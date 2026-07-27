---
title: Integrations
description: |
  Connect your SDLC tools to CDviz: collect events from GitHub, GitLab, Jenkins, ArgoCD, and Kubernetes;
  report test and quality results from JUnit, TAP, and SARIF; store and visualize with PostgreSQL,
  ClickHouse, and Grafana; trigger automation with Argo Workflows.
---

<script setup>
import IntegrationsCoverage from '../../../components/IntegrationsCoverage.vue'
</script>

# Integrations

Connect the tools you already use. Each integration is a focused setup guide: what events you get, how to wire it up, and where the data lands.

## Collect Events From

Track repository, pipeline, and deployment activity as [CDEvents](../cdevents.md) — which subject each source can emit, toggle to see the predicates:

<IntegrationsCoverage />

- **[GitHub Webhook](./github.md)** — repository, PR, and workflow events with signature validation
- **[GitHub Action](./github-action.md)** — send hand-crafted CDEvents from workflow steps
- **[GitHub Actions CI](./github-actions-ci.md)** — test and task reporting from CI jobs
- **[GitHub REST API (Polling)](./github-rest-api.md)** — backfill and pull-based tracking without webhooks
- **[GitLab Webhook](./gitlab.md)** — repository, MR, and pipeline events
- **[GitLab CI](./gitlab-ci.md)** — test and task reporting from CI jobs
- **[Jenkins](./jenkins.md)** — job and pipeline events
- **[ArgoCD](./argocd.md)** — GitOps deployment events via notifications
- **[Kubernetes (via Kubewatch)](./kubewatch.md)** — cluster deployment events
- **[Jira](./jira.md)** — ticket and version events (Pro plan, beta)

## Report Test & Quality Results

Emit `testSuiteRun` CDEvents from any CI job with [`cdviz-collector send --run`](../cdviz-collector/send-run.md):

- **[JUnit Reports](./junit.md)** — Maven, Gradle, pytest, and any tool producing JUnit XML
- **[TAP Reports](./tap.md)** — Node test runner, bats, shellspec, and any TAP producer
- **[SARIF](./sarif.md)** — linters, static analysis, and security scanners

## Store & Visualize

- **[PostgreSQL](./postgresql.md)** — the CDviz event store (TimescaleDB hypertable, DORA views)
- **[ClickHouse](./clickhouse.md)** — alternative analytics storage via the ClickHouse sink
- **[Grafana](../cdviz-grafana/index.md)** — pre-built dashboards for DORA metrics, deployments, and incidents

## Trigger Automation

React to the event stream — see [Event Reaction](../event-reaction.md) for all patterns:

- **[Argo Workflows](./argo-workflows.md)** — submit workflows from CDEvents (post-deployment tests, environment promotion, artifact validation)

## Something Else?

The collector is open source and extensible — see **[Custom Integration](./custom.md)** to connect any tool via webhooks, polling, and VRL transformers.
