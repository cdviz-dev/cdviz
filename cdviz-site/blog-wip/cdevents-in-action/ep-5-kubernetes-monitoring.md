---
title: "CDEvents in Action #5: Kubernetes Native Monitoring"
description: "Monitor Kubernetes deployments and operations without modifying pipelines. Learn to capture deployment, scaling, and health events using native K8s watches and controllers."
tags:
  [
    "cdevents",
    "kubernetes",
    "k8s",
    "monitoring",
    "passive-monitoring",
    "controllers",
    "operators",
  ]
target_audience: "Kubernetes Operators, Platform Engineers, SREs"
reading_time: "14 minutes"
series: "CDEvents in Action"
series_part: 5
published: false
---

# CDEvents in Action #5: Kubernetes Native Monitoring

_Monitor Kubernetes deployments, scaling operations, and health changes automatically. Learn patterns to capture K8s events without modifying pipelines using native watches, controllers, and event streaming._

## The Kubernetes Observability Gap

In [Episode #4](./20251020-episode-4-webhook-transformers), you learned passive monitoring using ArgoCD notifications. This works perfectly for GitOps deployments, but what about:

- **Non-ArgoCD deployments** using kubectl, Helm, or Kustomize directly
- **Scaling operations** triggered by HPA, VPA, or manual scaling
- **Pod lifecycle events** (crashes, restarts, OOMKills, image pulls)
- **ConfigMap and Secret changes** affecting running applications
- **Node operations** (cordoning, draining, maintenance)
- **Multi-cluster environments** where ArgoCD isn't the only deployment method

**The challenge**: Kubernetes has rich event streams, but they're ephemeral, unstructured, and don't follow CDEvents standards.

**The solution**: Use Kubernetes watches and controllers to transform native K8s events into CDEvents automatically, providing observability across all deployment methods.

## ArgoCD vs. Native Kubernetes Monitoring

Understanding when each approach is appropriate:

```
Episode #4 (ArgoCD Notifications)
├─ Best for: GitOps-managed deployments
├─ Event trigger: ArgoCD sync operations
├─ Covers: Applications explicitly managed by ArgoCD
└─ Limitation: Doesn't see manual kubectl/Helm deployments

Episode #5 (Native K8s Monitoring) ← You are here
├─ Best for: Any deployment method (kubectl, Helm, manual)
├─ Event trigger: Kubernetes resource changes
├─ Covers: All deployments, scaling, pod lifecycle
└─ Limitation: Requires more configuration for application context
```

**Key insight**: These approaches complement each other. ArgoCD provides application-level context (which app, which git commit), while native K8s monitoring provides deployment-method-agnostic coverage.

## Monitoring Patterns Overview

Three patterns for Kubernetes-native CDEvents generation:

| Pattern                        | What It Monitors                    | CDEvents Generated                        | Complexity |
| ------------------------------ | ----------------------------------- | ----------------------------------------- | ---------- |
| **Pattern A: Deployment Watch** | Deployment resource changes         | `service.deployed`, `service.upgraded`    | Medium     |
| **Pattern B: Pod Lifecycle**    | Pod events (crashes, restarts, OOM) | `incident.detected`, `incident.resolved`  | Medium     |
| **Pattern C: Event Streaming**  | All Kubernetes events               | Various (configurable transformation)     | High       |

## Pattern A: Deployment Watch

Monitor Deployment resources and generate CDEvents when applications are deployed or updated.

### What Deployment Watches Capture

Kubernetes Deployment changes trigger CDEvents:

- **New rollout started** → `service.upgradeStarted` or `service.deploymentStarted`
- **Rollout completed (available)** → `service.deployed` or `service.upgraded`
- **Rollout failed** → `incident.detected`
- **Scaling operations** → Custom events or `service.upgraded`

### Implementation: Custom Controller Pattern

A minimal Kubernetes controller watches Deployments and sends CDEvents to cdviz-collector.

#### Step 1: Controller Configuration

This example uses a conceptual controller configuration. In practice, you would implement this using:
- **Client-go** (Go) for Kubernetes API interaction
- **Kubernetes Informers** for efficient resource watching
- **cdviz-collector HTTP sink** for CDEvent delivery

**Conceptual configuration:**

```yaml
# k8s-cdevents-controller-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cdevents-controller-config
  namespace: monitoring
data:
  config.yaml: |
    # What to watch
    watches:
      - apiVersion: apps/v1
        kind: Deployment
        namespaces:
          - production
          - staging
        labelSelectors:
          - "app.kubernetes.io/managed-by!=argocd"  # Avoid duplication with ArgoCD

    # CDEvents mapping
    events:
      deploymentAvailable:
        type: "dev.cdevents.service.deployed.0.2.0"
        condition: "status.conditions[?(@.type=='Available')].status == 'True'"
        subjectId: "{{ .metadata.namespace }}/{{ .metadata.name }}"
        environment: "{{ .metadata.namespace }}"
        artifactId: "{{ .spec.template.spec.containers[0].image }}"  # First container image

      deploymentFailed:
        type: "dev.cdevents.incident.detected.0.2.0"
        condition: "status.conditions[?(@.type=='Progressing')].status == 'False'"
        subjectId: "{{ .metadata.namespace }}/{{ .metadata.name }}"
        description: "Deployment rollout failed"

    # Where to send CDEvents
    sink:
      type: http
      url: "http://cdviz-collector.monitoring.svc:8080/webhook/000-k8s"
      headers:
        Authorization: "Bearer ${K8S_CONTROLLER_TOKEN}"
```

#### Step 2: Deploy the Controller

The controller runs as a Deployment in your cluster with appropriate RBAC:

```yaml
# k8s-cdevents-controller-rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: cdevents-controller
  namespace: monitoring
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: cdevents-controller
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["events"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: cdevents-controller
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cdevents-controller
subjects:
  - kind: ServiceAccount
    name: cdevents-controller
    namespace: monitoring
```

#### Step 3: cdviz-collector Webhook Sink

Configure collector to receive events from the controller:

```toml
# cdviz-collector.toml

[sources.k8s_webhook]
enabled = true

[sources.k8s_webhook.extractor]
type = "webhook"
id = "000-k8s"

# Optional: Verify Authorization header
[sources.k8s_webhook.extractor.headers.authorization]
type = "secret"
value = "Bearer your-k8s-controller-secret"
```

### What You Get

- ✅ **Deployment method agnostic**: Captures kubectl apply, Helm installs, manual changes
- ✅ **Automatic discovery**: Watches entire namespaces or label-selected resources
- ✅ **Rollout tracking**: Start, progress, completion, and failure events
- ✅ **Environment mapping**: Namespace → environment correlation
- ✅ **Image tracking**: Automatic artifactId from container spec

**Limitation**: Requires implementing or deploying a custom controller. See Resources section for open-source implementations.

## Pattern B: Pod Lifecycle Monitoring

Track pod-level incidents like crashes, restarts, OOMKills, and image pull failures.

### What Pod Lifecycle Captures

Pod events that indicate operational issues:

- **CrashLoopBackOff** → `incident.detected` (type: crash)
- **OOMKilled** → `incident.detected` (type: oom)
- **ImagePullBackOff** → `incident.detected` (type: image-pull)
- **Pod transitions to Running** after crash → `incident.resolved`
- **Excessive restarts** → `incident.detected` (type: instability)

### Implementation: Event-Based Controller

Watch Pod events and conditions to detect incidents:

**Conceptual configuration:**

```yaml
# k8s-pod-monitor-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: pod-monitor-config
  namespace: monitoring
data:
  config.yaml: |
    watches:
      - apiVersion: v1
        kind: Pod
        namespaces:
          - production
          - staging

    # Incident detection rules
    incidents:
      crashLoop:
        type: "dev.cdevents.incident.detected.0.3.0"
        condition: "status.containerStatuses[*].state.waiting.reason == 'CrashLoopBackOff'"
        subjectId: "{{ .metadata.namespace }}/{{ .metadata.labels['app'] }}"
        description: "Pod {{ .metadata.name }} in CrashLoopBackOff"
        severity: "high"

      oomKill:
        type: "dev.cdevents.incident.detected.0.3.0"
        condition: "status.containerStatuses[*].lastState.terminated.reason == 'OOMKilled'"
        subjectId: "{{ .metadata.namespace }}/{{ .metadata.labels['app'] }}"
        description: "Container OOMKilled in pod {{ .metadata.name }}"
        severity: "critical"

      imagePullFail:
        type: "dev.cdevents.incident.detected.0.3.0"
        condition: "status.containerStatuses[*].state.waiting.reason == 'ImagePullBackOff'"
        subjectId: "{{ .metadata.namespace }}/{{ .metadata.labels['app'] }}"
        description: "Failed to pull image for pod {{ .metadata.name }}"
        severity: "high"

    # Resolution detection
    resolutions:
      podRunning:
        type: "dev.cdevents.incident.resolved.0.2.0"
        condition: "status.phase == 'Running' AND status.containerStatuses[*].ready == true"
        correlatesWith: "previous incident for same subjectId"

    sink:
      type: http
      url: "http://cdviz-collector.monitoring.svc:8080/webhook/000-k8s-pods"
```

### CDEvent Example: OOMKilled Incident

When a container is OOMKilled, the controller generates:

```json
{
  "context": {
    "version": "0.4.1",
    "source": "https://k8s.example.com/cluster/prod-us-1",
    "type": "dev.cdevents.incident.detected.0.3.0"
  },
  "subject": {
    "id": "production/payment-service",
    "type": "service",
    "content": {
      "description": "Container 'payment-api' OOMKilled in pod 'payment-service-7d8f9c-abcd'",
      "ticketURI": "https://k8s.example.com/ui/ns/production/pods/payment-service-7d8f9c-abcd/logs"
    }
  }
}
```

### What You Get

- ✅ **Real-time incident detection**: Immediate notification of pod failures
- ✅ **Automatic resolution tracking**: Correlates recovery with initial incident
- ✅ **Root cause context**: Includes container exit codes, reasons, messages
- ✅ **SRE-focused**: Surfaces operational issues, not just deployments

**Limitation**: Generates high event volume in unstable clusters. Use filtering and aggregation.

## Pattern C: Kubernetes Event Streaming

Stream all Kubernetes events and transform them into CDEvents using a flexible processor.

### What Event Streaming Captures

Kubernetes native events provide a comprehensive view:

- **Scheduling**: Pod scheduled, preempted, failed to schedule
- **Pulling**: Image pulling, pulled, failed to pull
- **Starting**: Container started, killed, failed to start
- **Probing**: Liveness probe failed, readiness probe failed
- **Scaling**: Scaled up/down, HPA triggered
- **Configuration**: ConfigMap mounted, Secret mounted

### Implementation: Event Processor

A processor watches Kubernetes events and transforms them using VRL (Vector Remap Language) or similar transformation logic.

**Architecture:**

```
┌─────────────────────────────────────┐
│ Kubernetes API                       │
│ └─ /api/v1/events (watch)            │
└────────────┬────────────────────────┘
             │ Watch stream
             ↓
┌─────────────────────────────────────┐
│ Event Processor (e.g., Vector)       │
│ ├─ Watch Kubernetes events           │
│ ├─ Filter relevant events            │
│ └─ Transform to CDEvents (VRL)       │
└────────────┬────────────────────────┘
             │ CDEvents stream
             ↓
┌─────────────────────────────────────┐
│ cdviz-collector                      │
│ └─ Webhook sink                      │
└─────────────────────────────────────┘
```

### Vector Configuration Example

Using [Vector](https://vector.dev/) to watch Kubernetes events and transform them:

```toml
# vector.toml
[sources.k8s_events]
type = "kubernetes_logs"
extra_field_selector = "involvedObject.kind=Pod"
namespace_annotation_fields.namespace = "namespace"

# Only watch relevant event types
[sources.k8s_events.filtering]
type = "vrl"
source = '''
  .reason == "Started" ||
  .reason == "Killing" ||
  .reason == "Failed" ||
  .reason == "BackOff" ||
  .reason == "Unhealthy"
'''

# Transform to CDEvents
[transforms.to_cdevents]
type = "remap"
inputs = ["k8s_events"]
source = '''
  event_type = if .reason == "Started" {
    "dev.cdevents.service.deployed.0.2.0"
  } else if .reason == "Failed" || .reason == "BackOff" || .reason == "Unhealthy" {
    "dev.cdevents.incident.detected.0.3.0"
  } else {
    "dev.cdevents.incident.resolved.0.2.0"
  }

  subject_id = join([.involvedObject.namespace, .involvedObject.name], "/")

  . = {
    "context": {
      "version": "0.4.1",
      "source": "k8s://cluster/" + .cluster_name,
      "type": event_type
    },
    "subject": {
      "id": subject_id,
      "type": "service",
      "content": {
        "description": .message,
        "environment": {"id": .involvedObject.namespace}
      }
    }
  }
'''

# Send to cdviz-collector
[sinks.cdviz]
type = "http"
inputs = ["to_cdevents"]
uri = "http://cdviz-collector:8080/webhook/000-k8s-events"
encoding.codec = "json"
```

### What You Get

- ✅ **Comprehensive coverage**: Captures all K8s native events
- ✅ **Flexible transformation**: VRL/JavaScript/Lua transformation logic
- ✅ **High throughput**: Efficient streaming without polling
- ✅ **Existing tooling**: Leverage Vector, Fluentd, or similar processors
- ✅ **Multi-cluster**: Single Vector instance can watch multiple clusters

**Limitation**: Requires deploying and managing an event processor. High event volume requires filtering.

## Combining Kubernetes Monitoring Approaches

The most effective observability strategy uses multiple patterns together.

### Recommended Architecture

```
┌─────────────────────────────────────────────────────┐
│ ArgoCD Notifications (from Episode #4)              │
│ ├─ GitOps-managed applications                      │
│ ├─ Application-level context (git commits)          │
│ └─ service.deployed events with commit correlation  │
└─────────────────────────────────────────────────────┘
           ↓ Rich application context

┌─────────────────────────────────────────────────────┐
│ Deployment Watch (Pattern A)                        │
│ ├─ kubectl/Helm deployments                         │
│ ├─ Manual changes                                   │
│ └─ service.deployed/upgraded events                 │
└─────────────────────────────────────────────────────┘
           ↓ Deployment method agnostic

┌─────────────────────────────────────────────────────┐
│ Pod Lifecycle Monitor (Pattern B)                   │
│ ├─ CrashLoopBackOff, OOMKilled                      │
│ ├─ Container failures                               │
│ └─ incident.detected/resolved events                │
└─────────────────────────────────────────────────────┘
           ↓ Operational incidents

┌─────────────────────────────────────────────────────┐
│ Event Streaming (Pattern C) - Optional              │
│ ├─ Scheduling, probing, scaling events              │
│ ├─ Comprehensive K8s activity                       │
│ └─ Various CDEvents based on transformation         │
└─────────────────────────────────────────────────────┘
```

### Example: E-Commerce Platform

**Scenario**: 50 microservices, mixed deployment methods (ArgoCD + manual kubectl), multi-cluster

**ArgoCD Notifications** (Episode #4):
- Covers 40 services deployed via GitOps
- Rich context: git commits, authors, PRs

**Deployment Watch** (Pattern A):
- Covers 10 services deployed via kubectl/Helm
- Unified observability regardless of deployment method

**Pod Lifecycle Monitor** (Pattern B):
- All 50 services monitored for crashes, OOMs, failures
- Automatic incident detection and alerting

**Event Streaming** (Pattern C):
- Optional: Detailed scheduling and scaling events
- Useful for capacity planning and SRE investigation

**Result**:
- ✅ 100% deployment coverage (ArgoCD + native K8s)
- ✅ Automatic incident detection for all services
- ✅ Unified CDEvents stream for dashboards and alerts
- ✅ No pipeline modifications required

## Filtering and Namespaces

Prevent CDEvent flood by filtering what you monitor.

### Namespace Filtering

Only watch production and staging namespaces:

```yaml
# Controller configuration
watches:
  - kind: Deployment
    namespaces:
      - production
      - staging
    excludeNamespaces:
      - kube-system
      - kube-public
      - monitoring
```

### Label-Based Filtering

Only monitor services explicitly opted in:

```yaml
# Controller configuration
watches:
  - kind: Deployment
    labelSelectors:
      - "cdevents.enabled=true"
      - "app.kubernetes.io/part-of"  # Only services with this label
```

Deploy applications with opt-in labels:

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-service
  labels:
    cdevents.enabled: "true"
    app.kubernetes.io/part-of: payment-platform
```

### Event Deduplication

Use content-based deduplication to avoid duplicate events:

- **cdviz-collector automatic deduplication**: Events with identical content generate the same content ID (CID)
- **Controller-side throttling**: Limit event generation rate per resource
- **Kubernetes watch bookmarks**: Use resourceVersion to avoid re-processing

## Security and RBAC

Secure access to Kubernetes API and CDEvent delivery.

### RBAC Best Practices

**Minimal permissions** for controllers:

```yaml
# Principle: Read-only access to watched resources
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: cdevents-controller-minimal
rules:
  # Only watch Deployments
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch"]

  # Optional: Read events for richer context
  - apiGroups: [""]
    resources: ["events"]
    verbs: ["get", "list", "watch"]

  # No write permissions needed
```

**Namespace-scoped alternative** (more secure for multi-tenant clusters):

```yaml
# Deploy controller per namespace with Role instead of ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: cdevents-controller
  namespace: production  # Scoped to one namespace
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch"]
```

### Network Policies

Restrict controller network access:

```yaml
# Only allow egress to cdviz-collector
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: cdevents-controller-egress
  namespace: monitoring
spec:
  podSelector:
    matchLabels:
      app: cdevents-controller
  policyTypes:
    - Egress
  egress:
    # Allow DNS
    - to:
        - namespaceSelector:
            matchLabels:
              name: kube-system
      ports:
        - protocol: UDP
          port: 53

    # Allow cdviz-collector
    - to:
        - podSelector:
            matchLabels:
              app: cdviz-collector
      ports:
        - protocol: TCP
          port: 8080
```

### Webhook Authentication

Protect cdviz-collector webhook endpoints:

```toml
# cdviz-collector.toml
[sources.k8s_webhook.extractor.headers.authorization]
type = "secret"
value = "Bearer ${K8S_CONTROLLER_TOKEN}"
```

Controller sends token:

```go
// Controller code snippet (Go example)
req.Header.Set("Authorization", "Bearer " + os.Getenv("K8S_CONTROLLER_TOKEN"))
```

## Implementation Comparison

Choosing the right approach based on your requirements:

| Criteria                  | Deployment Watch | Pod Lifecycle | Event Streaming |
| ------------------------- | ---------------- | ------------- | --------------- |
| **Implementation Effort** | Medium           | Medium        | High            |
| **Event Volume**          | Low              | Medium        | Very High       |
| **Coverage**              | Deployments only | Pods only     | All resources   |
| **Resource Usage**        | Low              | Low           | Medium-High     |
| **Flexibility**           | Medium           | Medium        | Very High       |
| **Operational Maturity**  | Production       | Production    | Requires tuning |
| **Best For**              | Deployment tracking | Incident detection | Comprehensive audit |

**Recommendation**:
1. **Start with Deployment Watch (Pattern A)** for basic observability
2. **Add Pod Lifecycle (Pattern B)** for operational incident detection
3. **Consider Event Streaming (Pattern C)** only if you need comprehensive audit trails

## Open Source Tools

Existing tools that implement Kubernetes-to-CDEvents patterns:

> [!TIP] Production-Ready Integration
> **kubewatch** has a ready-to-use CDviz integration with pre-built transformers and Helm chart deployment. This is the recommended starting point for Kubernetes monitoring.

### kubewatch

[kubewatch](https://github.com/robusta-dev/kubewatch) watches Kubernetes resources and sends CloudEvents notifications.

**Capabilities**:
- Watches Deployments, StatefulSets, DaemonSets, Pods, Services
- Sends CloudEvents format (richer than basic webhooks)
- Configurable resource and namespace filters
- Built-in CDviz integration with community transformer

**CDviz provides ready-to-use kubewatch integration** with a pre-built transformer that converts Kubewatch CloudEvents to CDEvents:

- Deployment/StatefulSet/DaemonSet **create** → `service.deployed`
- Deployment/StatefulSet/DaemonSet **update** → `service.deployed`, `service.upgraded`, or `service.removed` (based on change)
- Deployment/StatefulSet/DaemonSet **delete** → `service.removed`

**Quick Setup with Helm** (easiest):

CDviz Helm chart can deploy both cdviz-collector and a preconfigured kubewatch:

```bash
# Install cdviz-collector with integrated kubewatch
helm install cdviz-collector oci://ghcr.io/cdviz-dev/charts/cdviz-collector \
  --set kubewatch.enabled=true
```

This automatically:
- ✅ Deploys kubewatch configured to send CloudEvents
- ✅ Configures cdviz-collector with kubewatch transformer
- ✅ Sets up proper RBAC and network policies
- ✅ Generates CDEvents for Deployment/StatefulSet/DaemonSet changes

**Manual cdviz-collector configuration**:

```toml
# cdviz-collector.toml
[remote.transformers-community]
type = "github"
owner = "cdviz-dev"
repo = "transformers-community"

[sources.kubewatch_webhook]
enabled = true
transformer_refs = ["kubewatch_cloudevents"]

[sources.kubewatch_webhook.extractor]
type = "webhook"
id = "000-kubewatch"
metadata.environment_id = "/production/eu-1"

[transformers.kubewatch_cloudevents]
type = "vrl"
template_rfile = "transformers-community:///kubewatch_cloudevents/transformer.vrl"
```

**Manual kubewatch configuration**:

```yaml
# kubewatch-values.yaml
resourcesToWatch:
  deployment: true
  statefulset: true
  daemonset: true
  pod: false
  services: false

slack:
  enabled: false

# CloudEvents include full resource manifest
cloudevent:
  enabled: true
  url: "http://cdviz-collector:8080/webhook/000-kubewatch"
```

> [!WARNING] Security Note
> Kubewatch sends CloudEvents without authentication. Deploy in trusted environments only (same cluster/namespace). Consider using a sidecar cdviz-collector or network policies for isolation.

**Complete integration guide**: [Kubewatch Integration Documentation](https://cdviz.dev/docs/cdviz-collector/integrations/kubewatch.html)

### Vector (Event Streaming)

[Vector](https://vector.dev/) is a high-performance observability data pipeline.

**Why Vector**:
- Native Kubernetes event watching
- Powerful VRL transformation language
- High throughput, low resource usage
- Production-grade reliability

See Pattern C (Event Streaming) section for detailed configuration.

### Custom Controllers

For full control, build a custom controller:

**Recommended frameworks**:
- [Kubebuilder](https://book.kubebuilder.io/) (Go) - Full controller SDK
- [Operator SDK](https://sdk.operatorframework.io/) (Go) - Kubernetes Operator framework
- [Kopf](https://kopf.readthedocs.io/) (Python) - Python Kubernetes operator framework
- [client-go](https://github.com/kubernetes/client-go) (Go) - Low-level Kubernetes client

**Minimal controller pseudocode**:

```go
// Minimal controller example (Go + client-go)
func watchDeployments(clientset *kubernetes.Clientset) {
    watchlist := cache.NewListWatchFromClient(
        clientset.AppsV1().RESTClient(),
        "deployments",
        v1.NamespaceAll,
        fields.Everything(),
    )

    _, controller := cache.NewInformer(
        watchlist,
        &appsv1.Deployment{},
        time.Second*0,
        cache.ResourceEventHandlerFuncs{
            UpdateFunc: func(oldObj, newObj interface{}) {
                oldDep := oldObj.(*appsv1.Deployment)
                newDep := newObj.(*appsv1.Deployment)

                // Detect rollout completion
                if isAvailable(newDep) && !isAvailable(oldDep) {
                    sendCDEvent("service.deployed", newDep)
                }
            },
        },
    )

    controller.Run(wait.NeverStop)
}

func isAvailable(dep *appsv1.Deployment) bool {
    for _, cond := range dep.Status.Conditions {
        if cond.Type == appsv1.DeploymentAvailable && cond.Status == "True" {
            return true
        }
    }
    return false
}
```

## Troubleshooting

Common issues and solutions:

### High Event Volume

**Problem**: Thousands of events per minute, overwhelming cdviz-collector

**Solutions**:
1. **Namespace filtering**: Only watch production/staging namespaces
2. **Label selectors**: Require opt-in labels on resources
3. **Event type filtering**: Skip routine events (probe successes, image pulls)
4. **Aggregation**: Combine multiple related events into one CDEvent
5. **Rate limiting**: Throttle events per resource

### Missing Events

**Problem**: Expected events not appearing in CDviz dashboards

**Debug checklist**:
1. ✅ Check controller logs for errors
2. ✅ Verify RBAC permissions (get, list, watch)
3. ✅ Test webhook endpoint manually (curl)
4. ✅ Check network policies allow egress
5. ✅ Validate transformer logic (use cdviz-collector debug mode)
6. ✅ Verify namespace and label selectors match resources

### Duplicate Events

**Problem**: Same deployment generates multiple `service.deployed` events

**Solutions**:
1. **Content-based deduplication**: Use cdviz-collector automatic CID generation
2. **Watch bookmark reconciliation**: Use resourceVersion to track processing
3. **Condition checking**: Only send event when condition changes (e.g., Available becomes True)
4. **Generation field**: Track `metadata.generation` to detect actual spec changes

## Key Takeaways

- 🎯 **Complement ArgoCD**: Native K8s monitoring covers non-GitOps deployments
- 🔧 **Three patterns**: Deployment watch, pod lifecycle, event streaming (pick based on needs)
- 📊 **Comprehensive coverage**: Monitor all deployment methods without pipeline changes
- 🔒 **RBAC security**: Read-only access with namespace scoping
- 📈 **Filter aggressively**: Use namespaces, labels, and event types to control volume
- ⚙️ **Existing tools**: kubewatch, Vector, or custom controllers
- 🚀 **Start simple**: Begin with deployment watch, add pod monitoring for incidents

Kubernetes native monitoring provides deployment-agnostic observability. Combined with ArgoCD (Episode #4), you achieve complete coverage across all deployment methods.

## Resources

### CDviz Documentation
- [Kubewatch Integration Guide](https://cdviz.dev/docs/cdviz-collector/integrations/kubewatch.html) - Complete kubewatch setup with Helm
- [Transformer VRL Guide](https://cdviz.dev/docs/cdviz-collector/transformers.html) - Write transformation logic
- [Webhook Source Configuration](https://cdviz.dev/docs/cdviz-collector/sources/webhook.html) - Configure webhook receivers
- [Episode #4: Webhook Transformers](./20251020-episode-4-webhook-transformers) - ArgoCD passive monitoring

### Kubernetes Tools
- [kubewatch](https://github.com/robusta-dev/kubewatch) - Watch K8s resources, send CloudEvents (production-ready CDviz integration)
- [Vector](https://vector.dev/) - Event streaming and transformation
- [Kubebuilder](https://book.kubebuilder.io/) - Build custom controllers (Go)
- [Kopf](https://kopf.readthedocs.io/) - Build controllers in Python

### Kubernetes References
- [Kubernetes Events](https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/) - Native event API reference
- [Informers and Watch](https://kubernetes.io/docs/reference/using-api/api-concepts/#efficient-detection-of-changes) - Efficient resource watching
- [RBAC Authorization](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) - Security and permissions

