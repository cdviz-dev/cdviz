# Use Cases

Common scenarios and complete configurations for real-world deployments.

> **⚠️ CDEvents Transformation Disclaimer:**
> VRL templates in these examples may be incomplete, outdated, or incorrect. For production use: consult the [CDEvents specification](https://cdevents.dev/) and use provided transformers at `/etc/cdviz-collector/transformers/` (GitHub, etc.).

## Development & Testing

### Local Development

```toml
[sources.test_webhook]
enabled = true
[sources.test_webhook.extractor]
type = "webhook"
id = "test"

[sinks.debug]
enabled = true
type = "debug"

[sinks.files]
enabled = true
type = "folder"
kind = "fs"
parameters = { root = "./dev-events" }
```

**Use:** Test configurations, debug event flow, local development.

### CI/CD Pipeline Testing

```toml
[sources.build_events]
enabled = true
transformer_refs = ["to_cdevents"]
[sources.build_events.extractor]
type = "opendal"
kind = "fs"
polling_interval = "10s"
path_patterns = ["build-events/*.json"]
parser = "json"
parameters = { root = "./ci-outputs" }

[transformers.to_cdevents]
type = "vrl"
template_file = "./transforms/ci-events.vrl"

[sinks.validation]
enabled = true
type = "folder"
kind = "fs"
parameters = { root = "./validated-events" }
```

**Use:** Validate event transformation in CI pipelines.

## Production Deployments

### Single Instance (Simple)

One collector handles all event types - good for small to medium scale setups:

```
GitHub ────┐
           ├─→ CDviz Collector ─→ Database
Jenkins ───┘                      └─→ Archive
```

### Single Collector Configuration

```toml
[sources.api_webhooks]
enabled = true
transformer_refs = ["api_to_cdevents"]
[sources.api_webhooks.extractor]
type = "webhook"
id = "api"

[sources.log_files]
enabled = true
transformer_refs = ["logs_to_cdevents"]
[sources.log_files.extractor]
type = "opendal"
kind = "s3"
polling_interval = "5m"
path_patterns = ["logs/**/*.jsonl"]
parser = "jsonl"

[sinks.database]
enabled = true
type = "db"
# URL from environment

[sinks.archive]
enabled = true
type = "folder"
kind = "s3"
```

**Use:** Centralized collection for small to medium deployments.

### Multiple Instances (Scalable)

Different collectors for different purposes - good for high scale, separation of concerns:

```
GitHub ─→ Collector A ─┐
                       ├─→ Database
GitLab ─→ Collector B ─┘
                       └─→ Analytics API

Files ──→ Collector C ─→ Archive
```

### Multi-Collector Configuration

```toml
# Edge Collector - Regional event collection
[sources.regional_webhooks]
enabled = true
[sources.regional_webhooks.extractor]
type = "webhook"
id = "region-us-east"

[sinks.central_collector]
enabled = true
type = "http"
url = "https://central-collector.internal/webhooks/regional"
```

```toml
# Central Collector - Aggregation and storage
[sources.regional_events]
enabled = true
[sources.regional_events.extractor]
type = "webhook"
id = "regional"

[sinks.master_database]
enabled = true
type = "db"

[sinks.analytics_api]
enabled = true
type = "http"
url = "https://analytics.company.com/events"
```

**Use:** Distributed collection with centralized processing.

## Specific Integrations

### GitHub Repository Events

```toml
[sources.github]
enabled = true
transformer_refs = ["github_events"]
[sources.github.extractor]
type = "webhook"
id = "github"
headers_to_keep = ["X-GitHub-Event"]

[[sources.github.extractor.headers]]
header = "X-Hub-Signature-256"
[sources.github.extractor.headers.rule]
type = "signature"
# token from environment

[transformers.github_events]
type = "vrl"
template_file = "/etc/cdviz-collector/transformers/github_events.vrl"
```

**Use:** Standard GitHub webhook integration. See [GitHub Integration](./integrations/github.md).

### Kubernetes Cluster Events

```toml
[sources.k8s_events]
enabled = true
transformer_refs = ["kubewatch_to_cdevents"]
[sources.k8s_events.extractor]
type = "webhook"
id = "kubewatch"

[transformers.kubewatch_to_cdevents]
type = "vrl"
template = '''
[{
    "body": {
        "context": {
            "type": "dev.cdevents.environment.modified.0.1.1",
            "source": "/k8s/" + (.body.namespace // "default")
        },
        "subject": {
            "id": .body.name,
            "type": .body.kind
        }
    }
}]
'''
```

**Use:** Kubernetes cluster monitoring. See [Kubernetes Integration](./integrations/kubewatch.md).

### Build Artifact Processing

```toml
[sources.build_artifacts]
enabled = true
transformer_refs = ["artifact_metadata"]
[sources.build_artifacts.extractor]
type = "opendal"
kind = "s3"
polling_interval = "2m"
path_patterns = ["builds/**/*.json", "releases/**/*.json"]
parser = "json"
parameters = { bucket = "ci-artifacts" }

[transformers.artifact_metadata]
type = "vrl"
template = '''
[{
    "body": {
        "context": {
            "type": "dev.cdevents.artifact.published.0.2.0",
            "source": "/ci/artifacts"
        },
        "subject": {
            "id": .body.artifact_id,
            "type": "artifact",
            "content": {
                "url": .body.download_url,
                "digest": { "sha256": .body.sha256 }
            }
        }
    }
}]
'''

[sinks.artifact_db]
enabled = true
type = "db"

[sinks.notifications]
enabled = true
type = "http"
url = "https://notifications.company.com/webhooks/artifacts"
```

**Use:** Monitor and track build artifacts across environments.

## Advanced Patterns

### Multi-Environment with Filtering

```toml
# Production events only
[sources.prod_api]
enabled = true
transformer_refs = ["env_filter", "to_cdevents"]
[sources.prod_api.extractor]
type = "webhook"
id = "prod"

[transformers.env_filter]
type = "vrl"
template = '''
if .body.environment != "production" {
    []  # Discard non-production events
} else {
    [.]  # Pass through production events
}
'''

[transformers.to_cdevents]
type = "vrl"
template_file = "./transforms/api-events.vrl"
```

**Use:** Environment-specific event processing with filtering.

### Event Splitting and Enrichment

```toml
[sources.batch_events]
enabled = true
transformer_refs = ["split_batch", "enrich_metadata"]
[sources.batch_events.extractor]
type = "webhook"
id = "batch"

[transformers.split_batch]
type = "vrl"
template = '''
# Split batch into individual events
map_values(.body.events) -> |event| {
    {
        "metadata": .metadata,
        "headers": .headers,
        "body": event
    }
}
'''

[transformers.enrich_metadata]
type = "vrl"
template = '''
[{
    "metadata": merge(.metadata, {
        "region": "${AWS_REGION}",
        "processed_at": now()
    }),
    "headers": .headers,
    "body": .body
}]
'''
```

**Use:** Process batch events and add runtime metadata.

## Next Steps

- **[Configuration Guide](./configuration.md)** - Understand configuration structure
- **[Sources](./sources/)** - Configure specific event sources
- **[Transformers](./transformers.md)** - Learn VRL transformation language
- **[Sinks](./sinks/)** - Configure event destinations
- **[GitHub Integration](./integrations/github.md)** - Ready-made GitHub integration
