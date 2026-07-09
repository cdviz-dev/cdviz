---
title: Argo Workflows Integration
description: |
  Trigger Argo Workflows from CDEvents: forward delivery events to the Argo Workflows events API
  with the cdviz-collector HTTP sink and submit workflows via WorkflowEventBinding.
plans:
  - community
  - pro
---

# Argo Workflows Integration

Trigger [Argo Workflows](https://argo-workflows.readthedocs.io/) from your delivery events: the collector forwards CDEvents to the [Argo Workflows events API](https://argo-workflows.readthedocs.io/en/latest/events/), and `WorkflowEventBinding` resources decide which events submit which workflows.

Typical [event reaction](../event-reaction.md) use cases:

- run integration / smoke tests after a service is deployed into an environment
- promote a service or artifact to the next environment (cluster, region, ...) after tests succeed
- validate an artifact (scanning, signing, conformance checks) when it is published

## Setup

### Collector: HTTP sink

Point an [HTTP sink](../cdviz-collector/sinks/http.md) at the Argo Workflows events API; each CDEvent is delivered as JSON:

```toml
[sinks.argo_workflows_events]
enabled = true
type = "http"
# Argo Workflows events API — WorkflowEventBinding filters on context.type / subject.id
destination = "http://argo-workflows-server.argo-workflows:2746/api/v1/events/argo-workflows/cdviz"
total_duration_of_retries = "5m"

[sinks.argo_workflows_events.headers]
# token injected via env CDVIZ_COLLECTOR__SINKS__ARGO_WORKFLOWS_EVENTS__HEADERS__AUTHORIZATION__VALUE
"authorization" = { type = "secret", value = "Bearer changeme" }
```

The bearer token belongs to a Kubernetes service account allowed to submit workflows — see [Argo Workflows access tokens](https://argo-workflows.readthedocs.io/en/latest/access-token/).

### Argo Workflows: WorkflowEventBinding

A `WorkflowEventBinding` filters incoming events and maps CDEvents fields to workflow parameters — here, launching tests after each deployment of a service:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: WorkflowEventBinding
metadata:
  name: test-deployed-collector-on-service-event
  namespace: argo-workflows
spec:
  event:
    # CDEvents native JSON format:
    #   .context.type  = e.g. "dev.cdevents.service.deployed.0.2.0"
    #   .subject.id    = e.g. "/cdviz-dev/cdviz-collector/cdviz-collector"
    selector: >
      (payload.context.type contains "service.deployed" ||
       payload.context.type contains "service.updated" ||
       payload.context.type contains "service.rolledback") &&
      payload.subject.id == "/cdviz-dev/cdviz-collector/cdviz-collector"
  submit:
    workflowTemplateRef:
      name: test-deployed-collector
    arguments:
      parameters:
        - name: artifactId
          valueFrom:
            event: "payload.subject.content.artifactId"
        - name: environment
          valueFrom:
            event: "payload.subject.content.environment.id"
```

The referenced `WorkflowTemplate` receives `artifactId` and `environment` as parameters and runs whatever the reaction requires — a test suite, a promotion job, an HTTP call to another system.

## Live Example

A running version of this setup — collector sink, event bindings, and workflow templates — is part of the [CDviz demo cluster](https://github.com/cdviz-dev/demo-cluster) (see `4-k8s-gitops/manifests/argo-workflows/`).

## Related

- [Event Reaction](../event-reaction.md) — patterns for triggering automation from CDEvents
- [HTTP Sink reference](../cdviz-collector/sinks/http.md) — all options (retries, headers, transformers)
- [Transformers](../cdviz-collector/transformers.md) — filter or reshape events before they reach Argo Workflows
