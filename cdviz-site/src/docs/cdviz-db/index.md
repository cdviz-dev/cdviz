---
description: "CDviz Database: PostgreSQL + TimescaleDB schema for CDEvents storage. Hypertable, JSONB payload, DORA metrics views, and event ingestion API."
---

<script setup>
import DbConceptual from '../../../components/diagrams/DbConceptual.vue'
</script>

# CDviz Database

CDviz Database is the persistence layer for CDEvents. It stores normalized delivery events in a PostgreSQL + TimescaleDB hypertable with a JSONB payload column, enabling time-series queries for DORA metrics, deployment timelines, and incident tracking.

## Overview

The CDviz database provides the foundational data storage layer for the CDviz platform, enabling efficient capture and retrieval of continuous delivery events and metrics.
This database is also mentioned as **Evidence store** in the CDEvents literature, as it serves as a repository for all events and metrics collected from various sources.

The database is built on PostgreSQL with TimescaleDB extensions, optimized for time-series data management and analytics.

The conceptual architecture of the CDviz database is as follows:

<DbConceptual/>

- a schema for CDEvents storage and analytics: `cdviz`
- stored procedures for event ingestion (used by the collector service or other event sources): `cdviz.store_cdevent(jsonb)` for one event, `cdviz.store_cdevents(jsonb[])` for a batch (duplicates are skipped)
- an hypertable for raw CDEvents storage `cdviz.cdevents_lake`
- a table `cdviz.executions` with one row per pipelinerun / taskrun / testcaserun / testsuiterun, maintained by trigger on insert, so dashboards don't scan the whole event history
- a set of views for data retrieval, analytics and pre-computed metrics (the run views `cdviz.pipelinerun`, `cdviz.taskrun`, … are built on `cdviz.executions`)
- a procedure for data retention: `cdviz.apply_retention(interval)`
- 3 roles for data access (recommanded, not provisioned by the migrations):
  - `cdviz` - for administrative tasks (owner of the database)
  - `cdviz_collector` - for event ingestion
  - `cdviz_reader` - for read-only access to the data

::: tip No GIN index on `payload`
Since 1.5.0 the full-payload GIN index is dropped (unused by shipped queries, and most of the insert cost). If your custom SQL filters `payload` with `@>`, `?`, `@?`…, create a targeted index on the JSON path you query.
:::

When views (materialized or not) are missing, you can :

- query the raw CDEvents table directly
- create temporary views as needed with `WITH` clause
- create custom views in your environment
- submit a pull request to add the view to the database schema

## Installation

### Requirements

The database implementation requires PostgreSQL with specific extensions:

- **TimescaleDB** - For time-series data management
  - enabling efficient storage and retrieval of time-series data
  - adding functions for time-series & events analytics
  - adding support for continuous aggregates
  - adding support for periodic maintenance tasks (metrics aggregation, vacuuming, update of materialized view etc.)

Please refer to the hosting documentation for supported deployment options.

### Data Retention

Retention is not automatic: TimescaleDB retention policies need the Community license, unavailable on Apache-only deployments (e.g. Neon). Schedule the procedure externally (cron, Kubernetes CronJob, `pg_cron`…):

```sql
CALL cdviz.apply_retention(INTERVAL '13 months');
```

It drops whole `cdevents_lake` chunks (7 days) older than the interval, so events are kept between `keep` and `keep` + 7 days, and deletes `executions` whose latest event is older than the cutoff.

### Database Schema

The database schema is defined in the following resources:

- [Migration files](https://github.com/cdviz-dev/cdviz/tree/main/cdviz-db/migrations)

::: details Database Schema Definition (base)
<<< ../../../../cdviz-db/migrations/202601010000_baseline.up.sql
:::

### Available Packages

The following container images are available for deployment:

- [cdviz-db-migration](https://github.com/orgs/cdviz-dev/packages/container/package/cdviz-db-migration) - Handles database schema migrations
- [charts/cdviz-db](https://github.com/orgs/cdviz-dev/packages/container/package/charts%2Fcdviz-db) - Helm chart for Kubernetes deployment
