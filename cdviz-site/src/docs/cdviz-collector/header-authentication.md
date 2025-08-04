# Header Authentication

Header authentication is used by components that **make outgoing HTTP requests** to authenticate with external services. This includes [SSE](./sources/sse.md) sources that connect to event streams and [HTTP sinks](./sinks/http.md) that post events to external endpoints.

## Components Using Header Authentication

| Component        | Purpose                                                        |
| ---------------- | -------------------------------------------------------------- |
| **Source SSE**   | Authenticate with SSE event stream endpoints                   |
| **Sink webhook** | Authenticate when posting events to external webhook endpoints |

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

### Environment Secrets

Retrieve values from environment variables (recommended for sensitive data):

```toml
[sources.events.extractor.headers]
"X-API-Key" = { type = "secret", value = "API_KEY_ENV_VAR" }
```

#### Environment Variable Override Patterns

The configuration format affects how environment variables can override header settings:

```bash
# Can be overridden:
export CDVIZ_COLLECTOR__SOURCES__MYAPI__EXTRACTOR__HEADERS__X_API_KEY__TYPE="secret"
export CDVIZ_COLLECTOR__SOURCES__MYAPI__EXTRACTOR__HEADERS__X_API_KEY__VALUE="NEW_API_KEY_VAR"
```

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
"X-API-Key" = { type = "secret", value = "MY_API_KEY" }
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
"X-Client-ID" = { type = "secret", value = "CLIENT_ID" }
"X-Client-Secret" = { type = "secret", value = "CLIENT_SECRET" }
"Accept" = { type = "static", value = "text/event-stream" }
```

### Signature-Based Authentication

```toml
# Webhook sink with HMAC signature
[sinks.signed_webhook.configuration]
url = "https://partner.example.com/events"

[sinks.signed_webhook.configuration.headers]
"X-Webhook-Signature" = { type = "signature", token = "PARTNER_WEBHOOK_SECRET", signature_prefix = "sha256=", signature_on = "body", signature_encoding = "hex" }
```

## Multi-Header Authentication

Configure multiple headers for comprehensive authentication:

```toml
[sources.multi_auth.extractor]
type = "sse"
url = "https://api.example.com/events"

[sources.multi_auth.extractor.headers]
"Authorization" = { type = "secret", value = "BEARER_TOKEN" }
"X-API-Key" = { type = "secret", value = "API_KEY" }
"User-Agent" = { type = "static", value = "cdviz-collector/1.0" }
```

## Authentication by Service Type

### GitHub API Authentication

```toml
[sources.github_events.extractor]
type = "sse"
url = "https://api.github.com/events"

[sources.github_events.extractor.headers]
"Authorization" = { type = "secret", value = "GITHUB_TOKEN" }
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
"Authorization" = { type = "secret", value = "BASIC_AUTH_HEADER" }

# API key
[sources.custom_service.extractor.headers]
"X-API-Key" = { type = "secret", value = "CUSTOM_API_KEY" }

# Request signing
[sources.custom_service.extractor.headers]
"X-Request-Signature" = { type = "signature", token = "CUSTOM_SIGNING_SECRET", signature_prefix = "sig=", signature_on = "body", signature_encoding = "hex" }
```

## Security Best Practices

### Least Privilege Tokens

Use tokens with minimal required permissions:

```toml
# Use read-only tokens when possible
[sources.monitoring.extractor.headers]
"Authorization" = { type = "secret", value = "READONLY_MONITOR_TOKEN" }
```

### HTTPS Only

Always use HTTPS for external requests:

```toml
[sources.secure_events.extractor]
type = "sse"
url = "https://secure-api.company.com/events"  # HTTPS required

[sources.secure_events.extractor.headers]
"Authorization" = { type = "secret", value = "SECURE_API_TOKEN" }
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
"Authorization" = { type = "secret", value = "API_TOKEN" }
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

## Related

- [SSE Source](./sources/sse.md) - Server-Sent Events source configuration
- [HTTP Sinks](./sinks/http.md) - HTTP sink configuration
- [Header Validation](./header-validation.md) - Incoming request headers
- [Security Configuration](./configuration.md#security) - Overall security setup
