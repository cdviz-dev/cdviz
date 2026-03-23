# [![cdevents logo](/logos/cdevents.svg)](https://cdevents.dev/)

## What are CDEvents?

CDEvents (Continuous Delivery Events) is an open specification initiated by the Continuous Delivery Foundation (CDF). CDEvents defines a standardized JSON format for describing events in software delivery pipelines — deployments, builds, tests, incidents, and environment changes. The specification enables different CI/CD tools to communicate using a common event language, eliminating proprietary data silos.

CDviz is built natively on CDEvents: all data stored and visualized by CDviz conforms to the CDEvents specification. Events are structured JSON objects with a `context` block (event type, timestamp, source, version) and a `subject` block (what the event describes and its content).

## CDviz vs CDEvents

**CDEvents** is a specification — an open standard for describing events in software delivery pipelines, initiated by the Continuous Delivery Foundation (CDF). It defines a JSON schema for event types like `dev.cdevents.service.deployed`, `dev.cdevents.build.finished`, etc.

**CDviz** is a platform that implements the CDEvents specification. CDviz collects CDEvents from your CI/CD tools, stores them in PostgreSQL with TimescaleDB, and visualizes them in Grafana dashboards. Think of CDEvents as the language and CDviz as the system that speaks it.

Other tools can also produce or consume CDEvents — CDviz is one implementation, not the only one. The CDEvents ecosystem includes CLIs, SDKs, and integrations for GitHub Actions, Jenkins, Tekton, and more.

## CDEvent Structure

A CDEvent is a JSON object with a specific structure. Here is an example of a `service.deployed` event:

```json
{
  "context": {
    "version": "0.4.1",
    "id": "a2f2b6f0-8e0d-4b4c-9a6d-8f3e5f7e8f5d",
    "source": "/my-app/my-pipeline",
    "type": "dev.cdevents.service.deployed.0.1.1",
    "timestamp": "2025-07-03T10:00:00Z"
  },
  "subject": {
    "id": "my-service",
    "source": "/my-app/my-pipeline",
    "type": "service",
    "content": {
      "environment": {
        "id": "production"
      },
      "artifactId": "pkg:oci/my-app@sha256:1234567890abcdef"
    }
  }
}
```

## Key Fields

- **`context.type`:** The type of the event. This is a namespaced string that identifies the event, such as `dev.cdevents.service.deployed.0.1.1`.
- **`subject.id`:** The unique identifier of the subject of the event, such as the name of a service or a build ID.
- **`subject.content`:** A JSON object that contains the details of the event.

For a complete list of all the available event types and their fields, please refer to the [CDEvents specification](https://cdevents.dev/docs/spec).

## Guidelines

You can see some **opinionated** rules to create CDEvents at [Transformers & CDEvents Rules](/docs/cdviz-collector/transformers-rules).

## CDEvents ecosystem

Tools that emit or consume CDEvents — compatible with CDviz as sources or consumers. The CDEvents specification is implemented or being integrated by many SDLC tools.

### CI/CD pipelines

| Tool | CDEvents role | Notes |
| ---- | ------------- | ----- |
| [Jenkins](https://www.jenkins.io/) | producer | [CDEvents plugin](https://plugins.jenkins.io/cdevents/) emits events for builds and deployments |
| [Tekton](https://tekton.dev/) | producer | Native CDEvents emission from pipeline runs and task runs |
| [Spinnaker](https://spinnaker.io/) | producer | CDEvents integration for deployment pipeline events |
| [Argo CD](https://argoproj.github.io/cd/) | producer | Emits CDEvents on application sync and deployment events |

### GitOps & continuous delivery

| Tool | CDEvents role | Notes |
| ---- | ------------- | ----- |
| [Flux](https://fluxcd.io/) | producer | Emits CDEvents via notification-controller for reconciliation and deployment events |
| [Keptn](https://keptn.sh/) | producer / consumer | Lifecycle toolkit emits and reacts to CDEvents for deployment observability |

### Testing

| Tool | CDEvents role | Notes |
| ---- | ------------- | ----- |
| [Testkube](https://testkube.io/) | producer | Emits CDEvents on test execution events |
| [Tracetest](https://tracetest.io/) | producer | Emits CDEvents for trace-based test results |

### Artifact registries & supply chain

| Tool | CDEvents role | Notes |
| ---- | ------------- | ----- |
| [Harbor](https://goharbor.io/) | producer | Emits CDEvents for artifact push, scan, and replication events |
| [GUAC](https://guac.sh/) | consumer | Graph for Understanding Artifact Composition — ingests CDEvents to build software supply chain graphs |

### CLIs & utilities

### [CDEvents CLI](https://brunseba.github.io/cdevents-tools/)

[brunseba/cdevents-tools](https://github.com/brunseba/cdevents-tools)

CLI tool for generating and transmitting CDEvents from CI/CD pipelines. Useful for
instrumenting pipelines that don't have a native CDviz integration yet.

### [JReleaser CDEvents extension](https://jreleaser.org/guide/latest/extensions/extensions/jreleaser-cdevents.html)

JReleaser extension that emits CDEvents on release workflow events. Compatible with
cdviz-collector as a source.

## Related standards

- [Semantic conventions for CI/CD — OpenTelemetry](https://opentelemetry.io/docs/specs/semconv/cicd/)
- [CDEvents specification](https://cdevents.dev/) — the open standard CDviz is built on
