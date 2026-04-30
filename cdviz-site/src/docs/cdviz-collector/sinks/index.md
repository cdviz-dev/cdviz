---
description: "CDviz Collector sinks: deliver CDEvents to PostgreSQL, ClickHouse, HTTP endpoints, Kafka, NATS, SSE streams, or local folders."
---

# Sinks

Sinks deliver CDEvents to their final destinations.

## Quick Reference

```toml
[sinks.my_sink]
enabled = true
type = "folder"  # db | clickhouse | http | folder | sse | kafka | nats | debug
# ... type-specific parameters
```

## Available Sinks

| Type                            | Description                            | Use Cases                                               |
| ------------------------------- | -------------------------------------- | ------------------------------------------------------- |
| [`debug`](./debug.md)           | Log events for development and testing | Development, troubleshooting, pipeline validation       |
| [`db`](./db.md)                 | Store events in PostgreSQL database    | Primary storage, dashboards, analytics                  |
| [`clickhouse`](./clickhouse.md) | Store events in ClickHouse             | High-throughput analytics, columnar queries             |
| [`http`](./http.md)             | Forward events to HTTP endpoints       | Webhooks, external APIs, integrations                   |
| [`folder`](./folder.md)         | Write events as files to storage       | Archival, backup, batch processing                      |
| [`sse`](./sse.md)               | Stream events via Server-Sent Events   | Real-time dashboards, monitoring                        |
| [`kafka`](./kafka.md)           | Publish events to Kafka topics         | Event streaming, Kafka-compatible brokers               |
| [`nats`](./nats.md)             | Publish events to NATS subjects        | Cloud-native messaging, JetStream persistent publishing |

## Shared Configuration

### Header Configuration

Sinks use headers differently based on their direction:

- **Header Validation**: Validate incoming HTTP requests (SSE sink)
- **Header Authentication**: Authenticate outgoing HTTP requests (HTTP sink)

**[→ Header Validation Guide](../header-validation.md)** - For incoming request validation
**[→ Header Authentication Guide](../header-authentication.md)** - For outgoing request authentication

## Default Configuration

Several sinks are included in the default configuration:

```toml
[sinks.debug]
enabled = false
type = "debug"

[sinks.database]
enabled = false
type = "db"
url = "postgresql://postgres:passwd@localhost:5432/cdviz"
pool_connections_min = 1
pool_connections_max = 10
```

To enable them, either:

1. **Edit configuration**: Set `enabled = true` in config file
2. **Environment variable**: Set `CDVIZ_COLLECTOR__SINKS__{SINK_NAME}__ENABLED="true"`
3. **Override configuration**: Create a custom configuration file

## Multiple Sinks

All enabled sinks receive every CDEvent simultaneously. Define as many `[sinks.*]` sections as needed:

[cdevents]: https://cdevents.dev/
[Sources]: ../sources
[Sinks]: ./
[Transformers]: ../transformers
