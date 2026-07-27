---
title: Jira Integration
description: |
  Collect Jira issue and version events (via webhooks), transform them to CDEvents.
  <ul>
  <li>Jira notifies a webhook when issues are created, updated, or deleted, and when versions are released.</li>
  <li>cdviz-collector transforms these events to CDEvents, and sends them to the database, listeners,...</li>
  </ul>
references:
  - title: JIRA Cloud Webhook Documentation
    url: https://developer.atlassian.com/cloud/jira/platform/webhooks/
  - title: JIRA Server Webhook Documentation
    url: https://developer.atlassian.com/server/jira/platform/webhooks/
  - title: Examples of CDEvents converted from Jira's events
    url: https://github.com/cdviz-dev/transformers-pro/tree/main/jira_events/inputs/examples
---

<script setup>
import IntegrationCard from '../../../components/IntegrationCard.vue'
</script>

<IntegrationCard />

> [!NOTE] Beta
> This transformer is in beta: event mapping and field coverage may still change. Supports both **Jira Cloud** (`accountId`-based user identity) and **Jira Server / Data Center** (`name`-based user identity).

## Configuration

### Setting Up cdviz-collector

Configure `cdviz-collector.toml` to receive Jira webhook events:

```toml
[sources.jira_webhook]
enabled = true
transformer_refs = ["jira_events"]

[sources.jira_webhook.extractor]
type = "webhook"
id = "000-jira" # used as part of the webhook's url
headers_to_keep = []
# secure the endpoint with a secret & signature, see
# https://developer.atlassian.com/cloud/jira/platform/webhooks/#secure-admin-webhooks

# Transformer from transformers-pro repository
[remote.transformers-pro]
type = "github://cdviz-dev/transformers-pro"
# token = "xxx"  # set by env 'CDVIZ_COLLECTOR__REMOTE__TRANSFORMERS-PRO'

[transformers]
jira_events = { type = "vrl", template_rfile = "transformers-pro:///jira_events/to_v0_5.vrl" }
```

The `template_rfile` references the VRL transformation logic from the [transformers-pro repository](https://github.com/cdviz-dev/transformers-pro) (Pro plan). For more details on remote transformers, see the [Transformers documentation](../cdviz-collector/transformers.md#using-remote-transformers).

### Setting Up the Jira Webhook

1. In Jira: **Settings > System > WebHooks > Create a WebHook**.
2. **URL**: `http://your-collector-url/webhook/000-jira`
3. Select the events: **Issue: created, updated, deleted** and **Version: released**.
4. Save the webhook.

To verify webhook reception before transformation:

```toml
[sources.jira_webhook]
transformer_refs = ["log", "discard_all"]  # Log payloads without processing
```

For webhook troubleshooting, see the [Webhook Extractor documentation](../cdviz-collector/sources/webhook.md#testing).

## Event Mapping

Event type detection is performed in VRL based on the `webhookEvent` field:

| Jira Event                             | CDEvent Type         | Detection Logic                                                                |
| -------------------------------------- | -------------------- | ------------------------------------------------------------------------------ |
| `jira:issue_created`                   | `ticket.created`     | `webhookEvent = "jira:issue_created"`                                          |
| `jira:issue_updated` (status=done)     | `ticket.closed`      | `webhookEvent = "jira:issue_updated"` AND `status.statusCategory.key = "done"` |
| `jira:issue_updated` (other status)    | `ticket.updated`     | `webhookEvent = "jira:issue_updated"` AND other status category                |
| `jira:issue_deleted` (no resolution)   | `ticket.closed`      | `webhookEvent = "jira:issue_deleted"` AND `issue.fields.resolution` is null    |
| `jira:issue_deleted` (with resolution) | _(skipped)_          | `webhookEvent = "jira:issue_deleted"` AND `issue.fields.resolution` is set     |
| `jira:version_released`                | `artifact.published` | `webhookEvent = "jira:version_released"`                                       |

Deletion has no dedicated CDEvent type, so it maps to `ticket.closed`: if the issue already had a resolution (a `ticket.closed` was already emitted by the prior update), the delete is skipped; otherwise `resolution` is set to `"withdrawn"`.

### Artifact Identification

For `artifact.published` events (version releases), `subject.id` is a PURL:

```
pkg:generic/<projectKey>@<version_name>?repository_url=<base_url>
```

`base_url` is derived from the version's REST `self` URL, and `projectKey` comes from `version.projectKey` (Cloud) or `version.projectId` (Server).

## Event Coverage

**Supported Events**:

- ✅ Issue created, updated, deleted (as `ticket.*`)
- ✅ Version released (as `artifact.published`)

**Not Yet Supported**:

- Comment events
- Sprint / board events
- Attachment events

These can be added following the existing pattern in the [transformer VRL file](https://github.com/cdviz-dev/transformers-pro/blob/main/jira_events/to_v0_5.vrl).
