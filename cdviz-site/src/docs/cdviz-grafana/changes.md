---
description: "CDviz Changes dashboard: track pull-request and change lifecycle across repos — created, in review, merged, abandoned — with merge throughput, cycle time, and oldest open changes."
#plans:
#  - cloud
---

# Changes Dashboard

![Changes dashboard overview](/screenshots/cloud_changes_dashboard_top-20260717.png)

> [!NOTE] Available in CDviz Cloud
> The Changes dashboard ships today in [CDviz Cloud](/cloud). It is built on the
> same `change.*` [CDEvents](https://cdevents.dev) as the rest of the stack, so a
> self-hosted Grafana version can follow — the change lifecycle is also covered
> from the incident side in the [Incidents & Tickets](./incidents_tickets.md) dashboard.

## Overview

The Changes dashboard tracks the pull-request / change-request lifecycle across
all your connected repositories. It consolidates change events from GitHub,
GitLab, or Jira as long as they emit [CDEvents](https://cdevents.dev), so you can
see delivery flow without opening every repo's PR tab.

Key questions answered:

- How many changes are in flight right now — created, in review, merged, abandoned?
- What is our merge throughput, and is it trending up or down?
- What is the cycle time from change creation to merge?
- Which changes have been open the longest and need attention?

## Dashboard Panels

### Change Summary

An at-a-glance stat row: changes **created**, **in review**, **merged**, and
**abandoned** in the selected time window, plus median **cycle time** from
`change.created` to `change.merged`.

### Merge Throughput

![Merge throughput panel](/screenshots/cloud_changes_merge_throughput_panel-20260717.png)

Merged changes over time, grouped by day or week — the delivery-flow signal that
tells you whether work is actually shipping, and lets you spot slowdowns before
they show up as missed sprint goals.

### Open & Oldest Changes

![Open and oldest changes panel](/screenshots/cloud_changes_open_oldest_panel-20260717.png)

A scrollable list of currently open changes, sorted oldest first, so stale
pull requests that have stalled in review surface at the top instead of rotting
unnoticed.

## CDEvents Requirements

| Event type         | Used by                                      |
| ------------------ | -------------------------------------------- |
| `change.created`   | Change Summary, Cycle Time, Open Changes     |
| `change.reviewed`  | In-review count                              |
| `change.merged`    | Change Summary, Merge Throughput, Cycle Time |
| `change.abandoned` | Change Summary                               |

> [!NOTE]
> Panels show no data — not zero — when the required event types have not been
> emitted. If your tools do not yet emit CDEvents natively, configure the
> [CDviz Collector](../cdviz-collector/) to translate webhook payloads using
> [transformer rules](../cdviz-collector/transformers-rules.md).

## Connecting Your Tools

Use the corresponding CDviz Collector integration or a webhook transformer to
emit `change.created`, `change.reviewed`, `change.merged`, and `change.abandoned`
CDEvents from pull-request or issue state transitions in GitHub, GitLab, or Jira.

See the [Transformer Rules](../cdviz-collector/transformers-rules.md)
documentation for mapping examples.

## Technical Notes

Cycle time is computed as `change.merged.timestamp − change.created.timestamp`.
Changes that are abandoned (never merged) are excluded from that calculation.
