# Database Hosting Options

## Kubernetes Deployments

CDViz database can be deployed on Kubernetes using several mature operators:

- **Cloud Native Postgres (CNPG)** - The officially recommended solution, also used in our demonstration cluster. [Documentation](https://cloudnative-pg.io/) | [Reference configuration](https://github.com/cdviz-dev/cdviz/blob/main/demos/stack-k8s/values/cdviz-db.yaml)
- **Postgres Operator by Zalando** - A production-grade Postgres operator with high availability features. [Documentation](https://github.com/zalando/postgres-operator)
- **StackGres** - Enterprise-grade PostgreSQL operator with monitoring capabilities. [Documentation](https://stackgres.io/)

## Managed Database Services

The following managed database services have been evaluated for compatibility with CDViz requirements, particularly regarding support for the required PostgreSQL extensions.

### Specialized PostgreSQL Providers

- **TimescaleDB Cloud** - Optimized for time-series data with built-in support for the TimescaleDB extension. [Documentation](https://www.timescale.com/cloud)
- **Supabase** - Open source Firebase alternative with comprehensive PostgreSQL extension support. [Extension list](https://supabase.com/docs/guides/database/extensions#full-list-of-extensions)
- **Neon** - Serverless PostgreSQL with advanced extension capabilities. [Extension documentation](https://neon.tech/docs/extensions/pg-extensions)

### General Cloud Provider Services

Compatibility status with major cloud providers:

| Provider                      | Status                         | Documentation                                                                                                                            |
| ----------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Azure Database for PostgreSQL | ✅ Compatible                  | [Extensions documentation](https://learn.microsoft.com/en-us/azure/postgresql/extensions/concepts-extensions-versions)                   |
| AWS RDS                       | ❌ Missing required extensions | [Extensions list](https://docs.aws.amazon.com/AmazonRDS/latest/PostgreSQLReleaseNotes/postgresql-extensions.html)                        |
| Google Cloud SQL              | ❌ Missing required extensions | [Extensions documentation](https://cloud.google.com/sql/docs/postgres/extensions)                                                        |
| Digital Ocean                 | ✅ Compatible                  | [Extensions documentation](https://www.digitalocean.com/docs/databases/postgresql/extensions/)                                           |
| Scaleway                      | ✅ Compatible                  | [Extensions documentation](https://www.scaleway.com/en/docs/serverless-sql-databases/reference-content/supported-postgresql-extensions/) |

## Container Deployments

For development, testing, and demonstration purposes, the CDViz database can be deployed using Docker or other OCI-compatible container runtimes.

A reference docker-compose configuration is available in the repository:

::: details Docker Compose Configuration
<<< ../../../../demos/stack-compose/docker-compose.yaml#database{yaml:line-numbers}
:::
