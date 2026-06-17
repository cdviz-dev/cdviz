---
description: "CDviz Collector HTTP polling source: periodically fetch events from REST APIs, legacy systems, and services without push capabilities. Supports multi-pass driver scripts, pagination, and historical backfill."
---

# HTTP Polling Extractor

> [!NOTE] Requires cdviz-collector >= 0.42
> This page documents the `driver_vrl` multi-pass driver API. Earlier releases
> used a single-pass `request_vrl` script with a different contract.

Periodically polls one or more HTTP endpoints and emits one or more events per parsed response. Useful for services that expose data via a pull API rather than pushing webhooks, and for bootstrapping historical data before switching to webhook-based ingestion.

Each poll is driven by a single [VRL] **driver script** that builds a worklist of HTTP requests. A response can be emitted downstream, fed back into the driver to compute further requests, or both — which makes **multi-pass** flows possible: list/discovery followed by per-item detail fetches (Jenkins, GitHub REST packages), or cursor pagination where the cursor lives in the response body (GraphQL).

## Use Cases

- **Services without webhook support** — Jenkins Remote API, legacy CI servers, custom REST APIs that expose build/deploy history through query parameters.
- **Multi-pass APIs** — first list resources, then fetch details per resource (e.g., Jenkins: list jobs → per-job builds → per-build detail; GitHub: list packages → versions → detail).
- **Cursor pagination** — GraphQL or APIs whose "next" cursor is in the body.
- **Historical backfill** — set `ts_after` to a past date and `ts_before_limit` to "now" to ingest a bounded historical window, then switch to a webhook source going forward.
- **Slow-changing data** — poll a configuration or inventory endpoint on a long interval where push is not available.

## Configuration

```toml
[sources.my_source.extractor]
type = "http_polling"

## Polling interval (humantime format: "30s", "5m", "1h").
polling_interval = "1m"

## VRL driver script. Must set `.requests` (array). May set `.state`.
## Receives { metadata, state, request, response }.
driver_vrl = """
.requests = [{
  "url": "https://api.example.com/events",
  "query": {
    "after":  to_string!(.metadata.ts_after),
    "before": to_string!(.metadata.ts_before)
  }
}]
"""

## Bootstrap start for the time window (optional, defaults to the beginning of time).
## Overridden by persisted state on restart.
# ts_after = "2024-01-01T00:00:00Z"

## Stop the source once ts_after reaches this timestamp (optional).
## Useful for bounded historical backfills.
# ts_before_limit = "2025-01-01T00:00:00Z"

## Default parser for response bodies. Options: "auto" (default), "json", "jsonl", "text".
## Override per request via requests[].parser.
# parser = "auto"

## Minimum delay between the start of consecutive requests. Default: none.
# min_request_interval = "720ms"

## Max requests fetched concurrently within one poll. Default: 4.
# max_concurrency = 4

## Hard budget on total requests per poll (runaway guard). Default: 1000.
# max_requests = 1000

## Max feedback-chain depth (recursion guard). Default: 50.
# max_depth = 50

## Retry budget for transient HTTP failures (humantime format). Default: "30s".
# total_duration_of_retries = "30s"

## Static or secret request headers.
# [sources.my_source.extractor.headers]
# "Authorization" = { type = "secret", value = "Bearer TOKEN" }

## Base metadata merged into every EventSource.
# [sources.my_source.extractor.metadata]
# environment = "production"
```

## Parameters

| Parameter                   | Type     | Default                     | Description                                                                       |
| --------------------------- | -------- | --------------------------- | --------------------------------------------------------------------------------- |
| `polling_interval`          | duration | —                           | How often to poll the endpoint (required).                                        |
| `driver_vrl`                | string   | —                           | VRL driver script; must set `.requests` (array), may set `.state` (required).     |
| `ts_after`                  | datetime | `Timestamp::MIN`            | Initial lower bound of the time window. Overridden by persisted state on restart. |
| `ts_before_limit`           | datetime | none                        | Optional upper cap. When `ts_after` reaches this value the source stops.          |
| `parser`                    | string   | `"auto"`                    | Default response-body parser. Overridable per request via `requests[].parser`.    |
| `min_request_interval`      | duration | none                        | Minimum delay between the start of consecutive requests (rate limiting).          |
| `max_concurrency`           | usize    | `4`                         | Max requests fetched concurrently within one poll.                                |
| `max_requests`              | u32      | `1000`                      | Hard budget on total requests issued per poll (runaway guard).                    |
| `max_depth`                 | u32      | `50`                        | Max feedback-chain depth (recursion guard); bootstrap requests are depth 0.       |
| `total_duration_of_retries` | duration | `"30s"`                     | Retry budget for transient HTTP failures.                                         |
| `headers`                   | object   | `{}`                        | Static or secret headers added to every request.                                  |
| `metadata`                  | object   | `{}`                        | Static metadata merged into every `EventSource`.                                  |
| `user_agent`                | string   | `cdviz-collector/<version>` | `User-Agent` header sent with every request.                                      |

## How It Works

1. At the start of each poll the **driver** VRL script is invoked once (**bootstrap**, with `.response = null`) to seed an initial list of requests from the current **time window** (`ts_after` … `ts_before`).
2. Requests are fetched (with retry and distributed tracing), up to `max_concurrency` in flight at once, the start of each spaced by at least `min_request_interval`.
3. Each response is **routed** according to its request's `route`:
   - `pipeline` (default) — the body is parsed into one or more `EventSource` values and forwarded downstream.
   - `feedback` — the response is handed back to the driver, which may emit further requests.
   - `both` — emit **and** feed back (e.g., GraphQL: emit `nodes`, feed `pageInfo` back for the next page).
4. The poll ends when the worklist drains (or a guard trips — see [Guards](#guards-termination)).
5. On success the time window advances: `ts_after` = old `ts_before`, `ts_before` = `now − 1 s`. The window does **not** advance if the bootstrap driver call failed, or if requests were issued but none reached the server (a transport/HTTP outage) — the next poll retries the same window. A successful (2xx) response whose body fails to parse still advances the window (re-polling would not fix a malformed body).
6. When `ts_before_limit` is reached the source exits — useful for bounded backfills.

> **State is per-poll.** The driver `state` (see [VRL Driver Script](#vrl-driver-script)) is in-memory and reset at the start of every poll. Only the `ts_after`/`ts_before` time window is persisted across restarts (see [State Persistence](#state-persistence)).

## Time Window

| Field             | Description                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `ts_after`        | Exclusive lower bound. Defaults to `Timestamp::MIN`. Loaded from persisted state on restart; config value is the initial bootstrap. |
| `ts_before`       | Exclusive upper bound. Always computed as `now − 1 s` (capped at `ts_before_limit`).                                                |
| `ts_before_limit` | Optional cap. When `ts_after` reaches this value the source stops.                                                                  |

Both values are exposed as `metadata.ts_after` and `metadata.ts_before` (ISO 8601 strings) to the driver script and in every `EventSource` sent downstream.

### Window progression example

With `polling_interval = "1m"` and no `ts_after` configured (so it starts at `Timestamp::MIN`),
consecutive polls walk the window forward. Each successful poll sets the next `ts_after` to the
previous `ts_before`, and `ts_before` to `now − 1 s`:

| Poll | Clock (`now`) | Window requested (`ts_after` … `ts_before`) | Outcome | Next `ts_after`                                           |
| ---- | ------------- | ------------------------------------------- | ------- | --------------------------------------------------------- |
| #1   | `12:00:00`    | `MIN` … `11:59:59`                          | 2xx     | `11:59:59`                                                |
| #2   | `12:01:00`    | `11:59:59` … `12:00:59`                     | 2xx     | `12:00:59`                                                |
| #3   | `12:02:00`    | `12:00:59` … `12:01:59`                     | failure | `11:59:59` _(unchanged from #2)_ — re-requested next poll |
| #4   | `12:03:00`    | `12:00:59` … `12:02:59`                     | 2xx     | `12:02:59`                                                |

Notes on edges:

- **Exclusive bounds** (`ts_after` and `ts_before` are both exclusive) mean an event whose
  timestamp equals a boundary lands in exactly one window — no double-counting across polls.
- **The `now − 1 s` cap** intentionally lags the present by one second. Events created in the
  current second are picked up by the _next_ poll rather than risking a partial read; this trades
  one second of latency for not missing late-arriving events at the boundary.
- A failed poll (see below) does **not** advance the window, so poll #4 simply widens the range
  to re-cover everything poll #3 missed. The endpoint must therefore tolerate overlapping/repeated
  ranges; duplicate events are deduplicated downstream by content-based `context.id`.

## Error Handling

A poll is considered successful only on an HTTP **2xx** response. Anything else — `4xx`, `5xx`,
connection errors, or timeouts — is treated as a failure for that request.

- **Transient failures are retried within the budget.** Each poll retries failing requests for up
  to `total_duration_of_retries` (default `"30s"`) before giving up for that cycle.
- **On a failed poll the window does not advance.** The window stays put when the bootstrap driver
  call fails or when no issued request reached the server, and the next scheduled poll
  (`polling_interval` later) re-requests the same lower bound with an updated `ts_before`. No
  events are skipped because of a failure. A successful (2xx) response whose body fails to parse
  **does** advance the window — re-polling would not fix a malformed body.
- **No fast-fail / no crash.** A failing endpoint does not stop the source; it keeps polling on
  its interval, so the source self-heals once the endpoint recovers.
- **Persisted state only moves forward on success.** When `[state]` is configured, the `ts_after`
  checkpoint is written _after_ a successful poll, so a restart during an outage resumes from the
  last good window rather than skipping ahead.
- **An invalid `driver_vrl`** (e.g. emitting a request without `.url`, or never setting
  `.requests`) is a configuration error surfaced at build time, not a transient failure — fix the
  script.

## VRL Driver Script

The `driver_vrl` program is invoked once at bootstrap and again for every response whose `route`
feeds back. It receives a target shaped as:

```json
{
  "metadata": {
    "ts_after": "2024-01-01T00:00:00Z",
    "ts_before": "2024-01-02T00:00:00Z",
    "context": { "source": "cdviz-collector://...?source=my-source" }
  },
  "state": null,
  "request": null,
  "response": null
}
```

- `state` — the immutable snapshot carried by the request that produced this response. `null` at
  bootstrap and whenever the previous driver call set no `.state`.
- `request` — `{ url, method, headers }` of the request that produced this response, or `null` at
  bootstrap.
- `response` — `{ status, headers, body }` of the response, or `null` at bootstrap. `body` is the
  parsed JSON value when the body is JSON, otherwise the raw string.

The script **must set `.requests`** to an array (possibly empty) and may set `.state`:

| Output field | Type            | Description                                                                                 |
| ------------ | --------------- | ------------------------------------------------------------------------------------------- |
| `.requests`  | array (objects) | Requests to issue. Each entry needs a `url`; entries without one are skipped. **Required.** |
| `.state`     | any \| null     | New state, cloned (as an immutable snapshot) into every request in `.requests`. Optional.   |

Each `.requests[]` object:

| Field     | Type             | Default      | Description                                                                                     |
| --------- | ---------------- | ------------ | ----------------------------------------------------------------------------------------------- |
| `url`     | string           | —            | Request URL (required).                                                                         |
| `method`  | string           | `"GET"`      | HTTP method.                                                                                    |
| `headers` | object (strings) | `{}`         | Additional request headers. Merged with static `headers` config; config values take precedence. |
| `body`    | string           | none         | Request body.                                                                                   |
| `query`   | object (strings) | `{}`         | Query parameters appended to the URL.                                                           |
| `route`   | string           | `"pipeline"` | `pipeline`, `feedback`, or `both`.                                                              |
| `parser`  | string           | source dflt  | Per-request parser override: `auto`, `json`, `jsonl`, `text`.                                   |

> **VRL notes**
>
> - Use the infallible `!` variants (`to_string!()`, `string!()`, `array!()`) when converting
>   values whose type VRL cannot verify (e.g. fields read from `.response.body`), otherwise the
>   assignment is "fallible" and won't compile.
> - Closures (`for_each`, `map_values`) may read and mutate variables declared outside them; the
>   mutations persist.

### Example — single request (simplest)

```vrl
.requests = [{ "url": "https://api.example.com/events" }]
```

### Example — time-windowed request

```vrl
.requests = [{
  "url": "https://api.example.com/events",
  "query": {
    "after":  to_string!(.metadata.ts_after),
    "before": to_string!(.metadata.ts_before),
    "limit":  "500"
  }
}]
```

### Example — Link-header pagination

Pagination is not a built-in flag; express it with `feedback`. Read the `Link` header off
`.response.headers`, extract the `rel="next"` URL with a regex, and emit the next page until it is
absent:

```vrl
if .response == null {
    # bootstrap: first page; emit its items AND feed it back to paginate
    .requests = [{ "url": "https://api.example.com/events", "route": "both" }]
} else {
    link = string(.response.headers.link) ?? ""
    matched = parse_regex(link, r'<(?P<next>[^>]+)>;\s*rel="next"') ?? {}
    if exists(matched.next) {
        .requests = [{ "url": matched.next, "route": "both" }]
    } else {
        .requests = []
    }
}
```

### Example — multi-pass (discovery → detail)

List item ids, then fetch each item's detail. The discovery response feeds back; the detail
responses are emitted. Stash any discovery context you need in `.state` so it rides along into
`metadata.http_polling.state` on the emitted events (a downstream VRL transformer can merge it).

```vrl
if .response == null {
    # pass 1: discovery list — feed back, do not emit
    .requests = [{ "url": "https://api.example.com/jobs", "route": "feedback" }]
} else {
    # pass 2: one detail request per discovered job
    reqs = []
    for_each(array!(.response.body)) -> |_index, job| {
        reqs = push(reqs, {
            "url": "https://api.example.com/jobs/" + string!(job.id),
            "route": "pipeline"
        })
    }
    .requests = reqs
}
```

### Example — GraphQL cursor pagination (`both`)

```vrl
query = {
  "query": "query($after:String){ builds(after:$after){ nodes{ id status } pageInfo{ endCursor hasNextPage } } }",
  "variables": { "after": null }
}

if .response != null {
    query.variables.after = .response.body.data.builds.pageInfo.endCursor
}

cont = if .response == null {
    true
} else {
    .response.body.data.builds.pageInfo.hasNextPage == true
}

if cont {
    .requests = [{
        "url": "https://api.example.com/graphql",
        "method": "POST",
        "headers": { "content-type": "application/json" },
        "body": encode_json(query),
        "route": "both"
    }]
} else {
    .requests = []
}
```

With `route = "both"` each page's body is emitted downstream (use a transformer to pull out
`data.builds.nodes`) while the same body feeds the cursor back.

## Response Parsing

The source-level `parser` is the default; `requests[].parser` overrides it per request.

| Value   | `Accept` header sent                                 | Parsing                                                 |
| ------- | ---------------------------------------------------- | ------------------------------------------------------- |
| `auto`  | `application/json, application/x-ndjson, text/plain` | Detected from `Content-Type` (default).                 |
| `json`  | `application/json`                                   | Whole body → one `EventSource`.                         |
| `jsonl` | `application/x-ndjson`                               | One `EventSource` per non-empty newline-delimited line. |
| `text`  | `text/plain`                                         | Whole body as a JSON string → one `EventSource`.        |

With `jsonl` a single response may emit multiple `EventSource` events.

## EventSource Metadata

Every `EventSource` carries the following in its `metadata` field (merged on top of the static `metadata` config value):

```json
{
  "ts_after": "2024-01-01T00:00:00Z",
  "ts_before": "2024-01-02T00:00:00Z",
  "http_polling": {
    "url": "https://api.example.com/jobs/42",
    "method": "GET",
    "status": 200,
    "state": { "discovery_id": "42" }
  },
  "context": { "source": "cdviz-collector://...?source=my-source" }
}
```

`http_polling.state` is present only when the driver set `.state` for the request that produced the event — use it to carry discovery/parent data into a downstream transformer. VRL transformers downstream can access all of these fields directly.

## Guards (termination)

A driver loop is bounded by three guards, all configurable:

| Field             | Default | Guards against                                                 |
| ----------------- | ------- | -------------------------------------------------------------- |
| `max_requests`    | `1000`  | Runaway worklists — total requests issued in a single poll.    |
| `max_depth`       | `50`    | Unbounded feedback recursion — bootstrap requests are depth 0. |
| `max_concurrency` | `4`     | Too many concurrent in-flight requests.                        |

When `max_requests` or `max_depth` is reached the remaining work is dropped and logged; the poll still completes and the window advances.

## Rate Limiting and Retry-After

`cdviz-collector` automatically handles HTTP-level retry and redirect signals via the `RetryAfterMiddleware` built into every `http_polling` source:

| Status                     | Action                                                                  |
| -------------------------- | ----------------------------------------------------------------------- |
| `303 See Other`            | Sleep `Retry-After`, re-fetch `Location` as GET (async polling pattern) |
| `429 Too Many Requests`    | Sleep `Retry-After`, retry                                              |
| `503 Service Unavailable`  | Sleep `Retry-After`, retry                                              |
| `301`, `302`, `307`, `308` | Follow `Location` immediately                                           |

`Retry-After` accepts both integer seconds (`Retry-After: 60`) and HTTP-date format (`Retry-After: Wed, 21 Oct 2015 07:28:00 GMT`).

Use `min_request_interval` to space out the start of consecutive requests (applies across the whole worklist, including concurrent fetches):

```toml
min_request_interval = "720ms"  # ≈ 83 req/min
```

Automatic redirect following is disabled in the underlying HTTP client; all redirect and retry behaviour is managed by the middleware stack.

## Header Authentication

Static and secret headers can be configured directly on the extractor:

```toml
[sources.my_source.extractor.headers]
"Authorization" = { type = "static", value = "Bearer TOKEN" }
"X-API-Key"     = { type = "secret", value = "my-secret-key" }
```

**[→ Header Authentication Guide](../header-authentication.md)**

## State Persistence

When the `source_opendal` feature is enabled (included in the default feature set) and a `[state]` section is configured, the current `ts_after` checkpoint is saved after each successful poll. On restart, the persisted value is loaded automatically so polling resumes from where it left off.

Only the time window is persisted — the driver `state` is always reset at the start of each poll.

```toml
[state]
kind = "fs"

[state.parameters]
root = "./.cdviz-collector/state"
```

## Full Example — Jenkins multi-pass backfill

List a pipeline's builds, then fetch each build's detail, ingesting one month of history and then stopping:

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
min_request_interval = "200ms"

driver_vrl = """
if .response == null {
    # pass 1: list builds for the pipeline, feed back
    .requests = [{
        "url": "https://jenkins.example.com/job/my-pipeline/api/json",
        "query": { "tree": "builds[number,url]" },
        "route": "feedback"
    }]
} else {
    # pass 2: fetch each build's detail
    reqs = []
    for_each(array!(.response.body.builds)) -> |_index, build| {
        reqs = push(reqs, {
            "url": string!(build.url) + "api/json",
            "route": "pipeline"
        })
    }
    .requests = reqs
}
"""

[sources.jenkins_backfill.extractor.headers]
Authorization = { type = "secret", value = "Basic BASE64_ENCODED_CREDENTIALS" }

[sources.jenkins_backfill.extractor.metadata]
"context.source" = "https://jenkins.example.com"
```

[VRL]: https://vrl.dev
