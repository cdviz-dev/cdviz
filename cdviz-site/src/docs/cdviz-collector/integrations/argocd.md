---
title: ArgoCD Notifications Integration
description: |
  Collect ArgoCD application lifecycle events, transform them to CDEvents.
  <ul>
  <li>ArgoCD tracks application deployments, sync operations, and health status.</li>
  <li>cdviz-collector transforms these events to CDEvents, and sends them to the database, listeners,...</li>
  </ul>
editions:
  - community
  - enterprise
integration:
  icon: /icons/argocd.svg
  type: source/webhook
  events:
    - input: sync.succeeded + healthy
      output: service.deployed
    - input: sync.failed/error
      output: incident.detected
    - input: health.degraded
      output: incident.detected
    - input: app.deleted
      output: service.removed
references:
  - title: ArgoCD Notifications Documentation
    url: https://argo-cd.readthedocs.io/en/stable/operator-manual/notifications/
  - title: Source code of the transformation of ArgoCD notifications to CDEvents
    url: https://github.com/cdviz-dev/cdviz-collector/blob/main/transformers/argocd_notifications/transformer.vrl
  - title: Examples of CDEvents converted from ArgoCD events
    url: https://github.com/cdviz-dev/cdviz-collector/tree/main/transformers/argocd_notifications/outputs/captured
---

<script setup>
import IntegrationCard from '../../../../components/IntegrationCard.vue'
</script>

<IntegrationCard />

## Configuration

### Setting Up cdviz-collector's Side

Setting up `cdviz-collector.toml` to receive ArgoCD notification webhooks involves defining a webhook source in the collector configuration file. Below is an example configuration snippet:

```toml
# Remote transformers repository configuration
[remote.transformers-community]
type = "github"
owner = "cdviz-dev"
repo = "transformers-community"
# reference = "HEAD"  # Optional: specify branch, tag, or commit

[sources.argocd_webhook]
enabled = true
transformer_refs = ["argocd_metadata", "argocd_notifications"]

[sources.argocd_webhook.extractor]
type = "webhook"
id = "000-argocd"
headers_to_keep = []

# Metadata transformer injects environment_id from ArgoCD destination
[transformers.argocd_metadata]
type = "vrl"
template = """
.metadata = object(.metadata) ?? {}

[{
  "metadata": merge(.metadata, {
    "environment_id": .body.app.spec.destination.server || "unknown",
  }),
  "headers": .headers,
  "body": .body,
}]
"""

# Main transformer from transformers-community repository
[transformers.argocd_notifications]
type = "vrl"
template_rfile = "transformers-community:///argocd_notifications/transformer.vrl"
```

The `template_rfile` references the VRL (Vector Remap Language) file from the [transformers-community repository](https://github.com/cdviz-dev/transformers-community) that contains the transformation logic for converting ArgoCD notification events into CDEvents. The source code can be found at [argocd_notifications/transformer.vrl](https://github.com/cdviz-dev/transformers-community/blob/main/argocd_notifications/transformer.vrl).

### Setting Up ArgoCD Notifications

To configure the ArgoCD integration, you need to set up notifications in your ArgoCD installation. Here are the steps to do that:

#### Step 1: Create Webhook Service

Edit the `argocd-notifications-cm` ConfigMap:

```bash
kubectl edit configmap argocd-notifications-cm -n argocd
```

Add webhook service configuration:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-notifications-cm
  namespace: argocd
data:
  service.webhook.cdviz: |
    url: https://your-cdviz-collector.example.com/webhook/000-argocd
    headers:
    - name: Content-Type
      value: application/json
```

#### Step 2: Create Notification Template

Add a unified template that sends the full application state:

```yaml
template.webhook-cdviz: |
  webhook:
    cdviz:
      method: POST
      body: |
        {
          "timestamp": "{{ now | date "2006-01-02T15:04:05.000000Z07:00" }}",
          "context": {{ toJson .context }},
          "app": {{ toJson .app }}
        }
```

**Key point**: A single template handles all event types. Event detection logic is implemented in the VRL transformer, keeping ArgoCD configuration simple.

#### Step 3: Configure Triggers

Add triggers to filter and send relevant events:

```yaml
triggers:
  trigger.on-deployed: |
    - description: Application is synced and healthy. Triggered once per commit.
      oncePer: app.status.sync.revision
      send: [webhook-cdviz]
      when: app.status.operationState != nil and app.status.operationState.phase in ['Succeeded'] and app.status.health.status == 'Healthy'

  trigger.on-health-degraded: |
    - description: Application has degraded
      send: [webhook-cdviz]
      when: app.status.health.status == 'Degraded'

  trigger.on-deleted: |
    - description: Application is being deleted
      send: [webhook-cdviz]
      when: app.metadata.deletionTimestamp != nil

  trigger.on-sync-failed: |
    - description: Application syncing has failed
      send: [webhook-cdviz]
      when: app.status.operationState != nil and app.status.operationState.phase in ['Error', 'Failed']
```

**Optional triggers** (add if needed):

```yaml
trigger.on-health-recovered: |
  - description: Application health has recovered
    send: [webhook-cdviz]
    when: app.status.health.status == 'Healthy' and app.status.conditions != nil

trigger.on-sync-running: |
  - description: Application is being synced
    send: [webhook-cdviz]
    when: app.status.operationState != nil and app.status.operationState.phase in ['Running']
```

#### Step 4: Enable Notifications for Applications

**Recommended**: Configure default subscriptions to automatically apply notifications to all applications:

```yaml
subscriptions: |
  - recipients:
    - cdviz
    triggers:
    - on-deployed
    - on-health-degraded
    - on-deleted
    - on-sync-failed
```

This approach reduces configuration at the application level and prevents forgetting to enable notifications for new applications.

**Optional**: Use `defaultTriggers` to reduce repetition in per-application annotations:

```yaml
defaultTriggers: |
  - on-deployed
  - on-health-degraded
  - on-deleted
  - on-sync-failed
```

With `defaultTriggers` configured, you can simply annotate applications with:

```bash
kubectl annotate app <app-name> -n argocd \
  notifications.argoproj.io/subscribe.cdviz=""
```

**Alternative**: Configure subscriptions at the ArgoCD Project level:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: my-project
  namespace: argocd
  annotations:
    notifications.argoproj.io/subscribe.on-deployed.cdviz: ""
    notifications.argoproj.io/subscribe.on-health-degraded.cdviz: ""
    notifications.argoproj.io/subscribe.on-deleted.cdviz: ""
    notifications.argoproj.io/subscribe.on-sync-failed.cdviz: ""
```

## Alternative Approach: Native CDEvents Templates

Instead of transforming ArgoCD notifications via cdviz-collector, you can configure ArgoCD to send CDEvents directly using notification templates. This approach is being discussed in the ArgoCD community ([PR #24106](https://github.com/argoproj/argo-cd/pull/24106)).

**Example native CDEvents template** (see [argo-multiverse-labs/local-cluster example](https://github.com/argo-multiverse-labs/local-cluster/blob/feat/cdviz/argo-cdviz/argocd/notifications-cdevents.yaml)):

```yaml
template.cdevents-service-deployed: |
  webhook:
    cdevents:
      method: POST
      body: |
        {
          "context": {
            "version": "0.4.1",
            "id": "{{ .app.metadata.uid }}-{{ .app.status.operationState.finishedAt | date "20060102150405" }}",
            "source": "/argocd/{{ .app.metadata.namespace }}",
            "type": "dev.cdevents.service.deployed.0.2.0",
            "timestamp": "{{ .app.status.operationState.finishedAt }}"
          },
          "subject": {
            "id": "{{ .app.metadata.namespace }}/{{ .app.metadata.name }}",
            "type": "service",
            "source": "/argocd/{{ .app.metadata.namespace }}",
            "content": {
              "environment": {
                "id": "{{ .app.metadata.namespace }}",
                "source": "{{ .app.spec.destination.name | default .app.spec.destination.server }}"
              },
              "artifactId": "pkg:git/{{ .app.spec.source.repoURL | replace "https://" "" | replace "http://" "" | replace ".git" "" }}@{{ .app.status.sync.revision }}"
            }
          },
          "customData": {
            "argocdApp": "{{ .app.metadata.name }}",
            "syncStatus": "{{ .app.status.sync.status }}",
            "healthStatus": "{{ .app.status.health.status }}"
          }
        }
```

> [!NOTE]
> The example above uses `pkg:git/...` for artifactId, which is \*\*not currently a valid PURL type\*\* according to the [PURL specification](https://github.com/package-url/purl-spec). The transformer approach handles this complexity correctly by using proper PURL types (`oci`, `github`, etc.) based on the source type.

### Comparison: Transformer vs. Native Templates

| Feature                          | Transformer Approach                              | Native CDEvents Templates                  |
| -------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| **Setup Complexity**             | Moderate (collector + ArgoCD config)              | Simple (ArgoCD config only)                |
| **Event Logic**                  | Centralized in VRL transformer                    | Distributed across templates               |
| **Flexibility**                  | Easy to modify transformation logic               | Requires template updates                  |
| **Payload Size**                 | Full application state (~5-10KB)                  | Minimal CDEvent only (~1KB)                |
| **Maintenance**                  | Single template + transformer versioning          | Multiple templates to maintain             |
| **Testing**                      | Testable with sample inputs                       | Harder to test in isolation                |
| **Per-Container Events**         | Automatically emits events per container          | Manual template for each event type        |
| **ArtifactId (PURL) Generation** | VRL functions for complex PURL logic (since 0.18) | Limited by Go template engine capabilities |
| **Future Improvements**          | Can optimize payload size in transformer          | Already optimized                          |

> [!NOTE] ArtifactId/PURL Generation
> The transformer approach uses cdviz-collector's VRL functions (`purl_from_argocd_helm!`, `purl_from_argocd_git_source!`, `purl_from_oci_image!`) introduced in version 0.18. These functions handle complex logic for parsing ArgoCD sources (Helm charts, Git repos, OCI images) and formatting them into proper [PURL (Package URL)](https://github.com/package-url/purl-spec) identifiers. Implementing equivalent logic in Go templates would be significantly more complex and error-prone.

**Recommended approach**:

- **Transformer (current)**: For complex transformations, per-container events, PURL generation, and centralized event logic
- **Native templates**: For simple deployments with minimal transformation needs and optimized payload sizes

For detailed transformer implementation, see the [ArgoCD transformer README](https://github.com/cdviz-dev/cdviz-collector/blob/main/transformers/argocd_notifications/README.md).
