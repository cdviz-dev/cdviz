---
title: "CDEvents in Action #5: Kubernetes Native Monitoring with Kubewatch"
description: "Monitor all Kubernetes deployments automatically - kubectl, Helm, GitOps, or manual changes. Learn production-ready passive monitoring with kubewatch and CDviz."
tags:
  [
    "cdevents",
    "kubernetes",
    "k8s",
    "monitoring",
    "passive-monitoring",
    "kubewatch",
    "deployment",
  ]
target_audience: "Kubernetes Operators, Platform Engineers, DevOps Engineers"
reading_time: "8 minutes"
series: "CDEvents in Action"
series_part: 5
published: false
---

# CDEvents in Action #5: Kubernetes Native Monitoring with Kubewatch

_Monitor every Kubernetes deployment automatically - whether deployed via kubectl, Helm, ArgoCD, or manual changes. Learn production-ready passive monitoring without modifying pipelines._

## The Kubernetes Observability Gap

In [Episode #4](./20251020-episode-4-webhook-transformers), you learned passive monitoring using ArgoCD notifications. This works perfectly for GitOps deployments, but what about:

- **Non-ArgoCD deployments** using kubectl, Helm, or Kustomize directly
- **Manual changes** applied by operators during incidents
- **Legacy applications** not managed by GitOps
- **Multi-team environments** where some teams use GitOps and others don't
- **Complete deployment visibility** across all deployment methods

**The challenge**: ArgoCD only sees applications it manages. You need observability for **every** deployment in your cluster, regardless of how it was deployed.

**The solution**: Monitor Kubernetes resource changes directly using native watches. When any Deployment, StatefulSet, or DaemonSet changes, automatically generate CDEvents.

## ArgoCD vs. Native Kubernetes Monitoring

Understanding when each approach is appropriate:

**Episode #4: ArgoCD Notifications**
- Best for: GitOps-managed deployments
- Event trigger: ArgoCD sync operations
- Covers: Applications explicitly managed by ArgoCD
- Rich context: Git commits, authors, pull requests
- Limitation: Doesn't see manual kubectl/Helm deployments

**Episode #5: Native K8s Monitoring** (You are here)
- Best for: Any deployment method (kubectl, Helm, manual)
- Event trigger: Kubernetes resource changes in the cluster
- Covers: All deployments, regardless of deployment method
- Automatic discovery: Watches entire namespaces
- Limitation: Less application context (no git commit info by default)

**Key insight**: These approaches complement each other. Use ArgoCD notifications for GitOps-managed apps (rich git context), and native K8s monitoring for complete cluster-wide coverage.

## Prerequisites

Before you begin, ensure you have:

- **Running CDviz instance** with cdviz-collector accessible from your cluster
- **Kubernetes cluster** (v1.19+) with kubectl access
- **Helm 3** installed (for quick setup method)
- **Namespace permissions** to create ServiceAccounts and RBAC resources

## Kubewatch: Production-Ready Solution

[Kubewatch](https://github.com/robusta-dev/kubewatch) is a mature Kubernetes watcher that monitors resource changes and sends CloudEvents notifications. CDviz provides a ready-to-use integration with pre-built transformers.

### What Kubewatch Captures

Kubewatch watches Kubernetes resources and sends CloudEvents when changes occur:

- **Deployment created** → `service.deployed`
- **Deployment updated** → `service.deployed`, `service.upgraded`, or `service.removed` (based on change type)
- **Deployment deleted** → `service.removed`
- **StatefulSet/DaemonSet changes** → Same event types as Deployments

The CDviz transformer automatically converts these CloudEvents into standardized CDEvents.

### Quick Setup with Helm (Recommended)

The CDviz Helm chart can deploy both cdviz-collector and kubewatch together with pre-configured integration:

```bash
# Install cdviz-collector with integrated kubewatch
helm install cdviz-collector oci://ghcr.io/cdviz-dev/charts/cdviz-collector \
  --set kubewatch.enabled=true \
  --namespace cdviz \
  --create-namespace
```

This automatically:
- Deploys kubewatch configured to send CloudEvents to cdviz-collector
- Configures cdviz-collector with the kubewatch transformer from transformers-community
- Sets up proper RBAC (ServiceAccount, ClusterRole, ClusterRoleBinding)
- Configures network access between kubewatch and collector
- Starts generating CDEvents for Deployment/StatefulSet/DaemonSet changes

**Verify it's working:**

```bash
# Check kubewatch is running
kubectl get pods -n cdviz -l app=kubewatch

# View kubewatch logs
kubectl logs -n cdviz -l app=kubewatch --tail=50

# Trigger a test deployment
kubectl create deployment nginx --image=nginx -n default

# Check cdviz-collector received the event
kubectl logs -n cdviz -l app=cdviz-collector --tail=50 | grep "service.deployed"
```

You should see CDEvents appearing in your Grafana dashboards within seconds.

### Manual Configuration

If you prefer to configure components separately or customize the setup:

#### Step 1: Deploy Kubewatch

```bash
# Add kubewatch Helm repository
helm repo add robusta https://robusta-charts.storage.googleapis.com
helm repo update

# Install kubewatch
helm install kubewatch robusta/kubewatch \
  --namespace cdviz \
  --values kubewatch-values.yaml
```

**kubewatch-values.yaml:**

```yaml
# Which Kubernetes resources to watch
resourcesToWatch:
  deployment: true
  statefulset: true
  daemonset: true
  pod: false          # Too noisy, use Episode #6 for pod lifecycle
  service: false      # Usually not needed for deployment tracking
  replicaset: false   # Deployments provide this context

# Disable other notification channels
slack:
  enabled: false

webhook:
  enabled: false

# Enable CloudEvents mode (includes full resource manifest)
cloudevent:
  enabled: true
  url: "http://cdviz-collector.cdviz.svc.cluster.local:8080/webhook/000-kubewatch"
```

#### Step 2: Configure cdviz-collector

Add the kubewatch source and transformer to your cdviz-collector configuration:

```toml
# cdviz-collector.toml

# Load community transformers from GitHub
[remote.transformers-community]
type = "github"
owner = "cdviz-dev"
repo = "transformers-community"

# Kubewatch webhook source
[sources.kubewatch_webhook]
enabled = true
transformer_refs = ["kubewatch_cloudevents"]

[sources.kubewatch_webhook.extractor]
type = "webhook"
id = "000-kubewatch"

# Optional: Add environment context
[sources.kubewatch_webhook.extractor.metadata]
environment_id = "/production/us-west-2"  # Customize per cluster

# Use community transformer for kubewatch CloudEvents
[transformers.kubewatch_cloudevents]
type = "vrl"
template_rfile = "transformers-community:///kubewatch_cloudevents/transformer.vrl"
```

**Redeploy cdviz-collector:**

```bash
# Update ConfigMap with new configuration
kubectl create configmap cdviz-collector-config \
  --from-file=config.toml=cdviz-collector.toml \
  --namespace cdviz \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart collector to load new config
kubectl rollout restart deployment/cdviz-collector -n cdviz
```

### CDEvent Examples

When you deploy a new application:

```bash
kubectl create deployment payment-api --image=payment-api:v2.1.0 -n production
```

Kubewatch sends a CloudEvent to cdviz-collector, which transforms it to:

```json
{
  "context": {
    "version": "0.4.1",
    "id": "kubewatch-deployment-payment-api-created-abc123",
    "source": "https://k8s.cluster.local/production",
    "type": "dev.cdevents.service.deployed.0.2.0",
    "timestamp": "2025-11-27T10:30:45Z"
  },
  "subject": {
    "id": "production/payment-api",
    "source": "https://k8s.cluster.local/production",
    "type": "service",
    "content": {
      "environment": {
        "id": "production",
        "source": "https://k8s.cluster.local/production"
      },
      "artifactId": "payment-api:v2.1.0"
    }
  }
}
```

When you update the deployment:

```bash
kubectl set image deployment/payment-api payment-api=payment-api:v2.2.0 -n production
```

You receive a `service.upgraded` event with the new artifact version.

## What You Get

**Deployment method agnostic**: Captures changes regardless of deployment tool:
- `kubectl apply -f deployment.yaml`
- `helm install myapp ./chart`
- `kustomize build | kubectl apply -f -`
- ArgoCD syncs (duplicates ArgoCD notifications, can filter)
- Manual `kubectl edit deployment/myapp`

**Automatic discovery**: No per-application configuration needed. Watch entire namespaces with label selectors for filtering.

**Rollout tracking**: Captures deployment creation, updates, and deletion as separate CDEvents.

**Environment mapping**: Namespace automatically maps to environment context in CDEvents.

**Image tracking**: Container image becomes `artifactId` in CDEvents for version tracking.

## Filtering and Namespaces

Control event volume by filtering what kubewatch monitors.

### Namespace Filtering

Watch only specific namespaces:

```yaml
# kubewatch-values.yaml
namespaceToWatch: "production,staging"  # Comma-separated list
```

Or watch all namespaces except system ones (default behavior):

```yaml
# Kubewatch excludes kube-system and kube-public by default
# To watch ALL namespaces including system namespaces:
namespaceToWatch: ""  # Empty string = all namespaces
```

### Label-Based Filtering

Kubewatch doesn't support label selectors directly, but you can filter in the transformer:

```toml
# cdviz-collector.toml - Filter in transformer
[transformers.kubewatch_filter]
type = "vrl"
source = '''
  # Only process deployments with the cdevents.enabled label
  labels = .involvedObject.labels ?? {}
  if !exists(labels."cdevents.enabled") {
    abort  # Skip this event
  }
'''

[sources.kubewatch_webhook]
transformer_refs = ["kubewatch_filter", "kubewatch_cloudevents"]
```

Then label your deployments:

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-api
  labels:
    cdevents.enabled: "true"  # Opt-in to monitoring
```

### Avoiding Duplication with ArgoCD

If you use both ArgoCD notifications (Episode #4) and kubewatch, you'll get duplicate events for ArgoCD-managed apps.

**Solution 1**: Filter kubewatch to exclude ArgoCD-managed apps:

```toml
# cdviz-collector.toml
[transformers.exclude_argocd]
type = "vrl"
source = '''
  # Skip deployments managed by ArgoCD
  labels = .involvedObject.labels ?? {}
  if labels."app.kubernetes.io/instance" != null {
    abort  # Likely ArgoCD-managed
  }
'''

[sources.kubewatch_webhook]
transformer_refs = ["exclude_argocd", "kubewatch_cloudevents"]
```

**Solution 2**: Use different namespaces - ArgoCD in some, kubewatch in others.

## Security and RBAC

Kubewatch requires read-only cluster access to watch resources.

### RBAC Permissions

The Helm chart automatically creates appropriate RBAC. If deploying manually, kubewatch needs:

```yaml
# kubewatch-rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: kubewatch
  namespace: cdviz
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: kubewatch
rules:
  # Read-only access to watched resources
  - apiGroups: ["apps"]
    resources: ["deployments", "statefulsets", "daemonsets"]
    verbs: ["get", "list", "watch"]

  # Read events for additional context
  - apiGroups: [""]
    resources: ["events"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: kubewatch
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: kubewatch
subjects:
  - kind: ServiceAccount
    name: kubewatch
    namespace: cdviz
```

**Security note**: Kubewatch has read-only access and cannot modify cluster resources.

### Network Security

**Authentication**: Kubewatch sends CloudEvents without authentication headers by default.

**Recommended deployment**:
- Deploy cdviz-collector in the same namespace as kubewatch
- Use Kubernetes Service DNS for communication
- Apply NetworkPolicies to restrict egress

**NetworkPolicy example:**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: kubewatch-egress
  namespace: cdviz
spec:
  podSelector:
    matchLabels:
      app: kubewatch
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

## Troubleshooting

### Events Not Appearing

**Check kubewatch is running:**

```bash
kubectl get pods -n cdviz -l app=kubewatch
kubectl logs -n cdviz -l app=kubewatch
```

**Common issues:**
- RBAC permissions missing (check ClusterRoleBinding)
- Network connectivity to cdviz-collector (check NetworkPolicies)
- Wrong webhook URL in kubewatch config
- Namespace filtering excluding your test namespace

**Test webhook manually:**

```bash
# Port-forward to cdviz-collector
kubectl port-forward -n cdviz svc/cdviz-collector 8080:8080

# Send test CloudEvent (from another terminal)
curl -X POST http://localhost:8080/webhook/000-kubewatch \
  -H "Content-Type: application/cloudevents+json" \
  -d '{
    "specversion": "1.0",
    "type": "dev.cdevents.test",
    "source": "test",
    "id": "test-123",
    "data": {}
  }'
```

### High Event Volume

**Problem**: Too many events flooding cdviz-collector.

**Solutions:**
1. Use namespace filtering (watch only production/staging)
2. Disable pod/service watching (only watch deployments)
3. Add label-based filtering in transformer
4. Use CDviz automatic deduplication (identical events share same CID)

### Duplicate Events

**Problem**: Same deployment creates multiple CDEvents.

**Explanation**: Kubernetes may update a Deployment multiple times during rollout (progressing → available). Kubewatch sends an event for each update.

**Solutions:**
1. **Use CDviz deduplication**: Events with identical content automatically share the same content ID
2. **Filter in transformer**: Only send events when specific conditions change (e.g., image version)
3. **Accept duplicates**: In some cases, tracking rollout progress requires multiple events

## Key Takeaways

- **Complete coverage**: Native Kubernetes monitoring captures all deployments (kubectl, Helm, GitOps, manual)
- **Production-ready**: Kubewatch + CDviz provides turnkey integration with Helm chart
- **Complements ArgoCD**: Use ArgoCD notifications for GitOps apps, kubewatch for everything else
- **Minimal configuration**: Single Helm install starts capturing deployment events cluster-wide
- **Security**: Read-only RBAC, namespace isolation, NetworkPolicy support
- **Filtering**: Control event volume with namespace and label filtering

Native Kubernetes monitoring provides deployment-agnostic observability. Combined with ArgoCD notifications (Episode #4), you achieve complete coverage across all deployment methods.

## Resources

### CDviz Documentation
- [Kubewatch Integration Guide](https://cdviz.dev/docs/cdviz-collector/integrations/kubewatch) - Complete setup details
- [Transformer VRL Guide](https://cdviz.dev/docs/cdviz-collector/transformers) - Customize transformation logic
- [Webhook Source Configuration](https://cdviz.dev/docs/cdviz-collector/sources/webhook) - Configure webhook receivers
- [Episode #4: Webhook Transformers](./20251020-episode-4-webhook-transformers) - ArgoCD passive monitoring

### Kubewatch Resources
- [Kubewatch GitHub Repository](https://github.com/robusta-dev/kubewatch) - Official kubewatch project
- [Kubewatch Helm Chart](https://github.com/robusta-dev/kubewatch/tree/master/charts/kubewatch) - Helm deployment options
- [CloudEvents Specification](https://cloudevents.io/) - CloudEvents format reference

### Next Steps
- **Episode #6**: Learn to build custom Kubernetes controllers for specialized monitoring patterns
- **Episode #7**: Implement high-volume event streaming with Vector for comprehensive cluster observability
