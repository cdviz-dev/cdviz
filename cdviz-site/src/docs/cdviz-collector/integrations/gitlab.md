---
title: GitLab WebHook Integration
description: |
  Collect GitLab events (via webhooks), transform them to cdevents.
  <ul>
  <li>GitLab tracks all changes to repositories, issues, merge requests, releases, pipelines, jobs, and more. And it notifies a webhook about these changes.</li>
  <li>cdviz-collector transforms these events to cdevents, and sends them to the database, listeners,...</li>
  </ul>
editions:
  - pro
integration:
  icon: /icons/gitlab.svg
  type: source/webhook
  events:
    - input: pipeline.created/pending
      output: pipelineRun.queued
    - input: pipeline.running
      output: pipelineRun.started
    - input: pipeline.success/failed
      output: pipelineRun.finished
    - input: build.running
      output: taskRun.started
    - input: build.success/failed
      output: taskRun.finished
    - input: release.created
      output: artifact.published
    - input: tag_push
      output: artifact.published
    - input: issue.open/reopen
      output: ticket.created
    - input: issue.close
      output: ticket.closed
    - input: issue.update
      output: ticket.updated
    - input: merge_request.open/reopen
      output: change.created
    - input: merge_request.merge
      output: change.merged
    - input: merge_request.close
      output: change.abandoned
    - input: merge_request.approved
      output: change.reviewed
    - input: merge_request.update
      output: change.updated
    - input: push (branch)
      output: branch.created/deleted
references:
  - title: GitLab Webhooks and Events
    url: https://docs.gitlab.com/user/project/integrations/webhook_events/
  - title: Source code of the transformation of GitLab Webhooks to cdevents
    url: https://github.com/cdviz-dev/transformers-pro/blob/main/gitlab_events/transformer.vrl
  - title: Examples of cdevents converted from GitLab's events
    url: https://github.com/cdviz-dev/transformers-pro/tree/main/gitlab_events/outputs
---

<script setup>
import IntegrationCard from '../../../../components/IntegrationCard.vue'
</script>

<IntegrationCard />

## Configuration

### Setting Up cdviz-collector

Configure `cdviz-collector.toml` to receive GitLab webhook events:

```toml
# Remote transformers repository configuration
[remote.transformers-pro]
type = "github"
owner = "cdviz-dev"
repo = "transformers-pro"

[sources.gitlab_webhook]
enabled = true
transformer_refs = ["gitlab_events"]

[sources.gitlab_webhook.extractor]
type = "webhook"
id = "000-gitlab"
headers_to_keep = ["X-Gitlab-Event"]

# Optional: Verify webhook authenticity with token
[[sources.gitlab_webhook.extractor.headers]]
header = "X-Gitlab-Token"

[sources.gitlab_webhook.extractor.headers.rule]
type = "equals"
value = "token-changeme"
case_sensitive = true

# Transformer from transformers-pro repository
[transformers.gitlab_events]
type = "vrl"
template_rfile = "transformers-pro:///gitlab_events/transformer.vrl"
```

Replace `"token-changeme"` with your actual secret token configured in GitLab webhook settings.

The `template_rfile` references the VRL transformation logic from the [transformers-pro repository](https://github.com/cdviz-dev/transformers-pro). For more details on remote transformers, see the [Transformers documentation](../transformers.md#using-remote-transformers).

### Setting Up GitLab Webhook

Configure a webhook in your GitLab project or group:

1. Navigate to **Settings > Webhooks**
   - For projects: `https://gitlab.com/<namespace>/<project>/-/hooks`
   - For groups: `https://gitlab.com/groups/<group>/-/hooks`
2. Click **Add new webhook**
3. **URL**: `http://your-collector-url/webhook/000-gitlab`
4. **Secret token**: Enter the token from your collector configuration (e.g., `token-changeme`)
5. Select **Trigger** events:
   - ✅ Push events
   - ✅ Tag push events
   - ✅ Issues events
   - ✅ Merge request events
   - ✅ Pipeline events
   - ✅ Job events
   - ✅ Release events
6. Enable **SSL verification** (recommended for production)
7. Ensure **Enable webhook** is checked
8. Click **Add webhook**

### Testing the Integration

Test webhook delivery:

```bash
# Trigger a pipeline
git push origin main

# Create a tag
git tag v1.0.0
git push origin v1.0.0
```

Check webhook delivery logs in GitLab: **Settings > Webhooks > Edit > Recent events**

To verify webhook reception before transformation:

```toml
[sources.gitlab_webhook]
transformer_refs = ["log", "discard_all"]  # Log payloads without processing
```

For webhook troubleshooting, see the [Webhook Extractor documentation](../sources/webhook.md#testing).

## Event Mapping

The transformer converts GitLab webhook events into CDEvents following the [CDEvents specification](https://cdevents.dev):

| GitLab Event              | CDEvent Type           | Detection Logic                                                                            |
| ------------------------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| pipeline:created/pending  | pipelineRun.queued     | `object_kind=pipeline` AND `status` in [created, waiting_for_resource, preparing, pending] |
| pipeline:running          | pipelineRun.started    | `object_kind=pipeline` AND `status=running`                                                |
| pipeline:success/failed   | pipelineRun.finished   | `object_kind=pipeline` AND `status` in [success, failed, canceled, skipped]                |
| build:running             | taskRun.started        | `object_kind=build` AND `build_status=running`                                             |
| build:success/failed      | taskRun.finished       | `object_kind=build` AND `build_status` in [success, failed, canceled]                      |
| release:created           | artifact.published     | `object_kind=release`                                                                      |
| tag_push                  | artifact.published     | `object_kind=tag_push` AND tag created                                                     |
| issue:open/reopen         | ticket.created         | `object_kind=issue` AND `action` in [open, reopen]                                         |
| issue:close               | ticket.closed          | `object_kind=issue` AND `action=close`                                                     |
| issue:update              | ticket.updated         | `object_kind=issue` AND other actions                                                      |
| merge_request:open/reopen | change.created         | `object_kind=merge_request` AND `action` in [open, reopen]                                 |
| merge_request:merge       | change.merged          | `object_kind=merge_request` AND `action=merge`                                             |
| merge_request:close       | change.abandoned       | `object_kind=merge_request` AND `action=close` (not merged)                                |
| merge_request:approved    | change.reviewed        | `object_kind=merge_request` AND `action=approved`                                          |
| merge_request:update      | change.updated         | `object_kind=merge_request` AND other actions                                              |
| push (branch)             | branch.created/deleted | `object_kind=push` AND `ref` starts with `refs/heads/`                                     |

### CDEvent Structure

The VRL transformation generates CDEvents with:

- **context.id**: Auto-generated by collector
- **context.source**: Automatically set to `{http.root_url}/?source={source_name}` where `{source_name}` is the configuration key (e.g., `gitlab_webhook`)
- **subject.id**: Web URL of the entity (pipeline, job, issue, MR) or PURL for artifacts
- **subject.source**: Empty (not set)
- **customData.gitlab**: Selected GitLab-specific metadata (project, user, event-specific details)

### Artifact Identification

For `artifact.published` events, the `subject.id` is a PURL (Package URL):

- **Release**: `pkg:generic/<project_path>@<tag_name>?repository_url=<encoded_url>`
- **Tag Push**: `pkg:generic/<project_path>@<tag_name>?repository_url=<encoded_url>`

## Event Coverage

**Supported Events**:

- ✅ Pipeline lifecycle (queued, started, finished)
- ✅ Job lifecycle (started, finished)
- ✅ Issues (created, updated, closed)
- ✅ Merge requests (created, updated, merged, abandoned, reviewed)
- ✅ Releases and tags (artifact published)
- ✅ Branch operations (created, deleted)

**Not Yet Supported**:

- Deployment events → `service.deployed`
- Wiki page events
- Comment events
- Confidential issues/MRs
- System hooks

These can be added following the existing pattern in the [transformer VRL file](https://github.com/cdviz-dev/transformers-pro/blob/main/gitlab_events/transformer.vrl).
