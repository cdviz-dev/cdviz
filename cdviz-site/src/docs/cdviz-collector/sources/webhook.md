# Webhook Extractor

The webhook extractor allows CDviz Collector to receive events via HTTP POST requests. It creates HTTP endpoints that can accept JSON payloads from external systems like CI/CD pipelines, monitoring tools, and other webhook-enabled services.

## Configuration

```toml
[sources.my_webhook.extractor]
type = "webhook"
id = "github-events"
headers_to_keep = ["X-GitHub-Event", "X-GitHub-Delivery"]
```

## Parameters

### Required Parameters

- **`id`** (string): Unique identifier used in the URL path. The webhook will be available at `/webhook/{id}`

### Optional Parameters

- **`headers_to_keep`** (array of strings): List of HTTP header names to preserve and forward through the pipeline
- **`headers`** (array): Header validation rules for incoming requests (see [Security](#security))
- **`metadata`** (object): Static metadata to include in all events from this extractor. The `metadata.context.source` field will be automatically populated if not explicitly set (see [Extractor Metadata Configuration](./index.md#extractor-metadata-configuration))

### Deprecated Parameters

- **`signature`** (object): Signature verification configuration. **Deprecated in favor of `headers` rules**

## URL Structure

Webhooks are accessible at:

```
POST /webhook/{id}
```

For example, with `id = "github-events"`, the endpoint is:

```
POST /webhook/github-events
```

## Request Processing

### 1. Header Validation

If header rules are configured, incoming requests are validated against them. Failed validation returns appropriate HTTP error codes (401, 403, etc.).

### 2. JSON Parsing

The request body must be valid JSON. Invalid JSON returns a 400 Bad Request response.

### 3. Header Filtering

Only headers listed in `headers_to_keep` are preserved. Sensitive headers (marked as sensitive by the HTTP client) are automatically filtered out for security.

### 4. Event Creation

A pipeline event is created with:

- **Body**: Parsed JSON from request body
- **Headers**: Filtered headers as key-value pairs
- **Metadata**: Base metadata from extractor configuration (merged with transformer metadata)

## Security

Webhook extractors support comprehensive header validation for incoming requests. This includes API key validation, signature verification, and custom header rules.

### Quick Examples

```toml
# API key validation
[[sources.secure_webhook.extractor.headers]]
header = "X-API-Key"

[sources.secure_webhook.extractor.headers.rule]
type = "equals"
value = "my-secret-api-key"
case_sensitive = true

# GitHub signature verification
[[sources.github_webhook.extractor.headers]]
header = "X-Hub-Signature-256"

[sources.github_webhook.extractor.headers.rule]
type = "signature"
token = "github-webhook-secret"
signature_prefix = "sha256="
signature_on = "body"
signature_encoding = "hex"
```

**[→ Complete Header Validation Guide](../header-validation.md)**

## Examples

### Basic GitHub Webhook

```toml
[sources.github_events]
enabled = true
transformer_refs = ["github_to_cdevents"]

[sources.github_events.extractor]
type = "webhook"
id = "github"
headers_to_keep = ["X-GitHub-Event", "X-GitHub-Delivery"]
```

### Secure Webhook with API Key

```toml
[sources.secure_api]
enabled = true
transformer_refs = ["validate_and_convert"]

[sources.secure_api.extractor]
type = "webhook"
id = "api-events"
headers_to_keep = ["Content-Type"]

# Require API key
[[sources.secure_api.extractor.headers]]
header = "X-API-Key"

[sources.secure_api.extractor.headers.rule]
type = "equals"
value = "secret-api-key-123"
case_sensitive = true
```

### GitLab Webhook with Token Verification

```toml
[sources.gitlab_events]
enabled = true
transformer_refs = ["gitlab_transformer"]

[sources.gitlab_events.extractor]
type = "webhook"
id = "gitlab"
headers_to_keep = ["X-Gitlab-Event", "X-Gitlab-Event-UUID"]

# Verify GitLab token
[[sources.gitlab_events.extractor.headers]]
header = "X-Gitlab-Token"

[sources.gitlab_events.extractor.headers.rule]
type = "equals"
value = "my-gitlab-webhook-token"
case_sensitive = true
```

### Multi-Rule Validation

```toml
[sources.enterprise_webhook]
enabled = true

[sources.enterprise_webhook.extractor]
type = "webhook"
id = "enterprise"
headers_to_keep = ["Content-Type", "X-Event-Type"]

# Require specific content type
[[sources.enterprise_webhook.extractor.headers]]
header = "Content-Type"

[sources.enterprise_webhook.extractor.headers.rule]
type = "equals"
value = "application/json"
case_sensitive = false

# Require authorization header with Bearer token
[[sources.enterprise_webhook.extractor.headers]]
header = "Authorization"

[sources.enterprise_webhook.extractor.headers.rule]
type = "matches"
pattern = "^Bearer [A-Za-z0-9\\-_\\.]+"

# Verify HMAC signature
[[sources.enterprise_webhook.extractor.headers]]
header = "X-Signature"

[sources.enterprise_webhook.extractor.headers.rule]
type = "signature"
token = "enterprise-webhook-secret"
signature_prefix = "sha256="
signature_on = "body"
signature_encoding = "hex"
```

## Response Codes

| Code                   | Condition                                 |
| ---------------------- | ----------------------------------------- |
| 201 Created            | Event successfully received and processed |
| 400 Bad Request        | Invalid JSON in request body              |
| 401 Unauthorized       | Missing required authentication header    |
| 403 Forbidden          | Header validation failed                  |
| 404 Not Found          | Invalid webhook path                      |
| 405 Method Not Allowed | Non-POST request                          |

## Testing

Test your webhook with curl:

```bash
# Basic webhook test
curl -X POST http://localhost:8080/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "data": "hello"}'

# With authentication
curl -X POST http://localhost:8080/webhook/secure \
  -H "Content-Type: application/json" \
  -H "X-API-Key: my-secret-key" \
  -d '{"event": "secure_test"}'
```

## Integration Examples

### GitHub Actions

```yaml
# .github/workflows/notify-cdviz.yml
name: Notify CDviz
on: [push, pull_request]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send to CDviz
        run: |
          curl -X POST ${{ vars.CDVIZ_WEBHOOK_URL }} \
            -H "Content-Type: application/json" \
            -H "X-API-Key: ${{ secrets.CDVIZ_API_KEY }}" \
            -d '{
              "event": "github_action",
              "repository": "${{ github.repository }}",
              "ref": "${{ github.ref }}",
              "sha": "${{ github.sha }}"
            }'
```

### GitLab CI/CD

```yaml
# .gitlab-ci.yml
stages:
  - notify

notify_cdviz:
  stage: notify
  script:
    - |
        curl -X POST $CDVIZ_WEBHOOK_URL \
          -H "Content-Type: application/json" \
          -H "X-Gitlab-Token: $CDVIZ_GITLAB_TOKEN" \
          -d "{
            \"event\": \"gitlab_pipeline\",
            \"project_id\": $CI_PROJECT_ID,
            \"pipeline_id\": $CI_PIPELINE_ID,
            \"status\": \"$CI_JOB_STATUS\"
          }"
```

## Related

- [Sources Overview](./index.md) - Understanding the source pipeline
- [SSE Extractor](./sse.md) - For Server-Sent Events
- [Transformers](../transformers.md) - Processing webhook payloads
- [Security Configuration](../configuration.md#security) - Advanced security options
