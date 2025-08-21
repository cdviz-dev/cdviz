# Stop Flying Blind: Why You Need Pipeline Visibility Yesterday

*Your software delivery metrics are scattered across a dozen tools. Here's how to finally connect the dots with code and clear visualization.*

## The Multi-Tool Nightmare

You've invested in the best CI/CD tools money can buy, but when leadership asks "How fast do we ship?" you're stuck running queries like this across multiple systems:

```bash
# The current reality: scattered commands
curl -u admin:token "http://jenkins/api/json" | jq '.jobs[].lastBuild.duration'
gh run list --limit 100 --json conclusion,createdAt
kubectl get deployments -o json | jq '.items[].status.readyReplicas'
```

Then manually correlating timestamps in spreadsheets. There has to be a better way.

### The Problem Visualized

```mermaid
graph TB
    A[GitHub Actions] --> Z["Manual Correlation"]
    B[Jenkins] --> Z
    C[Kubernetes] --> Z
    D[Datadog] --> Z
    E[PagerDuty] --> Z

    Z --> Q1["❓ Deployment Success Rate?"]
    Z --> Q2["❓ MTTR Across Services?"]
    Z --> Q3["❓ Release Velocity?"]

    style Z fill:#ff6b6b
    style Q1 fill:#ffd93d
    style Q2 fill:#ffd93d
    style Q3 fill:#ffd93d
```

This isn't a tooling problem—it's a **visibility problem**.

## Enter CDviz: Monitor Your Software Delivery Pipeline With Confidence

CDviz solves this with standardized event collection and unified visualization. Instead of scattered queries, you get this:

```sql
-- One query to rule them all
SELECT
  service_name,
  environment,
  deployment_frequency,
  lead_time_minutes,
  success_rate
FROM deployment_events
WHERE timestamp >= NOW() - INTERVAL '30 days'
ORDER BY timestamp DESC;
```

### The Architecture That Makes It Work

```mermaid
graph LR
    subgraph Sources["Your Existing Tools"]
        A[GitHub Actions]
        B[Jenkins]
        C[Kubernetes]
        D[PagerDuty]
    end

    subgraph CDviz["CDviz Platform"]
        E[Collector]
        F[(PostgreSQL)]
        G[Grafana]
    end

    A -->|CDEvents| E
    B -->|CDEvents| E
    C -->|CDEvents| E
    D -->|CDEvents| E

    E --> F
    F --> G

    style E fill:#4a90e2
    style F fill:#50e3c2
    style G fill:#7ed321
```

Built on [CDEvents](https://cdevents.dev/)—the Cloud Native standard for delivery events.

## Quick Start: From Zero to Insights in 5 Commands

```bash
# 1. Get the stack
git clone https://github.com/cdviz-dev/cdviz.git
cd cdviz/demos/stack-compose

# 2. Start everything
docker compose up -d

# 3. Send your first deployment event
curl -X POST http://localhost:8080/events \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "version": "0.4.0",
      "id": "my-first-deployment",
      "source": "demo",
      "type": "dev.cdevents.service.deployed.0.1.1",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    },
    "subject": {
      "id": "my-service",
      "type": "service",
      "content": {
        "environment": {"id": "production"},
        "artifactId": "pkg:oci/my-service@sha256:abc123"
      }
    }
  }'

# 4. Query your data directly
docker exec cdviz-db psql -U postgres -d cdviz -c "
  SELECT subject_id, subject_environment_id, timestamp
  FROM cdevents ORDER BY timestamp DESC LIMIT 5;"

# 5. View dashboards
open http://localhost:3000/d/demo-service-deployed/demo-service-deployed
```

![Demo Dashboard](https://via.placeholder.com/700x400/7ed321/ffffff?text=CDviz+Demo+Dashboard)
*What you'll see: Real-time deployment metrics and event timeline*

## Real Integration Examples

### Connect Your GitHub Actions

```yaml
# .github/workflows/deploy.yml
- name: Send CDEvent on Deploy
  run: |
    curl -X POST ${{ secrets.CDVIZ_COLLECTOR_URL }}/events \
      -H "Content-Type: application/json" \
      -d '{
        "context": {
          "version": "0.4.0",
          "id": "${{ github.run_id }}-deployed",
          "source": "github-actions",
          "type": "dev.cdevents.service.deployed.0.1.1",
          "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
        },
        "subject": {
          "id": "${{ github.repository }}",
          "type": "service",
          "content": {
            "environment": {"id": "production"},
            "artifactId": "pkg:oci/${{ github.repository }}@${{ github.sha }}"
          }
        }
      }'
```

### Kubernetes Integration

Deploy a webhook to automatically capture deployment events:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cdviz-k8s-webhook
spec:
  template:
    spec:
      containers:
      - name: collector
        image: ghcr.io/cdviz-dev/cdviz-collector:latest
        env:
        - name: CDVIZ_CONFIG
          value: |
            [sources.k8s]
            type = "webhook"
            listen = "0.0.0.0:8080"

            [sinks.database]
            type = "db"
            url = "postgresql://user:pass@postgres:5432/cdviz"
```

## The Data is Yours: Advanced Analytics

Since everything lives in PostgreSQL, you can run sophisticated queries:

### DORA Metrics Dashboard

```sql
-- Deployment Frequency
SELECT
  DATE(timestamp) as day,
  COUNT(*) as deployments
FROM cdevents
WHERE context_type = 'dev.cdevents.service.deployed.0.1.1'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp);

-- Lead Time Calculation
WITH deployments AS (
  SELECT
    subject_id,
    timestamp,
    LAG(timestamp) OVER (
      PARTITION BY subject_id
      ORDER BY timestamp
    ) as prev_deployment
  FROM cdevents
  WHERE context_type = 'dev.cdevents.service.deployed.0.1.1'
)
SELECT
  subject_id,
  AVG(EXTRACT(EPOCH FROM (timestamp - prev_deployment))/3600) as avg_hours_between_deploys
FROM deployments
WHERE prev_deployment IS NOT NULL
GROUP BY subject_id;
```

### Visual Results

What these queries produce in your Grafana dashboards:

![DORA Metrics](https://via.placeholder.com/600x350/4a90e2/ffffff?text=DORA+Metrics+Dashboard)
*Deployment frequency, lead time, and failure rates visualized*

## Production Deployment: Helm Charts

```bash
# Production-ready deployment
helm repo add cdviz https://cdviz-dev.github.io/charts

# Custom configuration
cat << EOF > production-values.yaml
collector:
  replicas: 3
  resources:
    requests: {memory: 256Mi, cpu: 250m}
    limits: {memory: 512Mi, cpu: 500m}

database:
  postgresql:
    persistence:
      size: 100Gi
      storageClass: fast-ssd

grafana:
  ingress:
    enabled: true
    hosts: [cdviz.company.com]
EOF

helm install cdviz cdviz/cdviz -f production-values.yaml
```

## Before vs After: The Transformation

| Before CDviz | After CDviz |
|-------------|-------------|
| 🔴 12+ browser tabs | ✅ Single dashboard |
| 🔴 Manual correlation | ✅ Automated insights |
| 🔴 Hours to investigate | ✅ Seconds to understand |
| 🔴 Spreadsheet analysis | ✅ SQL-powered analytics |

### Event Flow Visualization

```mermaid
sequenceDiagram
    participant CI as CI/CD Pipeline
    participant Col as CDviz Collector
    participant DB as PostgreSQL
    participant Dash as Grafana Dashboard

    CI->>Col: Deployment Event (CDEvent)
    Col->>DB: Store Event
    Note over DB: Real-time storage
    Dash->>DB: Query Events
    Dash->>CI: Display Metrics
    Note over Dash: Instant visibility
```

## Custom Analytics: Your Code, Your Insights

Build custom integrations with the CDviz API:

```python
# Python client for custom metrics
import requests
from datetime import datetime

class CDvizAnalytics:
    def __init__(self, db_url):
        self.db_url = db_url

    def get_deployment_velocity(self, service_name, days=30):
        query = """
        SELECT COUNT(*) / %s as daily_avg
        FROM cdevents
        WHERE subject_id = %s
          AND context_type = 'dev.cdevents.service.deployed.0.1.1'
          AND timestamp >= NOW() - INTERVAL '%s days'
        """
        # Execute query and return results
        return self.execute_query(query, [days, service_name, days])

# Usage
analytics = CDvizAnalytics("postgresql://localhost/cdviz")
velocity = analytics.get_deployment_velocity("my-service")
print(f"Average deployments per day: {velocity}")
```

## The Open Source Advantage

![Architecture Diagram](https://via.placeholder.com/600x300/50e3c2/ffffff?text=Open+Source+Architecture)

- **CDviz Collector**: AGPL v3 (core event processing)
- **Database components**: Apache v2 (your data, your control)
- **Grafana dashboards**: Apache v2 (full customization)
- **Your infrastructure**: Deploy anywhere with standard tools

## Who Benefits: Visual Use Cases

```mermaid
mindmap
  root((CDviz Users))
    Platform Engineers
      🔧 Centralized metrics without building tools
      📊 Standard deployment visibility
    Engineering Managers
      📈 Data-driven team insights
      ⚡ Velocity measurement
    DevOps Teams
      🔍 Incident correlation
      🎯 MTTR optimization
    Leadership
      💼 Engineering ROI demonstration
      📊 Strategic planning data
```

## Next Steps: Your Pipeline Clarity Journey

1. **Try the 5-minute demo**: Experience unified visibility immediately
2. **Connect one tool**: Start with GitHub Actions or Jenkins integration
3. **Deploy to staging**: Use Helm charts for team evaluation
4. **Build custom queries**: PostgreSQL gives you unlimited analytics
5. **Scale to production**: Full observability across your delivery pipeline

Ready to stop flying blind? The combination of **standardized events + open database + visual dashboards** transforms how you understand your software delivery process.

---

*Start your pipeline visibility transformation: [Live demo](https://cdviz.dev) • [GitHub repo](https://github.com/cdviz-dev/cdviz) • [CDEvents community](https://cdevents.dev)*

---

**Tags**: #DevOps #CI/CD #Observability #CDEvents #Visualization #PostgreSQL #Grafana #Kubernetes #OpenSource #DORA