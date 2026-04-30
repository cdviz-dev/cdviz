---
description: "CDviz Collector HTTP sink: forward CDEvents to external webhooks and REST APIs with configurable headers and authentication."
---

# HTTP Sink

Forwards CDEvents to an external HTTP endpoint via POST request. Use for webhooks, external APIs, and any HTTP-based service.

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

```toml
# Static bearer token
[[sinks.webhook.headers]]
header = "Authorization"
[sinks.webhook.headers.rule]
type = "static"
value = "Bearer your-api-token"

# Token from environment variable
[[sinks.webhook.headers]]
header = "X-API-Key"
[sinks.webhook.headers.rule]
type = "secret"
value = "API_KEY_ENV_VAR"

# HMAC signature
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

## Examples

```toml
# Simple webhook
[sinks.notify]
enabled = true
type = "http"
url = "https://hooks.slack.com/services/T00/B00/XXX"

# Authenticated API
[sinks.api]
enabled = true
type = "http"
url = "https://api.company.com/events"

[[sinks.api.headers]]
header = "Authorization"
[sinks.api.headers.rule]
type = "secret"
value = "API_TOKEN"

# Multiple HTTP sinks receive every event simultaneously
[sinks.backup]
enabled = true
type = "http"
url = "https://backup-webhook.company.com/events"
```
