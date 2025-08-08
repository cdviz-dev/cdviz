# HTTP Sink

The HTTP sink forwards CDEvents to external HTTP endpoints via POST requests. It's ideal for integrating with webhooks, external APIs, and other HTTP-based services that need to receive event notifications.

## Configuration

```toml
[sinks.http]
enabled = true
type = "http"
url = "https://example.com/webhook"
```

## Parameters

### Required Parameters

- **`type`** (string): Must be set to `"http"`
- **`url`** (string): The destination HTTP endpoint URL

### Optional Parameters

- **`enabled`** (boolean): Enable/disable the HTTP sink (default: `true`)
- **`headers`** (array): HTTP headers to include in outgoing requests

## Authentication

HTTP sinks support flexible authentication through outgoing request headers. This includes static tokens, environment variables, and signature-based authentication.

### Quick Examples

```toml
# Bearer token authentication
[[sinks.webhook.headers]]
header = "Authorization"

[sinks.webhook.headers.rule]
type = "static"
value = "Bearer your-api-token"

# API key from environment
[[sinks.webhook.headers]]
header = "X-API-Key"

[sinks.webhook.headers.rule]
type = "secret"
value = "API_KEY_ENV_VAR"
```

**[→ Complete Header Authentication Guide](../header-authentication.md)**

## Request Format

### HTTP Method

All requests use the **POST** method.

### Content Type

Requests are sent with `Content-Type: application/json`.

### Request Body

The complete CDEvent is sent as JSON in the request body:

```json
{
  "context": {
    "version": "0.4.0",
    "id": "dev.cdevents.build.started.0.1.0-12345",
    "source": "github.com/myorg/myrepo",
    "type": "dev.cdevents.build.started.0.1.0",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "subject": {
    "id": "build-456",
    "type": "build",
    "content": {
      "id": "build-456",
      "source": "github.com/myorg/myrepo"
    }
  }
}
```

## Response Handling

### Success Responses

- **HTTP 200-299**: Considered successful, processing continues
- **Response body**: Ignored (not processed)

### Error Responses

- **HTTP 300+**: Considered errors
- **Network errors**: Connection timeouts, DNS failures
- **Error handling**: Logged but processing continues (non-blocking)

## Examples

### Basic Webhook Integration

```toml
[sinks.external_webhook]
enabled = true
type = "http"
url = "https://webhook.site/your-unique-url"
```

### Slack Webhook

```toml
[sinks.slack_notifications]
enabled = true
type = "http"
url = "https://hooks.slack.com/services/T00/B00/XXX"

# Slack webhooks typically don't need additional auth headers
# Authentication is embedded in the webhook URL
```

### Discord Webhook

```toml
[sinks.discord_alerts]
enabled = true
type = "http"
url = "https://discord.com/api/webhooks/123/abc"

# Discord webhooks use URL-based authentication
```

### Authenticated API Integration

```toml
[sinks.api_integration]
enabled = true
type = "http"
url = "https://api.company.com/events"

# Bearer token authentication
[[sinks.api_integration.headers]]
header = "Authorization"

[sinks.api_integration.headers.rule]
type = "secret"
value = "API_TOKEN"  # Environment variable

# Custom API key
[[sinks.api_integration.headers]]
header = "X-API-Key"

[sinks.api_integration.headers.rule]
type = "secret"
value = "COMPANY_API_KEY"
```

### Custom Service Integration

```toml
[sinks.custom_service]
enabled = true
type = "http"
url = "https://events.mycompany.com/cdviz/webhook"

# Custom authentication header
[[sinks.custom_service.headers]]
header = "X-Service-Token"

[sinks.custom_service.headers.rule]
type = "static"
value = "service-integration-token-123"

# User agent identification
[[sinks.custom_service.headers]]
header = "User-Agent"

[sinks.custom_service.headers.rule]
type = "static"
value = "cdviz-collector/1.0"
```

### Multi-Header Authentication

```toml
[sinks.enterprise_api]
enabled = true
type = "http"
url = "https://enterprise-api.company.com/events"

# Primary authentication
[[sinks.enterprise_api.headers]]
header = "Authorization"

[sinks.enterprise_api.headers.rule]
type = "secret"
value = "ENTERPRISE_BEARER_TOKEN"

# Secondary API key
[[sinks.enterprise_api.headers]]
header = "X-Enterprise-Key"

[sinks.enterprise_api.headers.rule]
type = "secret"
value = "ENTERPRISE_API_KEY"

# Request signing
[[sinks.enterprise_api.headers]]
header = "X-Request-Signature"

[sinks.enterprise_api.headers.rule]
type = "signature"
token = "ENTERPRISE_HMAC_SECRET"
signature_prefix = "sha256="
signature_on = "body"
signature_encoding = "hex"
```

## Use Cases

### External Monitoring Systems

Send events to monitoring and alerting platforms:

```toml
# PagerDuty integration
[sinks.pagerduty_alerts]
enabled = true
type = "http"
url = "https://events.pagerduty.com/integration/your-key/enqueue"

[[sinks.pagerduty_alerts.headers]]
header = "Authorization"

[sinks.pagerduty_alerts.headers.rule]
type = "static"
value = "Token token=your-pagerduty-token"
```

### Workflow Automation

Trigger automated workflows based on events:

```toml
# GitHub Actions workflow dispatch
[sinks.github_dispatch]
enabled = true
type = "http"
url = "https://api.github.com/repos/owner/repo/dispatches"

[[sinks.github_dispatch.headers]]
header = "Authorization"

[sinks.github_dispatch.headers.rule]
type = "secret"
value = "GITHUB_TOKEN"  # "Bearer ghp_xxxx"

[[sinks.github_dispatch.headers]]
header = "Accept"

[sinks.github_dispatch.headers.rule]
type = "static"
value = "application/vnd.github.v3+json"
```

### Analytics and Data Pipeline

Forward events to analytics platforms:

```toml
# Custom analytics service
[sinks.analytics]
enabled = true
type = "http"
url = "https://analytics.company.com/api/events"

[[sinks.analytics.headers]]
header = "Authorization"

[sinks.analytics.headers.rule]
type = "secret"
value = "ANALYTICS_API_KEY"

[[sinks.analytics.headers]]
header = "X-Data-Source"

[sinks.analytics.headers.rule]
type = "static"
value = "cdviz-collector"
```

### Multi-Environment Distribution

Send events to different environments:

```toml
# Development environment
[sinks.dev_webhook]
enabled = true
type = "http"
url = "https://dev-webhook.company.com/events"

[[sinks.dev_webhook.headers]]
header = "X-Environment"

[sinks.dev_webhook.headers.rule]
type = "static"
value = "development"

# Production environment
[sinks.prod_webhook]
enabled = false  # Enable in production
type = "http"
url = "https://prod-webhook.company.com/events"

[[sinks.prod_webhook.headers]]
header = "Authorization"

[sinks.prod_webhook.headers.rule]
type = "secret"
value = "PROD_WEBHOOK_TOKEN"
```

## Security Considerations

### HTTPS Only

Always use HTTPS endpoints in production:

```toml
[sinks.secure_webhook]
enabled = true
type = "http"
url = "https://secure-endpoint.company.com/events"  # HTTPS required
```

### Authentication Best Practices

1. **Use Environment Variables**: Store sensitive tokens in environment variables
2. **Rotate Tokens**: Regularly rotate authentication tokens
3. **Least Privilege**: Use tokens with minimal required permissions
4. **Monitor Access**: Log and monitor webhook delivery attempts

### Token Management

```bash
# Secure token storage
export WEBHOOK_TOKEN="your-secure-token-here"
export API_KEY="your-api-key-here"

# Reference in configuration
CDVIZ_COLLECTOR__SINKS__WEBHOOK__HEADERS__0__RULE__VALUE="$WEBHOOK_TOKEN"
```

## Testing and Debugging

### Test Webhook Endpoints

```bash
# Test endpoint manually
curl -X POST https://webhook.site/your-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"test": "event"}'
```

### Monitor HTTP Sink Delivery

```bash
# Enable HTTP sink debug logging
RUST_LOG=cdviz_collector::sinks::http=debug cdviz-collector connect --config config.toml

# Monitor webhook deliveries
journalctl -f -u cdviz-collector | grep "HTTP sink"
```

### Webhook Testing Services

Use webhook testing services for development:

```toml
# webhook.site for testing
[sinks.test_webhook]
enabled = true
type = "http"
url = "https://webhook.site/your-unique-url"

# RequestBin for testing
[sinks.requestbin]
enabled = true
type = "http"
url = "https://requestbin.com/your-bin"
```

## Error Handling and Reliability

### Retry Logic

Current behavior:

- **No automatic retries**: Failed requests are logged but not retried
- **Non-blocking**: Processing continues even if HTTP delivery fails
- **Error logging**: Failed requests are logged with details

### Monitoring Failed Deliveries

```bash
# Monitor failed HTTP deliveries
journalctl -u cdviz-collector | grep -i "http.*error\|http.*fail"

# Count failed deliveries
journalctl -u cdviz-collector --since="1 hour ago" | grep "HTTP sink.*error" | wc -l
```

### Reliability Patterns

For critical integrations, consider:

1. **Multiple Sinks**: Configure multiple HTTP sinks for redundancy
2. **Database Backup**: Always use database sink alongside HTTP sinks
3. **Monitoring**: Monitor HTTP sink delivery success rates
4. **External Queuing**: Use message queues for guaranteed delivery

```toml
# Redundant webhook configuration
[sinks.primary_webhook]
enabled = true
type = "http"
url = "https://primary-webhook.company.com/events"

[sinks.backup_webhook]
enabled = true
type = "http"
url = "https://backup-webhook.company.com/events"

# Always store to database
[sinks.database]
enabled = true
type = "db"
url = "postgresql://user:pass@host:5432/cdviz"
```

## Performance Considerations

### Concurrent Requests

- HTTP sinks make concurrent requests to endpoints
- Each event triggers a separate HTTP request
- High event volume may create significant outbound traffic

### Network Impact

- **Bandwidth**: Each event generates an HTTP request
- **Latency**: Network latency affects overall processing time
- **Rate limiting**: External services may rate limit requests

### Optimization

- **Event filtering**: Use transformers to filter events before HTTP delivery
- **Batching**: Consider external queuing systems for batching
- **Caching**: Cache authentication tokens where possible

## Integration Patterns

### Event Filtering

Send only specific events to HTTP endpoints:

```toml
# Source with filtering
[sources.filtered_builds]
enabled = true
transformer_refs = ["build_events_only"]

[transformers.build_events_only]
type = "vrl"
template = """
if !starts_with(.body.context.type, "dev.cdevents.build.") {
    abort
}
[{
    "metadata": .metadata,
    "headers": .headers,
    "body": .body
}]
"""

# HTTP sink receives only build events
[sinks.build_webhook]
enabled = true
type = "http"
url = "https://build-monitoring.company.com/events"
```

### Fan-out Pattern

Send events to multiple HTTP endpoints:

```toml
# Send to multiple services
[sinks.service_a]
enabled = true
type = "http"
url = "https://service-a.company.com/webhook"

[sinks.service_b]
enabled = true
type = "http"
url = "https://service-b.company.com/webhook"

[sinks.service_c]
enabled = true
type = "http"
url = "https://service-c.company.com/webhook"
```

### Collector-to-Collector Integration

HTTP sinks enable collector-to-collector communication through webhook endpoints, providing an alternative to SSE streaming:

#### Central Event Aggregation

Forward events from regional collectors to a central aggregation hub:

```toml
# Regional collector posting to central aggregator
[sinks.central_aggregator]
enabled = true
type = "http"
url = "https://central-collector.company.com/webhook/regional"

# Authentication for central collector
[[sinks.central_aggregator.headers]]
header = "Authorization"

[sinks.central_aggregator.headers.rule]
type = "secret"
value = "CENTRAL_AGGREGATOR_TOKEN"

# Identify the source region
[[sinks.central_aggregator.headers]]
header = "X-Source-Region"

[sinks.central_aggregator.headers.rule]
type = "static"
value = "us-west-2"

# Source collector identifier
[[sinks.central_aggregator.headers]]
header = "X-Collector-ID"

[sinks.central_aggregator.headers.rule]
type = "static"
value = "regional-collector-west"
```

#### Public-to-Internal Event Bridge

Forward events from public collectors to internal systems via secure webhooks:

```toml
# Public DMZ collector forwarding to internal collector
[sinks.internal_bridge]
enabled = true
type = "http"
url = "https://internal-collector.vpn.company.com:8080/webhook/public-bridge"

# Strong authentication for internal access
[[sinks.internal_bridge.headers]]
header = "Authorization"

[sinks.internal_bridge.headers.rule]
type = "secret"
value = "INTERNAL_BRIDGE_TOKEN"

# HMAC signature for request integrity
[[sinks.internal_bridge.headers]]
header = "X-Bridge-Signature"

[sinks.internal_bridge.headers.rule]
type = "signature"
token = "BRIDGE_HMAC_SECRET"
signature_prefix = "sha256="
signature_on = "body"
signature_encoding = "hex"

# Source identification
[[sinks.internal_bridge.headers]]
header = "X-Source-Network"

[sinks.internal_bridge.headers.rule]
type = "static"
value = "dmz-public"

# Filter and sanitize events before internal forwarding
[sources.sanitized_for_internal]
enabled = true
transformer_refs = ["remove_sensitive_data"]

[transformers.remove_sensitive_data]
type = "vrl"
template = """
[{
    "metadata": merge(.metadata, {
        "sanitized_for": "internal_bridge",
        "public_source": true
    }),
    "headers": .headers,
    "body": {
        "context": .body.context,
        "subject": {
            "id": .body.subject.id,
            "type": .body.subject.type,
            "content": del(.body.subject.content.external_ip, .body.subject.content.client_info) ?? .body.subject.content
        }
    }
}]
"""
```

#### Hierarchical Event Distribution

Push events up the organizational hierarchy:

```toml
# Team collector forwarding to department collector
[sinks.department_escalation]
enabled = true
type = "http"
url = "https://dept-engineering-collector.company.com/webhook/team-events"

# Team authentication
[[sinks.department_escalation.headers]]
header = "Authorization"

[sinks.department_escalation.headers.rule]
type = "secret"
value = "TEAM_ESCALATION_TOKEN"

# Team identification
[[sinks.department_escalation.headers]]
header = "X-Source-Team"

[sinks.department_escalation.headers.rule]
type = "static"
value = "backend-team"

# Department collector forwarding to corporate
[sinks.corporate_escalation]
enabled = true
type = "http"
url = "https://corporate-collector.company.com/webhook/department-events"

# Department authentication
[[sinks.corporate_escalation.headers]]
header = "Authorization"

[sinks.corporate_escalation.headers.rule]
type = "secret"
value = "CORPORATE_ESCALATION_TOKEN"

# Department identification
[[sinks.corporate_escalation.headers]]
header = "X-Source-Department"

[sinks.corporate_escalation.headers.rule]
type = "static"
value = "engineering"

# Filter events by importance for corporate escalation
[sources.corporate_worthy]
enabled = true
transformer_refs = ["filter_high_priority"]

[transformers.filter_high_priority]
type = "vrl"
template = """
# Only escalate high-priority events to corporate level
if !(.body.subject.content.priority == "high" ||
     .body.subject.content.category == "incident" ||
     .body.subject.content.category == "security") {
    abort
}

[{
    "metadata": merge(.metadata, {
        "escalated_to": "corporate",
        "escalation_reason": .body.subject.content.category ?? "high-priority"
    }),
    "headers": .headers,
    "body": .body
}]
"""
```

#### Cross-Environment Event Forwarding

Forward events between different environments for testing and validation:

```toml
# Production collector forwarding sample events to staging
[sinks.staging_sample]
enabled = true
type = "http"
url = "https://staging-collector.company.com/webhook/prod-sample"

# Staging environment authentication
[[sinks.staging_sample.headers]]
header = "Authorization"

[sinks.staging_sample.headers.rule]
type = "secret"
value = "STAGING_SAMPLE_TOKEN"

# Environment identification
[[sinks.staging_sample.headers]]
header = "X-Source-Environment"

[sinks.staging_sample.headers.rule]
type = "static"
value = "production"

# Sample and anonymize production events for staging
[sources.sampled_for_staging]
enabled = true
transformer_refs = ["sample_and_anonymize"]

[transformers.sample_and_anonymize]
type = "vrl"
template = """
# Sample only 10% of events for staging
if random_int(1, 10) != 1 {
    abort
}

[{
    "metadata": merge(.metadata, {
        "sampled_for": "staging",
        "sample_rate": "10_percent",
        "anonymized": true
    }),
    "headers": .headers,
    "body": {
        "context": merge(.body.context, {
            "source": "staging-sample-" + .body.context.source
        }),
        "subject": {
            "id": "staging-" + .body.subject.id,
            "type": .body.subject.type,
            "content": merge(.body.subject.content, {
                "user_id": "anonymous-user",
                "customer_id": "test-customer"
            })
        }
    }
}]
"""
```

#### Multi-Destination Event Distribution

Forward events to multiple external systems and partners:

```toml
# Primary partner integration
[sinks.partner_a]
enabled = true
type = "http"
url = "https://api.partner-a.com/integrations/cdviz/webhook"

[[sinks.partner_a.headers]]
header = "Authorization"

[sinks.partner_a.headers.rule]
type = "secret"
value = "PARTNER_A_API_KEY"

[[sinks.partner_a.headers]]
header = "X-Integration-Partner"

[sinks.partner_a.headers.rule]
type = "static"
value = "partner-a-integration"

# Secondary partner integration
[sinks.partner_b]
enabled = true
type = "http"
url = "https://webhooks.partner-b.com/cdviz-events"

[[sinks.partner_b.headers]]
header = "X-API-Key"

[sinks.partner_b.headers.rule]
type = "secret"
value = "PARTNER_B_WEBHOOK_KEY"

# Custom signature for Partner B
[[sinks.partner_b.headers]]
header = "X-Partner-Signature"

[sinks.partner_b.headers.rule]
type = "signature"
token = "PARTNER_B_HMAC_SECRET"
signature_prefix = "pb-sig="
signature_on = "body"
signature_encoding = "base64"

# Compliance and audit system
[sinks.compliance_audit]
enabled = true
type = "http"
url = "https://audit.compliance.company.com/api/events"

[[sinks.compliance_audit.headers]]
header = "Authorization"

[sinks.compliance_audit.headers.rule]
type = "secret"
value = "COMPLIANCE_AUDIT_TOKEN"

[[sinks.compliance_audit.headers]]
header = "X-Audit-Type"

[sinks.compliance_audit.headers.rule]
type = "static"
value = "sdlc-events"
```

## Related

- [Sinks Overview](./index.md) - Understanding sink pipelines
- [Header Authentication](../header-authentication.md) - Outgoing request authentication
- [SSE Sink](./sse.md) - Real-time event streaming
- [Database Sink](./db.md) - Persistent storage
