---
title: Event Reaction
description: |
  Trigger automation from CDEvents: forward delivery events to Argo Workflows, n8n, Zapier, or any
  webhook via the HTTP sink, stream them to Kafka or NATS consumers, or subscribe live over SSE.
keywords: "event-driven automation,CDEvents webhook,Argo Workflows,Kafka NATS events,SSE event stream"
---

# Event Reaction

CDviz is not only an observability platform — the same CDEvents stream that feeds your dashboards can trigger downstream automation. The collector fans events out to reactive sinks; anything that consumes a webhook, a Kafka topic, or an SSE stream can react to your delivery events.

## Example Use Cases

- **Post-deployment testing** — trigger a chain of integration / smoke tests after a service is deployed into an environment
- **Environment promotion** — promote a service or artifact to the next environment (cluster, region, ...) after tests succeed in the previous one
- **Artifact validation** — trigger validation (scanning, signing, conformance checks) when an artifact is published

## Patterns

### Webhooks — Argo Workflows, n8n, Zapier, custom services

The [HTTP sink](./cdviz-collector/sinks/http.md) POSTs each CDEvent to any endpoint (as CloudEvents). Typical targets:

- **[Argo Workflows](./integrations/argo-workflows.md)** — submit a workflow from an event via a `WorkflowEventBinding`
- **Workflow automation tools** — [n8n](https://n8n.io/), [Make](https://www.make.com/), [Zapier](https://zapier.com/), [Kestra](https://kestra.io/), ... — notify a channel on `deployment.finished`, open a ticket on `incident.detected`, chain follow-up jobs
- **Your own service** — any HTTP endpoint becomes an event consumer

### Event streams — Kafka, NATS

For decoupled, replayable consumption, publish CDEvents to a topic with the [Kafka sink](./cdviz-collector/sinks/kafka.md) or [NATS sink](./cdviz-collector/sinks/nats.md). Consumers subscribe independently of CDviz.

### Live subscription — SSE

The [SSE sink](./cdviz-collector/sinks/sse.md) exposes a Server-Sent Events endpoint: lightweight, connection-based consumption without a broker — handy for live UIs and simple listeners.

## Filtering & Shaping <Badge type="warning" text="beta" />

The [HTTP sink](./cdviz-collector/sinks/http.md#transformers) has beta support for per-sink [transformers](./cdviz-collector/transformers.md) (`transformer_refs`). They serve two purposes:

- **Filter** which events reach a reaction target — only `service.deployed`, only one service, ...
- **Reshape** the payload into whatever JSON the destination expects — not necessarily a CDEvent — so the consumer needs no translation logic

Reshaping can even replace a destination that only acts as a 1-to-1 translator: in the Argo Workflows example above, a workflow whose only job is converting the event into a GitHub `repository_dispatch` call can be dropped entirely — a sink transformer builds the GitHub API payload and the HTTP sink posts it directly (see the [full example](./cdviz-collector/sinks/http.md#transformers)).

## Related

- [Argo Workflows integration](./integrations/argo-workflows.md) — full setup: HTTP sink + `WorkflowEventBinding`
- [Sinks reference](./cdviz-collector/sinks/index.md) — all sink types and options
- [Architecture](./architecture.md) — where reaction fits in the CDviz pipeline
- [CDviz vs Kargo](./alternatives/vs-kargo.md) — how event reaction compares to a dedicated promotion control plane
