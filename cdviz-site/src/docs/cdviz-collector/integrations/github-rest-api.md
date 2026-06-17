---
title: GitHub REST API (Polling)
description: |
  Poll the GitHub REST API and transform paginated responses into CDEvents.
  <ul>
  <li>Backfill historical data (workflow runs, pull requests, releases, ...) before switching to webhooks.</li>
  <li>Ingest GitHub activity in environments where webhooks are not available (no inbound endpoint, GitHub Enterprise behind a firewall).</li>
  <li>Multi-pass discovery: list an org's repositories/packages, then fan out to fetch each one's resources — no per-repo configuration.</li>
  </ul>
editions:
  - community
  - enterprise
integration:
  icon: /icons/github.svg
  type: source/http_polling
  events:
    - input: "GET /repos/{owner}/{repo}/actions/runs"
      output: pipelineRun.{queued,started,finished}
    - input: "GET /repos/{owner}/{repo}/pulls"
      output: change.{created,merged,abandoned}
    - input: "GET /repos/{owner}/{repo}/releases (+ assets)"
      output: artifact.published
    - input: "GET /{orgs|users}/{owner}/packages/.../versions"
      output: artifact.published
    - input: "GET /repos/{owner}/{repo}/issues (non-PR)"
      output: ticket.{created,closed}
    - input: "GET /repos/{owner}/{repo}/deployments"
      output: service.deployed
    - input: "GET /orgs/{org}/repos"
      output: repository.created
    - input: "GET /repos/{owner}/{repo}/environments"
      output: environment.created
    - input: "GET /repos/{owner}/{repo}/branches"
      output: branch.created
references:
  - title: HTTP Polling Source reference
    url: /docs/cdviz-collector/sources/http_polling
  - title: GitHub Webhook Integration (real-time)
    url: /docs/cdviz-collector/integrations/github
  - title: github_rest_api transformers (source + example config)
    url: https://github.com/cdviz-dev/transformers-community/tree/main/github_rest_api
  - title: GitHub REST API documentation
    url: https://docs.github.com/en/rest
---

<script setup>
import IntegrationCard from '../../../../components/IntegrationCard.vue'
</script>

<IntegrationCard />

> [!NOTE] Requires cdviz-collector >= 0.42
> This integration uses the [`http_polling`](../sources/http_polling.md) source with
> the `driver_vrl` multi-pass driver. Earlier releases (single-pass `request_vrl`)
> are not compatible.

## When to Use

Use REST API polling when **push (webhooks) is not enough or not possible**:

- **Historical backfill** — ingest months of past activity before switching to the
  [GitHub Webhook integration](./github.md) going forward. Set `ts_after` to a past
  date and `ts_before_limit` to "now", run once, then stop.
- **No inbound endpoint** — GitHub Enterprise behind a firewall, or a collector with
  no public URL to receive webhooks.
- **Backfilling missed events** — re-pull a window after webhook downtime; downstream
  deduplication by content-based `context.id` makes overlapping ranges safe.

For real-time ingestion, prefer [webhooks](./github.md) — they are lower-latency and
do not consume API rate limit. The two can run side by side: backfill with polling,
then track live activity with webhooks.

## How It Works

Each source uses the [`http_polling`](../sources/http_polling.md) extractor with a
single inline `driver_vrl` script that builds a worklist of requests. Responses are
**routed**:

- `feedback` — handed back to the driver to compute more requests (discovery,
  pagination); **not** emitted downstream.
- `pipeline` — body is parsed and forwarded to the transformer.
- `both` — emit **and** feed back (resource pages that must be transformed _and_
  paginated).

This enables **discovery**: list an org's repositories once (routed `feedback`), then
fan out one request per repo to fetch its resources (routed `both`) — no need to
hardcode every repository. Pagination is manual: read the `Link` header and re-issue
the `rel="next"` URL until it is absent. Responses are distinguished by their
originating URL (`.request.url`).

The transformation logic lives in the
[`github_rest_api`](https://github.com/cdviz-dev/transformers-community/tree/main/github_rest_api)
transformers in the community repository.

## Configuration

### 1. Reference the transformers

```toml
[remote.transformers-community]
type = "github://cdviz-dev/transformers-community"

[transformers.github_rest_workflow_runs]
type = "vrl"
template_rfile = "transformers-community:///github_rest_api/workflow_runs_to_v0_5.vrl"

[transformers.github_rest_releases]
type = "vrl"
template_rfile = "transformers-community:///github_rest_api/releases_to_v0_5.vrl"

# Add others as needed: pull_requests, package_versions, issues,
# deployments, repositories, environments, branches.
```

### 2. Define a polling source (multi-pass discovery)

Example: discover an org's repositories, then fetch each repo's workflow runs created
since the polling window start.

```toml
[sources.github_rest_workflow_runs]
enabled = true
transformer_refs = ["github_rest_workflow_runs"]

[sources.github_rest_workflow_runs.extractor]
type                 = "http_polling"
polling_interval     = "1h"
min_request_interval = "720ms"   # ≈ 83 req/min, stays under GitHub rate limits
parser               = "json"
# ts_after        = "2024-01-01T00:00:00Z"   # optional backfill lower bound
# ts_before_limit = "2025-01-01T00:00:00Z"   # optional: stop after this window

driver_vrl = """
org = "myorg"
reqs = []
if .response == null {
  # pass 1: discover repos (feedback only — the repos list is not a run event)
  reqs = [{ "url": "https://api.github.com/orgs/" + org + "/repos", "query": {"per_page": "100"}, "route": "feedback" }]
} else {
  url = string(.request.url) ?? ""
  is_resource = contains(url, "/actions/runs")
  # paginate the current listing via the Link header
  matched = parse_regex(string(.response.headers.link) ?? "", r'<(?P<next>[^>]+)>;\\s*rel="next"') ?? {}
  if exists(matched.next) {
    reqs = push(reqs, { "url": matched.next, "route": (if is_resource { "both" } else { "feedback" }) })
  }
  if !is_resource {
    # pass 2: per repo, fetch its workflow runs (emitted via "both", paginated above)
    created = (">=" + to_string!(.metadata.ts_after)) ?? ""
    for_each(array!(.response.body)) -> |_i, repo| {
      reqs = push(reqs, { "url": string!(repo.url) + "/actions/runs", "query": {"per_page": "100", "created": created}, "route": "both" })
    }
  }
}
.requests = reqs
"""

[sources.github_rest_workflow_runs.extractor.headers]
authorization          = { type = "secret", value_file = "/secrets/github_pat_token", prefix = "Bearer " }
"x-github-api-version" = { type = "static", value = "2022-11-28" }
```

The same discovery → per-repo pattern applies to every repository-scoped resource —
only the endpoint suffix and `transformer_refs` change:

| Transformer                 | Per-repo endpoint suffix             |
| --------------------------- | ------------------------------------ |
| `github_rest_releases`      | `/releases`                          |
| `github_rest_workflow_runs` | `/actions/runs?created=>{ts_after}`  |
| `github_rest_pull_requests` | `/pulls?state=all`                   |
| `github_rest_issues`        | `/issues?state=all&since={ts_after}` |
| `github_rest_deployments`   | `/deployments`                       |
| `github_rest_environments`  | `/environments`                      |
| `github_rest_branches`      | `/branches`                          |

`github_rest_repositories` is simpler — the repos list _is_ the event, so route it
`pipeline` directly (no fan-out). `github_rest_package_versions` discovers packages per
type, then fans out to each package's versions endpoint.

> [!TIP]
> The community repository ships
> [`cdviz-collector.sources.example.toml`](https://github.com/cdviz-dev/transformers-community/blob/main/github_rest_api/cdviz-collector.sources.example.toml)
> with ready-to-use `enabled = false` source blocks for all resources. Copy one, set
> `org`, replace the authorization secret, set `enabled = true`.

## Token Permissions

Use a GitHub token (PAT or App) with the read scopes for the resources you poll:

| Resource         | Permission           |
| ---------------- | -------------------- |
| workflow runs    | `actions:read`       |
| pull requests    | `pull_requests:read` |
| releases         | `contents:read`      |
| package versions | `packages:read`      |
| issues           | `issues:read`        |
| deployments      | `deployments:read`   |
| repositories     | `metadata:read`      |
| environments     | `deployments:read`   |
| branches         | `contents:read`      |

## Backfill Pattern

A historical backfill is a one-shot `connect` run with `ts_after` and `ts_before_limit`
set — the source exits when it reaches the limit:

```sh
cdviz-collector connect --config github_backfill.toml
```

Re-running is safe: state checkpoints are saved after each successful window (see
[State Persistence](../sources/http_polling.md#state-persistence)), and duplicate events
are deduplicated downstream by content-based `context.id`. Once the backfill completes,
switch to the [GitHub Webhook integration](./github.md) for live tracking.

> **Branch timestamps are approximate** — GitHub's branches API does not expose branch
> creation time, so the transformer uses the polling window start (`ts_after`) as a
> proxy.
