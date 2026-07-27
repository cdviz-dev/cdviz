---
title: GitHub WebHook Integration
keywords: "GitHub webhook integration,GitHub CDEvents,GitHub Actions CI events,cdviz-collector GitHub"
description: |
  Collect GitHub events (via webhooks), transform them to cdevents.
  <ul>
  <li>Github tracks all changes to repositories, issues, pull requests, releases, workflows, and more. And it notifies a webhook about these changes.</li>
  <li>cdviz-collector transforms these events to cdevents, and sends them to the database, listeners,...</li>
  </ul>
references:
  - title: GitHub Webhooks and Events
    url: https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads
  - title: Examples of cdevents converted from github's events
    url: https://github.com/cdviz-dev/transformers-community/tree/main/github_events/outputs
---

<script setup>
import IntegrationCard from '../../../components/IntegrationCard.vue'
import EditionTabs from '../../../components/EditionTabs.vue'
</script>

<IntegrationCard />

## Configuration

### CDviz Side

<EditionTabs>
<template #selfhosted>

Setting up `cdviz-collector.toml` to receive GitHub events involves defining a webhook source in the collector configuration file. Below is an example configuration snippet:

```toml
# Remote transformers repository configuration
[remote.transformers-community]
type = "github://cdviz-dev/transformers-community"

[sources.github_webhook]
enabled = true
transformer_refs = ["github_events"]

[sources.github_webhook.extractor]
type = "webhook"
id = "000-github"
headers_to_keep = []

[sources.github_webhook.extractor.headers]
"x-hub-signature-256" = { type = "signature", signature_encoding = "hex", signature_on = "body", signature_prefix = "sha256=", token = "changeme" }


# Transformer from transformers-community repository
[transformers.github_events]
type = "vrl"
template_rfile = "transformers-community:///github_events/transformer.vrl"
```

The `signature` field is used to verify the authenticity of the webhook payload. You should replace `"changeme"` with your actual secret token that you set in your GitHub webhook configuration.

The `template_rfile` references the VRL (Vector Remap Language) file from the [transformers-community repository](https://github.com/cdviz-dev/transformers-community) that contains the transformation logic for converting GitHub webhook events into CDEvents. The source code can be found at [github_events/transformer.vrl](https://github.com/cdviz-dev/transformers-community/blob/main/github_events/transformer.vrl).

For more details on remote transformers, including using specific tags or commits, see the [Transformers documentation](../cdviz-collector/transformers.md#using-remote-transformers).

The webhook endpoint to declare on GitHub's side is then `http://your-collector-url/webhook/000-github`.

</template>
<template #cloud>

Nothing to run, and no transformer to configure: the endpoint is provisioned for your tenant.

1. Open [app.cdviz.dev](https://app.cdviz.dev) → **Settings** → **Collector**.
2. Enable **GitHub Webhook**.
3. Copy the **Endpoint** — `https://app.cdviz.dev/collect/<your-tenant>/webhook/github`.
4. Reveal (or regenerate) the **Signature secret** sent as the `x-hub-signature-256` header. You are free to change it, as long as GitHub and CDviz hold the same value.

![CDviz Cloud GitHub Webhook settings](/screenshots/cloud_settings_github_webhook-20260727.png)

</template>
</EditionTabs>

### GitHub Side

To configure the GitHub integration, you need to set up a webhook in your GitHub repository or in your GitHub Organization. Here are the steps to do that:

1. Go to your GitHub repository or organization settings.
2. Navigate to the "Webhooks" section.
3. Click on "Add webhook".
4. In the "Payload URL" field, enter <EditionTabs inline><template v-slot:selfhosted>the URL where your `cdviz-collector` is running, followed by `/webhook/{id_of_webhook_extractor}`. For example: `http://your-collector-url/webhook/000-github`</template><template v-slot:cloud>the endpoint copied above: `https://app.cdviz.dev/collect/<your-tenant>/webhook/github`</template></EditionTabs>.
5. Set the "Content type" to `application/json`.
6. In the "Secret" field, enter the secret from the [CDviz Side](#cdviz-side) section above.
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

For enhanced control and custom events, you can also use the **[GitHub Action integration](/docs/integrations/github-action)** alongside or instead of webhooks.

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

For step-by-step instructions, see the [GitHub Action Integration Guide](/docs/integrations/github-action).
