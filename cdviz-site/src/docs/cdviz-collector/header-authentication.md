---
description: "Authenticate outgoing HTTP requests in CDviz Collector: bearer tokens, basic auth, and custom header injection for sink and SSE source requests."
---

# Header Authentication

Header authentication is used by components that **send outgoing messages** to authenticate with external services. This includes [SSE](./sources/sse.md) sources that connect to HTTP event streams, [HTTP sinks](./sinks/http.md) that post events to external endpoints, and [Kafka sinks](./sinks/kafka.md) that generate authentication headers for Kafka messages.

## Components Using Header Authentication

| Component      | Purpose                                                     |
| -------------- | ----------------------------------------------------------- |
| **Source SSE** | Authenticate with SSE event stream endpoints                |
| **Sink HTTP**  | Authenticate when posting events to external HTTP endpoints |
| **Sink Kafka** | Generate authentication headers for Kafka message consumers |

## Authentication Process

When making an outgoing request, configured headers are added to authenticate with the target service:

1. **Headers are computed** based on configuration (static values, environment variables, etc.)
2. **Headers are added** to the outgoing HTTP request
3. **Target service validates** the provided authentication

## Header Rule Types

### Static Values

Use fixed string values for headers:

```toml
[sources.events.extractor.headers]
"User-Agent" = { type = "static", value = "cdviz-collector/1.0" }
```

### Secret Values

The `value` field holds the secret as a static string in TOML. To keep secrets out of the config file, use one of these approaches:

**Read from a file** (recommended — mount a Kubernetes Secret or Docker volume):

```toml
[sources.events.extractor.headers]
"X-API-Key" = { type = "secret", value_file = "/run/secrets/api_key" }
```

**Set via environment variable** (hyphens in header names must be preserved — bash cannot `export` names with hyphens):

```bash
# Preferred: --set flag handles hyphens cleanly
cdviz-collector connect --config config.toml \
  --set 'sources.myapi.extractor.headers."x-api-key".value = "actual-api-key"'

# Or via env wrapper:
env 'CDVIZ_COLLECTOR__SOURCES__MYAPI__EXTRACTOR__HEADERS__X-API-KEY__VALUE=actual-api-key' \
  cdviz-collector connect --config config.toml
```

Kubernetes `env[].name` and GitHub Actions `env:` support hyphens natively. See [Configuration — Environment Variables](./configuration.md#environment-variables) for the naming convention.

### HMAC Signature Generation

Generate cryptographic signatures for request authentication:

```toml
[sources.events.extractor.headers]
"X-Signature" = { type = "signature", token = "webhook-secret", signature_prefix = "sha256=", signature_on = "body", signature_encoding = "hex" }
```

#### Signature Parameters

- **`token`** (string): Secret key for HMAC computation
- **`signature_prefix`** (string, optional): Prefix added to signature (e.g., "sha256=")
- **`signature_on`** (string): What to sign - "body" or "headers_then_body"
- **`signature_encoding`** (string): Encoding format - "hex" or "base64"
- **`token_encoding`** (string, optional): How to decode the token - "hex", "base64", or unset

## Common Authentication Patterns

### API Key Authentication

```toml
# SSE source with API key
[sources.api_events.extractor]
type = "sse"
url = "https://api.example.com/events"

[sources.api_events.extractor.headers]
"X-API-Key" = { type = "secret", value_file = "/run/secrets/api_key" }
```

### Bearer Token Authentication

```toml
# SSE source with Bearer token
[sources.secure_events.extractor]
type = "sse"
url = "https://secure-api.example.com/stream"

[sources.secure_events.extractor.headers]
"Authorization" = { type = "secret", value = "Bearer your-token-here" }
```

### Custom Headers with Multiple Values

```toml
# Multiple authentication headers
[sources.enterprise_sse.extractor]
type = "sse"
url = "https://enterprise.example.com/events"

[sources.enterprise_sse.extractor.headers]
"X-Client-ID" = { type = "secret", value = "your-client-id" }
"X-Client-Secret" = { type = "secret", value_file = "/run/secrets/client_secret" }
"Accept" = { type = "static", value = "text/event-stream" }
```

### Signature-Based Authentication

```toml
# Webhook sink with HMAC signature
[sinks.signed_webhook.configuration]
url = "https://partner.example.com/events"

[sinks.signed_webhook.configuration.headers]
"X-Webhook-Signature" = { type = "signature", token_file = "/run/secrets/webhook_token", signature_prefix = "sha256=", signature_on = "body", signature_encoding = "hex" }
```

## Multi-Header Authentication

Configure multiple headers for comprehensive authentication:

```toml
[sources.multi_auth.extractor]
type = "sse"
url = "https://api.example.com/events"

[sources.multi_auth.extractor.headers]
"Authorization" = { type = "secret", value_file = "/run/secrets/bearer_token" }
"X-API-Key" = { type = "secret", value_file = "/run/secrets/api_key" }
"User-Agent" = { type = "static", value = "cdviz-collector/1.0" }
```

## Authentication by Service Type

### GitHub API Authentication

```toml
[sources.github_events.extractor]
type = "sse"
url = "https://api.github.com/events"

[sources.github_events.extractor.headers]
"Authorization" = { type = "secret", value_file = "/run/secrets/github_token" }
"Accept" = { type = "static", value = "application/vnd.github.v3+json" }
```

### Slack Webhook Authentication

```toml
[sinks.slack_webhook.configuration]
url = "https://hooks.slack.com/services/T00/B00/XXX"

[sinks.slack_webhook.configuration.headers]
"Content-Type" = { type = "static", value = "application/json" }

# Slack webhooks typically don't need additional auth headers
# Authentication is embedded in the webhook URL
```

### Custom Service with Multiple Auth Methods

```toml
[sources.custom_service.extractor]
type = "sse"
url = "https://custom.example.com/events"

# Basic auth converted to header
[sources.custom_service.extractor.headers]
"Authorization" = { type = "secret", value_file = "/run/secrets/basic_auth_header" }

# API key
[sources.custom_service.extractor.headers]
"X-API-Key" = { type = "secret", value_file = "/run/secrets/api_key" }

# Request signing
[sources.custom_service.extractor.headers]
"X-Request-Signature" = { type = "signature", token_file = "/run/secrets/signing_secret", signature_prefix = "sig=", signature_on = "body", signature_encoding = "hex" }
```

## Security Best Practices

### Least Privilege Tokens

Use tokens with minimal required permissions:

```toml
# Use read-only tokens when possible
[sources.monitoring.extractor.headers]
"Authorization" = { type = "secret", value_file = "/run/secrets/monitor_token" }
```

### HTTPS Only

Always use HTTPS for external requests:

```toml
[sources.secure_events.extractor]
type = "sse"
url = "https://secure-api.company.com/events"  # HTTPS required

[sources.secure_events.extractor.headers]
"Authorization" = { type = "secret", value_file = "/run/secrets/api_token" }
```

### Connection Security

Configure additional security options:

```toml
[sources.secure_connection.extractor]
type = "sse"
url = "https://api.example.com/events"
# Additional SSL/TLS configuration would go here if supported
timeout = "30s"
max_retries = 5

[sources.secure_connection.extractor.headers]
"Authorization" = { type = "secret", value_file = "/run/secrets/api_token" }
```

## Testing Header Authentication

### Test SSE Connection

```bash
# Test SSE connection with authentication headers
curl -N -H "Accept: text/event-stream" \
  -H "Authorization: Bearer your-token" \
  -H "X-API-Key: your-api-key" \
  https://events.example.com/stream
```

### Test Webhook Posting

```bash
# Test webhook posting with authentication
curl -X POST https://external-service.com/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -H "X-API-Key: your-api-key" \
  -d '{"test": "event data"}'
```

### Verify Authentication

```bash
# Check if authentication headers are working
curl -v -N -H "Accept: text/event-stream" \
  -H "Authorization: Bearer your-token" \
  https://events.example.com/stream 2>&1 | grep -i "< HTTP"
```

### Debug Authentication Issues

Enable debug logging to see outgoing headers:

```bash
RUST_LOG=cdviz_collector::sources::sse=debug,cdviz_collector::sinks::webhook=debug \
  cdviz-collector connect --config config.toml
```

## Common Authentication Errors

### 401 Unauthorized

- Missing or invalid authentication headers
- Expired tokens
- Incorrect token format

```bash
# Check token format and expiration
curl -H "Authorization: Bearer $TOKEN" https://api.example.com/verify
```

### 403 Forbidden

- Valid authentication but insufficient permissions
- API key lacks required scopes
- Rate limiting

```bash
# Verify token permissions
curl -H "Authorization: Bearer $TOKEN" https://api.example.com/permissions
```

### Connection Failures

- Network connectivity issues
- Invalid URLs
- SSL/TLS certificate problems

```bash
# Test basic connectivity
curl -v https://api.example.com/events
```
