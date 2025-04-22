# Hosting

## Docker / OCI container

Examples with docker-compose, [docker-compose.yml](https://github.com/cdviz-dev/cdviz/blob/main/demos/stack-compose/docker-compose.yaml)

<<< ../../../../demos/stack-compose/docker-compose.yaml{3-51 yaml:line-numbers}

## Kubernetes

- [cloud native postgres aka CNPG](https://cloudnative-pg.io/), it's the solution used in our demo cluster ([see values.yaml](https://github.com/cdviz-dev/cdviz/blob/main/demos/stack-k8s/values/cdviz-db.yaml))
- [Postgres Operator from Zalando](https://github.com/zalando/postgres-operator)
- [StackGres](https://stackgres.io/)
- ...

## Cloud (Managed)

> [!CAUTION]
> Below are some managed Database providers that may support our requirements based on their documentation.
>
> It's a non limited list (feedbacks are welcome).

### Dedicated

- [Timescaledb cloud](https://www.timescale.com/cloud)
- [Supabase](https://supabase.com/docs/guides/database/extensions#full-list-of-extensions)
- [Neon](https://neon.tech/docs/extensions/pg-extensions)

### General Cloud Provider

Currently some managed Database doesn't support our requirements (extensions):

- 🟢 [Azure Database for PostgreSQL](https://learn.microsoft.com/en-us/azure/postgresql/extensions/concepts-extensions-versions)
- 🔴 [AWS RDS](https://docs.aws.amazon.com/AmazonRDS/latest/PostgreSQLReleaseNotes/postgresql-extensions.html)
- 🔴 [Google Cloud SQL](https://cloud.google.com/sql/docs/postgres/extensions)
- 🟢 [Digital Ocean](https://www.digitalocean.com/docs/databases/postgresql/extensions/)
- 🟢 [Scaleway](https://www.scaleway.com/en/docs/serverless-sql-databases/reference-content/supported-postgresql-extensions/)
