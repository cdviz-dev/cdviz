# Header Validation

Header validation is used by components that **receive incoming HTTP requests** to verify the authenticity and authorization of those requests. This includes [webhook](./webhook.md) sources that accept events from external systems and [SSE sinks](../sinks/) that receive HTTP requests.

## Components Using Header Validation

| Component | Purpose |
|-----------|---------|
| **Source webhook** | Validate incoming webhook events from CI/CD systems, GitHub, GitLab, etc. |
| **Sink SSE** | Validate incoming HTTP requests to SSE endpoints |

## Validation Process

When a request arrives, each configured header rule is evaluated:
1. **All rules must pass** for the request to be accepted
2. **Any rule failure** results in request rejection (401/403 response)
3. **Missing headers** are treated as validation failures

## Header Rule Types

### Pattern Matching

Validate headers against regex patterns:

```toml
# Inline table syntax (compact)
headers = [
  { header = "Authorization", rule = { type = "matches", pattern = "^Bearer [A-Za-z0-9\\\\\\\\-_]+$" } }
]

# Table section syntax (expanded)
[[sources.webhook.extractor.headers]]
header = "Authorization"

[sources.webhook.extractor.headers.rule]
type = "matches"
pattern = "^Bearer [A-Za-z0-9\\\\-_]+$"
```

### Exact Matching

Require exact header values:

```toml
# Inline table syntax (compact)
headers = [
  { header = "Content-Type", rule = { type = "equals", value = "application/json", case_sensitive = false } }
]

# Table section syntax (expanded)
[[sources.webhook.extractor.headers]]
header = "Content-Type"

[sources.webhook.extractor.headers.rule]
type = "equals"
value = "application/json"
case_sensitive = false  # Optional, defaults to true
```

### Header Existence

Simply require that a header is present:

```toml
# Inline table syntax (compact)
headers = [
  { header = "X-Request-ID", rule = { type = "exists" } }
]

# Table section syntax (expanded)
[[sources.webhook.extractor.headers]]
header = "X-Request-ID"

[sources.webhook.extractor.headers.rule]
type = "exists"
```

### Environment Secrets

Compare against values from environment variables:

```toml
# Inline table syntax (compact)
headers = [
  { header = "X-API-Key", rule = { type = "secret", value = "EXPECTED_API_KEY" } }
]

# Table section syntax (expanded)
[[sources.webhook.extractor.headers]]
header = "X-API-Key"

[sources.webhook.extractor.headers.rule]
type = "secret"
value = "EXPECTED_API_KEY"  # Environment variable name
```

### HMAC Signature Verification

Verify cryptographic signatures to ensure request authenticity:

```toml
# Inline table syntax (compact)
headers = [
  { header = "X-Hub-Signature-256", rule = { type = "signature", token = "webhook-secret", signature_prefix = "sha256=", signature_on = "body", signature_encoding = "hex" } }
]

# Table section syntax (expanded)
[[sources.webhook.extractor.headers]]
header = "X-Hub-Signature-256"

[sources.webhook.extractor.headers.rule]
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

For complex signatures (like Svix), use table section syntax:

```toml
[[sources.webhook.extractor.headers]]
header = "svix-signature"

[sources.webhook.extractor.headers.rule]
type = "signature"
token = "svix-secret"
signature_prefix = "v1,"
signature_encoding = "hex"

[sources.webhook.extractor.headers.rule.signature_on]
headers_then_body = { separator = ".", headers = ["svix-id", "svix-timestamp"] }
```

## Common Validation Patterns

### GitHub Webhook Validation

```toml
[sources.github_webhook.extractor]
type = "webhook"
id = "github"

# GitHub signature validation
[[sources.github_webhook.extractor.headers]]
header = "X-Hub-Signature-256"

[sources.github_webhook.extractor.headers.rule]
type = "signature"
token = "GITHUB_WEBHOOK_SECRET"  # Environment variable
signature_prefix = "sha256="
signature_on = "body"
signature_encoding = "hex"
```

### GitLab Token Validation

```toml
[sources.gitlab_webhook.extractor]
type = "webhook"
id = "gitlab"

# GitLab token validation
[[sources.gitlab_webhook.extractor.headers]]
header = "X-Gitlab-Token"

[sources.gitlab_webhook.extractor.headers.rule]
type = "secret"
value = "GITLAB_WEBHOOK_TOKEN"  # Environment variable
```

### API Key + Content Type Validation

```toml
[sources.secure_api.extractor]
type = "webhook"
id = "api"

# Multiple validation rules
[[sources.secure_api.extractor.headers]]
header = "X-API-Key"

[sources.secure_api.extractor.headers.rule]
type = "secret"
value = "API_SECRET_KEY"

[[sources.secure_api.extractor.headers]]
header = "Content-Type"

[sources.secure_api.extractor.headers.rule]
type = "equals"
value = "application/json"
case_sensitive = false
```

### Custom Signature Validation

```toml
[sources.custom_webhook.extractor]
type = "webhook"
id = "custom"

# Custom signature format
[[sources.custom_webhook.extractor.headers]]
header = "X-Custom-Signature"

[sources.custom_webhook.extractor.headers.rule]
type = "signature"
token = "CUSTOM_SECRET"
signature_prefix = "custom="
signature_on = "body"
signature_encoding = "base64"
```

## Multi-Header Validation

Configure multiple validation rules for comprehensive security:

### Inline Table Syntax (Simple Cases)

```toml
[sources.enterprise.extractor]
type = "webhook"
id = "enterprise"
headers = [
  { header = "X-API-Key", rule = { type = "secret", value = "ENTERPRISE_API_KEY" } },
  { header = "Content-Type", rule = { type = "equals", value = "application/json", case_sensitive = false } },
  { header = "User-Agent", rule = { type = "matches", pattern = "^MyApp/[0-9]+\\\\.[0-9]+.*" } }
]
```

### Table Section Syntax (Complex Cases)

```toml
[sources.enterprise.extractor]
type = "webhook"
id = "enterprise"

# Require API key
[[sources.enterprise.extractor.headers]]
header = "X-API-Key"

[sources.enterprise.extractor.headers.rule]
type = "secret"
value = "ENTERPRISE_API_KEY"

# Require proper content type
[[sources.enterprise.extractor.headers]]
header = "Content-Type"

[sources.enterprise.extractor.headers.rule]
type = "equals"
value = "application/json"
case_sensitive = false

# Verify signature
[[sources.enterprise.extractor.headers]]
header = "X-Enterprise-Signature"

[sources.enterprise.extractor.headers.rule]
type = "signature"
token = "ENTERPRISE_SECRET"
signature_prefix = "sha256="
signature_on = "body"
signature_encoding = "hex"
```

## Security Best Practices

### Environment Variables

Always use environment variables for sensitive values:

```bash
# Set environment variables
export GITHUB_WEBHOOK_SECRET="your-secret-here"
export API_KEY="your-api-key-here"
export GITLAB_TOKEN="your-gitlab-token"
```

```toml
# Reference in configuration
[[sources.secure.extractor.headers]]
header = "X-API-Key"

[sources.secure.extractor.headers.rule]
type = "secret"
value = "API_KEY"  # Retrieved from environment
```

### Defense in Depth

Use multiple validation layers:

```toml
# Example: API key + signature + content type
headers = [
  { header = "X-API-Key", rule = { type = "secret", value = "API_KEY" } },
  { header = "X-Signature", rule = { type = "signature", token = "HMAC_SECRET", signature_prefix = "sha256=", signature_on = "body", signature_encoding = "hex" } },
  { header = "Content-Type", rule = { type = "equals", value = "application/json" } }
]
```

### Token Rotation

Design configuration to support token rotation:

```toml
# Use environment variables that can be updated without config changes
[[sources.rotating_auth.extractor.headers]]
header = "Authorization"

[sources.rotating_auth.extractor.headers.rule]
type = "matches"
pattern = "^Bearer [A-Za-z0-9\\-_]+"  # Pattern allows for any valid token format
```

### HTTPS Only

Always use HTTPS for webhook endpoints:

```toml
# Ensure webhook URLs use HTTPS
[http]
host = "0.0.0.0"
port = 8443  # HTTPS port
```

### Rate Limiting

Consider implementing rate limiting for webhook endpoints (configured outside cdviz-collector):

```nginx
# Example nginx rate limiting
location /webhook/ {
    limit_req zone=webhook burst=10 nodelay;
    proxy_pass http://cdviz-collector:8080;
}
```

## Testing Header Validation

### Test Valid Requests

```bash
# Test valid authentication
curl -X POST http://localhost:8080/webhook/test \
  -H "Content-Type: application/json" \
  -H "X-API-Key: my-secret-key" \
  -d '{"test": "data"}'
```

### Test Invalid Requests

```bash
# Test missing header (should return 401)
curl -X POST http://localhost:8080/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Test wrong API key (should return 403)
curl -X POST http://localhost:8080/webhook/test \
  -H "Content-Type: application/json" \
  -H "X-API-Key: wrong-key" \
  -d '{"test": "data"}'

# Test invalid content type (should return 400/403)
curl -X POST http://localhost:8080/webhook/test \
  -H "Content-Type: text/plain" \
  -H "X-API-Key: my-secret-key" \
  -d '{"test": "data"}'
```

### Debug Validation Issues

Enable debug logging to see header processing:

```bash
RUST_LOG=cdviz_collector::security=debug cdviz-collector connect --config config.toml
```

## Response Codes

Header validation affects HTTP response codes:

| Code | Condition |
|------|-----------|
| 200/201 | All header rules passed |
| 400 Bad Request | Malformed headers or content |
| 401 Unauthorized | Missing required headers |
| 403 Forbidden | Header validation failed |

## Syntax Choice Guidelines

### Use Inline Table Syntax When:

✅ **Simple Rules**: Basic validation with 1-3 simple headers
✅ **Compact Configuration**: Want to keep configuration concise
✅ **Single Values**: Each rule has only a few parameters

```toml
# Good for inline syntax
headers = [
  { header = "X-API-Key", rule = { type = "secret", value = "API_KEY" } },
  { header = "Content-Type", rule = { type = "equals", value = "application/json" } }
]
```

### Use Table Section Syntax When:

✅ **Complex Rules**: Signature verification with many parameters
✅ **Better Readability**: Multiple headers with detailed configurations
✅ **Comments Needed**: Want to document each header rule
✅ **Nested Structures**: Complex signature_on configurations

```toml
# Good for table sections
[[sources.complex.extractor.headers]]
header = "svix-signature"  # Svix webhook signature

[sources.complex.extractor.headers.rule]
type = "signature"
token = "svix-secret"
signature_prefix = "v1,"
signature_encoding = "hex"

# Complex nested configuration
[sources.complex.extractor.headers.rule.signature_on]
headers_then_body = { separator = ".", headers = ["svix-id", "svix-timestamp"] }
```

## Related

- [Webhook Source](./sources/webhook.md) - HTTP webhook endpoint configuration
- [SSE Sink](./sinks/) - Server-Sent Events sink configuration
- [Header Authentication](./header-authentication.md) - Outgoing request headers
- [Security Configuration](./configuration.md#security) - Overall security setup