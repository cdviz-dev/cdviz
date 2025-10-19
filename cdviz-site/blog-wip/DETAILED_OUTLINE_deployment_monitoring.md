# CDviz Deployment Monitoring Series: Detailed Outline

## Series Overview

5-part blog series focused on deployment visibility, progressing from simple direct integration to advanced monitoring patterns.

---

## Article 1: "Pipeline Visibility Crisis: When Your Tools Don't Talk"

**Status**: Keep existing, minor refinements
**Target**: Engineering Managers, Tech Leads
**Reading Time**: 5 minutes

### Refinements Needed:

- Remove detailed installation steps (link to official docs)
- Strengthen the problem statement with more specific pain points
- Add brief preview of solution approaches (direct vs passive monitoring)
- Include ROI metrics (time saved, accuracy improved)

---

## Article 2: "Direct Pipeline Integration: Sending Deployment Events"

**Target**: DevOps Engineers, Developers
**Reading Time**: 8-10 minutes

### Structure:

#### Introduction (2 minutes)

- When to choose direct pipeline integration
- Benefits: immediate data, complete control, custom metadata
- Trade-offs: maintenance overhead, security considerations

#### GitHub Actions Deep Dive (3 minutes)

```yaml
# Enhanced example with error handling
- name: Send Deployment Event
  env:
    CDVIZ_URL: ${{ secrets.CDVIZ_COLLECTOR_URL }}
    CDVIZ_TOKEN: ${{ secrets.CDVIZ_TOKEN }}
  run: |
    # Enhanced error handling and retry logic
    for i in {1..3}; do
      if curl -X POST "${CDVIZ_URL}/events" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${CDVIZ_TOKEN}" \
        --retry 2 --retry-delay 5 \
        -d '{
          "context": {
            "version": "0.4.0",
            "id": "${{ github.run_id }}-${{ github.run_attempt }}",
            "source": "${{ github.repository }}",
            "type": "dev.cdevents.service.deployed.0.1.1",
            "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
          },
          "subject": {
            "id": "${{ github.event.repository.name }}",
            "source": "${{ github.server_url }}/${{ github.repository }}",
            "type": "service",
            "content": {
              "environment": {"id": "${{ inputs.environment || 'production' }}"},
              "artifactId": "pkg:oci/ghcr.io/${{ github.repository }}@${{ github.sha }}",
              "deploymentId": "${{ github.run_id }}"
            }
          }
        }'; then
        echo "Event sent successfully"
        break
      else
        echo "Attempt $i failed, retrying..."
        sleep 5
      fi
    done
```

#### Jenkins Integration (3 minutes)

```groovy
pipeline {
    agent any

    environment {
        CDVIZ_URL = credentials('cdviz-collector-url')
        CDVIZ_TOKEN = credentials('cdviz-token')
    }

    stages {
        stage('Deploy') {
            steps {
                script {
                    // Deployment logic here
                    deployApplication()

                    // Send CDEvent with proper error handling
                    try {
                        sendDeploymentEvent()
                    } catch (Exception e) {
                        echo "Failed to send deployment event: ${e.getMessage()}"
                        // Decision: fail build or continue?
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }
    }
}

def sendDeploymentEvent() {
    def eventData = [
        context: [
            version: "0.4.0",
            id: "${BUILD_NUMBER}-deployed",
            source: "jenkins/${JOB_NAME}",
            type: "dev.cdevents.service.deployed.0.1.1",
            timestamp: new Date().format("yyyy-MM-dd'T'HH:mm:ss'Z'")
        ],
        subject: [
            id: env.JOB_NAME,
            source: "${JENKINS_URL}job/${JOB_NAME}",
            type: "service",
            content: [
                environment: [id: params.ENVIRONMENT ?: "production"],
                artifactId: "pkg:oci/${JOB_NAME}@${GIT_COMMIT}",
                deploymentId: "${BUILD_NUMBER}"
            ]
        ]
    ]

    def response = sh(
        script: """
            curl -X POST \${CDVIZ_URL}/events \\
                 -H 'Content-Type: application/json' \\
                 -H 'Authorization: Bearer \${CDVIZ_TOKEN}' \\
                 -w '%{http_code}' \\
                 -o /dev/null \\
                 -d '${groovy.json.JsonOutput.toJson(eventData)}'
        """,
        returnStdout: true
    ).trim()

    if (response != "200") {
        throw new Exception("HTTP ${response}")
    }
}
```

#### GitLab CI Integration (2 minutes)

```yaml
# .gitlab-ci.yml
send_deployment_event:
  stage: post-deploy
  script:
    - |
        curl -X POST "$CDVIZ_COLLECTOR_URL/events" \
          -H "Content-Type: application/json" \
          -H "Authorization: Bearer $CDVIZ_TOKEN" \
          -d '{
            "context": {
              "version": "0.4.0",
              "id": "'$CI_PIPELINE_ID'-deployed",
              "source": "'$CI_PROJECT_PATH'",
              "type": "dev.cdevents.service.deployed.0.1.1",
              "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
            },
            "subject": {
              "id": "'$CI_PROJECT_NAME'",
              "source": "'$CI_PROJECT_URL'",
              "type": "service",
              "content": {
                "environment": {"id": "'${CI_ENVIRONMENT_NAME:-production}'"},
                "artifactId": "pkg:oci/'$CI_REGISTRY_IMAGE'@'$CI_COMMIT_SHA'",
                "deploymentId": "'$CI_PIPELINE_ID'"
              }
            }
          }'
  variables:
    CDVIZ_COLLECTOR_URL: $CDVIZ_COLLECTOR_URL
    CDVIZ_TOKEN: $CDVIZ_TOKEN
  only:
    - main
```

#### Decision Framework

- **Use direct integration when**:
  - You need custom metadata
  - You want immediate event sending
  - You have control over pipeline modifications
  - Team is comfortable maintaining pipeline code

- **Avoid direct integration when**:
  - You have many pipelines to modify
  - Teams resist pipeline changes
  - You need passive monitoring
  - Maintenance overhead is a concern

---

## Article 3: "Kubernetes Deployment Monitoring: Passive Event Collection"

**Target**: Platform Engineers, DevOps Teams
**Reading Time**: 10 minutes

### Structure:

#### Introduction (2 minutes)

- Benefits of passive monitoring
- When pipelines can't be modified
- Platform-level visibility approach

#### kubewatch Integration (3 minutes)

```yaml
# kubewatch-cdviz-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kubewatch-config
data:
  config.yaml: |
    webhook:
      url: "http://cdviz-collector:8080/events"

    resource:
      deployment: true
      pod: false
      replicaset: false

    namespace:
      include:
        - production
        - staging
      exclude:
        - kube-system

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kubewatch
spec:
  template:
    spec:
      containers:
        - name: kubewatch
          image: bitnami/kubewatch:latest
          args:
            - --config=/config/config.yaml
          volumeMounts:
            - name: config
              mountPath: /config
      volumes:
        - name: config
          configMap:
            name: kubewatch-config
```

#### Custom Controller Development (3 minutes)

```go
// Simple deployment controller example
package main

import (
    "context"
    "encoding/json"
    "net/http"
    "time"

    appsv1 "k8s.io/api/apps/v1"
    "k8s.io/client-go/informers"
    "k8s.io/client-go/tools/cache"
)

type CDEvent struct {
    Context CDEventContext `json:"context"`
    Subject CDEventSubject `json:"subject"`
}

func deploymentEventHandler(obj interface{}) {
    deployment := obj.(*appsv1.Deployment)

    event := CDEvent{
        Context: CDEventContext{
            Version:   "0.4.0",
            ID:        fmt.Sprintf("%s-%s", deployment.Name, deployment.UID),
            Source:    "kubernetes-controller",
            Type:      "dev.cdevents.service.deployed.0.1.1",
            Timestamp: time.Now().UTC().Format(time.RFC3339),
        },
        Subject: CDEventSubject{
            ID:   deployment.Name,
            Type: "service",
            Content: map[string]interface{}{
                "environment": map[string]string{
                    "id": deployment.Namespace,
                },
                "artifactId": getArtifactId(deployment),
            },
        },
    }

    sendEvent(event)
}
```

#### Helm Deployment Tracking (2 minutes)

```yaml
# helm-hook-example.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: "{{ .Release.Name }}-cdviz-hook"
  annotations:
    "helm.sh/hook": post-install,post-upgrade
    "helm.sh/hook-weight": "1"
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: cdviz-reporter
          image: curlimages/curl:latest
          command:
            - /bin/sh
            - -c
            - |
                curl -X POST "$CDVIZ_URL/events" \
                  -H "Content-Type: application/json" \
                  -d '{
                    "context": {
                      "version": "0.4.0",
                      "id": "{{ .Release.Name }}-{{ .Release.Revision }}",
                      "source": "helm/{{ .Chart.Name }}",
                      "type": "dev.cdevents.service.deployed.0.1.1",
                      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
                    },
                    "subject": {
                      "id": "{{ .Release.Name }}",
                      "type": "service",
                      "content": {
                        "environment": {"id": "{{ .Release.Namespace }}"},
                        "artifactId": "helm://{{ .Chart.Name }}@{{ .Chart.Version }}"
                      }
                    }
                  }'
          env:
            - name: CDVIZ_URL
              value: "{{ .Values.cdviz.collectorUrl }}"
```

---

## Article 4: "GitOps and Registry Monitoring: ArgoCD and Artifact Events"

**Target**: Platform Engineers, GitOps Practitioners
**Reading Time**: 10 minutes

### Structure:

#### ArgoCD Integration (4 minutes)

```yaml
# argocd-webhook-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-notifications-cm
data:
  service.webhook.cdviz: |
    url: http://cdviz-collector:8080/events
    headers:
    - name: Content-Type
      value: application/json

  template.cdviz-deployment: |
    webhook:
      cdviz:
        method: POST
        body: |
          {
            "context": {
              "version": "0.4.0",
              "id": "{{.app.metadata.name}}-{{.app.status.sync.revision}}",
              "source": "argocd/{{.app.metadata.name}}",
              "type": "dev.cdevents.service.deployed.0.1.1",
              "timestamp": "{{.timestamp}}"
            },
            "subject": {
              "id": "{{.app.metadata.name}}",
              "source": "{{.app.spec.source.repoURL}}",
              "type": "service",
              "content": {
                "environment": {"id": "{{.app.metadata.namespace}}"},
                "artifactId": "git://{{.app.spec.source.repoURL}}@{{.app.status.sync.revision}}"
              }
            }
          }

  trigger.on-deployed: |
    - when: app.status.health.status == 'Healthy' and app.status.operationState.phase == 'Succeeded'
      send: [cdviz-deployment]
```

#### Container Registry Webhooks (3 minutes)

```yaml
# Harbor webhook configuration
# POST to /events endpoint when image pushed
{
  "type": "pushImage",
  "event_data": {
    "repository": {
      "name": "my-app",
      "namespace": "production"
    },
    "resources": [{
      "tag": "v1.2.3",
      "digest": "sha256:abc123..."
    }]
  }
}

# CDviz transformer for Harbor events
[[transformers]]
name = "harbor-to-cdevent"
type = "jq"
filter = '''
{
  context: {
    version: "0.4.0",
    id: (.event_data.repository.namespace + "-" + .event_data.repository.name + "-" + .event_data.resources[0].tag),
    source: "harbor/webhook",
    type: "dev.cdevents.artifact.published.0.1.1",
    timestamp: (now | todate)
  },
  subject: {
    id: (.event_data.repository.namespace + "/" + .event_data.repository.name),
    type: "artifact",
    content: {
      artifactId: ("pkg:oci/" + .event_data.repository.namespace + "/" + .event_data.repository.name + "@" + .event_data.resources[0].tag)
    }
  }
}
'''
```

#### Git Webhook Integration (3 minutes)

```yaml
# GitHub webhook to CDviz for tag events
# Webhook payload transformation
[[transformers]]
name = "github-tag-to-cdevent"
type = "jq"
condition = '.ref | startswith("refs/tags/")'
filter = '''
{
  context: {
    version: "0.4.0",
    id: (.repository.full_name + "-" + .ref),
    source: "github/webhook",
    type: "dev.cdevents.artifact.published.0.1.1",
    timestamp: .head_commit.timestamp
  },
  subject: {
    id: .repository.name,
    source: .repository.html_url,
    type: "artifact",
    content: {
      artifactId: ("git://" + .repository.clone_url + "@" + .after)
    }
  }
}
'''
```

---

## Article 5: "Advanced Patterns: Custom Sources and Scaling"

**Target**: Platform Engineers, DevOps Architects
**Reading Time**: 12 minutes

### Structure:

#### Custom Source Development (4 minutes)

```toml
# Custom source example - database migration tracker
[[sources]]
name = "db-migrations"
type = "webhook"
listen = "0.0.0.0:8081"
path = "/db-events"

[[transformers]]
name = "migration-to-cdevent"
type = "jq"
filter = '''
{
  context: {
    version: "0.4.0",
    id: (.migration_id + "-" + .timestamp),
    source: "flyway/migrations",
    type: "dev.cdevents.change.created.0.1.1",
    timestamp: .timestamp
  },
  subject: {
    id: .database_name,
    type: "environment",
    content: {
      change: {
        id: .migration_id,
        description: .migration_description
      }
    }
  }
}
'''
```

#### Multi-Cluster Event Aggregation (4 minutes)

```yaml
# Federation pattern with cluster identification
apiVersion: v1
kind: ConfigMap
metadata:
  name: cdviz-collector-config
data:
  config.toml: |
    [sources.webhook]
    type = "webhook"
    listen = "0.0.0.0:8080"
    path = "/events"

    [[transformers]]
    name = "add-cluster-metadata"
    type = "jq"
    filter = '''
    .context.source = (.context.source + "/cluster-west") |
    .subject.content.cluster = "production-west"
    '''

    [sinks.database]
    type = "db"
    url = "postgresql://user:pass@central-db:5432/cdviz"
```

#### Production Scaling Patterns (4 minutes)

```yaml
# High availability CDviz deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cdviz-collector
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: collector
          image: cdviz/collector:latest
          resources:
            requests:
              memory: "256Mi"
              cpu: "200m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 30
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
```

---

## Cross-Article Elements

### Decision Framework Summary

Each article includes a decision matrix:

- **Complexity**: Low/Medium/High
- **Maintenance**: Low/Medium/High
- **Control**: Low/Medium/High
- **Coverage**: Partial/Full
- **Best For**: Team size and use case

### Common Code Patterns

- Error handling and retries
- Authentication and security
- Event payload best practices
- Monitoring and alerting integration

### Integration with Official Docs

Each article links to:

- Installation guide
- Configuration reference
- Troubleshooting guide
- API documentation

---

_This outline provides the detailed structure for creating practical, actionable content that focuses on deployment monitoring while avoiding duplication with official documentation._
