---
title: Gitea Integration
keywords: "Gitea webhook integration,Gitea CDEvents,Gitea Actions,cdviz-collector Gitea"
description: |
  Collect Gitea events (via webhooks), transform them to CDEvents.
  <ul>
  <li>Gitea notifies a webhook on pushes, pull requests, issues, releases, packages and Actions runs.</li>
  <li>cdviz-collector transforms these events to CDEvents, and sends them to the database, listeners,...</li>
  </ul>
references:
  - title: Gitea - Webhooks
    url: https://docs.gitea.com/usage/webhooks
  - title: Examples of CDEvents converted from Gitea's events
    url: https://github.com/cdviz-dev/transformers-community/tree/main/gitea_webhook/outputs
---

<script setup>
import IntegrationCard from '../../../components/IntegrationCard.vue'
</script>

<IntegrationCard />

> [!IMPORTANT] Gitea vs Forgejo
> Forgejo is a Gitea fork and most webhook payloads are still byte-identical, **but the CI events are not**:
> Gitea sends `workflow_run` / `workflow_job`, while Forgejo sends `action_run_success` /
> `action_run_failure` / `action_run_recover`. Using the wrong transformer silently drops all pipeline
> events — for Forgejo, use the [Forgejo integration](./forgejo.md) instead.

## Configuration

### Setting Up cdviz-collector

Configure `cdviz-collector.toml` to receive Gitea webhook events:

```toml
[remote.transformers-community]
type = "github://cdviz-dev/transformers-community"

[transformers]
gitea_webhook = { type = "vrl", template_rfile = "transformers-community:///gitea_webhook/to_v0_5.vrl" }

[sources.gitea_webhook]
enabled = true
transformer_refs = ["gitea_webhook"]

[sources.gitea_webhook.extractor]
type = "webhook"
id = "000-gitea" # used as part of the webhook's url

[sources.gitea_webhook.extractor.headers]
# gitea signs with HMAC-SHA256, hex encoded, over the raw body, without prefix
# value set by env CDVIZ_COLLECTOR__SOURCES__GITEA_WEBHOOK__EXTRACTOR__HEADERS__X-GITEA-SIGNATURE__TOKEN
"x-gitea-signature" = { type = "signature", signature_encoding = "hex", signature_on = "body", token = "changeme" }
```

The `template_rfile` references the VRL transformation logic from the [transformers-community repository](https://github.com/cdviz-dev/transformers-community). For more details on remote transformers, see the [Transformers documentation](../cdviz-collector/transformers.md#using-remote-transformers).

### Setting Up the Gitea Webhook

1. Navigate to **Repository settings > Webhooks > Add Webhook > Gitea** (or an organization/global webhook to cover every repository)
2. **Target URL**: `http://your-collector-url/webhook/000-gitea`
3. **HTTP Method**: `POST`, **POST Content Type**: `application/json`
4. **Secret**: the same value as `token` of the `x-gitea-signature` header in the collector configuration
5. **Trigger On**: select the events you want, or "All events" (unmapped events are silently ignored) — at minimum:
   - ✅ Repository events (branch/tag creation & deletion)
   - ✅ Pull request events
   - ✅ Issue events
   - ✅ Release events
   - ✅ Package events
   - ✅ Actions events (workflow run / workflow job, for CI pipeline results)
6. Ensure **Active** is checked, then save

### Testing the Integration

To verify webhook reception before transformation:

```toml
[sources.gitea_webhook]
transformer_refs = ["log", "discard_all"]  # Log payloads without processing
```

Check webhook deliveries in Gitea: **Repository settings > Webhooks > (your webhook) > Recent Deliveries**.

For webhook troubleshooting, see the [Webhook Extractor documentation](../cdviz-collector/sources/webhook.md#testing).

## Event Mapping

Event type detection is performed in VRL, mostly from body fields rather than the `X-Gitea-Event` header, since Gitea's ~28 hook event types share only a handful of payload structs.

| Gitea Event                                                     | Action                              | CDEvent Type                                    |
| ------------------------------------------------------------------ | ------------------------------------- | ------------------------------------------------- |
| `workflow_run`                                                   | `requested` / `queued` / `waiting`  | `pipelineRun.queued`                             |
| `workflow_run`                                                   | `in_progress`                       | `pipelineRun.started`                            |
| `workflow_run`                                                   | `completed`                         | `pipelineRun.finished`                           |
| `workflow_job`                                                   | `in_progress`                       | `taskRun.started`                                |
| `workflow_job`                                                   | `completed`                         | `taskRun.finished`                               |
| `package`                                                        | `created`                           | `artifact.published`                             |
| `package`                                                        | `deleted`                           | `artifact.deleted`                               |
| `release`                                                        | `published`                         | `artifact.published` (+ one per release asset)   |
| `release`                                                        | `deleted`                           | `artifact.deleted`                               |
| `pull_request` (+ `_assign`, `_label`, `_milestone`, `_sync`)    | `opened`                            | `change.created`                                 |
| `pull_request`                                                   | `closed` (merged / not merged)      | `change.merged` / `change.abandoned`             |
| `pull_request`                                                   | any other                           | `change.updated`                                 |
| `pull_request_review` (+ `_approved`, `_rejected`, `_comment`)   | `reviewed`                          | `change.reviewed`                                |
| `pull_request_comment`                                           | any                                  | `change.updated`                                 |
| `issues` (+ `issue_assign`, `_label`, `_milestone`)              | `opened`                            | `ticket.created`                                 |
| `issues`                                                         | `closed`                            | `ticket.closed`                                  |
| `issues`                                                         | any other                           | `ticket.updated`                                 |
| `issue_comment`                                                  | any                                  | `ticket.updated`                                 |
| `create` (`ref_type: branch`)                                    |                                      | `branch.created`                                 |
| `delete` (`ref_type: branch`)                                    |                                      | `branch.deleted`                                 |
| `repository`                                                     | `created` / `deleted`               | `repository.created` / `repository.deleted`      |
| `fork`                                                           |                                      | `repository.created` (for the fork)              |

A single payload produces at most one CDEvent (except `release.published`, which produces one per asset).

Any other event (`push`, `wiki`, `status`, `schedule`, `create`/`delete` for tags, …) produces **no** event — there is no CDEvents subject for raw pushes or tags outside of the artifact model.

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
- ✅ Full CI pipeline lifecycle via Gitea Actions (`pipelineRun` queued/started/finished, `taskRun` started/finished)

**Not Yet Supported**:

- `taskRun.queued` (no `taskRun:queued` equivalent in CDEvents)
- Push events, wiki events, tag create/delete
- `release.updated` (would re-publish identical artifact coordinates)

These can be added following the existing pattern in the [transformer VRL file](https://github.com/cdviz-dev/transformers-community/blob/main/gitea_webhook/to_v0_5.vrl).

## Troubleshooting

### No event produced

1. Check that the event/action combination is mapped (see the table above) — unmapped ones are silently ignored.
2. Check the delivery in **Repository settings > Webhooks > (your webhook) > Recent Deliveries**.

### Signature rejected

1. The `token` in `cdviz-collector.toml` must match the webhook secret configured in Gitea.
2. The header is `x-gitea-signature`, hex encoded, no prefix.
