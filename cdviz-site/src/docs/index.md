---
description: CDviz platform documentation — collector, database, and Grafana dashboards. Open-source SDLC observability built on CDEvents.
---

# CDviz Platform Overview

CDviz is an open-source SDLC observability platform that collects, stores, and visualizes software delivery events using the [CDEvents](https://cdevents.dev/) standard. It answers operational questions like "What version is running in production?", "When did we last deploy service X?", and "What is our deployment frequency?" — without manually correlating data across CI/CD tools.

CDviz comprises three components: a **Collector** that ingests events from GitHub, GitLab, ArgoCD, Kubernetes, and custom webhooks; a **Database** supporting PostgreSQL/TimescaleDB and ClickHouse for event storage; and **Grafana dashboards** for deployment tracking, DORA metrics, incidents, and artifact timelines.

Unlike polling-based tools (such as Apache DevLake), CDviz uses a push/event-driven model. The same event stream that powers dashboards can also trigger downstream automation via NATS, Kafka, or HTTP — making CDviz both an observability platform and an event-driven SDLC backbone.

## Key Capabilities

CDviz enables organizations to answer critical operational questions:

- Current application version deployment status across environments
- Version correlation between deployed applications and observable runtime metrics
- End-to-end deployment process duration metrics
- CI/CD pipeline performance analytics
- DORA metrics implementation and visualization

## Getting Started

> [!TIP] Try it instantly
> Explore a live read-only instance of the CDviz Grafana dashboards at
> **[demo.cdviz.dev/grafana](https://demo.cdviz.dev/grafana)** — no installation required.

If you're new to CDviz, we recommend starting with our **[Getting Started Guide](./getting-started.md)**. This guide will walk you through setting up a local CDviz environment, sending your first events, and seeing the results in Grafana.

## CDEvents

CDviz is built on top of the **[CDEvents](https://cdevents.dev/)** specification. To learn more about CDEvents, please refer to our **[CDEvents](./cdevents.md)** documentation.

## Architecture

To get an overview of how CDviz components collaborate, check out our **[Architecture](./architecture.md)** documentation.

## Components

CDviz is a modular platform with three main components:

- **[CDviz Collector](./cdviz-collector/index.md):** A flexible data pipeline for acquiring, transforming, and forwarding data from diverse sources.
- **[CDviz Database](./cdviz-db/index.md):** An optimized data storage solution for metrics and events.
- **[CDviz Grafana](./cdviz-grafana/index.md):** A comprehensive dashboard solution for visualizing, analyzing, and generating alerts.

## Other Resources

- **[Alternatives](./alternatives/index.md):** A list of alternative tools to CDviz.
