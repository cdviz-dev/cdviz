# Stop Flying Blind: Why You Need Pipeline Visibility Yesterday

*Your software delivery metrics are scattered across a dozen tools. Here's how to code your way to unified pipeline visibility.*

## The Multi-Tool Nightmare

You've invested in the best CI/CD tools money can buy, but when leadership asks "How fast do we ship?" you're stuck running queries like this across multiple systems:

```bash
# Jenkins API call
curl -u admin:token "http://jenkins.company.com/api/json" | jq '.jobs[].lastBuild.duration'

# GitHub Actions via gh CLI  
gh run list --limit 100 --json conclusion,createdAt,updatedAt

# Kubernetes deployment check
kubectl get deployments -o json | jq '.items[] | {name: .metadata.name, ready: .status.readyReplicas}'

# Datadog metrics API
curl -X GET "https://api.datadoghq.com/api/v1/metrics" -H "DD-API-KEY: ${DD_API_KEY}"
```

Then manually correlating timestamps, praying the data makes sense, and building spreadsheets. There has to be a better way.

## Enter CDviz: Code-First Pipeline Observability

CDviz solves this with standardized event collection and a database-first approach. Here's the core concept in code:

```typescript
// Instead of this scattered approach...
const jenkinsData = await fetch('/jenkins/api');
const githubData = await fetch('/github/api');  
const k8sData = await kubectl('get deployments');

// You get this unified query
const pipelineMetrics = await db.query(`
  SELECT 
    service_name,
    environment,
    deployment_frequency,
    lead_time_minutes,
    success_rate
  FROM deployment_events 
  WHERE timestamp >= NOW() - INTERVAL '30 days'
  ORDER BY timestamp DESC
`);
```

## Quick Start: From Zero to Insights in 5 Commands

```bash
# 1. Get the stack
git clone https://github.com/cdviz-dev/cdviz.git
cd cdviz/demos/stack-compose

# 2. Start everything  
docker compose up -d

# 3. Send your first event
curl -X POST http://localhost:8080/events \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "version": "0.4.0",
      "id": "my-first-event",
      "source": "my-ci-system",
      "type": "dev.cdevents.service.deployed.0.1.1",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    },
    "subject": {
      "id": "my-service",
      "source": "my-repo",
      "type": "service",
      "content": {
        "environment": {
          "id": "production",
          "source": "my-k8s-cluster"
        },
        "artifactId": "pkg:oci/my-service@sha256:abc123"
      }
    }
  }'

# 4. Query your data directly
docker exec cdviz-db psql -U postgres -d cdviz -c "
  SELECT 
    subject_id,
    subject_environment_id, 
    timestamp 
  FROM cdevents 
  ORDER BY timestamp DESC 
  LIMIT 5;"

# 5. View dashboards
open http://localhost:3000
```

## Configuration Examples: Integrate With Your Stack

### GitHub Actions Integration

Add this to your workflow to send deployment events:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
    
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Your deployment logic here
          kubectl apply -f k8s/
          
      - name: Send CDEvent
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
                "source": "${{ github.server_url }}/${{ github.repository }}",
                "type": "service",
                "content": {
                  "environment": {
                    "id": "production"
                  },
                  "artifactId": "pkg:oci/${{ github.repository }}@${{ github.sha }}"
                }
              }
            }'
```

### Jenkins Pipeline Integration

```groovy
// Jenkinsfile
pipeline {
    agent any
    
    stages {
        stage('Deploy') {
            steps {
                script {
                    // Your deployment logic
                    sh 'kubectl apply -f k8s/'
                    
                    // Send CDEvent
                    def eventPayload = [
                        context: [
                            version: "0.4.0",
                            id: "${BUILD_ID}-deployed",
                            source: "jenkins",
                            type: "dev.cdevents.service.deployed.0.1.1", 
                            timestamp: new Date().format("yyyy-MM-dd'T'HH:mm:ss'Z'")
                        ],
                        subject: [
                            id: "${JOB_NAME}",
                            source: "${JENKINS_URL}job/${JOB_NAME}",
                            type: "service",
                            content: [
                                environment: [id: "production"],
                                artifactId: "pkg:oci/${JOB_NAME}@${GIT_COMMIT}"
                            ]
                        ]
                    ]
                    
                    sh """
                        curl -X POST ${CDVIZ_COLLECTOR_URL}/events \\
                             -H 'Content-Type: application/json' \\
                             -d '${groovy.json.JsonOutput.toJson(eventPayload)}'
                    """
                }
            }
        }
    }
}
```

### Kubernetes Webhook Integration

Deploy a webhook to catch Kubernetes deployment events:

```yaml
# k8s-webhook-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cdviz-webhook-config
data:
  config.toml: |
    [sources.kubernetes]
    type = "webhook" 
    listen = "0.0.0.0:8080"
    path = "/k8s-events"
    
    [sinks.cdviz]
    type = "http"
    url = "http://cdviz-collector:8080/events"
    
    [[transformers]]
    type = "k8s_to_cdevents"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cdviz-k8s-webhook
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cdviz-k8s-webhook
  template:
    metadata:
      labels:
        app: cdviz-k8s-webhook
    spec:
      containers:
      - name: webhook
        image: ghcr.io/cdviz-dev/cdviz-collector:latest
        ports:
        - containerPort: 8080
        volumeMounts:
        - name: config
          mountPath: /config
        env:
        - name: CDVIZ_CONFIG
          value: /config/config.toml
      volumes:
      - name: config
        configMap:
          name: cdviz-webhook-config
```

## Advanced Queries: Your Data, Your Rules

Since CDviz stores everything in PostgreSQL, you can run sophisticated analyses:

### DORA Metrics Calculation

```sql
-- Deployment Frequency (deployments per day)
SELECT 
  DATE(timestamp) as day,
  COUNT(*) as deployments
FROM cdevents 
WHERE context_type = 'dev.cdevents.service.deployed.0.1.1'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY day;

-- Lead Time (time from commit to deployment) 
WITH commits AS (
  SELECT subject_id, timestamp as commit_time
  FROM cdevents 
  WHERE context_type = 'dev.cdevents.change.merged.0.1.2'
),
deployments AS (
  SELECT subject_id, timestamp as deploy_time  
  FROM cdevents
  WHERE context_type = 'dev.cdevents.service.deployed.0.1.1'
)
SELECT 
  d.subject_id,
  AVG(EXTRACT(EPOCH FROM (d.deploy_time - c.commit_time))/60) as avg_lead_time_minutes
FROM deployments d
JOIN commits c ON d.subject_id = c.subject_id 
  AND d.deploy_time > c.commit_time
GROUP BY d.subject_id;

-- Change Failure Rate
SELECT 
  subject_id,
  COUNT(CASE WHEN subject_outcome = 'failure' THEN 1 END) * 100.0 / COUNT(*) as failure_rate
FROM cdevents 
WHERE context_type = 'dev.cdevents.service.deployed.0.1.1'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY subject_id;
```

### Custom Dashboards with Grafana API

```javascript
// Create custom dashboard programmatically
const dashboard = {
  dashboard: {
    title: "My Service Deployments",
    panels: [
      {
        title: "Deployment Frequency",
        type: "stat",
        targets: [{
          rawSql: `
            SELECT 
              COUNT(*) as deployments
            FROM cdevents 
            WHERE subject_id = 'my-service'
              AND context_type = 'dev.cdevents.service.deployed.0.1.1'
              AND timestamp >= NOW() - INTERVAL '7 days'
          `
        }]
      }
    ]
  }
};

// Deploy via Grafana API
fetch('http://localhost:3000/api/dashboards/db', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + grafanaApiKey
  },
  body: JSON.stringify(dashboard)
});
```

## Helm Deployment: Production Ready

Deploy CDviz to your Kubernetes cluster:

```bash
# Add the CDviz Helm repository
helm repo add cdviz https://cdviz-dev.github.io/charts
helm repo update

# Install with custom values
cat << EOF > values.yaml
collector:
  replicas: 3
  resources:
    requests:
      memory: 256Mi
      cpu: 250m
    limits:
      memory: 512Mi  
      cpu: 500m
  
database:
  postgresql:
    auth:
      database: cdviz_prod
      username: cdviz
    persistence:
      size: 100Gi
      storageClass: fast-ssd
      
grafana:
  admin:
    password: super-secure-password
  ingress:
    enabled: true
    hosts:
      - cdviz.company.com
EOF

# Deploy
helm install cdviz cdviz/cdviz -f values.yaml
```

## Collector Configuration: Code Your Pipeline

The CDviz collector is configured via TOML. Here's a production-ready setup:

```toml
# config.toml
[server]
host = "0.0.0.0"
port = 8080

# Multiple sources
[sources.github_webhook]
type = "webhook"
listen = "0.0.0.0:8081" 
path = "/github"

[sources.jenkins_sse]
type = "sse"
url = "http://jenkins.company.com/sse-gateway/listen"
headers = { "Authorization" = "Bearer ${JENKINS_TOKEN}" }

[sources.k8s_events]  
type = "opendal"
scheme = "s3"
bucket = "k8s-events"
region = "us-west-2"

# Transform and route
[[transformers]]
type = "json_path"
input_field = "$.action"
output_field = "$.context.type"
mapping = [
  { from = "deployment", to = "dev.cdevents.service.deployed.0.1.1" },
  { from = "test_run", to = "dev.cdevents.test.run.0.1.0" }
]

# Multiple sinks
[sinks.database]
type = "db"
url = "postgresql://user:pass@postgres:5432/cdviz"

[sinks.webhook_alerts]
type = "http" 
url = "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
filter = "$.context.type == 'dev.cdevents.incident.reported.0.1.0'"
```

## Performance: Scale Your Observability

CDviz is built for scale. Here's how to optimize for high-throughput environments:

```sql
-- Optimize your database
CREATE INDEX CONCURRENTLY idx_cdevents_timestamp 
  ON cdevents USING BTREE (timestamp DESC);
  
CREATE INDEX CONCURRENTLY idx_cdevents_subject_type
  ON cdevents USING BTREE (subject_id, context_type);

-- Partition large tables  
SELECT create_hypertable('cdevents', 'timestamp');

-- Set up read replicas for dashboard queries
CREATE SUBSCRIPTION dashboard_replica 
CONNECTION 'host=postgres-primary port=5432 user=replication'
PUBLICATION cdviz_events;
```

## The API-First Advantage

Everything in CDviz is programmable. Build custom integrations:

```python
# Python client example
import requests
import json
from datetime import datetime

class CDvizClient:
    def __init__(self, collector_url):
        self.base_url = collector_url
    
    def send_deployment_event(self, service_name, environment, artifact_id):
        event = {
            "context": {
                "version": "0.4.0",
                "id": f"{service_name}-{datetime.now().isoformat()}",
                "source": "python-client",
                "type": "dev.cdevents.service.deployed.0.1.1",
                "timestamp": datetime.utcnow().isoformat() + "Z"
            },
            "subject": {
                "id": service_name,
                "type": "service", 
                "content": {
                    "environment": {"id": environment},
                    "artifactId": artifact_id
                }
            }
        }
        
        response = requests.post(
            f"{self.base_url}/events",
            headers={"Content-Type": "application/json"},
            data=json.dumps(event)
        )
        return response.status_code == 200

# Usage
client = CDvizClient("http://localhost:8080")
client.send_deployment_event(
    "my-service", 
    "production",
    "pkg:oci/my-service@sha256:abc123"
)
```

## Monitoring Your Monitoring

CDviz includes built-in observability:

```yaml
# Prometheus metrics endpoint
apiVersion: v1
kind: Service
metadata:
  name: cdviz-collector-metrics
  labels:
    app: cdviz-collector
spec:
  ports:
  - name: metrics
    port: 9090
    targetPort: metrics
  selector:
    app: cdviz-collector
---
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor  
metadata:
  name: cdviz-collector
spec:
  selector:
    matchLabels:
      app: cdviz-collector
  endpoints:
  - port: metrics
    path: /metrics
```

## Next Steps: Code Your Pipeline Visibility

Ready to stop playing deployment detective? Here's your implementation roadmap:

1. **Start local** (5 min): `git clone` and `docker compose up`
2. **Send test events** (10 min): Use the curl examples above  
3. **Connect your CI** (30 min): Add webhook calls to your pipelines
4. **Deploy to prod** (1 hour): Use the Helm chart with your values
5. **Build custom queries** (ongoing): PostgreSQL is your playground

The future of software delivery observability is **data-driven and programmable**. CDviz gives you the foundation.

---

*Ready to code your way to pipeline clarity? Explore the [GitHub repo](https://github.com/cdviz-dev/cdviz) and join the [CDEvents community](https://cdevents.dev). Questions? File an issue or join the discussions.*

---

**Tags**: #DevOps #CI/CD #PostgreSQL #API #CDEvents #Kubernetes #Infrastructure #Automation #OpenSource #Observability