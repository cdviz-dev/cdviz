---
description: "CDviz Collector SSE sink: stream CDEvents to clients via Server-Sent Events for real-time dashboards and monitoring tools."
---

# Server-Sent Events (SSE) Sink

The SSE sink exposes CDEvents as a real-time HTTP stream that any browser or HTTP client can subscribe to. Each sink creates one endpoint broadcasting all processed events.

## Configuration

```toml
[sinks.events_stream]
enabled = true
type = "sse"
id = "events"
```

Endpoint accessible at: `http://{host}:{port}/sse/{id}`

## Parameters

| Parameter | Type    | Default | Description                                      |
| --------- | ------- | ------- | ------------------------------------------------ |
| `type`    | string  | —       | Must be `"sse"`                                  |
| `id`      | string  | —       | URL path identifier                              |
| `enabled` | boolean | `true`  | Enable/disable this sink                         |
| `headers` | array   | `[]`    | Header validation rules for incoming connections |

## Authentication

Incoming connections are validated using the same header rules as webhook sources.

```toml
# Require a bearer token
[sinks.events_stream]
type = "sse"
id = "events"

[sinks.events_stream.headers]
"Authorization" = { type = "matches", pattern = "^Bearer [\\w-]+$" }

# Or a static API key from an environment variable
"X-API-Key" = { type = "secret", value = "SSE_API_KEY_ENV_VAR" }
```

**[→ Complete Header Validation Guide](../header-validation.md)**

## Event Stream Format

Each CDEvent is sent as:

```
event: cdevent
id: {cdevent-id}
data: {cdevent-json}
```

Keep-alive messages are sent every 30 seconds:

```
: keep-alive
```

When a slow client's buffer (1000 messages) overflows, it receives:

```
event: error
data: lagged: {N} messages skipped
```

## HTTP Response Codes

| Status             | Cause                   |
| ------------------ | ----------------------- |
| `200 OK`           | Valid connection        |
| `401 Unauthorized` | Required header missing |
| `403 Forbidden`    | Header value invalid    |
| `404 Not Found`    | Unknown SSE `id`        |

## Examples

```bash
# Connect and stream events
curl -N -H "Accept: text/event-stream" \
     -H "Authorization: Bearer your-token" \
     http://localhost:8080/sse/events
```

```toml
# Multiple endpoints with different access levels
[sinks.public_stream]
enabled = true
type = "sse"
id = "public"

[sinks.admin_stream]
enabled = true
type = "sse"
id = "admin"

[sinks.admin_stream.headers]
"Authorization" = { type = "equals", value = "Bearer admin-secret", case_sensitive = true }
```

> [!NOTE]
> The SSE sink requires the `sink_sse` feature flag at compile time. Verify with `cdviz-collector --version`.
