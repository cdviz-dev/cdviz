---
title: PostgreSQL Integration
description: |
  Store CDEvents in PostgreSQL + TimescaleDB: the CDviz event store with a hypertable,
  JSONB payloads, and pre-built views for DORA metrics and deployment analytics.
plans:
  - community
  - pro
---

# PostgreSQL Integration

PostgreSQL (with the TimescaleDB extension) is the primary event store for CDviz. The collector writes every CDEvent into the `cdviz.cdevents_lake` hypertable; views on top of it power the [Grafana dashboards](../cdviz-grafana/index.md) and your own analytics.

## Setup

1. **Provision the schema** — apply the CDviz Database migrations to a PostgreSQL instance with TimescaleDB. See the [CDviz Database reference](../cdviz-db/index.md) and [hosting options](../cdviz-db/hosting.md) (self-hosted, managed PostgreSQL, Kubernetes via Helm).

2. **Point the collector at it** — enable the database sink:

```toml
[sinks.cdviz_db]
enabled = true
type = "db"
url = "postgresql://cdviz_collector:$PASSWORD@$HOST:5432/cdviz"
```

See the [Database Sink reference](../cdviz-collector/sinks/db.md) for pool sizing and all options.

3. **Grant read access** — dashboards and analytics connect with the read-only `cdviz_reader` role.

## What You Get

- Time-partitioned CDEvents storage with automatic retention
- Pre-built views for DORA metrics, deployment timelines, and incident tracking
- Plain SQL access — query the lake directly or build your own views
