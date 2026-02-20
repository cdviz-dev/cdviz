# Database Sink

Stores CDEvents in PostgreSQL. The primary sink for CDviz dashboards and analytics.

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

The CDviz schema provides this procedure. See [Database Setup](../../cdviz-db/) for installation.

PostgreSQL 12+ is required; TimescaleDB is recommended for time-series queries.

## Connection URL

```
postgresql://[user[:password]@][host][:port][/dbname][?param=value&...]
```

```toml
# Basic
url = "postgresql://cdviz_user:password@localhost:5432/cdviz"

# SSL required
url = "postgresql://user:pass@host:5432/cdviz?sslmode=require"

# SSL with client certificates
url = "postgresql://user:pass@host:5432/cdviz?sslmode=require&sslcert=client.pem&sslkey=client.key&sslrootcert=ca.pem"
```

Use environment variables to keep credentials out of config files:

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

Enable it via config (`enabled = true`) or environment variable (`CDVIZ_COLLECTOR__SINKS__DATABASE__ENABLED="true"`).
