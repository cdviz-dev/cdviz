---
title: GitHub WebHook Integration
description: |
  Collect GitHub events (via webhooks), transform them to cdevents.
  <ul>
  <li>Github tracks all changes to repositories, issues, pull requests, releases, workflows, and more. And it notifies a webhook about these changes.</li>
  <li>cdviz-collector transforms these events to cdevents, and sends them to the database, listeners,...</li>
  </ul>
editions:
  - community
  - enterprise
integration:
  icon: /icons/github.svg
  type: source/webhook
  events:
    - input: package.published
      output: artifact.published
    - input: release.published
      output: artifact.published
    - input: workflow_run.requested
      output: pipelineRun.queued
    - input: workflow_run.in_progress
      output: pipelineRun.started
    - input: workflow_run.completed
      output: pipelineRun.finished
    - input: workflow_job.in_progress
      output: taskRun.started
    - input: workflow_job.completed
      output: taskRun.finished
    - input: issue.opened
      output: ticket.created
    - input: issue.closed
      output: ticket.closed
    - input: issue.*
      output: ticket.updated
    - input: branch.
      output: branch.created
    - input: pull_request.opened
      output: change.created
    - input: pull_request.closed
      output: change.{merged,abandoned}
    - input: pull_request.*
      output: change.updated
    - input: pull_request_review.submitted
      output: change.reviewed
references:
  - title: GitHub Webhooks and Events
    url: https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads
  - title: Source code of the transformation of GitHub Webhooks to cdevents
    url: https://github.com/cdviz-dev/cdviz-collector/blob/main/config/transformers/github_events.vrl
  - title: Examples of cdevents converted from github's events
    url: https://github.com/cdviz-dev/cdviz-collector/tree/main/examples/assets/outputs/transform-github_events
---

<script setup>
import IntegrationCard from '../../../../components/IntegrationCard.vue'
</script>

<IntegrationCard />

## Configuration

### Setting Up cdviz-collector's side

Setting up `cdviz-collector.toml` to receive GitHub events involves defining a webhook source in the collector configuration file. Below is an example configuration snippet:

```toml
# Remote transformers repository configuration
[remote.transformers-community]
type = "github"
owner = "cdviz-dev"
repo = "transformers-community"

[sources.github_webhook]
enabled = true
transformer_refs = ["github_events"]

[sources.github_webhook.extractor]
type = "webhook"
id = "000-github"
headers_to_keep = []
signature = { signature_encoding = "hex", signature_on = "body", signature_prefix = "sha256=", header = "x-hub-signature-256", token = "changeme" }

# Transformer from transformers-community repository
[transformers.github_events]
type = "vrl"
template_rfile = "transformers-community:///github_events/transformer.vrl"
```

The `signature` field is used to verify the authenticity of the webhook payload. You should replace `"changeme"` with your actual secret token that you set in your GitHub webhook configuration.

The `template_rfile` references the VRL (Vector Remap Language) file from the [transformers-community repository](https://github.com/cdviz-dev/transformers-community) that contains the transformation logic for converting GitHub webhook events into CDEvents. The source code can be found at [github_events/transformer.vrl](https://github.com/cdviz-dev/transformers-community/blob/main/github_events/transformer.vrl).

For more details on remote transformers, including using specific tags or commits, see the [Transformers documentation](../transformers.md#using-remote-transformers).

### Setting Up GitHub Webhook

To configure the GitHub integration, you need to set up a webhook in your GitHub repository or in your GitHub Organization. Here are the steps to do that:

1. Go to your GitHub repository or organization settings.
2. Navigate to the "Webhooks" section.
3. Click on "Add webhook".
4. In the "Payload URL" field, enter the URL where your `cdviz-collector` is running, followed by `/webhook/{id_of_webhook_extractor}`. For example: `http://your-collector-url/webhook/000-github`.
5. Set the "Content type" to `application/json`.
6. In the "Secret" field, enter the secret token that you specified in your `cdviz-collector.toml` configuration.
7. Select the events you want to trigger the webhook. You can choose "Let me select individual events" and select the events you are interested in, or you can select "Send me everything" to receive all events.
   - Branch or tag creation
   - Branch or tag deletion
   - Issues
   - Packages
   - Pull requests
   - Pull request reviews
   - Releases
   - Repository
   - Workflow jobs
   - Workflow runs
8. Make sure the "Active" checkbox is checked.
9. Click on "Add webhook" to save the configuration.

## Complementary: GitHub Action Integration

For enhanced control and custom events, you can also use the **[GitHub Action integration](/docs/cdviz-collector/integrations/github-action)** alongside or instead of webhooks.

**These approaches can be used together** for comprehensive event coverage:

| Feature           | Webhook Integration           | GitHub Action          |
| ----------------- | ----------------------------- | ---------------------- |
| **Setup**         | Configure webhook + collector | Add action to workflow |
| **Event Control** | All GitHub events             | Custom events only     |
| **Custom Data**   | Limited to webhook payload    | Full control           |
| **Timing**        | Real-time                     | Workflow-controlled    |
| **Maintenance**   | Central configuration         | Per-workflow setup     |

**Recommended combinations:**

- **Webhooks only**: Complete GitHub activity tracking with automatic setup
- **GitHub Action only**: Custom events for specific workflows with full control
- **Both together**: Comprehensive GitHub events (webhooks) + custom workflow data (actions)

**Example combined use case**: Use webhooks to track all repository activity automatically, while adding GitHub Actions to specific deployment workflows to send detailed deployment context and custom metrics.

For step-by-step instructions, see the [GitHub Action Integration Guide](/docs/cdviz-collector/integrations/github-action).
