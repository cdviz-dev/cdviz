---
title: Event Monitoring
description: |
  Monitor your software delivery from CDEvents: DORA metrics, deployment timelines, pipeline
  performance, and incidents — with Grafana today, CDviz Cloud and other viewers tomorrow.
---

# Event Monitoring

Every CDEvent stored in the [event store](./cdviz-db/index.md) is available for monitoring and analytics. CDviz ships dashboards organized by the question they answer, not by the tool that renders them.

## Dashboards

| Dashboard                                                        | Answers                                                               |
| ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| [DORA Metrics](./cdviz-grafana/dora_metrics.md)                  | Deployment frequency, lead time, time to restore, change failure rate |
| [Artifact Timeline](./cdviz-grafana/artifact_timeline.md)        | Which version is deployed where, and since when                       |
| [Execution Performance](./cdviz-grafana/execution_dashboards.md) | Pipeline runs, task executions, test results                          |
| [CDEvents Activity](./cdviz-grafana/cdevents_activity.md)        | Raw event stream and activity overview                                |
| [Incidents & Tickets](./cdviz-grafana/incidents_tickets.md)      | Open incidents, MTTR, change cycle time                               |

## Annotate Your Own Dashboards

Events aren't limited to CDviz's own dashboards. Any Grafana time series panel — even one backed by Prometheus, Datadog, or CloudWatch — can show deployment and incident markers pulled straight from the event store. See [Annotate Runtime Metrics with Events](./cdviz-grafana/annotations.md).

## Viewers

- **[Grafana](./cdviz-grafana/index.md)** — the reference viewer: pre-built dashboards over a PostgreSQL datasource, self-hosted. See the [setup guide](./cdviz-grafana/index.md). Try it live at [demo.cdviz.dev/grafana](https://demo.cdviz.dev/grafana).
- **[CDviz Cloud](/cloud)** — managed dashboards, built in, nothing to install.
- **Others (Backstage, BI tools, …)** — the dashboards, panels, and queries are plain SQL against PostgreSQL: adapt them to your favorite analytics system. Dedicated guides are on the roadmap.

## Beyond Dashboards

Monitoring is one consumer of the event stream — the same events can [trigger automation](./event-reaction.md) via webhooks, Kafka, NATS, or SSE.
