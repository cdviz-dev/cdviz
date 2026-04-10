---
title: "CDviz vs CNCF DevStats: SDLC Observability vs Open-Source Community Analytics"
description: "Compare CDviz and CNCF DevStats (devstats.cncf.io). Two Apache 2.0 tools with overlapping stack but entirely different purposes: enterprise SDLC observability vs open-source contributor analytics."
head:
  - - script
    - type: application/ld+json
    - '{"@context":"https://schema.org","@type":"ItemList","name":"CDviz vs CNCF DevStats","itemListElement":[{"@type":"ListItem","position":1,"name":"CDviz","url":"https://cdviz.dev"},{"@type":"ListItem","position":2,"name":"CNCF DevStats","url":"https://devstats.cncf.io"}]}'
---

# CDviz vs CNCF DevStats

> _Last updated March 2026. [Corrections welcome](https://github.com/cdviz-dev/cdviz/edit/main/cdviz-site/src/docs/alternatives/vs-devstats-cncf.md)._

::: tip Don't confuse the two DevStats products
**CNCF DevStats** (`devstats.cncf.io`, `github.com/cncf/devstats`) is a CNCF-maintained open-source tool for tracking contributor activity on public GitHub repositories. It is unrelated to [DevStats.com](./vs-devstats), the commercial SaaS product for enterprise engineering metrics. This page compares CDviz with the CNCF version.
:::

CDviz and CNCF DevStats share a similar technical stack — both use PostgreSQL and Grafana — but they solve entirely different problems for entirely different audiences. CDviz is built for enterprise software delivery observability and event-driven CI/CD automation. CNCF DevStats is built for tracking community health and contributor activity in public open-source projects.

## At a glance

|                                           |                    **CDviz**                    |          **CNCF DevStats**           |
| ----------------------------------------- | :---------------------------------------------: | :----------------------------------: |
| License                                   |                   Apache 2.0                    |              Apache 2.0              |
| Self-hosted                               |                       ✅                        |           ✅ (Helm chart)            |
| Hosted public instance                    |             ⏳ waitlist (cdviz.dev)             | ✅ free at devstats.cncf.io (public) |
| Commercial support                        |                       ✅                        |                  ❌                  |
| Data sources                              | Webhooks, Kafka, NATS, SSE, files, HTTP polling |   GitHub Archive + GitHub API only   |
| Private repositories                      |                       ✅                        |     ❌ public GitHub repos only      |
| [CDEvents](https://cdevents.dev) standard |                       ✅                        |                  ❌                  |
| Data model                                |               Event-driven (push)               |     Pull-based (hourly polling)      |
| CI/CD pipeline events                     |                       ✅                        |                  ❌                  |
| Deployment tracking                       |                       ✅                        |                  ❌                  |
| Incident / DORA metrics                   |                       ✅                        |                  ❌                  |
| Contributor / community analytics         |                       ❌                        |                  ✅                  |
| Company attribution for contributors      |                       ❌                        |                  ✅                  |
| Trigger downstream workflows              |                       ✅                        |                  ❌                  |
| Stack                                     |       Rust collector, PostgreSQL, Grafana       | Go, PostgreSQL (Patroni HA), Grafana |
| Update latency                            |               Real-time (seconds)               |           ~1 hour (batch)            |

## Key differences

- **Purpose**: CNCF DevStats was created to help CNCF project maintainers and the CNCF TOC track open-source community health — who is contributing, which companies are active, how quickly PRs are reviewed. CDviz was built for software engineering teams to observe and automate their internal delivery pipelines.

- **Data sources**: CNCF DevStats ingests GitHub Archive (hourly gzip dumps of all public GitHub events) plus the GitHub API for current state. It cannot ingest GitLab, Bitbucket, or any private repository. CDviz accepts events from any source via webhooks, Kafka, NATS, SSE, and file-based inputs — including private CI/CD systems.

- **What gets measured**: CNCF DevStats measures contributor metrics (commits, PRs, reviews, comment activity, company affiliation, SIG workload). CDviz measures software delivery metrics: deployment frequency, lead time, change failure rate, time to restore, artifact timelines, test outcomes.

- **Event-driven vs analytics-only**: CDviz's event stream is actionable — the same events that feed dashboards can trigger downstream workflows via HTTP, Kafka, or NATS sinks. CNCF DevStats is a read-only analytics tool; it has no mechanism to trigger external actions.

- **Latency**: CNCF DevStats syncs on an hourly cron from GitHub Archive, so data is always ~1 hour behind. CDviz receives events in real time as they happen.

- **Shared stack (different model)**: Both tools happen to use PostgreSQL and Grafana. CNCF DevStats stores raw GitHub events with company affiliation data; CDviz stores normalized CDEvents with a JSONB payload column optimized for time-series delivery queries.

## When to choose CDviz

- You need visibility into **private CI/CD pipelines** — builds, tests, deployments, incidents.
- You want to calculate **DORA metrics** from actual delivery events, not derived from git history.
- You need events from **non-GitHub sources**: GitLab, ArgoCD, Kubernetes, Kafka, custom webhooks.
- You want the **same event stream** to power both dashboards and automated workflows.
- You are adopting the **CDEvents open standard** for interoperability with other CNCF tooling.
- You need **commercial support** or a managed hosting option.

## When to choose CNCF DevStats

- You maintain or operate a **public open-source project on GitHub** and want to track community health.
- You are a **CNCF project** and want a free hosted instance at `devstats.cncf.io`.
- You need **company attribution** — mapping GitHub contributor logins to their employer organizations.
- Your focus is on **contributor engagement metrics**: new contributors, PR review times by SIG, company participation.
- You want a pre-built, no-cost analytics layer for an open-source community (not enterprise delivery pipelines).

## Summary

CNCF DevStats and CDviz overlap only in their technology choices (PostgreSQL + Grafana). Their scope, audience, and purpose are completely different. If you run a public open-source project and want to understand who is contributing and how the community is growing, CNCF DevStats is purpose-built for that. If you need to observe and automate a software delivery pipeline — tracking deployments, incidents, CI outcomes, and artifact lifecycles — CDviz is the right tool.

::: tip Get started with CDviz
[Self-host CDviz](/docs/getting-started) — free, Apache 2.0. Or [join the SaaS waitlist](/pricing).
:::

## FAQ

**Does CNCF DevStats support private GitHub repositories?** No. CNCF DevStats relies on GitHub Archive, which only covers public GitHub events. Private repositories are not supported.

**Can CNCF DevStats track deployment frequency or lead time?** Not directly. It can infer some metrics from git tags and release events, but it does not ingest CI/CD pipeline events, deployment system events, or incident data. DORA metrics from CNCF DevStats are approximations derived from GitHub activity.

**Is CNCF DevStats only for CNCF projects?** No. The tooling is open source and documented for any public GitHub project to self-host. However, getting a hosted instance on `devstats.cncf.io` requires being part of the CNCF project portfolio.

**Can I use both CDviz and CNCF DevStats?** Yes. They are complementary: CNCF DevStats for open-source community analytics on your public repos; CDviz for internal delivery pipeline observability and automation.

## Related comparisons

- [CDviz vs DevStats (commercial)](./vs-devstats) — the enterprise SaaS product with the same name
- [CDviz vs Apache DevLake](./vs-apache-devlake) — another open-source SDLC analytics tool
- [CDviz vs Powerpipe](./vs-powerpipe) — open-source dashboards for cloud and DevOps data
- [All alternatives](./index)
