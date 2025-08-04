# SSE Extractor

The SSE (Server-Sent Events) extractor connects to HTTP endpoints that provide real-time event streams using the Server-Sent Events protocol. It's ideal for consuming live events from services that offer SSE-based notifications or streaming APIs.

## Configuration

```toml
[sources.events.extractor]
type = "sse"
url = "https://events.example.com/stream"
max_retries = 10
```

## Parameters

### Required Parameters

- **`url`** (string): The SSE endpoint URL to connect to

### Optional Parameters

- **`max_retries`** (integer): Maximum number of reconnection attempts (default: 10)
- **`headers`** (array): HTTP headers to include in SSE requests (default: [])

## Authentication

SSE extractors support flexible authentication through outgoing request headers. This includes static tokens, environment variables, and signature-based authentication.

### Quick Examples

```toml
# Bearer token authentication
[[sources.api_events.extractor.headers]]
header = "Authorization"

[sources.api_events.extractor.headers.rule]
type = "static"
value = "Bearer your-api-token"

# API key from environment
[[sources.api_events.extractor.headers]]
header = "X-API-Key"

[sources.api_events.extractor.headers.rule]
type = "secret"
value = "API_KEY_ENV_VAR"
```

**[→ Complete Header Authentication Guide](../header-authentication.md)**

## Event Processing

SSE messages are automatically processed and converted to pipeline events:

### Message Structure
- **`data`**: Message payload (JSON or text)
- **`id`**: Optional message identifier (UUID generated if missing)
- **`event`**: Optional event type (defaults to "message")

### Metadata
Each SSE message includes metadata:
```json
{
  "metadata": {
    "sse_id": "message-id-or-uuid",
    "sse_event": "event-type",
    "sse_url": "source-endpoint-url"
  },
  "headers": {},
  "body": { "parsed": "json-data" }
}
```

### Data Handling
- Valid JSON data is parsed and used as event body
- Invalid JSON is wrapped as string value
- All metadata is preserved for transformation

## Connection Management

### Retry Logic
- **Exponential backoff**: 2^retry_count seconds (max 64s)
- **Maximum retries**: Configurable limit (default: 10)
- **Connection logging**: Detailed connection state tracking

### Error Handling
| Error Type | Behavior |
|------------|----------|
| Network timeout | Auto-reconnect with backoff |
| HTTP 4xx/5xx | Retry with exponential backoff |
| Invalid SSE | Log error, continue processing |
| JSON parse failure | Use raw data, continue |
| Max retries exceeded | Stop source, log failure |

## Examples

### CI/CD Integration

```toml
[sources.jenkins_builds]
enabled = true
transformer_refs = ["jenkins_to_cdevents"]

[sources.jenkins_builds.extractor]
type = "sse"
url = "https://jenkins.company.com/sse/builds"

[[sources.jenkins_builds.extractor.headers]]
header = "Authorization"

[sources.jenkins_builds.extractor.headers.rule]
type = "secret"
value = "JENKINS_API_TOKEN"
```

### GitHub Repository Events

```toml
[sources.github_repo]
enabled = true
transformer_refs = ["github_transformer"]

[sources.github_repo.extractor]
type = "sse"
url = "https://api.github.com/repos/owner/repo/events"

[[sources.github_repo.extractor.headers]]
header = "Authorization"

[sources.github_repo.extractor.headers.rule]
type = "static"
value = "token ghp_your_token"

[[sources.github_repo.extractor.headers]]
header = "Accept"

[sources.github_repo.extractor.headers.rule]
type = "static"
value = "application/vnd.github.v3+json"
```

### Custom Application Monitoring

```toml
[sources.app_monitoring]
enabled = true
transformer_refs = ["app_events"]

[sources.app_monitoring.extractor]
type = "sse"
url = "https://app.company.com/api/events/stream"
max_retries = 5

[[sources.app_monitoring.extractor.headers]]
header = "X-API-Key"

[sources.app_monitoring.extractor.headers.rule]
type = "secret"
value = "APP_API_KEY"

[[sources.app_monitoring.extractor.headers]]
header = "User-Agent"

[sources.app_monitoring.extractor.headers.rule]
type = "static"
value = "cdviz-collector/1.0"
```

### Collector-to-Collector Integration

Connect to SSE sinks from other cdviz-collector instances for various integration patterns:

#### Central Aggregation Hub

Aggregate events from multiple collectors into a central instance:

```toml
# Regional collector streams
[sources.us_east_events]
enabled = true
transformer_refs = ["add_region_metadata"]

[sources.us_east_events.extractor]
type = "sse"
url = "https://us-east-collector.company.com:8080/sse/regional"

[[sources.us_east_events.extractor.headers]]
header = "Authorization"

[sources.us_east_events.extractor.headers.rule]
type = "secret"
value = "REGIONAL_COLLECTOR_TOKEN"

[sources.eu_west_events]
enabled = true
transformer_refs = ["add_region_metadata"]

[sources.eu_west_events.extractor]
type = "sse"
url = "https://eu-west-collector.company.com:8080/sse/regional"

[[sources.eu_west_events.extractor.headers]]
header = "Authorization"

[sources.eu_west_events.extractor.headers.rule]
type = "secret"
value = "REGIONAL_COLLECTOR_TOKEN"

[transformers.add_region_metadata]
type = "vrl"
template = """
[{
    "metadata": merge(.metadata, {
        "forwarded_from": .metadata.sse_url,
        "aggregation_level": "central",
        "received_at": now()
    }),
    "headers": .headers,
    "body": .body
}]
"""
```

#### Public-to-Internal Bridge

Stream events from public collectors to internal systems without exposing internal infrastructure:

```toml
# Internal collector receiving from public DMZ collector
[sources.public_events]
enabled = true
transformer_refs = ["sanitize_public_events"]

[sources.public_events.extractor]
type = "sse"
url = "https://public-collector.dmz.company.com:8080/sse/public"
max_retries = 20  # Higher retries for external connections

[[sources.public_events.extractor.headers]]
header = "Authorization"

[sources.public_events.extractor.headers.rule]
type = "secret"
value = "PUBLIC_BRIDGE_TOKEN"

[[sources.public_events.extractor.headers]]
header = "X-Internal-Bridge"

[sources.public_events.extractor.headers.rule]
type = "static"
value = "internal-collector-v1"

[transformers.sanitize_public_events]
type = "vrl"
template = """
# Add internal tracking and remove sensitive data
[{
    "metadata": merge(.metadata, {
        "source_type": "public_bridge",
        "internal_received_at": now(),
        "bridge_version": "v1.0"
    }),
    "headers": .headers,
    "body": {
        "context": .body.context,
        "subject": {
            "id": .body.subject.id,
            "type": .body.subject.type,
            "content": del(.body.subject.content.internal_data) ?? .body.subject.content
        }
    }
}]
"""
```

#### Hierarchical Event Distribution

Create a hierarchical collector network:

```toml
# Team-level collector receiving from department collector
[sources.department_events]
enabled = true
transformer_refs = ["filter_team_events"]

[sources.department_events.extractor]
type = "sse"
url = "https://dept-engineering-collector.company.com:8080/sse/teams"

[[sources.department_events.extractor.headers]]
header = "Authorization"

[sources.department_events.extractor.headers.rule]
type = "secret"
value = "DEPT_COLLECTOR_TOKEN"

[[sources.department_events.extractor.headers]]
header = "X-Team-Filter"

[sources.department_events.extractor.headers.rule]
type = "static"
value = "backend-team"

[transformers.filter_team_events]
type = "vrl"
template = """
# Only process events relevant to our team
if !(.body.subject.content.team == "backend-team" ||
     .body.subject.content.department == "engineering") {
    abort
}

[{
    "metadata": merge(.metadata, {
        "team_scope": "backend-team",
        "hierarchy_level": "team"
    }),
    "headers": .headers,
    "body": .body
}]
"""
```

#### Cross-Environment Event Streaming

Stream events between different environments:

```toml
# Production collector receiving staging events for testing
[sources.staging_mirror]
enabled = true
transformer_refs = ["mark_staging_events"]

[sources.staging_mirror.extractor]
type = "sse"
url = "https://staging-collector.company.com:8080/sse/mirror"

[[sources.staging_mirror.extractor.headers]]
header = "Authorization"

[sources.staging_mirror.extractor.headers.rule]
type = "secret"
value = "STAGING_MIRROR_TOKEN"

[[sources.staging_mirror.extractor.headers]]
header = "X-Environment-Bridge"

[sources.staging_mirror.extractor.headers.rule]
type = "static"
value = "staging-to-prod"

[transformers.mark_staging_events]
type = "vrl"
template = """
[{
    "metadata": merge(.metadata, {
        "original_environment": "staging",
        "mirror_purpose": "production_testing",
        "mirrored_at": now()
    }),
    "headers": .headers,
    "body": merge(.body, {
        "context": merge(.body.context, {
            "source": .body.context.source + "-staging-mirror"
        })
    })
}]
"""
```

### Multi-Environment Aggregation

```toml
# Development environment
[sources.dev_events]
enabled = true

[sources.dev_events.extractor]
type = "sse"
url = "https://dev-collector.company.com:8080/sse/development"

# Production environment
[sources.prod_events]
enabled = true

[sources.prod_events.extractor]
type = "sse"
url = "https://prod-collector.company.com:8080/sse/production"

[[sources.prod_events.extractor.headers]]
header = "Authorization"

[sources.prod_events.extractor.headers.rule]
type = "secret"
value = "PROD_COLLECTOR_TOKEN"
```

## Testing

Test SSE connection with curl:

```bash
# Test endpoint connectivity
curl -N -H "Accept: text/event-stream" \
  -H "Authorization: Bearer your-token" \
  https://events.example.com/stream

# Test with cdviz-collector
RUST_LOG=debug cdviz-collector connect --config config.toml
```

## Troubleshooting

### Connection Issues
- **Symptoms**: Repeated connection errors, no events received
- **Solutions**: Verify URL accessibility, check network/firewall rules, validate authentication

### Authentication Failures
- **Symptoms**: HTTP 401/403 responses
- **Solutions**: Verify tokens are valid and not expired, check environment variables

### Missing Events
- **Symptoms**: Some events not processed
- **Solutions**: Check endpoint filtering, verify transformers, monitor connection stability

### Performance Tuning
- Each SSE source maintains one persistent connection
- Large JSON payloads impact memory usage
- Adjust `max_retries` based on reliability requirements
- Monitor retry patterns for connection issues

## Related

- [Sources Overview](./index.md) - Understanding the source pipeline
- [Webhook Extractor](./webhook.md) - For HTTP event ingestion
- [SSE Sink](../sinks/sse.md) - For exposing SSE endpoints
- [Transformers](../transformers.md) - Processing SSE events