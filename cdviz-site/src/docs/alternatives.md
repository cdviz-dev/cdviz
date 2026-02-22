---
description: Compare CDviz with Apache DevLake, Datadog CI Visibility, and other SDLC observability tools. Built on the open CDEvents standard.
---

# Alternatives, tools, ...

## CDEvents ecosystem

### [CDEvents CLI](https://brunseba.github.io/cdevents-tools/)

[brunseba/cdevents-tools](https://github.com/brunseba/cdevents-tools)

CDEvents CLI is a powerful tool designed to integrate with your CI/CD pipeline by generating and transmitting standardized CDEvents. It helps create interoperability between different CI/CD tools and provides observability into your software delivery process

### [jreleaser-cdevents :: JReleaser](https://jreleaser.org/guide/latest/extensions/extensions/jreleaser-cdevents.html)

This JReleaser extension provides integration with CDEvents. It registers a WorkflowListener, triggering cdevents events as a result.

## Similar tools

### [Apache DevLake](https://devlake.apache.org/)

Open-source engineering metrics platform (Apache Incubating). Ingests data from 50+ tools (Jira, GitHub, Jenkins…) via polling. Uses a proprietary domain model, not CDEvents.

→ [CDviz vs Apache DevLake](./vs-apache-devlake)

### [CI Pipeline Visibility | Datadog](https://www.datadoghq.com/product/ci-cd-monitoring/)

Fully-managed SaaS pipeline and test observability. Best when already using Datadog for APM/infra. Proprietary, vendor-hosted data model.

→ [CDviz vs Datadog CI Visibility](./vs-datadog-ci)

### Turbot tools

#### [powerpipe](https://powerpipe.io/): Dashboards for DevOps

Visualize cloud configurations. Assess security posture against a massive library of benchmarks. Build custom dashboards with code.

→ [CDviz vs Powerpipe](./vs-powerpipe)

#### [steampipe](https://steampipe.io/): select \* from cloud;

Drill deep into the table schemas and discover helpful example queries for 140 plugins.

#### [flowpipe](https://flowpipe.io): Workflow for DevOps

Automate cloud operations. Coordinate people and pipelines. Build workflows as code.

#### [tailpipe](https://tailpipe.io): select \* from logs;

Open source SIEM for instant log insights, powered by DuckDB. Analyze millions of events in seconds, right from your terminal.

## Misc

- [Semantic conventions for CICD | OpenTelemetry](https://opentelemetry.io/docs/specs/semconv/cicd/)
