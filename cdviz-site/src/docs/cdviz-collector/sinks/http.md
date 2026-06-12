---
description: "CDviz Collector HTTP sink: forward CDEvents to external webhooks and REST APIs with configurable headers and authentication."
---

# HTTP Sink

Forwards CDEvents to an external HTTP endpoint via POST request. Use for webhooks, external APIs, notification services, and any HTTP-based system that accepts JSON events.

## Configuration

```toml
[sinks.webhook]
enabled = true
type = "http"
url = "https://example.com/webhook"
```

## Parameters

| Parameter | Type    | Default | Description                                       |
| --------- | ------- | ------- | ------------------------------------------------- |
| `type`    | string  | —       | Must be `"http"`                                  |
| `url`     | string  | —       | Destination endpoint URL                          |
| `enabled` | boolean | `true`  | Enable/disable this sink                          |
| `headers` | array   | `[]`    | Outgoing request headers (auth, signatures, etc.) |

## Request Format

- **Method**: `POST`
- **Content-Type**: `application/json`
- **Body**: Complete CDEvent serialized as JSON
- **Errors**: Failed requests (HTTP 3xx+ or network errors) are logged; processing continues

## Authentication

### Bearer token

```toml
[[sinks.webhook.headers]]
header = "Authorization"
[sinks.webhook.headers.rule]
type = "static"
value = "Bearer your-api-token"
```

### API key from environment variable

```toml
[[sinks.webhook.headers]]
header = "X-API-Key"
[sinks.webhook.headers.rule]
type = "secret"
value = "API_KEY_ENV_VAR"  # reads from $API_KEY_ENV_VAR at runtime
```

### HMAC signature (for webhook receivers that verify signatures)

```toml
[[sinks.webhook.headers]]
header = "X-Hub-Signature-256"
[sinks.webhook.headers.rule]
type = "signature"
token = "WEBHOOK_HMAC_SECRET"
signature_prefix = "sha256="
signature_on = "body"
signature_encoding = "hex"
```

**[→ Complete Header Authentication Guide](../header-authentication.md)**

## Common Use Cases

```toml
# Slack notification on deployment
[sinks.slack]
enabled = true
type = "http"
url = "https://hooks.slack.com/services/T00/B00/XXX"

# Forward to authenticated internal API
[sinks.internal_api]
enabled = true
type = "http"
url = "https://platform.company.com/api/events"

[[sinks.internal_api.headers]]
header = "Authorization"
[sinks.internal_api.headers.rule]
type = "secret"
value = "Bearer PLATFORM_API_TOKEN"

# Fan-out: multiple HTTP sinks all receive every event
[sinks.backup_receiver]
enabled = true
type = "http"
url = "https://backup-collector.company.com/webhook/events"
```

## Error Handling

Failed requests (non-2xx responses, network errors, timeouts) are logged at ERROR level. Processing continues — the event is not retried. For guaranteed delivery, use the [Kafka sink](./kafka.md) or [NATS sink](./nats.md) with a durable consumer.

## Related

- [Kafka Sink](./kafka.md) — durable, high-throughput event delivery
- [NATS Sink](./nats.md) — lightweight publish-subscribe delivery
- [Header Authentication](../header-authentication.md) — configure outgoing request headers
- [Database Sink](./db.md) — store CDEvents for analytics and dashboards
