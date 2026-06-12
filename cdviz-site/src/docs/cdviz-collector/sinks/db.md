---
description: "CDviz Collector database sink: store CDEvents in PostgreSQL with TimescaleDB for DORA metrics dashboards and delivery analytics."
---

# Database Sink

Stores CDEvents in PostgreSQL. The primary sink for CDviz dashboards and analytics — events stored here power DORA metrics, deployment timelines, and artifact tracking in Grafana.

## Configuration

```toml
[sinks.database]
enabled = true
type = "db"
url = "postgresql://postgres:passwd@localhost:5432/cdviz"
pool_connections_min = 1
pool_connections_max = 10
```

## Parameters

| Parameter              | Type    | Default | Description                    |
| ---------------------- | ------- | ------- | ------------------------------ |
| `type`                 | string  | —       | Must be `"db"`                 |
| `url`                  | string  | —       | PostgreSQL connection URL      |
| `enabled`              | boolean | `true`  | Enable/disable this sink       |
| `pool_connections_min` | integer | `1`     | Minimum idle connections       |
| `pool_connections_max` | integer | `10`    | Maximum concurrent connections |

## Database Requirements

The sink calls the `store_cdevent` stored procedure for every event:

```sql
CALL store_cdevent($1);
```

The CDviz schema provides this procedure. See [Database Setup](../../cdviz-db/) for installation instructions.

PostgreSQL 12+ is required; TimescaleDB is strongly recommended for time-series queries and automatic data retention.

## Connection URL

```
postgresql://[user[:password]@][host][:port][/dbname][?param=value&...]
```

```toml
# Basic
url = "postgresql://cdviz_user:password@localhost:5432/cdviz"

# SSL required (recommended for production)
url = "postgresql://user:pass@host:5432/cdviz?sslmode=require"

# SSL with client certificates
url = "postgresql://user:pass@host:5432/cdviz?sslmode=require&sslcert=client.pem&sslkey=client.key&sslrootcert=ca.pem"
```

Keep credentials out of config files using environment variables:

```bash
export CDVIZ_COLLECTOR__SINKS__DATABASE__URL="postgresql://user:pass@prod-db:5432/cdviz"
```

## Default Configuration

The database sink is included but disabled by default:

```toml
[sinks.database]
enabled = false
type = "db"
url = "postgresql://postgres:passwd@localhost:5432/cdviz"
pool_connections_min = 1
pool_connections_max = 10
```

Enable via config (`enabled = true`) or environment variable:

```bash
CDVIZ_COLLECTOR__SINKS__DATABASE__ENABLED="true" cdviz-collector connect --config config.toml
```

## Pool Sizing

For production deployments:
- `pool_connections_min = 2` keeps warm connections available during quiet periods
- `pool_connections_max` should not exceed your PostgreSQL `max_connections` divided by the number of collector instances
- For most deployments, the defaults (`min=1, max=10`) are sufficient

## Related

- [Database Setup (cdviz-db)](../../cdviz-db/) — install the CDviz schema and TimescaleDB
- [Debug Sink](./debug.md) — log events to stdout before enabling the database sink
- [ClickHouse Sink](./clickhouse.md) — alternative analytical database for high-throughput use cases
- [DORA Metrics Dashboard](../../cdviz-grafana/dora_metrics.md) — Grafana dashboard powered by stored CDEvents
