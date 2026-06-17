---
title: CDviz Use Cases
description: Real-world use cases for CDviz across the whole platform and each component — for CTOs, DevOps, platform engineers and developers.
layout: home
markdownStyles: false

# Use cases db. Markdown is allowed in `goal` and `solution` — rendered to HTML at
# build time by use-cases.data.ts (no runtime JS rendering, SEO/GEO friendly).
#   component: platform | collector | db | grafana
#   audiences: any of cto | devops | platform | developer
#   image / imageAlt: optional, embedded at the top of the card
cases:
  - id: dora-metrics
    title: DORA metrics without the spreadsheet
    component: platform
    audiences: [cto, devops]
    goal: |
      Leadership wants DORA numbers, but today they are stitched together by hand from
      several dashboards every sprint. Get the four indicators — deployment frequency, lead
      time for changes, change failure rate and time to restore — as a **live dashboard**
      instead of a hand-maintained spreadsheet.
    solution: |
      CDviz captures [CDEvents](https://cdevents.dev) from your CI/CD and deployment tools into
      a single store, and ships a **pre-built Grafana DORA dashboard** that auto-populates the
      four metrics. No more copy-paste reporting.

      See the [DORA Metrics dashboard](/docs/cdviz-grafana/dora_metrics).
    # image: /screenshots/grafana_dashboard_dora_metrics-20260222.png
    # imageAlt: CDviz DORA Metrics dashboard in Grafana

  - id: incident-shared-timeline
    title: A shared timeline when incidents hit
    component: platform
    audiences: [devops, platform]
    goal: |
      Without a shared timeline of changes across tools, mean-time-to-restore is spent
      reconstructing context from Slack threads and git logs. Instantly see **what changed,
      where, and when** the moment an incident hits.
    solution: |
      CDviz records deployments, upgrades and rollbacks as structured CDEvents on one timeline,
      correlated with `incident.detected` / `incident.resolved`. Open one Grafana view and the
      sequence of changes around the incident is right there.

  - id: audit-trail
    title: An auditable trail of every delivery event
    component: platform
    audiences: [cto, platform]
    goal: |
      Audit and compliance reviews ask who deployed what, when, and to which environment —
      answering means digging across CI logs, ticketing systems and chat history. Keep a
      **tamper-evident, queryable history** for compliance and post-mortems instead.
    solution: |
      Every delivery event is stored as a standardized CDEvent in the CDviz event lake with its
      metadata extracted, giving you a durable, SQL-queryable audit trail with automatic
      long-term retention — no custom logging pipeline to build.

  - id: unify-cicd-tools
    title: One event stream from many CI/CD tools
    component: collector
    audiences: [platform, devops]
    goal: |
      Each tool has its own webhook payload shape, so one coherent view means writing and
      maintaining glue code for every integration. Normalize events from GitHub, GitLab,
      Jenkins, ArgoCD and more into **one consistent schema** so downstream dashboards and
      automation do not care which tool emitted them.
    solution: |
      The **cdviz-collector** ingests webhooks and files from each tool and runs
      [VRL](https://vrl.dev) transformers to convert them into CDEvents. Reuse the maintained
      [transformers-community](https://github.com/cdviz-dev/transformers-community) (GitHub,
      ArgoCD, Kubewatch, …) or write your own.

      See [collector use cases](/docs/cdviz-collector/use-cases).

  - id: k8s-deployment-tracking
    title: Track what actually runs in Kubernetes
    component: collector
    audiences: [platform, devops]
    goal: |
      CI says it deployed, but what is actually running? Drift between pipeline intent and
      cluster reality hides failed rollouts and silent rollbacks. Emit a CDEvent whenever a
      workload is **deployed, upgraded or rolled back**, reflecting real state not intent.
    solution: |
      Point the collector at cluster events (e.g. via Kubewatch) and transform them into
      `service.deployed` / `service.upgraded` / `service.rolledback` CDEvents — observed from
      the cluster, so the timeline reflects what truly happened.

  - id: event-driven-automation
    title: Trigger automation from delivery events
    component: collector
    audiences: [developer, devops]
    goal: |
      You want a Slack ping on production deploys or a smoke-test job when a service upgrades,
      but wiring that per-tool is repetitive and brittle. React to delivery events — **notify,
      gate, or kick off a follow-up workflow** — without polling or bespoke webhook plumbing.
    solution: |
      The collector's sinks let you fan delivery events out to HTTP endpoints, files or a
      database. Because everything is a standard CDEvent, one rule works across every source —
      observe first, then act.

  - id: queryable-event-lake
    title: A queryable history of your delivery lifecycle
    component: db
    audiences: [developer, platform]
    goal: |
      Delivery data is scattered and ephemeral across tool UIs and logs, so simple historical
      questions are surprisingly hard. Run **ad-hoc SQL** over your full delivery history —
      "how many times did service X deploy to prod last month?" — via JSONB access to the
      CDEvents payload.
    solution: |
      CDviz stores every CDEvent in the `cdviz.cdevents_lake` table on PostgreSQL with extracted
      metadata plus the raw JSONB payload. Query it directly — full SQL and JSONB operators, no
      API layer in the way.

  - id: timescale-retention
    title: Long-term analytics that stay fast
    component: db
    audiences: [platform, cto]
    goal: |
      Naive event tables get slow and expensive as history grows, pushing teams to throw away
      the very data needed for trends. Keep **months of delivery events** for trend analysis
      while queries stay fast and storage stays bounded.
    solution: |
      The event lake is a **TimescaleDB hypertable** with time-based chunking and hash
      partitioning by subject, plus an automatic 13-month retention policy. You get time-bucketed
      analytics at scale without manual housekeeping.

  - id: prebuilt-grafana-dashboards
    title: Pre-built dashboards, no panel-building
    component: grafana
    audiences: [cto, devops]
    goal: |
      Building DORA and deployment dashboards by hand means learning the data model, writing
      SQL and laying out panels before you see a single number. Stand up **delivery dashboards
      in minutes** instead.
    solution: |
      CDviz ships ready-to-import Grafana dashboards (DORA metrics, deployment timelines) that
      query the event lake directly. Import the JSON, point it at PostgreSQL, and the panels
      populate. Try the [live demo](https://demo.cdviz.dev/grafana).

  - id: deployment-drilldown
    title: Drill into deployments per service and environment
    component: grafana
    audiences: [developer, devops]
    goal: |
      Aggregate metrics hide the detail engineers need: which version, which environment, which
      deploy is behind a spike or a regression. See **deployment frequency and history per
      service and environment**, then drill down to the individual events behind a number.
    solution: |
      CDviz Grafana dashboards let you filter by service and environment and drill from a metric
      down to the underlying CDEvents — version, target environment and timing included — because
      they query the structured event lake directly.

  - id: webhook-to-sse-bridge
    title: Collect public webhooks without exposing your cluster
    component: collector
    audiences: [platform, devops]
    goal: |
      Your CI runs on a public provider, but the events you care about must land in an
      **internal cluster you do not want to expose** to the internet just to receive webhooks.
      Bridge the two without opening an inbound hole in your private network.
    solution: |
      Run a public **cdviz-collector** on isolated infra (a small VPS, SaaS, DMZ) that receives
      webhooks from the public provider and re-exposes them on an **SSE endpoint**. Your
      internal collector connects **outbound** to that SSE stream and pulls the events in — no
      inbound port, no internal endpoint published to the public internet.

  - id: enrich-idp
    title: Enrich your Internal Developer Platform with delivery facts
    component: db
    audiences: [platform, developer]
    goal: |
      Your IDP shows services and ownership, but not **what version of each artifact was
      published, signed, and deployed, and when**. Developers still chase that across registries,
      CI and chat.
    solution: |
      Point your IDP at the CDviz event lake and read it directly: every `artifact.published`,
      `artifact.signed`, `service.deployed` and `service.upgraded` CDEvent is queryable SQL with
      its version, environment and timestamp. Surface "what is deployed where, and is it signed"
      straight on the service page.

  - id: ai-agent-sdlc-source
    title: Give an AI agent SDLC context from one read-only source
    component: db
    audiences: [platform, developer]
    goal: |
      You want an **AI agent to answer questions about your SDLC** — what shipped, when, how
      often, what failed — without handing it credentials to every CI, registry and cluster,
      fanning out calls across all of them, or losing access to historical data the tools age
      out.
    solution: |
      Point the agent at the **CDviz event lake as the single source**: one read-only PostgreSQL
      connection over a standardized CDEvents history. The agent runs plain SQL for both live
      and historical questions — no per-system integration, no broad credentials, a clear
      least-privilege boundary you can audit.
---

<script setup>
import UseCasesPage from '../components/UseCasesPage.vue'
</script>

<UseCasesPage />
