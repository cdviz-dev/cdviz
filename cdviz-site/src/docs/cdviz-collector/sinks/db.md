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

| Parameter                   | Type     | Default | Description                                                                                     |
| --------------------------- | -------- | ------- | ----------------------------------------------------------------------------------------------- |
| `type`                      | string   | —       | Must be `"db"`                                                                                  |
| `url`                       | string   | —       | PostgreSQL connection URL                                                                       |
| `enabled`                   | boolean  | —       | Enable/disable this sink                                                                        |
| `pool_connections_min`      | integer  | `0`     | Connections kept open at all times (`> 0` requires the database at startup)                     |
| `pool_connections_max`      | integer  | `10`    | Maximum concurrent connections                                                                  |
| `pool_acquire_timeout`      | duration | `"30s"` | Max wait to get a connection from the pool                                                      |
| `pool_idle_timeout`         | duration | `"10m"` | Close connections idle longer than this                                                         |
| `pool_max_lifetime`         | duration | `"30m"` | Recycle connections older than this                                                             |
| `pool_test_before_acquire`  | boolean  | `true`  | Health-check a connection before using it                                                       |
| `lazy_connection`           | boolean  | `false` | `false`: connect at startup and fail fast if unreachable; `true`: connect on first use          |
| `total_duration_of_retries` | duration | `"30m"` | Retry budget for transient connection errors (`"0s"` disables retries)                          |
| `batch_max_size`            | integer  | `50`    | Flush once this many events are buffered; max events per `CALL` (`1` disables batching)         |
| `batch_max_wait`            | duration | `"1s"`  | Flush buffered events at least this often                                                       |
| `batch_spool_dir`           | path     | none    | Directory where buffered events are also written, to survive a crash. See [Batching](#batching) |

## Database Requirements

The sink inserts events in batches via the `cdviz.store_cdevents` stored procedure (one `CALL` per batch):

```sql
CALL cdviz.store_cdevents($1);  -- $1: jsonb[]
```

The CDviz schema provides this procedure since cdviz-db **1.4.0**. On an older schema, the sink logs a warning and falls back to `cdviz.store_cdevent` (one `CALL` per event): upgrade the schema to get batch inserts. See [Database Setup](../../cdviz-db/) for installation instructions.

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

Keep credentials out of config files using the `_file` suffix (read from a mounted file) or by setting via environment variable (the key need not exist in TOML):

```toml
# Read connection URL from a mounted file (Kubernetes Secret, Docker volume, etc.)
[sinks.database]
enabled = true
type = "db"
url_file = "/run/secrets/db_url"
```

```bash
# Or set via environment variable (no TOML entry needed):
export CDVIZ_COLLECTOR__SINKS__DATABASE__URL="postgresql://user:pass@prod-db:5432/cdviz"
```

## Default Configuration

The database sink is included but disabled by default:

```toml
[sinks.database]
enabled = false
type = "db"
url = "postgresql://postgres:passwd@localhost:5432/cdviz?search_path=cdviz"
pool_connections_min = 0
pool_connections_max = 10
pool_acquire_timeout = "30s"
pool_idle_timeout = "10m"
pool_max_lifetime = "30m"
pool_test_before_acquire = true
lazy_connection = false
```

Enable via config (`enabled = true`) or environment variable:

```bash
CDVIZ_COLLECTOR__SINKS__DATABASE__ENABLED="true" cdviz-collector connect --config config.toml
```

## Batching

Events are buffered and written in batches, which cuts round trips when a source produces events faster than one-by-one inserts can keep up (HTTP polling, backfills, bursts of webhooks). A batch is flushed when `batch_max_size` events are buffered or every `batch_max_wait`, whichever comes first. Receiving events never waits on the database: while a batch is being written, new events keep buffering.

If the database is unreachable, buffered events are kept in memory and retried on the next flush. To also survive a **crash or restart**, set `batch_spool_dir`: buffered events are appended to a file there and replayed at startup. A replay may resend events already stored; `cdviz.store_cdevents` ignores duplicates.

```toml
[sinks.database]
enabled = true
type = "db"
url_file = "/run/secrets/db_url"
batch_max_size = 200
batch_max_wait = "5s"
batch_spool_dir = "/var/lib/cdviz-collector/spool/database"  # use a persistent volume
```

::: tip Scale-to-zero databases (e.g. Neon)
A long `batch_max_wait` (e.g. `"30m"`) combined with a short `pool_idle_timeout`, `pool_connections_min = 0` and a `batch_spool_dir` lets the database suspend between flushes without risking event loss.
:::

## Pool Sizing

For production deployments:

- `pool_connections_min = 2` keeps warm connections available during quiet periods (keep `0` for scale-to-zero databases)
- `pool_connections_max` should not exceed your PostgreSQL `max_connections` divided by the number of collector instances
- For most deployments, the defaults (`min=0, max=10`) are sufficient

## Related

- [Database Setup (cdviz-db)](../../cdviz-db/) — install the CDviz schema and TimescaleDB
- [Debug Sink](./debug.md) — log events to stdout before enabling the database sink
- [ClickHouse Sink](./clickhouse.md) — alternative analytical database for high-throughput use cases
- [DORA Metrics Dashboard](../../cdviz-grafana/dora_metrics.md) — Grafana dashboard powered by stored CDEvents
