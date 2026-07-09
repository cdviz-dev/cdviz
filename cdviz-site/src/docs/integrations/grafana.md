---
title: Grafana Integration
description: |
  Visualize CDEvents in Grafana: pre-built dashboards for DORA metrics, artifact timelines,
  pipeline performance, and incidents — connected directly to the CDviz PostgreSQL database.
plans:
  - community
  - cloud
  - pro
---

# Grafana Integration

Grafana is the reference visualization layer for CDviz. Pre-built dashboards query the [CDviz Database](../cdviz-db/index.md) directly over a PostgreSQL datasource — no backend API in between, full SQL power for your own panels.

> [!TIP] Online Demo
> Explore a live read-only instance at **[demo.cdviz.dev/grafana](https://demo.cdviz.dev/grafana)** — no installation required.

## What You Get

| Dashboard                                                         | Answers                                                               |
| ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| [DORA Metrics](../cdviz-grafana/dora_metrics.md)                  | Deployment frequency, lead time, time to restore, change failure rate |
| [Artifact Timeline](../cdviz-grafana/artifact_timeline.md)        | Which version is deployed where, and since when                       |
| [Execution Performance](../cdviz-grafana/execution_dashboards.md) | Pipeline runs, task executions, test results                          |
| [CDEvents Activity](../cdviz-grafana/cdevents_activity.md)        | Raw event stream and activity overview                                |
| [Incidents & Tickets](../cdviz-grafana/incidents_tickets.md)      | Open incidents, MTTR, change cycle time                               |

## Setup

1. Create a PostgreSQL datasource pointing at your CDviz Database (name it with the `cdviz-` prefix, enable TimescaleDB).
2. Install the required plugins and import the dashboard JSON definitions.

The full walkthrough — required plugins, manual import, and Kubernetes/Helm provisioning — is in the **[CDviz Grafana reference](../cdviz-grafana/index.md)**.

## Beyond Grafana

Dashboards, panels, and SQL queries are provided for Grafana, but the queries run against plain PostgreSQL — adapt them to your favorite analytics system. Cross-application dashboards (CDviz Cloud, Backstage, …) are on the roadmap.
