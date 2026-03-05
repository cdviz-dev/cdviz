---
title: Custom Integration
description: |
  cdviz-collector is open source (Apache 2.0) and extensible.
  Build custom integrations by writing VRL transformer scripts, configuring custom sources and sinks,
  or contributing new connectors back to the project.
editions:
  - community
  - enterprise
integration:
  icon: /logos/cdviz.svg
  type: custom
---

<script setup>
import IntegrationCard from '../../../../components/IntegrationCard.vue'
</script>

<IntegrationCard />

## Overview

cdviz-collector is open source under the [Apache 2.0 license](https://github.com/cdviz-dev/cdviz-collector/blob/main/LICENSE), making it fully extensible for any integration not covered by built-in connectors. You can adapt it to your own tooling without forking, and contribute improvements back to the community.

## Option 1 — Custom Transformers

The most common path for custom integrations is writing a [VRL (Vector Remap Language)](../transformers.md) transformer script. A transformer receives raw incoming events from any source and maps them to valid CDEvents.

Steps:

1. Configure a source (e.g. a webhook) that receives events from your tool.
2. Write a `.vrl` script that maps the payload fields to CDEvents fields.
3. Reference the transformer from your source configuration.

```toml
[sources.my_tool_webhook]
enabled = true
transformer_refs = ["my_tool_transformer"]

[sources.my_tool_webhook.extractor]
type = "webhook"
id = "000-my-tool"

[transformers.my_tool_transformer]
type = "vrl"
template_file = "/path/to/my_tool_transformer.vrl"
```

See the [Transformers documentation](../transformers.md) for the full VRL API and examples from existing integrations in the [transformers-community repository](https://github.com/cdviz-dev/transformers-community).

## Option 2 — Custom Source or Sink Configuration

cdviz-collector supports multiple source and sink types out of the box (webhooks, polling, message queues, etc.). You may only need to configure an existing type with the right parameters for your tool.

Refer to the [collector configuration documentation](../configuration.md) for the full list of available source and sink types and their options.

## Option 3 — Contribute

If your integration would benefit others, consider contributing it to one of the following repositories:

- [transformers-community](https://github.com/cdviz-dev/transformers-community) — open VRL transformer scripts for community integrations.
- [transformers-pro](https://github.com/cdviz-dev/transformers-pro) — curated transformers for enterprise integrations.
- [cdviz-collector](https://github.com/cdviz-dev/cdviz-collector) — new source or sink connectors that require changes to the collector itself.

[Open an issue](https://github.com/cdviz-dev/cdviz-collector/issues) to discuss before building, or submit a pull request directly. Community contributions are the best way to grow the ecosystem of supported tools.
