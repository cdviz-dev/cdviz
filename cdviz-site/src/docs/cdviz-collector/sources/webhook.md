---
description: "CDviz Collector webhook source: receive CI/CD events via HTTP POST. Supports GitHub, GitLab, Jenkins webhooks with HMAC signature validation."
---

# Webhook Extractor

Receives events via HTTP POST requests, creating endpoints that accept JSON payloads from CI/CD pipelines and external services.

The webhook source is the primary way to receive **push-based events** from GitHub, GitLab, Jenkins, ArgoCD, and other systems that support outgoing webhooks.

## Configuration

```toml
[sources.my_webhook.extractor]
type = "webhook"
id = "github-events"
headers_to_keep = ["X-GitHub-Event", "X-GitHub-Delivery"]
```

## Parameters

| Parameter         | Type   | Default | Description                                                                 |
| ----------------- | ------ | ------- | --------------------------------------------------------------------------- |
| `id`              | string | —       | Unique identifier used in the URL path (`/webhook/{id}`)                    |
| `headers_to_keep` | array  | `[]`    | HTTP header names to preserve through the pipeline                          |
| `headers`         | table  | `{}`    | Header validation rules for incoming requests                               |
| `metadata`        | object | —       | Static metadata for all events; `context.source` is auto-populated if unset |

## URL Structure

```
POST /webhook/{id}
```

The collector exposes one endpoint per webhook source. Configure the external service to send POST requests to `https://your-collector:8080/webhook/{id}`.

## Response Codes

| Code             | Condition                     |
| ---------------- | ----------------------------- |
| 201 Created      | Event successfully received   |
| 400 Bad Request  | Invalid JSON body             |
| 401 Unauthorized | Missing authentication header |
| 403 Forbidden    | Header validation failed      |

## Security

Always validate webhook signatures to prevent unauthorized event injection.

### API key validation

```toml
[sources.my_webhook.extractor.headers]
"x-api-key" = { type = "secret", value = "my-secret-api-key" }
```

### HMAC signature (GitHub, Jenkins, Gitea)

```toml
[sources.github_webhook.extractor.headers]
"x-hub-signature-256" = { type = "signature", token = "github-webhook-secret", signature_prefix = "sha256=", signature_on = "body", signature_encoding = "hex" }
```

**[→ Complete Header Validation Guide](../header-validation.md)**

## Integration Examples

### GitHub Actions / GitHub webhooks

```toml
[sources.github_events]
enabled = true
transformer_refs = ["github_to_cdevents"]

[sources.github_events.extractor]
type = "webhook"
id = "github"
headers_to_keep = ["X-GitHub-Event", "X-GitHub-Delivery"]

[sources.github_events.extractor.headers]
"x-hub-signature-256" = { type = "signature", token_file = "/run/secrets/github_webhook_secret", signature_prefix = "sha256=", signature_on = "body", signature_encoding = "hex" }
```

Configure in GitHub: Settings → Webhooks → Add webhook → `https://collector:8080/webhook/github`

### GitLab webhooks

```toml
[sources.gitlab_events]
enabled = true
transformer_refs = ["gitlab_to_cdevents"]

[sources.gitlab_events.extractor]
type = "webhook"
id = "gitlab"
headers_to_keep = ["X-Gitlab-Event", "X-Gitlab-Event-UUID"]

[sources.gitlab_events.extractor.headers]
"x-gitlab-token" = { type = "secret", value_file = "/run/secrets/gitlab_webhook_token" }
```

### Multiple independent webhook sources

Define one source per external system to apply different transformers:

```toml
[sources.github]
enabled = true
transformer_refs = ["github_to_cdevents"]

[sources.github.extractor]
type = "webhook"
id = "github"

[sources.argocd]
enabled = true
transformer_refs = ["argocd_to_cdevents"]

[sources.argocd.extractor]
type = "webhook"
id = "argocd"
```

## Related

- [GitHub Integration](../integrations/github.md) — complete setup guide for GitHub webhooks
- [GitLab Integration](../integrations/gitlab.md) — complete setup guide for GitLab webhooks
- [Header Validation](../header-validation.md) — validate and authenticate incoming requests
- [SSE Source](./sse.md) — alternative for services that support event streaming
- [Transformers](../transformers.md) — convert webhook payloads to CDEvents
