# Sinks

A Sink pushes CDEvents to a destination.

> [!NOTE] TODO / Roadmap?
> Allowing sinks to used [Transformers] to modify [cdevents] before sending them to the destination.

Every sink has a name (value of the section under `sinks`) and it is configured with at least 2 parameters:

- `enabled`: A boolean value indicating whether the sink is enabled or not (so you can configure it in configuration file and enable/disable by environment variable).
- `type`: A string indicating the type of the sink

The other parameters are specific to the sink type.

## `type = "debug"`

The simplest sink is the `debug` sink. It prints the CDEvent to the log at level `INFO`.

```toml
[sinks.debug]
enabled = false
type = "debug"
```

The `sinks.debug` is included in default configuration, you can just enable it.

## `type = "db"`

The `db` sink stores events in a PostgreSQL database. Configuration parameters include:

- `url`: Connection URL of the form `postgresql://user:pass@host:port/db`
- `pool_connections_min`: Minimum number of connections to maintain in the pool (default 1)
- `pool_connections_max`: Maximum number of connections allowed in the pool (default 10)

The `db` sink inserts the event into the database by calling a stored procedure: `CALL store_cdevent($1)`.

Example configuration:

```toml
[sinks.cdviz_db]
enabled = false
type = "db"
url = "postgresql://postgres:passwd@localhost:5432/cdviz"
pool_connections_min = 1
pool_connections_max = 10
```

The sink requires a PostgreSQL database with the appropriate schema initialized. Events are stored as JSON documents in the database.

The `sinks.cdviz_db` is included in default configuration, you can just enable it and override some parameters.

## `type = "http"`

> [!NOTE]
> This sink will evolve to support more features and configuration options.

The `http` sink forwards events to an HTTP endpoint. Configuration parameters include:

- `url`: The destination HTTP endpoint URL

Example configuration:

```toml
[sinks.http]
enabled = true
type = "http"
url = "https://example.com/webhook"
```

The sink POSTs events as JSON in the request body. Any non-200 response status code will be considered an error but ignored.

## `type = "folder"`

The `folder` sink writes events as JSON files to a directory. Configuration parameters include:

- `kind`: Type of storage backend (e.g. `fs` for local filesystem)
- `parameters`: Backend-specific configuration parameters (same as [`Source with type = "opendal"`](<sources#`type = "opendal"`>))

Example configuration for writing to local filesystem:

```toml
[sinks.cdevents_local_json]
enabled = true
type = "folder"
kind = "fs"
parameters = { root = "./sink" }
```

The sink writes each event as a separate JSON file named with the event ID. The destination path can be configured through the backend parameters.
The sink uses [OpenDAL](https://opendal.apache.org/) to write events to the configured backend. The backend/service supported can be `fs`, `s3` for S3 compatible,... (some backends are not enabled by default contact us or rebuild your own collector).
The service should have the capability to write files.

[cdevents]: <https://cdevents.dev/>
[Sources]: sources
[Sinks]: sinks
[Transformers]: transformers
