# Header Validation

Header validation is used by components that **receive incoming messages** to verify the authenticity and authorization of those messages. This includes [webhook](./sources/webhook.md) sources that accept HTTP events from external systems, [Kafka sources](./sources/kafka.md) that validate Kafka message headers, and [SSE sinks](./sinks/sse.md) that receive HTTP requests.

## Components Using Header Validation

| Component          | Purpose                                                                      |
| ------------------ | ---------------------------------------------------------------------------- |
| **Source webhook** | Validate incoming webhook events from CI/CD systems, GitHub, GitLab, etc.    |
| **Source Kafka**   | Validate incoming Kafka message headers for authentication and authorization |
| **Sink SSE**       | Validate incoming HTTP requests to SSE endpoints                             |

## Validation Process

When a request arrives, each configured header rule is evaluated:

1. **All rules must pass** for the request to be accepted
2. **Any rule failure** results in request rejection (401/403 response)
3. **Missing headers** are treated as validation failures

## Header Rule Types

### Pattern Matching

Validate headers against regex patterns:

```toml
[sources.webhook.extractor.headers]
"Authorization" = { type = "matches", pattern = "^Bearer [A-Za-z0-9\\\\-_]+$" }
```

### Exact Matching

Require exact header values:

```toml
[sources.webhook.extractor.headers]
"Content-Type" = { type = "equals", value = "application/json", case_sensitive = false }
```

### Header Existence

Simply require that a header is present:

```toml
[sources.webhook.extractor.headers]
"X-Request-ID" = { type = "exists" }
```

### Environment Secrets

Compare against values from environment variables:

```toml
[sources.webhook.extractor.headers]
"X-API-Key" = { type = "secret", value = "EXPECTED_API_KEY" }
```

### HMAC Signature Verification

Verify cryptographic signatures to ensure request authenticity:

```toml
[sources.webhook.extractor.headers]
"X-Hub-Signature-256" = { type = "signature", token = "webhook-secret", signature_prefix = "sha256=", signature_on = "body", signature_encoding = "hex" }
```

#### Signature Parameters

- **`token`** (string): Secret key for HMAC computation
- **`signature_prefix`** (string, optional): Prefix added to signature (e.g., "sha256=")
- **`signature_on`** (string): What to sign - "body" or "headers_then_body"
- **`signature_encoding`** (string): Encoding format - "hex" or "base64"
- **`token_encoding`** (string, optional): How to decode the token - "hex", "base64", or unset

## Common Validation Patterns

### GitHub Webhook Validation

```toml
[sources.github_webhook.extractor]
type = "webhook"
id = "github"

# GitHub signature validation
[sources.github_webhook.extractor.headers]
"X-Hub-Signature-256" = { type = "signature", token = "GITHUB_WEBHOOK_SECRET", signature_prefix = "sha256=", signature_on = "body", signature_encoding = "hex" }
```

### GitLab Token Validation

```toml
[sources.gitlab_webhook.extractor]
type = "webhook"
id = "gitlab"

# GitLab token validation
[sources.gitlab_webhook.extractor.headers]
"X-Gitlab-Token" = { type = "secret", value = "GITLAB_WEBHOOK_TOKEN" }
```

### API Key + Content Type Validation

```toml
[sources.secure_api.extractor]
type = "webhook"
id = "api"

[sources.secure_api.extractor.headers]
"X-API-Key" = { type = "secret", value = "API_SECRET_KEY" }
"Content-Type" = { type = "equals", value = "application/json", case_sensitive = false }
```

### Custom Signature Validation

```toml
[sources.custom_webhook.extractor]
type = "webhook"
id = "custom"

# Custom signature format
[sources.custom_webhook.extractor.headers]
"X-Custom-Signature" = { type = "signature", token = "CUSTOM_SECRET", signature_prefix = "custom=", signature_on = "body", signature_encoding = "base64" }
```

## Multi-Header Validation

Configure multiple validation rules for comprehensive security:

```toml
[sources.enterprise.extractor]
type = "webhook"
id = "enterprise"

[sources.enterprise.extractor.headers]
"X-API-Key" = { type = "secret", value = "ENTERPRISE_API_KEY" }
"Content-Type" = { type = "equals", value = "application/json", case_sensitive = false }
"User-Agent" = { type = "matches", pattern = "^MyApp/[0-9]+\\.[0-9]+.*" }
```

## Security Best Practices

### HTTPS Only

Always use HTTPS for webhook endpoints

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

| Code             | Condition                    |
| ---------------- | ---------------------------- |
| 200/201          | All header rules passed      |
| 400 Bad Request  | Malformed headers or content |
| 401 Unauthorized | Missing required headers     |
| 403 Forbidden    | Header validation failed     |

## Related

- [Webhook Source](./sources/webhook.md) - HTTP webhook endpoint configuration
- [Kafka Source](./sources/kafka.md) - Kafka source message validation
- [SSE Sink](./sinks/sse.md) - Server-Sent Events sink configuration
- [Header Authentication](./header-authentication.md) - Outgoing request headers
- [Security Configuration](./configuration.md#security) - Overall security setup
