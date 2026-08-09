---
title: Bitbucket Integration
description: |
  Collect Bitbucket Cloud events (via webhooks), transform them to CDEvents.
  <ul>
  <li>Bitbucket notifies a webhook on pushes, pull requests, issues and commit statuses.</li>
  <li>cdviz-collector transforms these events to CDEvents, and sends them to the database, listeners,...</li>
  </ul>
references:
  - title: Bitbucket Cloud - Manage webhooks
    url: https://support.atlassian.com/bitbucket-cloud/docs/manage-webhooks/
  - title: Bitbucket Cloud - Event payloads
    url: https://support.atlassian.com/bitbucket-cloud/docs/event-payloads/
  - title: Examples of CDEvents converted from Bitbucket's events
    url: https://github.com/cdviz-dev/transformers-community/tree/main/bitbucket_webhook/outputs
---

<script setup>
import IntegrationCard from '../../../components/IntegrationCard.vue'
</script>

<IntegrationCard />

> [!NOTE] Beta
> This transformer is in beta: event mapping and field coverage may still change. It targets **Bitbucket Cloud** webhook payloads.

## Configuration

### Setting Up cdviz-collector

Configure `cdviz-collector.toml` to receive Bitbucket webhook events:

```toml
[sources.bitbucket_webhook]
enabled = true
transformer_refs = ["bitbucket_events"]

[sources.bitbucket_webhook.extractor]
type = "webhook"
id = "000-bitbucket" # used as part of the webhook's url
# required: Bitbucket exposes the event type only as a header
headers_to_keep = ["x-event-key"]

[sources.bitbucket_webhook.extractor.headers]
# value set by env CDVIZ_COLLECTOR__SOURCES__BITBUCKET_WEBHOOK__EXTRACTOR__HEADERS__X-HUB-SIGNATURE__TOKEN
"x-hub-signature" = { type = "signature", signature_encoding = "hex", signature_on = "body", signature_prefix = "sha256=", token = "changeme" }

# Transformer from transformers-community repository
[remote.transformers-community]
type = "github://cdviz-dev/transformers-community"
# token = "xxx"  # set by env 'CDVIZ_COLLECTOR__REMOTE__TRANSFORMERS-COMMUNITY'

[transformers]
bitbucket_events = { type = "vrl", template_rfile = "transformers-community:///bitbucket_webhook/to_v0_5.vrl" }
```

The `template_rfile` references the VRL transformation logic from the [transformers-community repository](https://github.com/cdviz-dev/transformers-community). For more details on remote transformers, see the [Transformers documentation](../cdviz-collector/transformers.md#using-remote-transformers).

> [!WARNING] `headers_to_keep` is mandatory
> Unlike GitLab or Jira, Bitbucket does **not** include the event type in the payload body: it is only available in the `X-Event-Key` HTTP header. Without `headers_to_keep = ["x-event-key"]`, the transformer cannot determine the event type and emits nothing.

Bitbucket signs the raw body with HMAC-SHA256 and sends it as `X-Hub-Signature: sha256=<hex>` (note: **no** `-256` suffix in the header name, unlike GitHub).

### Setting Up the Bitbucket Webhook

1. Navigate to **Repository settings > Webhooks > Add webhook** (or **Workspace settings > Webhooks** to cover every repository)
2. **URL**: `http://your-collector-url/webhook/000-bitbucket`
3. **Secret**: the same value as `token` of the `x-hub-signature` header in the collector configuration
4. Select the **Triggers**:
   - ✅ Repository: Push
   - ✅ Repository: Build status created / updated
   - ✅ Pull request: Created, Updated, Approved, Merged, Declined
   - ✅ Issue: Created, Updated
5. Ensure **Active** is checked, then save

### Testing the Integration

Send a test event by hand:

```bash
curl -X POST http://localhost:8080/webhook/000-bitbucket \
  -H "Content-Type: application/json" \
  -H "X-Event-Key: repo:push" \
  -d @push_branch_created.json
```

Check webhook deliveries in Bitbucket: **Repository settings > Webhooks > View requests**.

To verify webhook reception before transformation:

```toml
[sources.bitbucket_webhook]
transformer_refs = ["log", "discard_all"]  # Log payloads without processing
```

For webhook troubleshooting, see the [Webhook Extractor documentation](../cdviz-collector/sources/webhook.md#testing).

## Event Mapping

Event type detection is performed in VRL based on the `X-Event-Key` header:

| `X-Event-Key`                | Condition                                                  | CDEvent Type           |
| ---------------------------- | ---------------------------------------------------------- | ---------------------- |
| `repo:push`                  | change with `new.type=branch` and `created`                | `branch.created`       |
| `repo:push`                  | change with `old.type=branch` and `closed`                 | `branch.deleted`       |
| `repo:push`                  | change with `new.type=tag` and `created`                   | `artifact.published`   |
| `pullrequest:created`        |                                                            | `change.created`       |
| `pullrequest:updated`        |                                                            | `change.updated`       |
| `pullrequest:approved`       |                                                            | `change.reviewed`      |
| `pullrequest:fulfilled`      |                                                            | `change.merged`        |
| `pullrequest:rejected`       |                                                            | `change.abandoned`     |
| `issue:created`              |                                                            | `ticket.created`       |
| `issue:updated`              | `state` in [resolved, closed, invalid, duplicate, wontfix] | `ticket.closed`        |
| `issue:updated`              | other states (new, open, on hold, …)                       | `ticket.updated`       |
| `repo:commit_status_created` | `state=INPROGRESS`                                         | `pipelineRun.started`  |
| `repo:commit_status_updated` | `state` in [SUCCESSFUL, FAILED, STOPPED]                   | `pipelineRun.finished` |

A single `repo:push` payload can carry several changes, and therefore produce several CDEvents.

Any other event key (comments, `repo:fork`, `repo:updated`, `pullrequest:unapproved`, `pullrequest:changes_request_*`, …) produces **no** event.

### Why commit statuses for pipelines?

Bitbucket Cloud has no webhook for Pipelines runs. CI systems (Bitbucket Pipelines, Jenkins, …) report their progress through the [commit status API](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-commit-statuses/), which is what `repo:commit_status_created` / `repo:commit_status_updated` carry.

Each commit status `key` is an independent CI run, so it is mapped to a `pipelineRun` (`pipelineName` = `<workspace>/<repo>/<key>`) rather than a `taskRun`, which would require a parent pipeline id that the payload does not provide.

Outcome mapping: `SUCCESSFUL` → `success`, `FAILED` → `failure`, `STOPPED` → `error`.

### Artifact Identification

For `artifact.published` events (tag push), `subject.id` is a PURL:

```
pkg:generic/<workspace>/<repo_slug>@<tag_name>?repository_url=<repository html url>
```

Bitbucket tags may reference any kind of artifact (container images, packages, binaries), so `pkg:generic` is used. For a specific artifact type, extend the transformer to emit a type-specific PURL.

## Event Coverage

**Supported Events**:

- ✅ Branch creation / deletion
- ✅ Tag push (artifact published)
- ✅ Pull requests (created, updated, merged, declined, approved)
- ✅ Issues (created, updated, closed)
- ✅ CI status via commit statuses (started, finished)

**Not Yet Supported**:

- Comment events
- Forks and repository updates
- Deployments
- `pullrequest:unapproved`, `pullrequest:changes_request_*`

These can be added following the existing pattern in the [transformer VRL file](https://github.com/cdviz-dev/transformers-community/blob/main/bitbucket_webhook/to_v0_5.vrl).

## Troubleshooting

### No event produced

1. Check that the event key is mapped (see the table above) — unmapped keys are silently ignored.
2. Check that `headers_to_keep` contains `x-event-key`; without it no event is emitted.
3. Check the delivery in **Repository settings > Webhooks > View requests**.

### Signature rejected

1. The `token` in `cdviz-collector.toml` must match the webhook secret configured in Bitbucket.
2. The header is `x-hub-signature`, with a `sha256=` prefix and hex encoding.
