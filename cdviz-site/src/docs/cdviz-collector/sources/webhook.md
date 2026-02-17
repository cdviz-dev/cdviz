# Webhook Extractor

Receives events via HTTP POST requests, creating endpoints that accept JSON payloads from CI/CD pipelines and external services.

## Configuration

```toml
[sources.my_webhook.extractor]
type = "webhook"
id = "github-events"
headers_to_keep = ["X-GitHub-Event", "X-GitHub-Delivery"]
```

## Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | string | — | Unique identifier used in the URL path (`/webhook/{id}`) |
| `headers_to_keep` | array | `[]` | HTTP header names to preserve through the pipeline |
| `headers` | array | `[]` | Header validation rules for incoming requests |
| `metadata` | object | — | Static metadata for all events; `context.source` is auto-populated if unset |

## URL Structure

```
POST /webhook/{id}
```

## Response Codes

| Code | Condition |
| --- | --- |
| 201 Created | Event successfully received |
| 400 Bad Request | Invalid JSON body |
| 401 Unauthorized | Missing authentication header |
| 403 Forbidden | Header validation failed |

## Security

```toml
# API key validation
[[sources.my_webhook.extractor.headers]]
header = "X-API-Key"
[sources.my_webhook.extractor.headers.rule]
type = "equals"
value = "my-secret-api-key"

# HMAC signature
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

## Example

```toml
[sources.github_events]
enabled = true
transformer_refs = ["github_to_cdevents"]

[sources.github_events.extractor]
type = "webhook"
id = "github"
headers_to_keep = ["X-GitHub-Event", "X-GitHub-Delivery"]
```
