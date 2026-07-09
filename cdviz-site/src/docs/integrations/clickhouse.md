---
title: ClickHouse Integration
description: |
  Store CDEvents in ClickHouse for large-scale analytics: configure the cdviz-collector
  ClickHouse sink and query delivery events with ClickHouse SQL.
plans:
  - community
  - pro
---

# ClickHouse Integration

ClickHouse is an alternative analytics store for CDEvents, suited to very large event volumes or organizations already standardized on ClickHouse. The collector writes events through the ClickHouse sink.

> [!NOTE]
> The pre-built [Grafana dashboards](../cdviz-grafana/index.md) currently require the [PostgreSQL event store](./postgresql.md). With ClickHouse you bring your own dashboards and queries.

## Setup

Enable the ClickHouse sink in the collector configuration:

```toml
[sinks.clickhouse]
enabled = true
type = "clickhouse"
```

Connection URL, table layout, and all options are covered in the **[ClickHouse Sink reference](../cdviz-collector/sinks/clickhouse.md)**.

## When to Choose ClickHouse

- Very high event throughput or long retention where columnar storage pays off
- Existing ClickHouse-based analytics platform to join delivery events with other data
- Otherwise, prefer [PostgreSQL](./postgresql.md) — it powers the full CDviz experience out of the box
