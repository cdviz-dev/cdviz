---
title: "CDEvents in Action #4: Webhook Transformers and Passive Monitoring"
description: "Collect CDEvents from tools that already send webhooks - GitHub, GitLab, ArgoCD - without modifying pipelines. Transform platform events into CDEvents automatically."
tags:
  [
    "cdevents",
    "devops",
    "webhooks",
    "github",
    "gitlab",
    "argocd",
    "transformers",
    "passive-monitoring",
  ]
target_audience: "Platform Engineers, DevOps Architects"
reading_time: "12 minutes"
series: "CDEvents in Action"
series_part: 4
published: false
---

# CDEvents in Action #4: Webhook Transformers and Passive Monitoring

_Stop modifying every pipeline. Learn how to collect CDEvents from platforms that already send webhooks - GitHub, GitLab, ArgoCD - by transforming their native events automatically._

## From Active to Passive Monitoring

In [Episode #3](./20251007-episode-3-cicd-integration), you learned **active integration** - modifying pipelines to send CDEvents directly. This works great for new services, but what about:

- **100+ existing repositories** you don't want to touch
- **Legacy pipelines** that are fragile and risky to modify
- **Third-party tools** (ArgoCD, GitHub Actions) that already send events
- **Compliance requirements** demanding complete observability without pipeline changes
- **Multiple platforms** (GitHub + GitLab + Jenkins) creating integration fatigue

The solution: **Passive monitoring** using webhook transformers. Instead of changing pipelines, you configure platforms to send their native webhooks to cdviz-collector, which transforms them into CDEvents automatically.

## Active vs. Passive Integration

Understanding the difference between the two approaches:

```
Episode #3 (Active Integration)
├─ Modify each pipeline to send CDEvents
├─ Direct control over event content
├─ Requires touching every pipeline
└─ Best for: New services, custom events

Episode #4 (Passive Integration) ← You are here
├─ Configure webhook once per platform
├─ Automatic transformation of platform events
├─ No pipeline modifications required
└─ Best for: Existing services, standard platform events
```

**Key insight**: These approaches complement each other. Use passive integration for broad coverage, add active integration for custom events.

## Three Webhook Integration Patterns

Learn how to transform native platform events into CDEvents:

| Platform   | Webhook Type           | CDEvents Generated                         | Setup Complexity |
| ---------- | ---------------------- | ------------------------------------------ | ---------------- |
| **GitHub** | Repository webhooks    | Pipeline, task, artifact, issue, PR events | Low              |
| **GitLab** | Project/group webhooks | Pipeline, job, artifact, issue, MR events  | Low              |
| **ArgoCD** | Notifications webhooks | Deployment, incident, removal events       | Medium           |

### Platform Comparison

| Feature             | GitHub                                 | GitLab                                 | ArgoCD                                      |
| ------------------- | -------------------------------------- | -------------------------------------- | ------------------------------------------- |
| **Event Coverage**  | Workflows, jobs, releases, issues, PRs | Pipelines, jobs, releases, issues, MRs | Sync operations, health status, deployments |
| **Authentication**  | HMAC-SHA256 signature                  | Token header                           | Network isolation or Authorization header   |
| **Transformer**     | Community (VRL)                        | Pro (VRL)                              | Community (VRL)                             |
| **Configuration**   | Repository or Organization webhook     | Project or Group webhook               | Notifications ConfigMap                     |
| **CDEvents Output** | 10+ event types                        | 10+ event types                        | 4+ event types                              |

## Pattern 1: GitHub Webhook Integration

Collect GitHub repository events and transform them into CDEvents automatically - workflows, jobs, releases, PRs, issues, and branches all generate CDEvents without touching your pipelines.

### Quick Overview

GitHub webhooks automatically notify cdviz-collector about repository activity:

- **Workflows & Jobs** → `pipelineRun.*` and `taskRun.*` events
- **Releases & Packages** → `artifact.published` events
- **Pull Requests** → `change.*` events
- **Issues** → `ticket.*` events
- **Branches** → `branch.created/deleted` events

**🔗 [Complete event mapping and setup guide](https://cdviz.dev/docs/cdviz-collector/integrations/github.html)**

### Minimal Configuration

**cdviz-collector side** (`cdviz-collector.toml`):

```toml
[remote.transformers-community]
type = "github"
owner = "cdviz-dev"
repo = "transformers-community"

[sources.github_webhook]
enabled = true
transformer_refs = ["github_events"]

[sources.github_webhook.extractor]
type = "webhook"
id = "000-github"

# Verify GitHub signature (HMAC-SHA256)
[sources.github_webhook.extractor.headers.x-hub-signature-256]
type = "signature"
signature_encoding = "hex"
signature_on = "body"
signature_prefix = "sha256="
token = "your-webhook-secret-here"

[transformers.github_events]
type = "vrl"
template_rfile = "transformers-community:///github_events/transformer.vrl"
```

**GitHub side**: Create webhook at organization or repository level

- **Payload URL**: `https://your-collector.example.com/webhook/000-github`
- **Secret**: Same token as collector configuration
- **Events**: Workflow runs, jobs, releases, PRs, issues

**🔗 [Detailed GitHub webhook setup instructions](https://cdviz.dev/docs/cdviz-collector/integrations/github.html#setting-up-github-webhook)**

### What You Get

- ✅ **Organization-wide coverage**: Configure once, all repositories tracked
- ✅ **Zero pipeline changes**: Automatic event generation
- ✅ **Complete lifecycle**: Queued → started → finished events
- ✅ **Secure**: HMAC-SHA256 signature verification

**💡 Tip**: For custom deployment context, combine with [GitHub Action integration](https://cdviz.dev/docs/cdviz-collector/integrations/github-action.html) from Episode #3.

## Pattern 2: GitLab Webhook Integration

Collect GitLab project events and transform them into CDEvents automatically - pipelines, jobs, releases, MRs, issues, and branches all generate CDEvents without touching your pipelines.

### Quick Overview

GitLab webhooks automatically notify cdviz-collector about project activity:

- **Pipelines & Jobs** → `pipelineRun.*` and `taskRun.*` events
- **Releases & Tags** → `artifact.published` events
- **Merge Requests** → `change.*` events (created, merged, abandoned, reviewed)
- **Issues** → `ticket.*` events
- **Branches** → `branch.created/deleted` events

**🔗 [Complete event mapping and setup guide](https://cdviz.dev/docs/cdviz-collector/integrations/gitlab.html)**

### Minimal Configuration

**cdviz-collector side** (`cdviz-collector.toml`):

```toml
[remote.transformers-pro]
type = "github"
owner = "cdviz-dev"
repo = "transformers-pro"

[sources.gitlab_webhook]
enabled = true
transformer_refs = ["gitlab_events"]

[sources.gitlab_webhook.extractor]
type = "webhook"
id = "000-gitlab"
headers_to_keep = ["X-Gitlab-Event"]

# Verify GitLab token
[[sources.gitlab_webhook.extractor.headers]]
header = "X-Gitlab-Token"

[sources.gitlab_webhook.extractor.headers.rule]
type = "equals"
value = "your-secret-token-here"
case_sensitive = true

[transformers.gitlab_events]
type = "vrl"
template_rfile = "transformers-pro:///gitlab_events/transformer.vrl"
```

> [!NOTE]
> GitLab transformer is part of the **Pro plan**. See [CDviz Plans](https://cdviz.dev/).

**GitLab side**: Create a webhook at the group or project level

- **URL**: `https://your-collector.example.com/webhook/000-gitlab`
- **Secret token**: Same token as collector configuration
- **Trigger events**: Pipeline, job, release, MR, issue events

**🔗 [Detailed GitLab webhook setup instructions](https://cdviz.dev/docs/cdviz-collector/integrations/gitlab.html#setting-up-gitlab-webhook)**

### What You Get

- ✅ **Group-wide coverage**: Configure once, all projects tracked
- ✅ **Zero pipeline changes**: Automatic event generation
- ✅ **Complete lifecycle**: Queued → started → finished events
- ✅ **Secure**: Token-based authentication

**💡 Tip**: For Kubernetes deployment details, combine with ArgoCD integration (Pattern 3).

## Pattern 3: ArgoCD Webhook Integration

Collect ArgoCD application lifecycle events and transform them into CDEvents automatically.

### What Events ArgoCD Sends

ArgoCD notifications webhook can send:

- **Sync succeeded + healthy** → `service.deployed`
- **Sync failed/error** → `incident.detected`
- **Health degraded** → `incident.detected`
- **App deleted** → `service.removed`

**Complete mapping**: See [ArgoCD Integration documentation](https://cdviz.dev/docs/cdviz-collector/integrations/argocd.html)

### Configuration: cdviz-collector Side

Create a webhook source that receives and transforms ArgoCD events:

```toml
# cdviz-collector.toml

# Remote transformers repository configuration
[remote.transformers-community]
type = "github"
owner = "cdviz-dev"
repo = "transformers-community"

[sources.argocd_webhook]
enabled = true
transformer_refs = ["argocd_notifications"]

[sources.argocd_webhook.extractor]
type = "webhook"
id = "000-argocd"
headers_to_keep = []

# Optional: Verify Authorization header (when using external endpoints)
# [sources.argocd_webhook.extractor.headers.authorization]
# type = "secret"
# value = "Bearer your-secret-token-here"

# Optional: Inject environment metadata from ArgoCD destination
[sources.argocd_webhook.extractor.metadata]
environment_id = "/production/eu-1"

# Transformer from transformers-community repository
[transformers.argocd_notifications]
type = "vrl"
template_rfile = "transformers-community:///argocd_notifications/transformer.vrl"
```

**What this does**:

- ✅ Receives ArgoCD webhooks at `http://your-collector/webhook/000-argocd`
- ✅ Verifies authenticity using Authorization header
- ✅ Transforms ArgoCD notifications into CDEvents using VRL transformer
- ✅ Generates per-container `service.deployed` events automatically
- ✅ Routes CDEvents to configured sinks

### Configuration: ArgoCD Side

Configure ArgoCD notifications to send webhooks:

#### Step 1: Create Webhook Service

Edit the `argocd-notifications-cm` ConfigMap:

```bash
kubectl edit configmap argocd-notifications-cm -n argocd
```

Add webhook service configuration with authentication:

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
    - name: Authorization
      value: "Bearer your-secret-token-here"
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

### Testing the Integration

Trigger an ArgoCD sync operation:

```bash
# Sync application manually
argocd app sync my-app

# Or push a change that triggers automatic sync
git commit -m "Update deployment" && git push
```

**Expected CDEvents**:

1. `service.deployed` - One event per container when sync succeeds and app is healthy
2. `incident.detected` - If sync fails or health degrades
3. `service.removed` - If application is deleted

### What You Get Without Pipeline Changes

- ✅ **Deployment visibility**: Automatic `service.deployed` events for all ArgoCD apps
- ✅ **Per-container events**: Separate events for each container in the deployment
- ✅ **Incident detection**: Automatic `incident.detected` for sync failures and health issues
- ✅ **PURL generation**: Correct Package URL (PURL) for Helm charts, Git repos, OCI images
- ✅ **GitOps correlation**: Links deployments to source commits automatically

**Advantage**: ArgoCD is the deployment source of truth. Events reflect actual Kubernetes state, not just CI/CD pipeline intent.

## Combining Active and Passive Integration

The most powerful observability strategy combines both approaches:

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────┐
│ GitHub/GitLab Webhooks (Passive)                        │
│ ├─ All workflows/pipelines → pipelineRun.* events       │
│ ├─ All jobs → taskRun.* events                          │
│ └─ Releases, PRs, issues → artifact.*, change.*, ...    │
└─────────────────────────────────────────────────────────┘
           ↓ Broad coverage, zero pipeline changes
┌─────────────────────────────────────────────────────────┐
│ GitHub Actions/GitLab CI Integration (Active)           │
│ ├─ Custom deployment context → service.deployed         │
│ ├─ Test results → testCaseRun.finished                  │
│ └─ Custom metadata → artifact.published                 │
└─────────────────────────────────────────────────────────┘
           ↓ Detailed context for critical workflows
┌─────────────────────────────────────────────────────────┐
│ ArgoCD Webhooks (Passive)                               │
│ ├─ Actual deployments → service.deployed                │
│ ├─ Health issues → incident.detected                    │
│ └─ Per-container events → fine-grained tracking         │
└─────────────────────────────────────────────────────────┘
```

### Example: E-Commerce Platform

**Scenario**: 50 microservices, GitHub Actions for CI, ArgoCD for deployment

**Passive Integration** (broad coverage):

- GitHub webhook → All workflows tracked automatically
- ArgoCD webhook → All deployments tracked automatically
- **Zero pipeline modifications**

**Active Integration** (detailed context):

- Add `send-cdevents` action to 5 critical services
- Include custom metadata: feature flags, canary percentage, rollback info
- Send `testCaseRun.finished` events with test coverage

**Result**:

- ✅ 100% observability coverage via passive integration
- ✅ Rich context for critical services via active integration
- ✅ Minimal maintenance burden

## Migration Strategy: Passive First, Active Later

Progressively adopt webhook integrations across your organization:

### Phase 1: Enable Passive Monitoring (Week 1)

1. **Configure GitHub/GitLab webhook** at organization/group level
2. **Set up cdviz-collector** with webhook sources
3. **Deploy ArgoCD notifications** with default subscriptions
4. **Validate events** appearing in CDviz dashboards

**Effort**: 1-2 days for platform team
**Impact**: Immediate visibility across all repositories and deployments

### Phase 2: Validate Coverage (Week 2-3)

1. **Review dashboards** to identify missing events
2. **Check event quality** (correct subject.id, environment, artifactId)
3. **Identify gaps** where passive integration isn't enough
4. **Document custom event requirements**

**Effort**: 1-2 weeks of observation
**Impact**: Understand where active integration adds value

### Phase 3: Selective Active Integration (Week 4+)

1. **Add active integration** to top 5 critical services
2. **Enhance with custom metadata** (deployment strategy, SLO targets)
3. **Send test events** (`testCaseRun.finished`, `testSuiteRun.finished`)
4. **Measure improvement** in observability quality

**Effort**: 1-2 days per service
**Impact**: Rich context for critical services without modifying all pipelines

### Migration Checklist

- [ ] Identify platforms sending webhooks (GitHub, GitLab, ArgoCD)
- [ ] Configure webhook at organization/group level (not per-repository)
- [ ] Set up cdviz-collector with remote transformers
- [ ] Verify webhook signature/token authentication
- [ ] Test webhook delivery with sample events
- [ ] Monitor CDviz dashboards for event coverage
- [ ] Document gaps requiring active integration
- [ ] Selectively add active integration for critical services
- [ ] Measure observability improvement

## Webhook Security Best Practices

Protect your webhook endpoints from unauthorized access:

### GitHub HMAC-SHA256 Signature Verification

GitHub signs webhooks using HMAC-SHA256. The collector validates signatures automatically:

```toml
[sources.github_webhook.extractor.headers.x-hub-signature-256]
type = "signature"
signature_encoding = "hex"
signature_on = "body"
signature_prefix = "sha256="
token = "your-webhook-secret-here"
```

**What this does**:

- ✅ Verifies webhook came from GitHub
- ✅ Prevents replay attacks
- ✅ Rejects tampered payloads
- ❌ Blocks unauthorized requests

**Best practice**: Use a strong random token (32+ characters) and rotate periodically.

### GitLab Token Header Validation

GitLab sends a static token in the `X-Gitlab-Token` header:

```toml
[[sources.gitlab_webhook.extractor.headers]]
header = "X-Gitlab-Token"

[sources.gitlab_webhook.extractor.headers.rule]
type = "equals"
value = "your-secret-token-here"
case_sensitive = true
```

**What this does**:

- ✅ Verifies webhook came from GitLab
- ✅ Simple token-based authentication
- ❌ Blocks unauthorized requests

**Best practice**: Use a UUID or strong random token, store in secrets manager.

### ArgoCD: Network Isolation + Optional Header Auth

ArgoCD offers flexible security options depending on your deployment:

**Option 1: Internal network (simplest)**

When collector runs inside the same Kubernetes cluster:

**ArgoCD side**:

```yaml
service.webhook.cdviz: |
  url: http://cdviz-collector.cdviz:8080/webhook/000-argocd
  headers:
  - name: Content-Type
    value: application/json
```

**Collector side**: No authentication required (rely on NetworkPolicies)

- ✅ No public internet exposure
- ✅ Use Kubernetes NetworkPolicies to restrict access
- ✅ Simple configuration

**Option 2: Authorization header (external endpoints or defense-in-depth)**

When collector is external or you want additional security:

**ArgoCD side**:

```yaml
service.webhook.cdviz: |
  url: https://your-cdviz-collector.example.com/webhook/000-argocd
  headers:
  - name: Content-Type
    value: application/json
  - name: Authorization
    value: "Bearer your-secret-token-here"
```

**Collector side**:

```toml
[sources.argocd_webhook.extractor.headers.authorization]
type = "secret"
value = "Bearer your-secret-token-here"
```

- ✅ Works with external collectors
- ✅ Standard HTTP Authorization header
- ✅ Blocks unauthorized requests

**Best practice**: Use Option 1 (network isolation) when possible, add Option 2 (Authorization header) for external endpoints or defense-in-depth.

## Transformer Versioning and Updates

Remote transformers enable centralized updates without changing collector configuration:

### Using Specific Transformer Versions

Pin to a specific tag for stability:

```toml
[remote.raw_github]
type = "http"
endpoint = "https://raw.githubusercontent.com"

[transformers.github_events]
type = "vrl"
template_rfile = "raw_github:///cdviz-dev/transformers-community/refs/tags/v1.0.0/github_events/transformer.vrl"
```

### Using Latest Transformers

Track the latest version automatically:

```toml
[remote.transformers-community]
type = "github"
owner = "cdviz-dev"
repo = "transformers-community"

[transformers.github_events]
type = "vrl"
template_rfile = "transformers-community:///github_events/transformer.vrl"
```

**Trade-off**:

- ✅ Automatic bug fixes and improvements
- ❌ Risk of breaking changes

## Key Takeaways

- 🎯 **Passive first**: Webhook integration provides broad coverage without pipeline changes
- 🔧 **Combine approaches**: Passive for coverage, active for custom context
- 📊 **Platform coverage**: GitHub, GitLab, ArgoCD webhooks transform automatically
- 🔒 **Security built-in**: HMAC signatures, token validation, network isolation
- 📈 **Incremental adoption**: Start with webhooks, add active integration selectively
- ⚙️ **Centralized transformers**: VRL logic versioned in remote repositories
- 🚀 **Zero pipeline changes**: Organization-level webhook = all repositories covered

Webhook transformers make CDEvents observability achievable at scale. Configure once, gain visibility across all repositories and deployments without modifying pipelines.

## Resources

- [GitHub Webhook Integration](https://cdviz.dev/docs/cdviz-collector/integrations/github.html) - Complete configuration guide
- [GitLab Webhook Integration](https://cdviz.dev/docs/cdviz-collector/integrations/gitlab.html) - Complete configuration guide
- [ArgoCD Notifications Integration](https://cdviz.dev/docs/cdviz-collector/integrations/argocd.html) - Complete configuration guide
- [Transformers Documentation](https://cdviz.dev/docs/cdviz-collector/transformers.html) - VRL transformer reference
- [Episode #3: Direct CI/CD Integration](./20251007-episode-3-cicd-integration) - Active integration patterns
- [GitHub Actions Integration](https://cdviz.dev/docs/cdviz-collector/integrations/github-action.html) - Custom events in workflows
