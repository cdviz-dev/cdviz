---
title: "CDEvents in Action #6: Building Custom Kubernetes Controllers"
description: "Build specialized Kubernetes controllers for advanced monitoring. Learn deployment watch patterns, pod lifecycle tracking, and incident detection beyond kubewatch capabilities."
tags:
  [
    "cdevents",
    "kubernetes",
    "k8s",
    "controllers",
    "operators",
    "incident-detection",
    "advanced",
  ]
target_audience: "Platform Engineers, SREs, Kubernetes Developers"
reading_time: "12 minutes"
series: "CDEvents in Action"
series_part: 6
published: false
---

# CDEvents in Action #6: Building Custom Kubernetes Controllers

_When kubewatch isn't enough - build specialized Kubernetes controllers for advanced monitoring patterns including incident detection, pod lifecycle tracking, and custom event logic._

## When to Build Custom Controllers

In [Episode #5](./ep-5-kubernetes-monitoring-kubewatch), you learned production-ready monitoring with kubewatch. This covers most use cases, but sometimes you need more:

**Kubewatch limitations:**
- Watches resource changes but doesn't detect specific conditions
- No custom business logic for event generation
- Limited to resource-level events (no pod lifecycle details)
- No incident correlation or resolution tracking

**When to build custom controllers:**
- **Pod-level incident detection**: CrashLoopBackOff, OOMKilled, ImagePullBackOff
- **Condition-based events**: Only send events when specific status conditions change
- **Custom correlation**: Link deployment events with pod failures
- **Business logic**: Apply organization-specific rules for event generation
- **Advanced filtering**: Complex label selectors and field-based filtering
- **Incident resolution tracking**: Detect when incidents are resolved

This episode covers two controller patterns with implementation guidance.

## Prerequisites

Before building custom controllers, ensure you have:

- **Go development environment** (1.21+) or Python 3.10+ for Kopf
- **Kubernetes cluster** for testing (minikube, kind, or cloud cluster)
- **Understanding of Kubernetes API concepts** (informers, watches, reconciliation)
- **CDviz collector** running and accessible from your cluster

## Pattern A: Deployment Watch Controller

Monitor Deployment resources and generate CDEvents based on status conditions.

### What This Pattern Captures

- **New rollout started** → `service.deploymentStarted` or `service.upgradeStarted`
- **Rollout completed successfully** → `service.deployed` or `service.upgraded`
- **Rollout failed** → `incident.detected` with failure reason
- **Scaling operations** → Custom events or `service.upgraded`

### Design Pattern

> [!NOTE]
> The configuration examples in this section represent **design patterns**, not production-ready code. They illustrate the controller logic conceptually. For a working implementation, use the frameworks listed in the [Implementation Options](#implementation-options) section or reference the example repositories in [Resources](#resources).

**Conceptual controller configuration:**

```yaml
# Design pattern - not runnable code
# See Implementation Options section for production frameworks

apiVersion: cdevents.dev/v1alpha1
kind: ControllerConfig
metadata:
  name: deployment-watch-config

# What resources to watch
watches:
  - apiVersion: apps/v1
    kind: Deployment
    namespaces:
      - production
      - staging
    labelSelectors:
      # Avoid duplication with ArgoCD notifications
      - "app.kubernetes.io/managed-by!=argocd"

# CDEvents generation rules
eventRules:
  # Deployment becomes available
  - name: deploymentAvailable
    cdEventType: "dev.cdevents.service.deployed.0.2.0"

    # Trigger condition using JSONPath
    triggerWhen:
      # Available condition changed from False/Unknown to True
      conditionTransition:
        type: "Available"
        from: ["False", "Unknown"]
        to: "True"

    # CDEvent field mapping
    mapping:
      subject:
        id: "{{ .metadata.namespace }}/{{ .metadata.name }}"
        content:
          environment:
            id: "{{ .metadata.namespace }}"
          artifactId: "{{ .spec.template.spec.containers[0].image }}"

  # Deployment rollout failed
  - name: deploymentFailed
    cdEventType: "dev.cdevents.incident.detected.0.3.0"

    triggerWhen:
      conditionTransition:
        type: "Progressing"
        reason: "ProgressDeadlineExceeded"
        to: "False"

    mapping:
      subject:
        id: "{{ .metadata.namespace }}/{{ .metadata.name }}"
        content:
          description: "Deployment rollout failed: {{ .status.conditions[?(@.type=='Progressing')].message }}"
          ticketURI: "https://k8s.example.com/namespace/{{ .metadata.namespace }}/deployment/{{ .metadata.name }}"

# Sink configuration
sink:
  type: http
  url: "http://cdviz-collector.cdviz.svc:8080/webhook/000-k8s-controller"
  headers:
    Authorization: "Bearer ${K8S_CONTROLLER_TOKEN}"
```

### Implementation Options

To implement this pattern, choose a controller framework:

#### Option 1: Kubebuilder (Go)

[Kubebuilder](https://book.kubebuilder.io/) provides scaffolding for production Kubernetes controllers.

**Setup:**

```bash
# Initialize new controller project
kubebuilder init --domain cdevents.dev --repo github.com/yourorg/deployment-controller

# Create API for watching Deployments (using unmanaged external type)
kubebuilder create webhook --resource Deployment --group apps --version v1 --kind Deployment
```

**Minimal controller logic (Go):**

```go
package controllers

import (
    "context"
    appsv1 "k8s.io/api/apps/v1"
    "sigs.k8s.io/controller-runtime/pkg/client"
    "sigs.k8s.io/controller-runtime/pkg/reconcile"
)

type DeploymentWatcher struct {
    client.Client
    CDEventSender CDEventSenderInterface
}

func (r *DeploymentWatcher) Reconcile(ctx context.Context, req reconcile.Request) (reconcile.Result, error) {
    var deployment appsv1.Deployment
    if err := r.Get(ctx, req.NamespacedName, &deployment); err != nil {
        return reconcile.Result{}, client.IgnoreNotFound(err)
    }

    // Check if deployment is now available
    if isAvailable(&deployment) {
        r.CDEventSender.SendDeployedEvent(ctx, &deployment)
    }

    // Check if deployment failed
    if hasFailedCondition(&deployment) {
        r.CDEventSender.SendIncidentEvent(ctx, &deployment)
    }

    return reconcile.Result{}, nil
}

func isAvailable(dep *appsv1.Deployment) bool {
    for _, cond := range dep.Status.Conditions {
        if cond.Type == appsv1.DeploymentAvailable && cond.Status == "True" {
            return true
        }
    }
    return false
}

func hasFailedCondition(dep *appsv1.Deployment) bool {
    for _, cond := range dep.Status.Conditions {
        if cond.Type == appsv1.DeploymentProgressing &&
           cond.Reason == "ProgressDeadlineExceeded" {
            return true
        }
    }
    return false
}
```

**Complete example**: See [cdviz-k8s-controller-example](https://github.com/cdviz-dev/examples) (reference repository)

#### Option 2: Kopf (Python)

[Kopf](https://kopf.readthedocs.io/) provides Python-based Kubernetes operator framework.

**Minimal controller (Python):**

```python
import kopf
import requests
import os

COLLECTOR_URL = os.environ.get('CDVIZ_COLLECTOR_URL', 'http://cdviz-collector:8080/webhook/000-k8s')

@kopf.on.update('apps', 'v1', 'deployments')
def deployment_updated(old, new, namespace, name, **kwargs):
    """Watch deployment updates and send CDEvents."""

    # Check if deployment became available
    old_available = is_available(old)
    new_available = is_available(new)

    if not old_available and new_available:
        send_deployed_event(namespace, name, new)

    # Check if deployment failed
    if has_failed_condition(new):
        send_incident_event(namespace, name, new)

def is_available(deployment):
    """Check if deployment has Available=True condition."""
    conditions = deployment.get('status', {}).get('conditions', [])
    for cond in conditions:
        if cond.get('type') == 'Available' and cond.get('status') == 'True':
            return True
    return False

def send_deployed_event(namespace, name, deployment):
    """Send service.deployed CDEvent to collector."""
    image = deployment['spec']['template']['spec']['containers'][0]['image']

    event = {
        "context": {
            "version": "0.4.1",
            "type": "dev.cdevents.service.deployed.0.2.0",
            "source": f"k8s://{namespace}"
        },
        "subject": {
            "id": f"{namespace}/{name}",
            "type": "service",
            "content": {
                "environment": {"id": namespace},
                "artifactId": image
            }
        }
    }

    requests.post(COLLECTOR_URL, json=event)
```

**Deploy with Helm**: Package as container, deploy with RBAC configuration.

#### Option 3: client-go (Low-level Go)

For full control, use [client-go](https://github.com/kubernetes/client-go) directly with informers.

**Minimal watch loop (Go):**

```go
package main

import (
    "time"
    appsv1 "k8s.io/api/apps/v1"
    "k8s.io/client-go/informers"
    "k8s.io/client-go/kubernetes"
    "k8s.io/client-go/tools/cache"
)

func watchDeployments(clientset *kubernetes.Clientset) {
    // Create informer factory
    factory := informers.NewSharedInformerFactory(clientset, time.Minute*10)
    deploymentInformer := factory.Apps().V1().Deployments().Informer()

    // Register event handlers
    deploymentInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
        UpdateFunc: func(oldObj, newObj interface{}) {
            oldDep := oldObj.(*appsv1.Deployment)
            newDep := newObj.(*appsv1.Deployment)

            // Detect condition changes
            if !isAvailable(oldDep) && isAvailable(newDep) {
                sendCDEvent("service.deployed", newDep)
            }
        },
    })

    // Start informer
    stopCh := make(chan struct{})
    defer close(stopCh)
    factory.Start(stopCh)
    factory.WaitForCacheSync(stopCh)
    <-stopCh
}
```

### RBAC Configuration

All controller implementations need read-only access:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: deployment-watcher
rules:
  # Watch Deployments
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch"]

  # Optional: Read events for context
  - apiGroups: [""]
    resources: ["events"]
    verbs: ["get", "list", "watch"]
```

## Pattern B: Pod Lifecycle and Incident Detection

Track pod-level incidents like crashes, OOMKills, and image pull failures.

### What This Pattern Captures

- **CrashLoopBackOff** → `incident.detected` (type: crash)
- **OOMKilled** → `incident.detected` (type: oom)
- **ImagePullBackOff** → `incident.detected` (type: image-pull)
- **Pod Running after crash** → `incident.resolved`
- **Excessive restarts** → `incident.detected` (type: instability)

### Design Pattern

> [!NOTE]
> This configuration represents a **design pattern** for illustration. For production implementation, use the frameworks in [Implementation Options](#implementation-options-1) or adapt the example code provided.

**Conceptual pod monitor configuration:**

```yaml
# Design pattern - not runnable code
# Shows the monitoring logic conceptually

apiVersion: cdevents.dev/v1alpha1
kind: ControllerConfig
metadata:
  name: pod-lifecycle-monitor

watches:
  - apiVersion: v1
    kind: Pod
    namespaces:
      - production
      - staging

# Incident detection rules
incidentRules:
  # CrashLoopBackOff detection
  - name: crashLoop
    cdEventType: "dev.cdevents.incident.detected.0.3.0"

    triggerWhen:
      # Container waiting with CrashLoopBackOff reason
      podCondition:
        containerStatuses:
          state:
            waiting:
              reason: "CrashLoopBackOff"

    mapping:
      subject:
        id: "{{ .metadata.namespace }}/{{ .metadata.labels.app }}"
        type: "service"
        content:
          description: "Pod {{ .metadata.name }} in CrashLoopBackOff"
          ticketURI: "https://k8s.example.com/logs/{{ .metadata.namespace }}/{{ .metadata.name }}"

    # Custom fields (CDEvents extension)
    customData:
      severity: "high"
      podName: "{{ .metadata.name }}"
      containerName: "{{ .status.containerStatuses[0].name }}"

  # OOMKilled detection
  - name: oomKill
    cdEventType: "dev.cdevents.incident.detected.0.3.0"

    triggerWhen:
      podCondition:
        containerStatuses:
          lastState:
            terminated:
              reason: "OOMKilled"

    mapping:
      subject:
        id: "{{ .metadata.namespace }}/{{ .metadata.labels.app }}"
        content:
          description: "Container OOMKilled in pod {{ .metadata.name }}"

    customData:
      severity: "critical"
      exitCode: "{{ .status.containerStatuses[0].lastState.terminated.exitCode }}"

  # ImagePullBackOff detection
  - name: imagePullFail
    cdEventType: "dev.cdevents.incident.detected.0.3.0"

    triggerWhen:
      podCondition:
        containerStatuses:
          state:
            waiting:
              reason: "ImagePullBackOff"

    mapping:
      subject:
        id: "{{ .metadata.namespace }}/{{ .metadata.labels.app }}"
        content:
          description: "Failed to pull image for pod {{ .metadata.name }}"

    customData:
      severity: "high"
      image: "{{ .spec.containers[0].image }}"

# Resolution detection
resolutionRules:
  # Pod running after incident
  - name: podRunning
    cdEventType: "dev.cdevents.incident.resolved.0.2.0"

    triggerWhen:
      # Pod phase changed to Running and all containers ready
      stateTransition:
        phase:
          from: ["Pending", "Failed"]
          to: "Running"
        containerStatuses:
          allReady: true

    # Correlate with previous incident for same subject
    correlatesWith:
      subjectId: "{{ .metadata.namespace }}/{{ .metadata.labels.app }}"
      eventTypes: ["dev.cdevents.incident.detected.0.3.0"]

sink:
  type: http
  url: "http://cdviz-collector.cdviz.svc:8080/webhook/000-k8s-pods"
```

### Implementation Options

#### Option 1: Kopf with State Tracking (Python)

Kopf excels at pod monitoring with built-in state tracking:

```python
import kopf
import requests

# Track incidents per service (namespace/app)
incident_tracker = {}

@kopf.on.update('v1', 'pods')
def pod_lifecycle(old, new, namespace, name, labels, **kwargs):
    """Monitor pod lifecycle and detect incidents."""

    app_id = f"{namespace}/{labels.get('app', 'unknown')}"

    # Check for CrashLoopBackOff
    if is_crash_loop(new):
        send_incident(app_id, "crash", f"Pod {name} in CrashLoopBackOff")
        incident_tracker[app_id] = "crash"

    # Check for OOMKilled
    elif is_oom_killed(new):
        send_incident(app_id, "oom", f"Container OOMKilled in pod {name}")
        incident_tracker[app_id] = "oom"

    # Check for resolution (Running after incident)
    elif is_running(new) and app_id in incident_tracker:
        send_resolution(app_id, f"Pod {name} recovered")
        del incident_tracker[app_id]

def is_crash_loop(pod):
    """Check if any container is in CrashLoopBackOff."""
    statuses = pod.get('status', {}).get('containerStatuses', [])
    for status in statuses:
        waiting = status.get('state', {}).get('waiting', {})
        if waiting.get('reason') == 'CrashLoopBackOff':
            return True
    return False

def is_oom_killed(pod):
    """Check if any container was OOMKilled."""
    statuses = pod.get('status', {}).get('containerStatuses', [])
    for status in statuses:
        terminated = status.get('lastState', {}).get('terminated', {})
        if terminated.get('reason') == 'OOMKilled':
            return True
    return False

def is_running(pod):
    """Check if pod is running with all containers ready."""
    if pod.get('status', {}).get('phase') != 'Running':
        return False

    statuses = pod.get('status', {}).get('containerStatuses', [])
    return all(s.get('ready', False) for s in statuses)

def send_incident(subject_id, incident_type, description):
    """Send incident.detected CDEvent."""
    event = {
        "context": {
            "version": "0.4.1",
            "type": "dev.cdevents.incident.detected.0.3.0",
            "source": "k8s://pod-monitor"
        },
        "subject": {
            "id": subject_id,
            "type": "service",
            "content": {
                "description": description
            }
        },
        "customData": {
            "incidentType": incident_type
        }
    }
    requests.post("http://cdviz-collector:8080/webhook/000-k8s-pods", json=event)

def send_resolution(subject_id, description):
    """Send incident.resolved CDEvent."""
    event = {
        "context": {
            "version": "0.4.1",
            "type": "dev.cdevents.incident.resolved.0.2.0",
            "source": "k8s://pod-monitor"
        },
        "subject": {
            "id": subject_id,
            "type": "service",
            "content": {
                "description": description
            }
        }
    }
    requests.post("http://cdviz-collector:8080/webhook/000-k8s-pods", json=event)
```

#### Option 2: Kubebuilder with Custom Logic (Go)

Similar pattern with Kubebuilder - watch Pods and implement incident detection logic.

### CDEvent Example: OOMKilled Incident

When a container is OOMKilled:

```json
{
  "context": {
    "version": "0.4.1",
    "id": "pod-monitor-oom-abc123",
    "source": "k8s://cluster/prod-us-1",
    "type": "dev.cdevents.incident.detected.0.3.0",
    "timestamp": "2025-11-27T14:23:10Z"
  },
  "subject": {
    "id": "production/payment-service",
    "source": "k8s://cluster/prod-us-1/production",
    "type": "service",
    "content": {
      "description": "Container 'payment-api' OOMKilled in pod 'payment-service-7d8f9c-abcd'",
      "ticketURI": "https://k8s.example.com/logs/production/payment-service-7d8f9c-abcd"
    }
  },
  "customData": {
    "severity": "critical",
    "incidentType": "oom",
    "podName": "payment-service-7d8f9c-abcd",
    "exitCode": 137
  }
}
```

## Deployment Best Practices

### Testing Controllers Locally

Before deploying to production, test controllers locally:

**Kubebuilder/client-go (Go):**

```bash
# Run controller locally pointing to cluster
export KUBECONFIG=~/.kube/config
go run main.go
```

**Kopf (Python):**

```bash
# Run Kopf operator locally
kopf run pod_monitor.py --verbose
```

### Container Deployment

Package controller as container image:

**Dockerfile (Python/Kopf):**

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY pod_monitor.py .
CMD ["kopf", "run", "pod_monitor.py"]
```

**Deploy with Kubernetes:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pod-lifecycle-monitor
  namespace: cdviz
spec:
  replicas: 1
  selector:
    matchLabels:
      app: pod-lifecycle-monitor
  template:
    metadata:
      labels:
        app: pod-lifecycle-monitor
    spec:
      serviceAccountName: pod-lifecycle-monitor
      containers:
        - name: monitor
          image: your-registry/pod-lifecycle-monitor:v1.0.0
          env:
            - name: CDVIZ_COLLECTOR_URL
              value: "http://cdviz-collector:8080/webhook/000-k8s-pods"
```

### High Availability

For production deployments:

- **Single replica recommended**: Kubernetes informers handle distributed caching, multiple replicas may send duplicate events
- **Leader election**: If you need multiple replicas, implement leader election (Kubebuilder supports this)
- **Graceful shutdown**: Handle SIGTERM to complete in-flight event sends

### Resource Limits

Set appropriate resource limits:

```yaml
resources:
  requests:
    memory: "64Mi"
    cpu: "100m"
  limits:
    memory: "128Mi"
    cpu: "200m"
```

Pod watchers can be resource-intensive in large clusters. Monitor memory usage and adjust.

## Filtering and Performance

### Namespace-Scoped vs. Cluster-Scoped

**Cluster-scoped (ClusterRole)**:
- Watches all namespaces
- Higher resource usage
- Single deployment for entire cluster

**Namespace-scoped (Role)**:
- Watches specific namespace
- Lower resource usage
- Deploy one controller per namespace

For pod monitoring, prefer cluster-scoped with namespace filtering in code.

### Label Selectors

Filter pods in code to reduce event volume:

```python
# Kopf with label filtering
@kopf.on.update('v1', 'pods', labels={'cdevents.monitor': 'true'})
def pod_lifecycle(old, new, **kwargs):
    # Only processes pods with label cdevents.monitor=true
    pass
```

### Event Deduplication

Avoid duplicate incident events:

```python
# Track incidents by subject ID
incident_cache = {}

def send_incident_once(subject_id, incident_type, description):
    """Send incident only if not already tracked."""
    cache_key = f"{subject_id}:{incident_type}"

    if cache_key in incident_cache:
        return  # Already sent this incident

    send_incident(subject_id, incident_type, description)
    incident_cache[cache_key] = True

def clear_incident(subject_id, incident_type):
    """Clear incident from cache when resolved."""
    cache_key = f"{subject_id}:{incident_type}"
    incident_cache.pop(cache_key, None)
```

## Comparison: Custom vs. Kubewatch

| Feature | Kubewatch | Custom Controller |
|---------|-----------|-------------------|
| **Deployment Monitoring** | Yes | Yes |
| **Pod Lifecycle** | Limited | Full control |
| **Incident Detection** | No | Yes |
| **Custom Logic** | No | Yes |
| **Condition-Based Events** | No | Yes |
| **Setup Complexity** | Low (Helm) | Medium (code + deploy) |
| **Maintenance** | Low | Medium |
| **Flexibility** | Low | High |
| **Best For** | Standard deployment tracking | Advanced incident detection |

**Recommendation**: Start with kubewatch (Episode #5). Build custom controllers only when you need incident detection or custom business logic.

## Key Takeaways

- **Custom controllers** enable advanced monitoring beyond kubewatch capabilities
- **Two main patterns**: Deployment watch (rollout tracking) and pod lifecycle (incident detection)
- **Framework options**: Kubebuilder (Go), Kopf (Python), or client-go for full control
- **Proper RBAC**: Read-only cluster access with appropriate namespace scoping
- **Testing first**: Develop locally before deploying to production
- **Performance matters**: Use label selectors and namespace filtering to control event volume

Custom controllers provide flexibility for specialized monitoring patterns. Combined with kubewatch for basic deployment tracking, you achieve comprehensive Kubernetes observability.

## Resources

### Controller Frameworks
- [Kubebuilder](https://book.kubebuilder.io/) - Go-based controller SDK with scaffolding
- [Operator SDK](https://sdk.operatorframework.io/) - Kubernetes Operator framework (Go, Ansible, Helm)
- [Kopf](https://kopf.readthedocs.io/) - Python Kubernetes operator framework
- [client-go](https://github.com/kubernetes/client-go) - Low-level Kubernetes Go client

### Example Implementations
- [cdviz-k8s-controller-example](https://github.com/cdviz-dev/examples/tree/main/k8s-controller) - Reference implementation with Kubebuilder
- [Kubernetes sample-controller](https://github.com/kubernetes/sample-controller) - Official Kubernetes controller example

### CDviz Documentation
- [Episode #5: Kubewatch Monitoring](./ep-5-kubernetes-monitoring-kubewatch) - Production-ready deployment monitoring
- [Webhook Source Configuration](https://cdviz.dev/docs/cdviz-collector/sources/webhook) - Configure collector webhook receivers
- [CDEvents Specification](https://cdevents.dev/) - CDEvents format reference

### Next Steps
- **Episode #7**: Learn high-volume event streaming with Vector for comprehensive cluster observability
