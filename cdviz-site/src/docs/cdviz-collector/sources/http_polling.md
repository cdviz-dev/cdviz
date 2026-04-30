---
description: "CDviz Collector HTTP polling source: periodically fetch events from REST APIs, legacy systems, and services without push capabilities."
---

# HTTP Polling Extractor

Periodically polls an HTTP endpoint and emits one or more events per successful response. Useful for services that expose data via a pull API rather than pushing webhooks, and for bootstrapping historical data before switching to webhook-based ingestion.

## Use Cases

- **Services without webhook support** — Jenkins Remote API, legacy CI servers, custom REST APIs that expose build/deploy history through query parameters.
- **Historical backfill** — Set `ts_after` to a past date and `ts_before_limit` to "now" to ingest a bounded historical window, then switch to a webhook source going forward.
- **Slow-changing data** — Poll a configuration API or inventory endpoint on a long interval (e.g., hourly) where push is not available.

## Configuration

```toml
[sources.my_source.extractor]
type = "http_polling"

## How often to poll (humantime format: "30s", "5m", "1h").
polling_interval = "1m"

## VRL script to build the HTTP request (required).
request_vrl = """
.url = "https://api.example.com/events"
.query.after  = to_string!(.metadata.ts_after)
.query.before = to_string!(.metadata.ts_before)
"""

## Bootstrap start for the time window (optional, defaults to beginning of time).
## Overridden by persisted state on restart.
# ts_after = "2024-01-01T00:00:00Z"

## Stop once ts_after reaches this timestamp (optional, useful for bounded backfills).
# ts_before_limit = "2025-01-01T00:00:00Z"

## Response body parser: "auto" (default), "json", "jsonl", "text".
# parser = "auto"

## Retry budget for transient HTTP failures (humantime format). Default: "30s".
# total_duration_of_retries = "30s"

## Static or secret request headers.
# [sources.my_source.extractor.headers]
# "Authorization" = { type = "static", value = "Bearer TOKEN" }

## Base metadata merged into every EventSource.
# [sources.my_source.extractor.metadata]
# environment = "production"
```

## Parameters

| Parameter                   | Type     | Default                     | Description                                                                       |
| --------------------------- | -------- | --------------------------- | --------------------------------------------------------------------------------- |
| `polling_interval`          | duration | —                           | How often to poll the endpoint (required).                                        |
| `request_vrl`               | string   | —                           | VRL script to build the HTTP request; must set `.url` (required).                 |
| `ts_after`                  | datetime | `Timestamp::MIN`            | Initial lower bound of the time window. Overridden by persisted state on restart. |
| `ts_before_limit`           | datetime | none                        | Optional upper cap. When `ts_after` reaches this value the source stops.          |
| `parser`                    | string   | `"auto"`                    | How to parse the response body. See [Response parsing](#response-parsing).        |
| `total_duration_of_retries` | duration | `"30s"`                     | Retry budget for transient HTTP failures.                                         |
| `headers`                   | object   | `{}`                        | Static or secret headers added to every request.                                  |
| `metadata`                  | object   | `{}`                        | Static metadata merged into every `EventSource`.                                  |
| `user_agent`                | string   | `cdviz-collector/<version>` | `User-Agent` header sent with every request.                                      |

## How It Works

1. A [VRL] script (`request_vrl`) generates the HTTP request (URL, method, headers, query parameters) from the current **time window** (`ts_after` … `ts_before`).
2. The collector sends the request with automatic retry and distributed tracing.
3. On HTTP 2xx, the response body is parsed into one or more `EventSource` values (depending on `parser`) and forwarded downstream for transformation.
4. On success the time window advances: `ts_after` = old `ts_before`, `ts_before` = `now − 1 s`. On any failure the window stays put and the next poll retries the same window.
5. When `ts_before_limit` is reached the source exits — useful for bounded backfills.

## Time Window

| Field             | Description                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `ts_after`        | Exclusive lower bound. Defaults to `Timestamp::MIN`. Loaded from persisted state on restart; config value is the initial bootstrap. |
| `ts_before`       | Exclusive upper bound. Always computed as `now − 1 s` (capped at `ts_before_limit`).                                                |
| `ts_before_limit` | Optional cap. When `ts_after` reaches this value the source stops.                                                                  |

Both values are exposed as `metadata.ts_after` and `metadata.ts_before` (ISO 8601 strings) in the VRL request script and in every `EventSource` sent downstream.

## VRL Request Script

The `request_vrl` program receives a target with the shape:

```json
{
  "metadata": {
    "ts_after": "2024-01-01T00:00:00Z",
    "ts_before": "2024-01-02T00:00:00Z",
    "context": { "source": "cdviz-collector://...?source=my-source" }
  }
}
```

It must **set `.url`** (required) and may set any of the following:

| Field      | Type             | Default | Description                                                                                     |
| ---------- | ---------------- | ------- | ----------------------------------------------------------------------------------------------- |
| `.url`     | string           | —       | Request URL (required).                                                                         |
| `.method`  | string           | `"GET"` | HTTP method.                                                                                    |
| `.headers` | object (strings) | `{}`    | Additional request headers. Merged with static `headers` config; config values take precedence. |
| `.body`    | string           | none    | Request body bytes.                                                                             |
| `.query`   | object (strings) | `{}`    | Query parameters appended to the URL.                                                           |

> **VRL note**: use `to_string!()` (the infallible `!` variant) when converting field values to strings.

### Example — REST API with time window

```vrl
.url = "https://api.example.com/events"
.query.after  = to_string!(.metadata.ts_after)
.query.before = to_string!(.metadata.ts_before)
.query.limit  = "500"
```

### Example — Jenkins build history

```vrl
.url = "https://jenkins.example.com/job/my-pipeline/api/json"
.query.tree = "builds[number,result,timestamp,duration,url]"
```

## Response Parsing

| Value   | `Accept` header sent                                 | Parsing                                                 |
| ------- | ---------------------------------------------------- | ------------------------------------------------------- |
| `auto`  | `application/json, application/x-ndjson, text/plain` | Detected from `Content-Type` (default).                 |
| `json`  | `application/json`                                   | Whole body → one `EventSource`.                         |
| `jsonl` | `application/x-ndjson`                               | One `EventSource` per non-empty newline-delimited line. |
| `text`  | `text/plain`                                         | Whole body as a JSON string → one `EventSource`.        |

With `jsonl` a single poll can emit multiple events. Timestamp advancement still happens when parsing succeeds, even when zero lines are present.

## EventSource Metadata

Every `EventSource` carries the following in its `metadata` field (merged on top of the static `metadata` config value):

```json
{
  "ts_after": "2024-01-01T00:00:00Z",
  "ts_before": "2024-01-02T00:00:00Z",
  "http_polling": {
    "url": "https://api.example.com/events?after=...&before=...",
    "method": "GET",
    "status": 200
  },
  "context": { "source": "cdviz-collector://...?source=my-source" }
}
```

VRL transformers downstream can access these fields directly.

## Header Authentication

Static and secret headers can be configured directly on the extractor:

```toml
[sources.my_source.extractor.headers]
"Authorization" = { type = "static", value = "Bearer TOKEN" }
"X-API-Key"     = { type = "secret", value = "my-secret-key" }
```

**[→ Header Authentication Guide](../header-authentication.md)**

## State Persistence

When a `[state]` section is configured, the current `ts_after` checkpoint is saved after each successful poll. On restart, the persisted value is loaded automatically so polling resumes from where it left off.

```toml
[state]
kind = "fs"

[state.parameters]
root = "./.cdviz-collector/state"
```

## Full Example — Jenkins Backfill

Ingests 30 days of Jenkins build history and stops:

```toml
[sources.jenkins_backfill]
enabled = true
transformer_refs = ["jenkins_builds"]

[sources.jenkins_backfill.extractor]
type             = "http_polling"
polling_interval = "10s"
ts_after         = "2024-12-01T00:00:00Z"
ts_before_limit  = "2025-01-01T00:00:00Z"
parser           = "json"

request_vrl = """
.url    = "https://jenkins.example.com/job/my-pipeline/api/json"
.method = "GET"
.query.tree = "builds[number,result,timestamp,duration,url]"
"""

[sources.jenkins_backfill.extractor.headers]
Authorization = { type = "static", value = "Basic BASE64_ENCODED_CREDENTIALS" }

[sources.jenkins_backfill.extractor.metadata]
"context.source" = "https://jenkins.example.com"
```

[VRL]: https://vrl.dev
