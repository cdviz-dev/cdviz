# ClickHouse Sink

> [!WARNING] No Grafana dashboards for ClickHouse yet
> The CDviz Grafana dashboards are currently written for **PostgreSQL + TimescaleDB only**.
> Storing events in ClickHouse is supported at the collector level, but no pre-built dashboards
> or SQL queries targeting ClickHouse are provided.
>
> If your organisation relies on ClickHouse and would like to sponsor the development of
> ClickHouse-native CDviz dashboards, please [get in touch](/contact).

Stores CDEvents in [ClickHouse](https://clickhouse.com/) using a user-defined INSERT query template.

## Configuration

```toml
[sinks.clickhouse]
enabled = true
type = "clickhouse"
url = "http://localhost:8123"
database = "default"
user = "default"
password = "secret"
query = """
  INSERT INTO cdevents_lake (id, type, source, subject, predicate, specversion, timestamp, payload)
  VALUES ({id}, {type}, {source}, {subject}, {predicate}, {specversion}, {timestamp}, {payload})
"""
```

## Parameters

| Parameter  | Type    | Required | Description                                               |
| ---------- | ------- | -------- | --------------------------------------------------------- |
| `type`     | string  | yes      | Must be `"clickhouse"`                                    |
| `url`      | string  | yes      | ClickHouse HTTP endpoint (e.g. `http://host:8123`)        |
| `database` | string  | yes      | Target database                                           |
| `query`    | string  | yes      | INSERT query template — see [Placeholders](#placeholders) |
| `user`     | string  | no       | ClickHouse username                                       |
| `password` | string  | no       | ClickHouse password                                       |
| `enabled`  | boolean | yes      | Enable/disable this sink                                  |

## Placeholders

The `query` template supports the following `{field}` placeholders, replaced at runtime with values extracted from each CDEvent:

| Placeholder     | Description                                             | Example value                         |
| --------------- | ------------------------------------------------------- | ------------------------------------- |
| `{payload}`     | Full CDEvent as a JSON string                           | `{"context":{"id":"..."},...}`        |
| `{id}`          | Event ID (UUID)                                         | `a3e5f...`                            |
| `{timestamp}`   | Event timestamp (RFC 3339)                              | `2025-10-20T14:30:00Z`                |
| `{type}`        | Full CDEvent type string                                | `dev.cdevents.service.deployed.0.1.1` |
| `{source}`      | Event source URI                                        | `https://github.com/org/repo`         |
| `{subject}`     | Subject segment extracted from type (3rd dot-segment)   | `service`                             |
| `{predicate}`   | Predicate segment extracted from type (4th dot-segment) | `deployed`                            |
| `{specversion}` | CDEvents spec version                                   | `0.4.1`                               |

Each placeholder is replaced with a bound parameter (`?`) — values are never interpolated as raw strings.

## Table Schema

Create the target table before enabling the sink. A minimal example:

```sql
CREATE TABLE IF NOT EXISTS cdevents_lake
(
    id           String,
    type         String,
    source       String,
    subject      String,
    predicate    String,
    specversion  String,
    timestamp    String,  -- RFC 3339; cast with parseDateTime64BestEffort() as needed
    payload      String,  -- full CDEvent JSON
    inserted_at  DateTime64(3) DEFAULT now64(3)
)
ENGINE = MergeTree()
ORDER BY (type, inserted_at);
```

::: tip
`timestamp` is stored as `String` because CDEvent timestamps may include timezone offsets that ClickHouse `DateTime64` does not accept directly. Cast it in queries when needed:

```sql
parseDateTime64BestEffort(timestamp) AS ts
```

:::

## Credentials via Environment Variables

```bash
export CDVIZ_COLLECTOR__SINKS__CLICKHOUSE__URL="https://host:8443"
export CDVIZ_COLLECTOR__SINKS__CLICKHOUSE__PASSWORD="secret"
```

## See Also

- [Database Sink (PostgreSQL)](./db.md) — the default storage sink
- [CDviz Database](../../cdviz-db/) — PostgreSQL + TimescaleDB schema and hosting options
