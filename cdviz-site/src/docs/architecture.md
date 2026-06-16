---
description: "CDviz platform architecture: event-driven pipeline from CDviz Collector to PostgreSQL TimescaleDB and Grafana dashboards for DORA metrics."
---

<script setup>
import CdvizArchitecture from '../../components/diagrams/CdvizArchitecture.vue'
import CdvizArchitecturePart01 from '../../components/diagrams/CdvizArchitecturePart01.vue'
import CdvizArchitecturePart02 from '../../components/diagrams/CdvizArchitecturePart02.vue'
import CdvizArchitecturePart03 from '../../components/diagrams/CdvizArchitecturePart03.vue'
</script>

# Architecture

CDviz is an event-driven CI/CD platform built on the CDEvents standard. Its four-layer architecture — Collector, Database, Grafana, and Event Processing — lets teams observe software delivery events in real time and trigger automated workflows from the same event stream.

> [!NOTE]
> CDviz employs a modular architecture with three independent components that can be deployed individually or as an integrated solution.

1. **Visualization Layer** - [CDviz Grafana](./cdviz-grafana/)

   A comprehensive dashboard solution for visualizing, analyzing, and generating alerts by combining existing runtime and business metrics with SDLC metrics. While built on Grafana, the implementation can be adapted to alternative visualization platforms.

   <CdvizArchitecturePart01 aria-label="CDviz Visualization Layer: Grafana dashboards displaying DORA metrics, deployment frequency, artifact timelines, and CDEvents activity feeds"/>

2. **Data Persistence** - [CDviz Database](./cdviz-db/)

   An optimized data storage solution for metrics and events, built on PostgreSQL with specialized extensions for time-series analytics.

   <CdvizArchitecturePart02 aria-label="CDviz Data Persistence Layer: CDviz Collector sends normalized CDEvents to PostgreSQL database with TimescaleDB extension for time-series storage and analytics"/>

3. **Data Acquisition** - [CDviz Collector](./cdviz-collector/)

   A flexible data pipeline for acquiring, transforming, and forwarding data from diverse sources into the database, event processor,...

   <CdvizArchitecturePart03 aria-label="CDviz Data Acquisition Layer: CDviz Collector ingesting events from GitHub, GitLab, ArgoCD, Kubernetes webhooks, Kafka, and NATS sources, then normalizing them to CDEvents format"/>

4. **Event Processing**

   An optional reaction layer that turns the same CDEvents stream into automated actions. Instead of (or in addition to) storing events for visualization, the CDviz Collector can route them to its sinks — HTTP endpoints, Kafka, or NATS — so external systems react in real time: notifying a chat channel on a failed deployment, opening a ticket on an incident, triggering a downstream pipeline, or updating an internal developer portal. Because reactions consume the same normalized events that feed the database and dashboards, observability and automation stay in sync without a separate integration layer. This layer is wired through Collector sink and transformer configuration rather than a dedicated component.

   <CdvizArchitecture/>

## Data Flow

Events move through the platform in one direction, from source systems to insight and action:

1. **Emit** — CI/CD tools, deployment systems, and incident tools emit events, either pushed to the Collector (webhooks, Kafka, NATS, SSE) or pulled by it (file inputs, HTTP polling).
2. **Normalize** — the **Collector** validates each event and transforms it into a standard [CDEvent](https://cdevents.dev) via VRL transformers, enriching it with metadata along the way.
3. **Persist** — normalized CDEvents are written to the **Database** (PostgreSQL + TimescaleDB), which keeps the full JSONB payload plus extracted columns optimized for time-series delivery queries.
4. **Visualize** — **Grafana** queries the database directly to render DORA metrics, deployment timelines, and CDEvents activity — no intermediate API layer.
5. **React** — in parallel with persistence, the **Event Processing** layer can forward the same events to external systems through Collector sinks, triggering downstream automation.

Steps 3–5 are independent consumers of the Collector's output: a deployment can be stored for dashboards and trigger a notification at the same time, and any of the consuming layers can be deployed on its own.
