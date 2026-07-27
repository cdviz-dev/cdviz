---
title: Forgejo Integration
keywords: "Forgejo webhook integration,Forgejo CDEvents,Forgejo Actions,cdviz-collector Forgejo"
description: |
  Collect Forgejo events (via webhooks), transform them to CDEvents.
  <ul>
  <li>Forgejo notifies a webhook on pushes, pull requests, issues, releases, packages and Actions runs.</li>
  <li>cdviz-collector transforms these events to CDEvents, and sends them to the database, listeners,...</li>
  </ul>
references:
  - title: Forgejo - Webhooks
    url: https://forgejo.org/docs/latest/user/repository/webhooks/
  - title: Examples of CDEvents converted from Forgejo's events
    url: https://github.com/cdviz-dev/transformers-community/tree/main/forgejo_webhook/outputs
---

<script setup>
import IntegrationCard from '../../../components/IntegrationCard.vue'
</script>

<IntegrationCard />

> [!IMPORTANT] Forgejo vs Gitea
> Forgejo is a Gitea fork and most webhook payloads are still byte-identical, **but the CI events are not**:
> Forgejo sends `action_run_success` / `action_run_failure` / `action_run_recover`, while Gitea sends
> `workflow_run` / `workflow_job`. Using the wrong transformer silently drops all pipeline events — for
> Gitea, use the [Gitea integration](./gitea.md) instead.

## Configuration

### Setting Up cdviz-collector

Configure `cdviz-collector.toml` to receive Forgejo webhook events:

```toml
[remote.transformers-community]
type = "github://cdviz-dev/transformers-community"

[transformers]
forgejo_webhook = { type = "vrl", template_rfile = "transformers-community:///forgejo_webhook/to_v0_5.vrl" }

[sources.forgejo_webhook]
enabled = true
transformer_refs = ["forgejo_webhook"]

[sources.forgejo_webhook.extractor]
type = "webhook"
id = "000-forgejo" # used as part of the webhook's url

[sources.forgejo_webhook.extractor.headers]
# forgejo signs with HMAC-SHA256, hex encoded, over the raw body, without prefix
# value set by env CDVIZ_COLLECTOR__SOURCES__FORGEJO_WEBHOOK__EXTRACTOR__HEADERS__X-FORGEJO-SIGNATURE__TOKEN
"x-forgejo-signature" = { type = "signature", signature_encoding = "hex", signature_on = "body", token = "changeme" }
```

The `template_rfile` references the VRL transformation logic from the [transformers-community repository](https://github.com/cdviz-dev/transformers-community). For more details on remote transformers, see the [Transformers documentation](../cdviz-collector/transformers.md#using-remote-transformers).

### Setting Up the Forgejo Webhook

1. Navigate to **Repository settings > Webhooks > Add Webhook > Forgejo** (or a organization/global webhook to cover every repository)
2. **Target URL**: `http://your-collector-url/webhook/000-forgejo`
3. **HTTP Method**: `POST`, **POST Content Type**: `application/json`
4. **Secret**: the same value as `token` of the `x-forgejo-signature` header in the collector configuration
5. **Trigger On**: select the events you want, or "All events" (unmapped events are silently ignored) — at minimum:
   - ✅ Repository events (branch/tag creation & deletion)
   - ✅ Pull request events
   - ✅ Issue events
   - ✅ Release events
   - ✅ Package events
   - ✅ Action events (for CI pipeline results)
6. Ensure **Active** is checked, then save

### Testing the Integration

To verify webhook reception before transformation:

```toml
[sources.forgejo_webhook]
transformer_refs = ["log", "discard_all"]  # Log payloads without processing
```

Check webhook deliveries in Forgejo: **Repository settings > Webhooks > (your webhook) > Recent Deliveries**.

For webhook troubleshooting, see the [Webhook Extractor documentation](../cdviz-collector/sources/webhook.md#testing).

## Event Mapping

Event type detection is performed in VRL, mostly from body fields rather than the `X-Forgejo-Event` header, since Forgejo's ~28 hook event types share only a handful of payload structs.

| Forgejo Event                                                   | Action                            | CDEvent Type                                    |
| ---------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------- |
| `action_run_success` / `action_run_recover`                     |                                    | `pipelineRun.finished` (outcome `success`)       |
| `action_run_failure`                                             |                                    | `pipelineRun.finished` (outcome `failure`)       |
| `package`                                                        | `created`                          | `artifact.published`                             |
| `package`                                                        | `deleted`                          | `artifact.deleted`                               |
| `release`                                                        | `published`                        | `artifact.published` (+ one per release asset)   |
| `release`                                                        | `deleted`                          | `artifact.deleted`                               |
| `pull_request` (+ `_assign`, `_label`, `_milestone`, `_sync`)    | `opened`                           | `change.created`                                 |
| `pull_request`                                                   | `closed` (merged / not merged)     | `change.merged` / `change.abandoned`             |
| `pull_request`                                                   | any other                          | `change.updated`                                 |
| `pull_request_review_approved` / `_rejected` / `_comment`        | `reviewed`                         | `change.reviewed`                                |
| `pull_request_comment`                                           | any                                | `change.updated`                                 |
| `issues` (+ `issue_assign`, `_label`, `_milestone`)              | `opened`                           | `ticket.created`                                 |
| `issues`                                                         | `closed`                           | `ticket.closed`                                  |
| `issues`                                                         | any other                          | `ticket.updated`                                 |
| `issue_comment`                                                  | any                                | `ticket.updated`                                 |
| `create` (`ref_type: branch`)                                    |                                    | `branch.created`                                 |
| `delete` (`ref_type: branch`)                                    |                                    | `branch.deleted`                                 |
| `repository`                                                     | `created` / `deleted`              | `repository.created` / `repository.deleted`      |
| `fork`                                                           |                                    | `repository.created` (for the fork)              |

A single payload produces at most one CDEvent (except `release.published`, which produces one per asset).

Any other event (`push`, `wiki`, `workflow_dispatch`, `schedule`, `create`/`delete` for tags, …) produces **no** event — there is no CDEvents subject for raw pushes or tags outside of the artifact model.

### Why no `pipelineRun.queued` / `.started`?

Forgejo Actions only notify on terminal states (`action_run_success` / `action_run_failure` / `action_run_recover`), so only `pipelineRun.finished` is reachable. There is also no job-level webhook, so `taskRun` is not emitted at all. Gitea, which has `workflow_run:requested` / `:in_progress`, does emit the full pipeline lifecycle — see the [Gitea integration](./gitea.md).

### Artifact Identification

Container/package artifacts have no digest in the payload, so the OCI PURL uses the tag as version:

```
pkg:oci/<name>@<tag>?repository_url=<url>&tag=<tag>
```

## Event Coverage

**Supported Events**:

- ✅ Branch creation / deletion
- ✅ Pull requests (created, updated, merged, abandoned, reviewed)
- ✅ Issues (created, updated, closed)
- ✅ Releases and packages (artifact published / deleted)
- ✅ Repository created/deleted, forks
- ✅ CI pipeline outcome via Forgejo Actions (`pipelineRun.finished` only)

**Not Yet Supported**:

- `pipelineRun.queued` / `.started` and `taskRun` (not available from Forgejo Actions webhooks)
- Push events, wiki events, tag create/delete
- `release.updated` (would re-publish identical artifact coordinates)

These can be added following the existing pattern in the [transformer VRL file](https://github.com/cdviz-dev/transformers-community/blob/main/forgejo_webhook/to_v0_5.vrl).

## Troubleshooting

### No event produced

1. Check that the event/action combination is mapped (see the table above) — unmapped ones are silently ignored.
2. Check the delivery in **Repository settings > Webhooks > (your webhook) > Recent Deliveries**.

### Signature rejected

1. The `token` in `cdviz-collector.toml` must match the webhook secret configured in Forgejo.
2. The header is `x-forgejo-signature`, hex encoded, no prefix.
