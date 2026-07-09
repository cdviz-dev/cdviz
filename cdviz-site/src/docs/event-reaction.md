---
title: Event Reaction
description: |
  Trigger automation from CDEvents: forward delivery events to n8n, ArgoCD, or any webhook via the
  HTTP sink, stream them to Kafka or NATS consumers, or subscribe live over SSE.
---

# Event Reaction

CDviz is not only an observability platform — the same CDEvents stream that feeds your dashboards can trigger downstream automation. The collector fans events out to reactive sinks; anything that consumes a webhook, a Kafka topic, or an SSE stream can react to your delivery events.

## Patterns

### Webhooks — n8n, ArgoCD, custom services

The [HTTP sink](./cdviz-collector/sinks/http.md) POSTs each CDEvent to any endpoint (as CloudEvents). Typical targets:

- **n8n** (or any workflow automation tool) — notify a channel on `deployment.finished`, open a ticket on `incident.detected`, chain follow-up jobs
- **ArgoCD / CI systems** — kick off a sync or a downstream pipeline when an artifact is published
- **Your own service** — any HTTP endpoint becomes an event consumer

### Event streams — Kafka, NATS

For decoupled, replayable consumption, publish CDEvents to a topic with the [Kafka sink](./cdviz-collector/sinks/kafka.md) or [NATS sink](./cdviz-collector/sinks/nats.md). Consumers subscribe independently of CDviz.

### Live subscription — SSE

The [SSE sink](./cdviz-collector/sinks/sse.md) exposes a Server-Sent Events endpoint: lightweight, connection-based consumption without a broker — handy for live UIs and simple listeners.

## Filtering & Shaping

Sinks can be paired with [transformers](./cdviz-collector/transformers.md) to filter which events reach a reaction target or to reshape payloads for the consumer.

## Related

- [Sinks reference](./cdviz-collector/sinks/index.md) — all sink types and options
- [Architecture](./architecture.md) — where reaction fits in the CDviz pipeline
