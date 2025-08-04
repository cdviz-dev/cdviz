# Header Authentication

Header authentication is used by components that **make outgoing HTTP requests** to authenticate with external services. This includes [SSE](./sse.md) sources that connect to event streams and [webhook sinks](../sinks/) that post events to external endpoints.

## Components Using Header Authentication

| Component | Purpose |
|-----------|---------|
| **Source SSE** | Authenticate with SSE event stream endpoints |
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
# Inline table syntax (compact)
headers = [
  { header = "User-Agent", rule = { type = "static", value = "cdviz-collector/1.0" } }
]

# Table section syntax (expanded)
[[sources.events.extractor.headers]]
header = "User-Agent"

[sources.events.extractor.headers.rule]
type = "static"
value = "cdviz-collector/1.0"
```

### Environment Secrets

Retrieve values from environment variables (recommended for sensitive data):

```toml
# Inline table syntax (compact)
headers = [
  { header = "X-API-Key", rule = { type = "secret", value = "API_KEY_ENV_VAR" } }
]

# Table section syntax (expanded)
[[sources.events.extractor.headers]]
header = "X-API-Key"

[sources.events.extractor.headers.rule]
type = "secret"
value = "API_KEY_ENV_VAR"  # Environment variable name
```

### HMAC Signature Generation

Generate cryptographic signatures for request authentication:

```toml
# Inline table syntax (compact)
headers = [
  { header = "X-Signature", rule = { type = "signature", token = "webhook-secret", signature_prefix = "sha256=", signature_on = "body", signature_encoding = "hex" } }
]

# Table section syntax (expanded)
[[sources.events.extractor.headers]]
header = "X-Signature"

[sources.events.extractor.headers.rule]
type = "signature"
token = "webhook-secret"
signature_prefix = "sha256="
signature_on = "body"
signature_encoding = "hex"
```

#### Signature Parameters

- **`token`** (string): Secret key for HMAC computation
- **`signature_prefix`** (string, optional): Prefix added to signature (e.g., "sha256=")
- **`signature_on`** (string): What to sign - "body" or "headers_then_body"
- **`signature_encoding`** (string): Encoding format - "hex" or "base64"
- **`token_encoding`** (string, optional): How to decode the token - "hex", "base64", or unset

For complex signatures, use table section syntax:

```toml
[[sources.events.extractor.headers]]
header = "X-Custom-Signature"

[sources.events.extractor.headers.rule]
type = "signature"
token = "custom-secret"
signature_prefix = "v1,"
signature_encoding = "hex"

[sources.events.extractor.headers.rule.signature_on]
headers_then_body = { separator = ".", headers = ["timestamp", "request-id"] }
```

## Common Authentication Patterns

### API Key Authentication

```toml
# SSE source with API key
[sources.api_events.extractor]
type = "sse"
url = "https://api.example.com/events"

[[sources.api_events.extractor.headers]]
header = "X-API-Key"

[sources.api_events.extractor.headers.rule]
type = "secret"
value = "MY_API_KEY"  # Environment variable
```

### Bearer Token Authentication

```toml
# SSE source with Bearer token
[sources.secure_events.extractor]
type = "sse"
url = "https://secure-api.example.com/stream"

[[sources.secure_events.extractor.headers]]
header = "Authorization"

[sources.secure_events.extractor.headers.rule]
type = "static"
value = "Bearer your-token-here"
```

### OAuth2 Token from Environment

```toml
# Webhook sink with OAuth2 token
[sinks.external_webhook.configuration]
url = "https://external-service.com/webhook"

[[sinks.external_webhook.configuration.headers]]
header = "Authorization"

[sinks.external_webhook.configuration.headers.rule]
type = "secret"
value = "OAUTH2_TOKEN"  # Environment variable containing "Bearer ..."
```

### Custom Headers with Multiple Values

```toml
# Multiple authentication headers
[sources.enterprise_sse.extractor]
type = "sse"
url = "https://enterprise.example.com/events"

[[sources.enterprise_sse.extractor.headers]]
header = "X-Client-ID"

[sources.enterprise_sse.extractor.headers.rule]
type = "secret"
value = "CLIENT_ID"

[[sources.enterprise_sse.extractor.headers]]
header = "X-Client-Secret"

[sources.enterprise_sse.extractor.headers.rule]
type = "secret"
value = "CLIENT_SECRET"

[[sources.enterprise_sse.extractor.headers]]
header = "Accept"

[sources.enterprise_sse.extractor.headers.rule]
type = "static"
value = "text/event-stream"
```

### Signature-Based Authentication

```toml
# Webhook sink with HMAC signature
[sinks.signed_webhook.configuration]
url = "https://partner.example.com/events"

[[sinks.signed_webhook.configuration.headers]]
header = "X-Webhook-Signature"

[sinks.signed_webhook.configuration.headers.rule]
type = "signature"
token = "PARTNER_WEBHOOK_SECRET"
signature_prefix = "sha256="
signature_on = "body"
signature_encoding = "hex"
```

## Multi-Header Authentication

Configure multiple headers for comprehensive authentication:

### Inline Table Syntax (Simple Cases)

```toml
[sources.multi_auth.extractor]
type = "sse"
url = "https://api.example.com/events"
headers = [
  { header = "Authorization", rule = { type = "secret", value = "BEARER_TOKEN" } },
  { header = "X-API-Key", rule = { type = "secret", value = "API_KEY" } },
  { header = "User-Agent", rule = { type = "static", value = "cdviz-collector/1.0" } }
]
```

### Table Section Syntax (Complex Cases)

```toml
[sources.enterprise.extractor]
type = "sse"
url = "https://enterprise.example.com/events"

# Primary authentication
[[sources.enterprise.extractor.headers]]
header = "Authorization"

[sources.enterprise.extractor.headers.rule]
type = "secret"
value = "ENTERPRISE_BEARER_TOKEN"

# Secondary API key
[[sources.enterprise.extractor.headers]]
header = "X-Enterprise-Key"

[sources.enterprise.extractor.headers.rule]
type = "secret"
value = "ENTERPRISE_API_KEY"

# Custom signature
[[sources.enterprise.extractor.headers]]
header = "X-Enterprise-Signature"

[sources.enterprise.extractor.headers.rule]
type = "signature"
token = "ENTERPRISE_HMAC_SECRET"
signature_prefix = "enterprise-v1="
signature_on = "body"
signature_encoding = "base64"

# User agent identification
[[sources.enterprise.extractor.headers]]
header = "User-Agent"

[sources.enterprise.extractor.headers.rule]
type = "static"
value = "cdviz-collector/1.0 (enterprise-integration)"
```

## Authentication by Service Type

### GitHub API Authentication

```toml
[sources.github_events.extractor]
type = "sse"
url = "https://api.github.com/events"

[[sources.github_events.extractor.headers]]
header = "Authorization"

[sources.github_events.extractor.headers.rule]
type = "secret"
value = "GITHUB_TOKEN"  # "Bearer ghp_xxxx" or "token ghp_xxxx"

[[sources.github_events.extractor.headers]]
header = "Accept"

[sources.github_events.extractor.headers.rule]
type = "static"
value = "application/vnd.github.v3+json"
```

### Slack Webhook Authentication

```toml
[sinks.slack_webhook.configuration]
url = "https://hooks.slack.com/services/T00/B00/XXX"

[[sinks.slack_webhook.configuration.headers]]
header = "Content-Type"

[sinks.slack_webhook.configuration.headers.rule]
type = "static"
value = "application/json"

# Slack webhooks typically don't need additional auth headers
# Authentication is embedded in the webhook URL
```

### Custom Service with Multiple Auth Methods

```toml
[sources.custom_service.extractor]
type = "sse"
url = "https://custom.example.com/events"

# Basic auth converted to header
[[sources.custom_service.extractor.headers]]
header = "Authorization"

[sources.custom_service.extractor.headers.rule]
type = "secret"
value = "BASIC_AUTH_HEADER"  # "Basic base64(user:pass)"

# API key
[[sources.custom_service.extractor.headers]]
header = "X-API-Key"

[sources.custom_service.extractor.headers.rule]
type = "secret"
value = "CUSTOM_API_KEY"

# Request signing
[[sources.custom_service.extractor.headers]]
header = "X-Request-Signature"

[sources.custom_service.extractor.headers.rule]
type = "signature"
token = "CUSTOM_SIGNING_SECRET"
signature_prefix = "sig="
signature_on = "body"
signature_encoding = "hex"
```

## Security Best Practices

### Environment Variables

Always use environment variables for sensitive authentication data:

```bash
# Set environment variables securely
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export API_KEY="ak_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export WEBHOOK_SECRET="ws_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export OAUTH2_TOKEN="Bearer ya29.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

```toml
# Reference in configuration (never hardcode secrets)
[[sources.secure.extractor.headers]]
header = "Authorization"

[sources.secure.extractor.headers.rule]
type = "secret"
value = "OAUTH2_TOKEN"  # Retrieved from environment
```

### Token Rotation Support

Design configuration to support token rotation:

```toml
# Use environment variables that can be updated without config changes
[[sources.rotating_token.extractor.headers]]
header = "Authorization"

[sources.rotating_token.extractor.headers.rule]
type = "secret"
value = "ROTATING_API_TOKEN"  # Can be updated without restart
```

### Least Privilege Tokens

Use tokens with minimal required permissions:

```toml
# Use read-only tokens when possible
[[sources.monitoring.extractor.headers]]
header = "Authorization"

[sources.monitoring.extractor.headers.rule]
type = "secret"
value = "READONLY_MONITOR_TOKEN"
```

### HTTPS Only

Always use HTTPS for external requests:

```toml
[sources.secure_events.extractor]
type = "sse"
url = "https://secure-api.company.com/events"  # HTTPS required

[[sources.secure_events.extractor.headers]]
header = "Authorization"

[sources.secure_events.extractor.headers.rule]
type = "secret"
value = "SECURE_API_TOKEN"
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

[[sources.secure_connection.extractor.headers]]
header = "Authorization"

[sources.secure_connection.extractor.headers.rule]
type = "secret"
value = "API_TOKEN"
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

## Syntax Choice Guidelines

### Use Inline Table Syntax When:

✅ **Simple Authentication**: Basic Bearer tokens or API keys
✅ **Few Headers**: 1-3 authentication headers
✅ **Static Configuration**: Headers that rarely change

```toml
# Good for inline syntax
headers = [
  { header = "Authorization", rule = { type = "secret", value = "BEARER_TOKEN" } },
  { header = "X-API-Key", rule = { type = "secret", value = "API_KEY" } }
]
```

### Use Table Section Syntax When:

✅ **Complex Authentication**: Multiple auth methods or signatures
✅ **Many Headers**: 4+ headers or complex configurations
✅ **Documentation Needed**: Want to comment each header's purpose
✅ **Signature Generation**: HMAC or custom signature schemes

```toml
# Good for table sections
[[sources.complex.extractor.headers]]
header = "Authorization"  # Primary authentication
[sources.complex.extractor.headers.rule]
type = "secret"
value = "BEARER_TOKEN"

[[sources.complex.extractor.headers]]
header = "X-Request-Signature"  # Request integrity
[sources.complex.extractor.headers.rule]
type = "signature"
token = "SIGNING_SECRET"
signature_prefix = "sha256="
signature_on = "body"
signature_encoding = "hex"
```

## Related

- [SSE Source](./sources/sse.md) - Server-Sent Events source configuration
- [Webhook Sinks](./sinks/) - Webhook sink configuration
- [Header Validation](./header-validation.md) - Incoming request headers
- [Security Configuration](./configuration.md#security) - Overall security setup