---
title: CDEvents Integration
keywords: "CDEvents integration,native CDEvents producer,CDEvents webhook,CDEvents versions,cdviz-collector CDEvents"
description: |
  Receive CDEvents directly, without any transformer, from any producer.
  <ul>
  <li>A tool that natively emits CDEvents, an agent or a proxy (like another cdviz-collector) can POST them to the collector's webhook.</li>
  <li>CDEvents v0.3, v0.4 and v0.5 are accepted, and normalized to a single version at ingestion.</li>
  </ul>
references:
  - title: CDEvents Specification
    url: https://cdevents.dev/docs/
  - title: CDEvents SDKs (Go, Java, Python, Rust, JavaScript)
    url: https://cdevents.dev/docs/sdks/
---

<script setup>
import IntegrationCard from '../../../components/IntegrationCard.vue'
import EditionTabs from '../../../components/EditionTabs.vue'
</script>

<IntegrationCard />

## Who Can Send

Any producer able to POST JSON to an HTTP endpoint — no transformer is involved, the payload is
already a CDEvent:

- **A tool that natively emits CDEvents** — either built-in, or configured to render CDEvents from
  its own templating (see the [native CDEvents templates](./argocd.md#alternative-approach-native-cdevents-templates)
  of ArgoCD notifications), or built with one of the [CDEvents SDKs](https://cdevents.dev/docs/sdks/).
- **An agent or a proxy** — another `cdviz-collector` forwarding its stream with the
  [HTTP sink](../cdviz-collector/sinks/http.md), or any gateway that already speaks CDEvents.
- **A CI job** — [`cdviz-collector send`](../cdviz-collector/send.md) for a hand-crafted event, or
  [`send --run`](../cdviz-collector/send-run.md) to wrap a command as a `taskRun`.

For a tool that does **not** emit CDEvents, transform its payload instead: see the existing
integrations, or [Custom Integration](./custom.md).

## CDviz Side

<EditionTabs>
<template #selfhosted>

A [webhook source](../cdviz-collector/sources/webhook.md) with **no** `transformer_refs`:

```toml
[sources.cdevents]
enabled = true

[sources.cdevents.extractor]
type = "webhook"
id = "000-cdevents"
```

The endpoint is then `https://your-cdviz-collector.example.com/webhook/000-cdevents`.

> [!WARNING]
> An open endpoint accepts events from anyone. Protect it with an API key or an HMAC signature —
> see [Header Validation](../cdviz-collector/header-validation.md); on the producer side, see
> [Header Authentication](../cdviz-collector/header-authentication.md).

</template>
<template #cloud>

This is the path [CDviz Cloud](/cloud) exposes: a webhook URL to configure in your producer, no
self-hosted component to run.

1. Open [app.cdviz.dev](https://app.cdviz.dev) → **Settings** → **Collector**.
2. Enable **CDEvents Webhook**.
3. Copy the **Endpoint** — `https://app.cdviz.dev/collect/<your-tenant>/webhook/cdevents`.
4. Choose the **Authentication Mode**: a **Token** on a custom header, or an **HMAC Signature** on
   the `x-signature` header. Then reveal (or regenerate) the secret — you are free to change it, as
   long as the producer and CDviz hold the same value.

![CDviz Cloud CDEvents Webhook settings](/screenshots/cloud_settings_cdevents_webhook-20260727.png)

</template>
</EditionTabs>

## Producer Side

POST the CDEvent JSON to <EditionTabs inline><template v-slot:selfhosted>`https://your-cdviz-collector.example.com/webhook/000-cdevents`</template><template v-slot:cloud>the endpoint copied above, `https://app.cdviz.dev/collect/<your-tenant>/webhook/cdevents`</template></EditionTabs>, with the authentication header from the [CDviz Side](#cdviz-side) section above.

The payload is already a CDEvent: no transformer is involved, and no CDviz-specific envelope is
expected. See [Header Authentication](../cdviz-collector/header-authentication.md) for the producer
side of the token or signature.

## CDEvents Versions

Producers rarely agree on a version: an integration built before CDEvents v0.5 emits v0.3 or v0.4.
All of them are accepted, and normalized at ingestion so that the database holds a single version.
On CDviz Cloud this normalization is already in place — nothing to configure.

::: tip Self-hosted only
Normalization is done by the global pipeline chain:

```toml
[pipeline]
transformer_refs = ["cdevents_v0_3_to_v0_4", "cdevents_v0_4_to_v0_5"]
```

Both transformers are idempotent — an already-current event passes through unchanged. See
[CDEvents Version Conversion](../cdviz-collector/cdevents-version-conversion.md) for the full
configuration and the CLI conversion of existing files.
:::
