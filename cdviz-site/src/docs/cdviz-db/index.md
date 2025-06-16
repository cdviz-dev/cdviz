# CDViz Database

> [!IMPORTANT]
> CDViz is currently in **alpha / preview** stage.

## Overview

The CDViz database provides the foundational data storage layer for the CDViz platform, enabling efficient capture and retrieval of continuous delivery events and metrics.
This database is also mentioned as **Evidence store** in the CDEvents literature, as it serves as a repository for all events and metrics collected from various sources.

The database is built on PostgreSQL with TimescaleDB extensions, optimized for time-series data management and analytics.

The conceptual architecture of the CDViz database is as follows:

![CDViz Database Architecture](/architectures/cdviz_db_conceptual.excalidraw.svg)

- a schema for CDEvents storage and analytics: `cdviz`
- a stored procedure for event ingestion (used by the collector service or other event sources): `cdviz.store_cdevent`
- an hypertable for raw CDEvents storage `cdviz.cdevents_lake`
- a set of views for data retrieval, analytics and pre-computed metrics
- 3 roles for data access (TODO):
  - `cdviz` - for administrative tasks (owner of the database)
  - `cdviz_collector` - for event ingestion
  - `cdviz_reader` - for read-only access to the data

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

### Database Schema

The database schema is defined in the following resources:
- [schema.sql](https://github.com/cdviz-dev/cdviz/blob/main/cdviz-db/src/schema.sql)
- [Migration files](https://github.com/cdviz-dev/cdviz/tree/main/cdviz-db/migrations)

::: details Database Schema Definition
<<< ../../../../cdviz-db/src/schema.sql
:::

### Available Packages

The following container images are available for deployment:

- [cdviz-db-migration](https://github.com/orgs/cdviz-dev/packages/container/package/cdviz-db-migration) - Handles database schema migrations
- [cdviz-db-pg](https://github.com/orgs/cdviz-dev/packages/container/package/cdviz-db-pg) - PostgreSQL instance pre-configured for CDViz
- [charts/cdviz-db](https://github.com/orgs/cdviz-dev/packages/container/package/charts%2Fcdviz-db) - Helm chart for Kubernetes deployment
