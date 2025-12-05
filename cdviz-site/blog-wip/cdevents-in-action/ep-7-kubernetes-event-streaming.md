---
title: "CDEvents in Action #7: Kubernetes Event Streaming at Scale"
description: "Stream all Kubernetes events with Vector for comprehensive cluster observability. Learn high-volume filtering, multi-cluster architecture, and VRL transformations."
tags:
  [
    "cdevents",
    "kubernetes",
    "k8s",
    "event-streaming",
    "vector",
    "observability",
    "scale",
  ]
target_audience: "Platform Engineers, SREs, Observability Engineers"
reading_time: "10 minutes"
series: "CDEvents in Action"
series_part: 7
published: false
---

# CDEvents in Action #7: Kubernetes Event Streaming at Scale

_Stream all Kubernetes events with Vector for comprehensive cluster observability. Learn to capture scheduling, probing, scaling, and configuration events across multi-cluster environments._

## When Event Streaming Makes Sense

Previous episodes covered specific monitoring patterns:
- [Episode #5](./ep-5-kubernetes-monitoring-kubewatch): Deployment monitoring with kubewatch
- [Episode #6](./ep-6-kubernetes-custom-controllers): Custom controllers for incident detection

These approaches target **specific resource types** (Deployments, Pods). Sometimes you need **everything**:

**Use event streaming when:**
- **Comprehensive audit trail**: Compliance requires capturing all cluster activity
- **Multi-resource correlation**: Link scheduling events with deployments, scaling with load
- **Operational investigation**: SREs need full cluster event history for troubleshooting
- **Capacity planning**: Analyze scheduling failures, resource constraints, node operations
- **Multi-cluster aggregation**: Central event store for multiple Kubernetes clusters

**Don't use event streaming when:**
- You only need deployment tracking (use kubewatch - Episode #5)
- You only need incident detection (use custom controller - Episode #6)
- Event volume exceeds processing capacity (filter first, stream second)

## What Kubernetes Events Provide

Kubernetes emits [native events](https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/) for cluster operations:

**Scheduling events:**
- Pod scheduled to node
- Pod preempted by higher priority pod
- Failed to schedule (insufficient resources)

**Container lifecycle:**
- Image pulling, pulled, pull failed
- Container started, killed, failed to start

**Health probes:**
- Liveness probe failed
- Readiness probe failed
- Startup probe failed

**Scaling operations:**
- Scaled up/down by HPA
- Manual scaling operations

**Configuration changes:**
- ConfigMap mounted
- Secret mounted
- Volume binding

These events are **ephemeral** (stored 1 hour by default) and **unstructured**. Event streaming captures them permanently in CDEvents format.

## Architecture: Vector Event Pipeline

[Vector](https://vector.dev/) is a high-performance observability data pipeline that can watch Kubernetes events and transform them.

```
┌─────────────────────────────────────┐
│ Kubernetes API Server                │
│ └─ /api/v1/events?watch=true         │
└────────────┬────────────────────────┘
             │ Event stream
             ↓
┌─────────────────────────────────────┐
│ Vector (Event Processor)             │
│ ├─ Source: Kubernetes events         │
│ ├─ Transform: Filter & VRL mapping   │
│ └─ Sink: HTTP to cdviz-collector     │
└────────────┬────────────────────────┘
             │ CDEvents
             ↓
┌─────────────────────────────────────┐
│ cdviz-collector                      │
│ └─ Stores in database                │
└─────────────────────────────────────┘
```

**Why Vector:**
- Native Kubernetes event watching
- Powerful VRL (Vector Remap Language) transformation
- High throughput with low resource usage
- Production-grade reliability and observability
- Multi-source aggregation (multiple clusters → single pipeline)

## Prerequisites

- **Kubernetes cluster** with kubectl access
- **CDviz collector** running and accessible
- **Helm 3** for Vector installation
- **Understanding of VRL** (Vector Remap Language) - see [VRL documentation](https://vector.dev/docs/reference/vrl/)

## Vector Configuration

### Installation

Deploy Vector using Helm:

```bash
# Add Vector Helm repository
helm repo add vector https://helm.vector.dev
helm repo update

# Install Vector
helm install vector vector/vector \
  --namespace cdviz \
  --values vector-values.yaml
```

### Basic Configuration

<details>
<summary><strong>vector-values.yaml - Click to expand full configuration</strong></summary>

```yaml
# vector-values.yaml
role: "Agent"

# Deploy as DaemonSet to access node-level events
# Or use Deployment with single replica for cluster-wide events
podType: "Deployment"
replicas: 1

# RBAC for watching events
rbac:
  create: true

customConfig:
  data_dir: /vector-data-dir

  # Source: Watch Kubernetes events
  sources:
    kubernetes_events:
      type: kubernetes_logs
      # Use kubernetes_events source type for native event watching
      namespace_annotation_fields:
        namespace: "namespace"

      # Watch only Event objects
      extra_field_selector: "involvedObject.kind!=Event"

  # Transform: Filter and convert to CDEvents
  transforms:
    # Filter 1: Only relevant event types
    filter_events:
      type: filter
      inputs:
        - kubernetes_events
      condition:
        type: vrl
        source: |
          # Only process specific event reasons
          .reason == "Scheduled" ||
          .reason == "FailedScheduling" ||
          .reason == "Pulling" ||
          .reason == "Pulled" ||
          .reason == "Failed" ||
          .reason == "BackOff" ||
          .reason == "Unhealthy" ||
          .reason == "Started" ||
          .reason == "Killing" ||
          .reason == "ScalingReplicaSet"

    # Transform to CDEvents format
    to_cdevents:
      type: remap
      inputs:
        - filter_events
      source: |
        # Determine CDEvent type based on Kubernetes event reason
        event_type = if .reason == "Scheduled" || .reason == "Started" || .reason == "Pulled" {
          "dev.cdevents.service.deployed.0.2.0"
        } else if .reason == "ScalingReplicaSet" {
          "dev.cdevents.service.upgraded.0.2.0"
        } else if .reason == "Failed" || .reason == "BackOff" || .reason == "Unhealthy" || .reason == "FailedScheduling" {
          "dev.cdevents.incident.detected.0.3.0"
        } else {
          "dev.cdevents.other.0.1.0"
        }

        # Build subject ID from involved object
        subject_id = join!([.involvedObject.namespace, .involvedObject.name], "/")

        # Map to CDEvents structure
        . = {
          "context": {
            "version": "0.4.1",
            "id": uuid_v4(),
            "source": "k8s://events/" + (.involvedObject.namespace ?? "default"),
            "type": event_type,
            "timestamp": .metadata.creationTimestamp
          },
          "subject": {
            "id": subject_id,
            "source": "k8s://events/" + (.involvedObject.namespace ?? "default"),
            "type": "service",
            "content": {
              "description": .message,
              "environment": {
                "id": .involvedObject.namespace ?? "default"
              }
            }
          },
          "customData": {
            "reason": .reason,
            "involvedObjectKind": .involvedObject.kind,
            "component": .source.component,
            "count": .count
          }
        }

  # Sink: Send CDEvents to collector
  sinks:
    cdviz_collector:
      type: http
      inputs:
        - to_cdevents
      uri: "http://cdviz-collector.cdviz.svc.cluster.local:8080/webhook/000-k8s-events"
      encoding:
        codec: json
      batch:
        max_events: 10
        timeout_secs: 5

# Resource limits for production
resources:
  requests:
    memory: "256Mi"
    cpu: "200m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

</details>

### Advanced Filtering

Control event volume with sophisticated filtering:

<details>
<summary><strong>Advanced filtering examples - Click to expand</strong></summary>

```toml
# In Vector config: transforms.filter_events.condition.source

# Filter by namespace (only production/staging)
.involvedObject.namespace == "production" || .involvedObject.namespace == "staging"

# Filter by event type (failures only)
.type == "Warning"

# Filter by involved object kind (only Pods and Deployments)
.involvedObject.kind == "Pod" || .involvedObject.kind == "Deployment"

# Complex condition: Critical events only
(
  .type == "Warning" &&
  .involvedObject.namespace == "production" &&
  (
    .reason == "Failed" ||
    .reason == "BackOff" ||
    .reason == "OOMKilling" ||
    .reason == "FailedScheduling"
  )
)

# Exclude noisy events
.reason != "Pulled" &&
.reason != "Scheduled" &&
.count < 10  # Ignore events repeated more than 10 times
```

</details>

### VRL Transformation Examples

Vector uses VRL (Vector Remap Language) for powerful transformations:

<details>
<summary><strong>VRL transformation patterns - Click to expand</strong></summary>

**Extract image version from pod events:**

```vrl
# Add artifact information for container events
if .involvedObject.kind == "Pod" {
  # Parse pod spec to extract image
  pod_spec = parse_json!(.involvedObject.spec)
  image = pod_spec.containers[0].image

  .subject.content.artifactId = image
}
```

**Severity mapping:**

```vrl
# Map Kubernetes event type to severity
severity = if .type == "Warning" {
  "high"
} else if .reason == "OOMKilling" || .reason == "FailedScheduling" {
  "critical"
} else {
  "medium"
}

.customData.severity = severity
```

**Event aggregation:**

```vrl
# For repeated events (count > 1), add aggregation info
if .count > 1 {
  .customData.aggregated = true
  .customData.occurrences = .count
  .subject.content.description = .subject.content.description + " (occurred " + to_string(.count) + " times)"
}
```

**Namespace to environment mapping:**

```vrl
# Map namespace to environment with fallback
environment = if .involvedObject.namespace == "production" {
  "production/us-west-2"
} else if .involvedObject.namespace == "staging" {
  "staging/us-west-2"
} else {
  .involvedObject.namespace
}

.subject.content.environment.id = environment
```

</details>

## Multi-Cluster Event Streaming

Vector can aggregate events from multiple Kubernetes clusters into a single CDviz instance.

### Architecture

```
┌──────────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│ Cluster A (US-West)  │       │ Cluster B (EU-West)  │       │ Cluster C (AP-South) │
│ └─ Vector Agent      │       │ └─ Vector Agent      │       │ └─ Vector Agent      │
└──────────┬───────────┘       └──────────┬───────────┘       └──────────┬───────────┘
           │ CDEvents                      │ CDEvents                      │ CDEvents
           │                               │                               │
           └───────────────────────────────┴───────────────────────────────┘
                                           │
                                           ↓
                              ┌────────────────────────┐
                              │ Vector Aggregator       │
                              │ (Optional - for routing)│
                              └────────────┬───────────┘
                                           │
                                           ↓
                              ┌────────────────────────┐
                              │ cdviz-collector         │
                              │ (Central instance)      │
                              └────────────────────────┘
```

### Per-Cluster Vector Configuration

Tag events with cluster identifier:

```yaml
# vector-values.yaml for Cluster A (US-West)
customConfig:
  transforms:
    to_cdevents:
      source: |
        # ... CDEvent mapping ...

        # Add cluster identifier
        .context.source = "k8s://us-west-2/" + (.involvedObject.namespace ?? "default")
        .customData.cluster = "us-west-2"
        .customData.region = "us-west-2"

  sinks:
    cdviz_collector:
      uri: "https://cdviz-collector.example.com/webhook/000-k8s-events-us-west-2"
```

### Aggregator Pattern (Optional)

For complex routing or preprocessing, deploy a central Vector aggregator:

```yaml
# vector-aggregator-values.yaml
role: "Aggregator"

customConfig:
  # Receive events from multiple clusters
  sources:
    cluster_us_west:
      type: http
      address: "0.0.0.0:8080"
      decoding:
        codec: json

    cluster_eu_west:
      type: http
      address: "0.0.0.0:8081"
      decoding:
        codec: json

  # Optional: Add aggregator-level transformations
  transforms:
    enrich_metadata:
      type: remap
      inputs:
        - cluster_us_west
        - cluster_eu_west
      source: |
        # Add aggregator timestamp
        .customData.aggregator_timestamp = now()

  # Forward to single collector
  sinks:
    unified_collector:
      type: http
      inputs:
        - enrich_metadata
      uri: "http://cdviz-collector:8080/webhook/000-k8s-events"
```

## Performance and Scaling

### Resource Sizing

**Small cluster** (< 100 nodes):
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "200m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

**Large cluster** (100-500 nodes):
```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

### Batching Configuration

Optimize throughput with batching:

```yaml
sinks:
  cdviz_collector:
    batch:
      max_events: 50        # Send up to 50 events per request
      timeout_secs: 10      # Or send after 10 seconds
    request:
      retry_attempts: 5
      timeout_secs: 30
```

### Event Volume Estimation

Estimate event volume to size resources:

- **Average cluster**: 100-500 events/minute
- **Busy cluster**: 500-2000 events/minute
- **Very large cluster**: 2000-10000 events/minute

**Filter aggressively** in high-volume environments. Use sampling for non-critical events:

```vrl
# Sample 10% of "Pulled" events (too frequent)
if .reason == "Pulled" {
  random_number = random_int(0, 100)
  if random_number > 10 {
    abort  # Drop 90% of these events
  }
}
```

## Combining All Monitoring Approaches

The most effective observability strategy uses all episodes together:

| Approach | Coverage | Event Volume | Use Case |
|----------|----------|--------------|----------|
| **Episode #4: ArgoCD** | GitOps apps | Low | Git commit tracking |
| **Episode #5: Kubewatch** | All deployments | Low | Deployment tracking |
| **Episode #6: Custom Controllers** | Specific patterns | Medium | Incident detection |
| **Episode #7: Event Streaming** | All cluster events | High | Audit & investigation |

**Recommended architecture for production:**

1. **ArgoCD notifications** → CDEvents for GitOps-managed applications (rich git context)
2. **Kubewatch** → CDEvents for non-GitOps deployments (kubectl, Helm)
3. **Custom pod controller** → CDEvents for incident detection (crashes, OOM)
4. **Vector event streaming** → CDEvents for comprehensive audit trail (optional)

**Result**: Complete observability across deployment methods, incident detection, and cluster operations.

## Troubleshooting

### High Memory Usage

**Symptom**: Vector pod OOMKilled or high memory consumption.

**Solutions:**
- Reduce `batch.max_events` in sink configuration
- Add more aggressive filtering (fewer event types)
- Increase memory limits
- Sample high-frequency events

### Missing Events

**Symptom**: Expected events not appearing in CDviz.

**Debug steps:**

```bash
# Check Vector logs
kubectl logs -n cdviz deployment/vector --tail=100

# Check Vector metrics (if enabled)
kubectl port-forward -n cdviz svc/vector 9090:9090
curl http://localhost:9090/metrics | grep vector_events

# Test VRL transformation locally
vector vrl --input test-event.json --program transform.vrl
```

### CDviz Collector Overload

**Symptom**: Collector slow or dropping events.

**Solutions:**
- Increase collector replicas
- Add batching in Vector sink
- Filter more aggressively in Vector
- Use Vector aggregator for rate limiting

## Key Takeaways

- **Event streaming** provides comprehensive cluster observability for audit and investigation
- **Vector** offers production-grade event processing with powerful VRL transformations
- **Filter aggressively** to control event volume in high-throughput environments
- **Multi-cluster aggregation** centralizes observability across infrastructure
- **Combine approaches**: Use kubewatch for deployments, custom controllers for incidents, and Vector for comprehensive coverage
- **Start small**: Deploy with strict filtering, expand coverage as needed

Event streaming completes your Kubernetes observability stack, providing the comprehensive audit trail needed for compliance and deep operational investigation.

## Resources

### Vector Documentation
- [Vector Kubernetes Integration](https://vector.dev/docs/reference/configuration/sources/kubernetes_logs/) - Official Kubernetes source
- [VRL Reference](https://vector.dev/docs/reference/vrl/) - Vector Remap Language documentation
- [Vector Configuration](https://vector.dev/docs/reference/configuration/) - Complete configuration reference

### CDviz Documentation
- [Episode #5: Kubewatch Monitoring](./ep-5-kubernetes-monitoring-kubewatch) - Production deployment tracking
- [Episode #6: Custom Controllers](./ep-6-kubernetes-custom-controllers) - Advanced incident detection
- [Webhook Source](https://cdviz.dev/docs/cdviz-collector/sources/webhook) - Collector webhook configuration

### Kubernetes References
- [Kubernetes Events API](https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/) - Native event structure
- [Event Types and Reasons](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_events/) - Common Kubernetes events

### Example Configurations
- [Vector CDEvents Templates](https://github.com/cdviz-dev/examples/tree/main/vector-k8s-events) - Production-ready Vector configurations
