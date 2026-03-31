---
title: "CDviz vs Middleware: Open-Source DORA Metrics Compared"
description: "CDviz vs Middleware: both open-source, Apache 2.0. Compare event-driven vs polling, CDEvents standard, data ownership, and cost model for DORA metrics teams."
head:
  - - script
    - type: application/ld+json
    - '{"@context":"https://schema.org","@type":"ItemList","name":"CDviz vs Middleware","itemListElement":[{"@type":"ListItem","position":1,"name":"CDviz","url":"https://cdviz.dev"},{"@type":"ListItem","position":2,"name":"Middleware","url":"https://middlewarehq.com"}]}'
---

# CDviz vs Middleware

Both CDviz and Middleware are open-source, Apache 2.0 platforms targeting SDLC observability and DORA metrics. The core difference is the data model: Middleware polls your tools (GitHub, GitLab, Jira) on a schedule; CDviz ingests a real-time event stream from your pipeline using the CDEvents standard.

> _Last updated March 2026. [Corrections welcome](https://github.com/cdviz-dev/cdviz/edit/main/cdviz-site/src/docs/alternatives/vs-middleware.md)._

## At a glance

|                                           |              **CDviz**               |         **Middleware**          |
| ----------------------------------------- | :----------------------------------: | :-----------------------------: |
| License                                   |             Apache 2.0               |           Apache 2.0            |
| Self-hosted                               |                  ✅                  |               ✅                |
| SaaS option                               |             ⏳ waitlist              |               ✅                |
| Commercial support                        |                  ✅                  |      ✅ (paid tiers only)       |
| Data ownership                            |               ✅ full                |  ✅ self-hosted / ❌ SaaS cloud |
| [CDEvents](https://cdevents.dev) standard |                  ✅                  |               ❌                |
| Data model                                | Event-driven (push, real-time)       |    Pull-based (polling)         |
| DORA metrics                              |                  ✅                  |               ✅                |
| Sprint / project flow insights            |                  ❌                  |               ✅                |
| PR review analytics                       |                  ✅                  |               ✅                |
| AI-powered reports                        |                  ❌                  |          ✅ (Standard+)         |
| Beyond monitoring: trigger workflows      |                  ✅                  |               ❌                |
| Jira integration                          |                  ✅                  |               ✅                |
| Slack integration                         |                  ✅                  |          ✅ (Standard+)         |
| Customizable storage backends             |   ✅ (PostgreSQL, ClickHouse…)       |               ❌                |
| Visualization                             | Grafana, BI, AI agents, MCP, IDP     | built-in dashboards             |
| Cost (self-hosted)                        | Infra + optional support             |          Free community         |
| Cost (SaaS)                               | ⏳ waitlist (per org/month)          |    $39/user/month (Standard)    |

## Key differences

- **Data model**: Middleware polls GitHub, GitLab, and Jira APIs on a schedule to compute metrics. CDviz receives events pushed from your pipeline tools in real time using the CDEvents open standard — no polling delays, no API rate-limit gaps.
- **DORA calculation**: Middleware derives DORA metrics from PR merge history and deployment annotations pulled from your VCS. CDviz derives DORA metrics from CDEvents emitted directly by your CI/CD toolchain at the moment they happen.
- **Scope**: Middleware extends beyond CI/CD into sprint health — blocked work, spilled stories, Jira flow metrics, and AI-generated sprint summaries. CDviz focuses on the full SDLC event stream (build, test, artifact, deploy, incident) with less emphasis on issue-tracker analytics.
- **Event standard**: CDviz is built on the [CDEvents](https://cdevents.dev) specification — a [CD Foundation](https://cd.foundation) project for interoperable CI/CD events. Middleware uses a proprietary data model tied to its own integrations.
- **Observe and act**: CDviz events can trigger downstream workflows — the same event stream that drives observability can also drive automation. Middleware is monitoring and reporting only.
- **Visualization**: CDviz integrates with Grafana, BI tools, AI agents, and IDP frameworks, giving teams full flexibility. Middleware ships its own built-in dashboard UI, optimized for DORA and sprint metrics.
- **Cost model**: CDviz commercial support is priced per organization per month — not per seat — so cost does not scale with team size. Middleware's Standard SaaS tier is $39 per user per month, which grows linearly with headcount.

## When to choose CDviz

- You want real-time metrics without polling delays or API rate limits.
- Data ownership or privacy regulations make vendor-hosted SaaS unacceptable.
- You are adopting the CDEvents open standard for interoperability across your toolchain.
- You need events to trigger downstream workflows — not just observe them.
- You want flexible storage, reporting, or integration with BI tools, AI agents, or IDPs.
- Team size makes per-seat pricing expensive; you prefer a flat per-org cost ([contact us](/pricing)).

## When to choose Middleware

- Your primary workflow is sprint-centric: you want Jira flow metrics, sprint reports, and blocked-work detection alongside DORA.
- You want AI-generated sprint summaries and automated Slack reports out of the box.
- Your team is small and the free community tier covers your needs.
- You prefer a built-in dashboard UI rather than operating Grafana separately.

## Summary

Middleware and CDviz are both open-source Apache 2.0 tools, but they solve adjacent problems. Middleware is a strong choice for engineering managers who want sprint health, Jira flow, and AI-assisted reporting alongside DORA metrics — with a polished built-in UI and a free self-hosted tier. CDviz is the right choice when you need a real-time event-push model, CDEvents interoperability, event-driven automation, and flexible visualization — with flat per-org commercial support available to reduce operational risk.

::: tip Get started with CDviz
[Self-host CDviz](/docs/getting-started) — free, Apache 2.0. Or [join the SaaS waitlist](/pricing).
:::

## FAQ

**Is Middleware open-source?** Yes — Middleware is Apache 2.0 licensed and available at [github.com/middlewarehq/middleware](https://github.com/middlewarehq/middleware).

**Does Middleware support CDEvents?** No. Middleware uses a proprietary data model based on polling GitHub/GitLab/Jira APIs. CDEvents integration is not supported.

**Does CDviz support Jira?** Yes — CDviz can ingest Jira-sourced events (e.g., issue state changes) via the CDviz Collector, though sprint-level flow metrics are not a current focus.

**Is CDviz free?** Yes — Apache 2.0. Infrastructure costs only when self-hosted; optional [commercial support](/pricing) is billed per organization, not per seat.

## Related comparisons

- [CDviz vs Apache DevLake](./vs-apache-devlake) — open-source engineering metrics with 50+ integrations
- [CDviz vs LinearB](./vs-linearb) — engineering metrics with PR analytics
- [CDviz vs Sleuth](./vs-sleuth) — DORA metrics SaaS platform
- [CDviz vs Swarmia](./vs-swarmia) — engineering effectiveness platform
- [All alternatives](./index)
