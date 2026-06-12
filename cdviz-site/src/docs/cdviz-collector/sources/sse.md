---
description: "CDviz Collector SSE source: consume real-time events from Server-Sent Events endpoints in external services and pipelines."
---

# SSE Extractor

Connects to HTTP endpoints that stream events via Server-Sent Events (SSE) protocol — ideal for consuming live event streams from services that support push-based streaming.

## Configuration

```toml
[sources.events.extractor]
type = "sse"
url = "https://events.example.com/stream"
max_retries = 10
```

## Parameters

| Parameter     | Type    | Default | Description                                                                 |
| ------------- | ------- | ------- | --------------------------------------------------------------------------- |
| `url`         | string  | —       | SSE endpoint URL                                                            |
| `max_retries` | integer | `10`    | Maximum reconnection attempts                                               |
| `headers`     | array   | `[]`    | Outgoing request headers (auth, etc.)                                       |
| `metadata`    | object  | —       | Static metadata for all events; `context.source` is auto-populated if unset |

## Event Processing

- **Body**: Parsed as JSON if valid; stored as raw string otherwise
- **Metadata**: `sse_id`, `sse_event`, `sse_url` automatically merged with extractor metadata
- **Retry**: Exponential backoff (2^retry seconds, max 64s) on connection loss

## Authentication

### Bearer token

```toml
[[sources.api_events.extractor.headers]]
header = "Authorization"
[sources.api_events.extractor.headers.rule]
type = "static"
value = "Bearer your-api-token"
```

### API key from environment variable

```toml
[[sources.api_events.extractor.headers]]
header = "X-API-Key"
[sources.api_events.extractor.headers.rule]
type = "secret"
value = "API_KEY_ENV_VAR"  # reads from $API_KEY_ENV_VAR at runtime
```

**[→ Complete Header Authentication Guide](../header-authentication.md)**

## Common CI/CD Use Cases

### Jenkins build events via SSE

Jenkins supports Server-Sent Events for build queue and executor events:

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

### Consume from another CDviz Collector via SSE sink

CDviz Collector has an [SSE sink](../sinks/sse.md) that exposes an endpoint. One collector can consume from another:

```toml
[sources.upstream_collector]
enabled = true
transformer_refs = ["filter_events"]

[sources.upstream_collector.extractor]
type = "sse"
url = "https://collector-upstream.internal:8080/sse/events"
max_retries = 20
```

### Subscribe to a CI platform event stream

```toml
[sources.platform_events]
enabled = true
transformer_refs = ["platform_to_cdevents"]

[sources.platform_events.extractor]
type = "sse"
url = "https://platform.company.com/api/events/stream"

[[sources.platform_events.extractor.headers]]
header = "Authorization"
[sources.platform_events.extractor.headers.rule]
type = "static"
value = "Bearer eyJhbGciOiJSUzI1..."
```

## Reconnection Behavior

The SSE extractor implements automatic reconnection with exponential backoff:
- Retry 1: wait 2s
- Retry 2: wait 4s
- Retry 3: wait 8s
- ... up to max 64s between retries

Set `max_retries = 0` for unlimited reconnection attempts (recommended for production).

## Related

- [Webhook Source](./webhook.md) — receive events via HTTP POST (push-based)
- [HTTP Polling Source](./http_polling.md) — poll HTTP endpoints on a fixed interval
- [SSE Sink](../sinks/sse.md) — expose an SSE stream from CDviz Collector
- [Header Authentication](../header-authentication.md) — authenticate to SSE endpoints
