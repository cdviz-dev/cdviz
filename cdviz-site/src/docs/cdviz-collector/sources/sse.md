---
description: "CDviz Collector SSE source: consume real-time events from Server-Sent Events endpoints in external services and pipelines."
---

# SSE Extractor

Connects to HTTP endpoints that stream events via Server-Sent Events protocol — ideal for consuming live event streams.

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

## Authentication

```toml
# Bearer token
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

- **Body**: Parsed JSON (or raw string if invalid JSON)
- **Metadata**: `sse_id`, `sse_event`, `sse_url` merged with extractor metadata
- **Retry**: Exponential backoff (2^retry seconds, max 64s)

## Example

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
