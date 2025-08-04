# Sinks

A Sink pushes CDEvents to a destination.

> [!NOTE] TODO / Roadmap?
> Allowing sinks to used [Transformers] to modify [cdevents] before sending them to the destination.

Every sink has a name (value of the section under `sinks`) and it is configured with at least 2 parameters:

- `enabled`: A boolean value indicating whether the sink is enabled or not (so you can configure it in configuration file and enable/disable by environment variable).
- `type`: A string indicating the type of the sink

The other parameters are specific to the sink type.

📚 **TOML Syntax Help:** See our [TOML Configuration Guide](../toml-guide.md) for help with arrays, tables, and nested configurations.

## Available Sinks

CDviz Collector supports several types of sinks for different destinations. Each sink type has its own configuration options and use cases.

| Type | Description | Use Cases |
|------|-------------|-----------|
| [`debug`](./debug.md) | Log events for development and testing | Development, troubleshooting, pipeline validation |
| [`db`](./db.md) | Store events in PostgreSQL database | Primary storage, dashboards, analytics |
| [`http`](./http.md) | Forward events to HTTP endpoints | Webhooks, external APIs, integrations |
| [`folder`](./folder.md) | Write events as files to storage | Archival, backup, batch processing |
| [`sse`](./sse.md) | Stream events via Server-Sent Events | Real-time dashboards, monitoring |

## Quick Reference

### Debug Sink

For development and testing:

```toml
[sinks.debug]
enabled = true
type = "debug"
```

**[→ Full Documentation](./debug.md)**

### Database Sink

For persistent storage and dashboards:

```toml
[sinks.cdviz_db]
enabled = true
type = "db"
url = "postgresql://postgres:passwd@localhost:5432/cdviz"
pool_connections_min = 1
pool_connections_max = 10
```

**[→ Full Documentation](./db.md)**

### HTTP Sink

For webhook and API integrations:

```toml
[sinks.webhook]
enabled = true
type = "http"
url = "https://example.com/webhook"

# Optional: Authentication headers
[[sinks.webhook.headers]]
header = "Authorization"

[sinks.webhook.headers.rule]
type = "static"
value = "Bearer your-token"
```

**[→ Full Documentation](./http.md)**

### Folder Sink

For file-based archival and backup:

```toml
[sinks.archive]
enabled = true
type = "folder"
kind = "fs"  # or "s3", "gcs", "azblob"
parameters = { root = "./archive" }
```

**[→ Full Documentation](./folder.md)**

### SSE Sink

For real-time event streaming:

```toml
[sinks.events_stream]
enabled = true
type = "sse"
id = "events"

# Optional: Authentication for incoming connections
[[sinks.events_stream.headers]]
header = "Authorization"

[sinks.events_stream.headers.rule]
type = "exists"
```

**[→ Full Documentation](./sse.md)**

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

[sinks.cdviz_db]
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

Events can be sent to multiple sinks simultaneously:

```toml
# Primary storage
[sinks.database]
enabled = true
type = "db"
url = "postgresql://user:pass@host:5432/cdviz"

# Backup to files
[sinks.backup]
enabled = true
type = "folder"
kind = "s3"
parameters = { bucket = "cdviz-backup", region = "us-east-1" }

# Real-time monitoring
[sinks.monitoring]
enabled = true
type = "sse"
id = "monitoring"

# External integration
[sinks.webhook]
enabled = true
type = "http"
url = "https://external-service.com/webhook"

# Debug (development only)
[sinks.debug]
enabled = false  # Enable in development
type = "debug"
```

[cdevents]: <https://cdevents.dev/>
[Sources]: ../sources
[Sinks]: ./
[Transformers]: ../transformers
