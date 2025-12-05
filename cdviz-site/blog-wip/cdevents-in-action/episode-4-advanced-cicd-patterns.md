---
title: "CDEvents in Action #4: Advanced CI/CD Patterns"
description: "Scale CDEvents across your organization with reusable components, shared libraries, and multi-pipeline orchestration. Enterprise patterns for Jenkins, GitHub Actions, and GitLab CI."
tags: [
  "cdevents",
  "devops",
  "cicd",
  "jenkins",
  "github-actions",
  "gitlab",
  "enterprise",
  "automation",
  "orchestration",
]
target_audience: "Enterprise Platform Engineers, DevOps Architects"
reading_time: "12 minutes"
series: "CDEvents in Action"
series_part: 4
published: false
---

# CDEvents in Action #4: Advanced CI/CD Patterns

_Scale CDEvents from individual pipelines to enterprise-wide observability. Learn reusable components, shared libraries, and orchestration patterns that eliminate repetitive integration work._

## From Individual Pipelines to Platform Patterns

In [Episode #3](./episode-3-cicd-integration.md), you learned how to instrument individual pipelines to send CDEvents. This works great for a few services, but what happens when you have:

- **100+ microservices** each needing the same CDEvents instrumentation
- **Multiple teams** with different CI/CD platforms (GitHub, Jenkins, GitLab)
- **Standardized deployment patterns** that should emit consistent events
- **Cross-pipeline workflows** where one pipeline triggers others
- **Compliance requirements** demanding audit trails across all deployments

Copying the same CDEvents code into every pipeline creates maintenance nightmares. **Advanced patterns** solve this by centralizing CDEvents logic into reusable components, shared libraries, and platform-level integrations.

## Pattern Evolution: From Direct to Centralized

Understanding the progression from direct integration to advanced patterns:

```
Episode #3 (Direct Integration)
├─ Pattern A: Curl + Bash in each pipeline
├─ Pattern B: cdviz-collector send in each pipeline
└─ Pattern C: Platform-specific action/plugin in each pipeline

Episode #4 (Advanced Patterns) ← You are here
├─ Reusable Components: Shared steps, templates, libraries
├─ Platform Plugins: Centralized event logic
└─ Multi-Pipeline Orchestration: Cross-pipeline event correlation
```

The key difference: **Episode #3** requires touching every pipeline individually. **Episode #4** patterns enable instrumentation at scale with minimal per-pipeline changes.

## Three Advanced Integration Patterns

These patterns build on Episode #3 but focus on **reusability** and **enterprise scale**:

| Pattern                            | Description                                                         | Best For                                      | Maintenance |
| ---------------------------------- | ------------------------------------------------------------------- | --------------------------------------------- | ----------- |
| **Pattern D: Reusable Components** | Shared workflow templates, composite actions, job templates         | Organizations standardizing on one platform   | Medium      |
| **Pattern E: Shared Libraries**    | Jenkins shared libraries, custom GitHub Actions, GitLab CI includes | Enforcing organization-wide standards         | Low         |
| **Pattern F: Platform Plugins**    | Jenkins plugins, custom operators, platform extensions              | Maximum automation, minimal per-pipeline code | Very Low    |

### When to Use Each Pattern

**Use Pattern D (Reusable Components) if**:

- You want teams to opt-in to CDEvents easily
- You need flexibility for different pipeline types
- You're standardizing on one CI/CD platform
- You want visible, customizable integration

**Use Pattern E (Shared Libraries) if**:

- You want to enforce organization-wide CDEvents standards
- You need centralized version control of CDEvents logic
- You're comfortable with platform-specific library systems
- You want automatic updates across all pipelines

**Use Pattern F (Platform Plugins) if**:

- You want maximum automation with minimal pipeline changes
- You can develop and maintain custom platform extensions
- You need deep integration with platform internals
- You're building a platform engineering capability

## Platform Compatibility Matrix

How each advanced pattern maps to popular CI/CD platforms:

| Platform           | Pattern D (Components)                   | Pattern E (Shared Libraries)          | Pattern F (Plugins)             |
| ------------------ | ---------------------------------------- | ------------------------------------- | ------------------------------- |
| **GitHub Actions** | ✅ Reusable workflows, composite actions | ✅ Custom actions, workflow templates | ✅ Custom actions (marketplace) |
| **Jenkins**        | ✅ Pipeline libraries, job templates     | ✅ Shared libraries (Groovy)          | ✅ Jenkins plugins              |
| **GitLab CI**      | ✅ CI/CD templates, includes             | ✅ Project/group includes             | ⚠️ Limited plugin system         |
| **CircleCI**       | ✅ Orbs, reusable executors              | ✅ Custom orbs                        | ⚠️ Orb-based only                |
| **Azure DevOps**   | ✅ Templates, task groups                | ✅ Custom tasks                       | ✅ Pipeline extensions          |

## Pattern D: Reusable Components

Centralize CDEvents logic into reusable pipeline components that teams can easily adopt.

### GitHub Actions: Reusable Workflows

Create organization-wide workflow templates that include CDEvents instrumentation:

```yaml
# .github/workflows/reusable-deploy.yml
# Organization-level reusable workflow
name: Reusable Deploy with CDEvents

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
      service_name:
        required: true
        type: string
      artifact_tag:
        required: true
        type: string
    secrets:
      CDEVENTS_ENDPOINT_URL:
        required: true
      DEPLOY_TOKEN:
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # Deployment started event
      - name: Send deployment started event
        uses: cdviz-dev/send-cdevents@v1
        with:
          data: |
            {
              "context": {
                "version": "0.4.1",
                "source": "https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}",
                "type": "dev.cdevents.service.deploymentstarted.0.1.0"
              },
              "subject": {
                "id": "${{ inputs.service_name }}/${{ inputs.environment }}",
                "type": "service",
                "content": {
                  "environment": {"id": "${{ inputs.environment }}"},
                  "artifactId": "pkg:oci/${{ inputs.service_name }}@sha256:{digest}?repository_url=ghcr.io/${{ github.repository }}&tag=${{ inputs.artifact_tag }}"
                }
              }
            }
          url: ${{ secrets.CDEVENTS_ENDPOINT_URL }}

      # Actual deployment
      - name: Deploy to ${{ inputs.environment }}
        run: |
          echo "Deploying ${{ inputs.service_name }} to ${{ inputs.environment }}"
          # Your deployment logic here
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}

      # Deployment finished event
      - name: Send deployment finished event
        if: always()
        uses: cdviz-dev/send-cdevents@v1
        with:
          data: |
            {
              "context": {
                "version": "0.4.1",
                "source": "https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}",
                "type": "dev.cdevents.service.deployed.0.2.0"
              },
              "subject": {
                "id": "${{ inputs.service_name }}/${{ inputs.environment }}",
                "type": "service",
                "content": {
                  "environment": {"id": "${{ inputs.environment }}"},
                  "artifactId": "pkg:oci/${{ inputs.service_name }}@sha256:{digest}?repository_url=ghcr.io/${{ github.repository }}&tag=${{ inputs.artifact_tag }}"
                }
              }
            }
          url: ${{ secrets.CDEVENTS_ENDPOINT_URL }}
```

**Using the reusable workflow** in individual service repositories:

```yaml
# .github/workflows/deploy.yml
# Individual service repository
name: Deploy Service

on:
  push:
    branches: [main]

jobs:
  deploy-production:
    uses: my-org/.github/.github/workflows/reusable-deploy.yml@main
    with:
      environment: production
      service_name: my-service
      artifact_tag: ${{ github.sha }}
    secrets:
      CDEVENTS_ENDPOINT_URL: ${{ secrets.CDEVENTS_ENDPOINT_URL }}
      DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

**What this achieves**:

- ✅ **Zero duplication**: CDEvents logic maintained in one place
- ✅ **Easy adoption**: Teams add 5 lines to use organization-wide deployment
- ✅ **Consistent events**: All deployments emit identical CDEvent structure
- ✅ **Centralized updates**: Fix bugs or add features once, all pipelines benefit

### Jenkins: Shared Pipeline Steps

Create reusable Groovy functions that can be called from any Jenkinsfile:

```groovy
// vars/sendCDEvent.groovy
// Shared library step for sending CDEvents
def call(Map config) {
    def eventType = config.eventType ?: 'dev.cdevents.service.deployed.0.2.0'
    def serviceId = config.serviceId ?: env.JOB_NAME
    def environment = config.environment ?: 'production'
    def artifactId = config.artifactId ?: "pkg:generic/${env.JOB_NAME}@${env.BUILD_NUMBER}"

    def eventPayload = """
    {
      "context": {
        "version": "0.4.1",
        "source": "${env.BUILD_URL}",
        "type": "${eventType}"
      },
      "subject": {
        "id": "${serviceId}/${environment}",
        "type": "service",
        "content": {
          "environment": {"id": "${environment}"},
          "artifactId": "${artifactId}"
        }
      }
    }
    """

    sh """
        echo '${eventPayload}' > /tmp/cdevent.json
        cdviz-collector send --data @/tmp/cdevent.json --url ${env.CDEVENTS_ENDPOINT_URL}
        rm /tmp/cdevent.json
    """
}
```

**Using the shared step** in individual Jenkinsfiles:

```groovy
// Jenkinsfile in individual service repository
@Library('my-org-shared-library') _

pipeline {
    agent any

    environment {
        CDEVENTS_ENDPOINT_URL = credentials('cdevents-endpoint-url')
    }

    stages {
        stage('Deploy') {
            steps {
                sh './deploy.sh'

                // Send CDEvent using shared library
                sendCDEvent(
                    eventType: 'dev.cdevents.service.deployed.0.2.0',
                    serviceId: 'my-service',
                    environment: 'production',
                    artifactId: "pkg:oci/my-service@sha256:${env.IMAGE_DIGEST}"
                )
            }
        }
    }
}
```

**What this achieves**:

- ✅ **Function-based reuse**: Call `sendCDEvent()` from any Jenkinsfile
- ✅ **Parameterized flexibility**: Customize event details per pipeline
- ✅ **Default conventions**: Sensible defaults reduce boilerplate
- ✅ **Organization-wide consistency**: All teams use the same CDEvents logic

### GitLab CI: Project Includes and Templates

Create reusable job templates that can be included in any `.gitlab-ci.yml`:

```yaml
# .gitlab/ci-templates/cdevents.yml
# Organization-level CI template
.send_deployment_event:
  image: alpine:latest
  before_script:
    - apk add --no-cache curl bash
    - curl -LO https://github.com/cdviz-dev/cdviz-collector/releases/latest/download/cdviz-collector-linux-x86_64
    - chmod +x cdviz-collector-linux-x86_64
    - mv cdviz-collector-linux-x86_64 /usr/local/bin/cdviz-collector
  script:
    - |
        cdviz-collector send --data '{
          "context": {
            "version": "0.4.1",
            "source": "'"${CI_PIPELINE_URL}"'",
            "type": "dev.cdevents.service.deployed.0.2.0"
          },
          "subject": {
            "id": "'"${SERVICE_NAME}"'/'"${ENVIRONMENT}"'",
            "type": "service",
            "content": {
              "environment": {"id": "'"${ENVIRONMENT}"'"},
              "artifactId": "'"${ARTIFACT_ID}"'"
            }
          }
        }' --url "${CDEVENTS_ENDPOINT_URL}"
```

**Using the template** in individual service repositories:

```yaml
# .gitlab-ci.yml in individual service repository
include:
  - project: "my-org/ci-templates"
    file: "/cdevents.yml"

stages:
  - deploy
  - notify

variables:
  SERVICE_NAME: "my-service"
  ENVIRONMENT: "production"

deploy:
  stage: deploy
  script:
    - ./deploy.sh
    - export ARTIFACT_ID="pkg:oci/my-service@sha256:${IMAGE_DIGEST}"

send_cdevent:
  stage: notify
  extends: .send_deployment_event
  needs: [deploy]
```

**What this achieves**:

- ✅ **Template extension**: Inherit CDEvents logic via `extends`
- ✅ **Variable-based customization**: Configure events via GitLab CI variables
- ✅ **Organization-wide templates**: Centralized maintenance
- ✅ **Easy adoption**: Include one file, extend one job

## Pattern E: Shared Libraries (Advanced)

Deeper integration using platform-specific library systems for organization-wide enforcement.

### Jenkins: Shared Libraries with Automatic Instrumentation

Advanced Jenkins shared libraries can **automatically** instrument pipelines without explicit calls:

```groovy
// vars/standardPipeline.groovy
// Declarative Pipeline wrapper with automatic CDEvents
def call(Map config, Closure body) {
    pipeline {
        agent any

        environment {
            CDEVENTS_ENDPOINT_URL = credentials('cdevents-endpoint-url')
        }

        stages {
            stage('Pipeline Started') {
                steps {
                    script {
                        sendCDEvent(
                            eventType: 'dev.cdevents.pipelinerun.started.0.2.0',
                            serviceId: config.serviceName,
                            environment: config.environment
                        )
                    }
                }
            }

            stage('Execute Pipeline') {
                steps {
                    script {
                        body()
                    }
                }
            }

            stage('Pipeline Finished') {
                steps {
                    script {
                        sendCDEvent(
                            eventType: 'dev.cdevents.pipelinerun.finished.0.2.0',
                            serviceId: config.serviceName,
                            environment: config.environment
                        )
                    }
                }
            }
        }
    }
}
```

**Using the wrapper** in individual Jenkinsfiles:

```groovy
// Jenkinsfile - automatic CDEvents without explicit calls
@Library('my-org-shared-library') _

standardPipeline(serviceName: 'my-service', environment: 'production') {
    stage('Build') {
        sh 'npm install && npm run build'
    }

    stage('Test') {
        sh 'npm test'
    }

    stage('Deploy') {
        sh './deploy.sh'
    }
}
```

**What this achieves**:

- ✅ **Automatic instrumentation**: Teams don't need to think about CDEvents
- ✅ **Consistent lifecycle events**: Started/finished events always sent
- ✅ **Organization-wide enforcement**: All pipelines use the wrapper
- ✅ **Minimal pipeline code**: Focus on business logic, not observability

### GitHub Actions: Custom Composite Actions

Package CDEvents logic into custom composite actions:

```yaml
# .github/actions/deploy-with-events/action.yml
# Organization-level composite action
name: Deploy with CDEvents
description: Deploy service and send CDEvents automatically

inputs:
  service_name:
    required: true
  environment:
    required: true
  artifact_tag:
    required: true
  deploy_command:
    required: true
  cdevents_url:
    required: true

runs:
  using: composite
  steps:
    # Deployment started
    - name: Send deployment started event
      uses: cdviz-dev/send-cdevents@v1
      with:
        data: |
          {
            "context": {
              "version": "0.4.1",
              "source": "https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}",
              "type": "dev.cdevents.service.deploymentstarted.0.1.0"
            },
            "subject": {
              "id": "${{ inputs.service_name }}/${{ inputs.environment }}",
              "type": "service",
              "content": {
                "environment": {"id": "${{ inputs.environment }}"}
              }
            }
          }
        url: ${{ inputs.cdevents_url }}

    # Actual deployment
    - name: Deploy
      shell: bash
      run: ${{ inputs.deploy_command }}

    # Deployment finished
    - name: Send deployment finished event
      if: always()
      uses: cdviz-dev/send-cdevents@v1
      with:
        data: |
          {
            "context": {
              "version": "0.4.1",
              "source": "https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}",
              "type": "dev.cdevents.service.deployed.0.2.0"
            },
            "subject": {
              "id": "${{ inputs.service_name }}/${{ inputs.environment }}",
              "type": "service",
              "content": {
                "environment": {"id": "${{ inputs.environment }}"},
                "artifactId": "pkg:oci/${{ inputs.service_name }}@sha256:{digest}?repository_url=ghcr.io/${{ github.repository }}&tag=${{ inputs.artifact_tag }}"
              }
            }
          }
        url: ${{ inputs.cdevents_url }}
```

**Using the composite action**:

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
      - uses: actions/checkout@v5

      - name: Deploy with events
        uses: my-org/.github/.github/actions/deploy-with-events@main
        with:
          service_name: my-service
          environment: production
          artifact_tag: ${{ github.sha }}
          deploy_command: ./deploy.sh
          cdevents_url: ${{ secrets.CDEVENTS_ENDPOINT_URL }}
```

**What this achieves**:

- ✅ **Encapsulated logic**: Deployment + events in one step
- ✅ **Simple interface**: Teams only provide inputs
- ✅ **Automatic event correlation**: Started/finished events always paired
- ✅ **Organization-wide reuse**: Publish to GitHub Actions Marketplace

## Pattern F: Multi-Pipeline Orchestration

Advanced scenarios where multiple pipelines coordinate using CDEvents.

### Scenario: Microservices Deployment Chain

One service deployment triggers dependent service deployments:

```yaml
# Service A: Triggers downstream deployments
name: Deploy Service A

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Service A
        run: ./deploy.sh

      - name: Send deployment event (triggers Service B)
        uses: cdviz-dev/send-cdevents@v1
        with:
          data: |
            {
              "context": {
                "version": "0.4.1",
                "source": "https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}",
                "type": "dev.cdevents.service.deployed.0.2.0"
              },
              "subject": {
                "id": "service-a/production",
                "type": "service",
                "content": {
                  "environment": {"id": "production"},
                  "artifactId": "pkg:oci/service-a@sha256:{digest}"
                }
              }
            }
          url: ${{ secrets.CDEVENTS_ENDPOINT_URL }}
```

```yaml
# Service B: Triggered by Service A deployment
name: Deploy Service B

on:
  repository_dispatch:
    types: [service-a-deployed]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Service B
        run: ./deploy.sh

      - name: Send deployment event
        uses: cdviz-dev/send-cdevents@v1
        with:
          data: |
            {
              "context": {
                "version": "0.4.1",
                "source": "https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}",
                "type": "dev.cdevents.service.deployed.0.2.0"
              },
              "subject": {
                "id": "service-b/production",
                "type": "service",
                "content": {
                  "environment": {"id": "production"}
                }
              }
            }
          url: ${{ secrets.CDEVENTS_ENDPOINT_URL }}
```

**Orchestration via CDEvents consumer** (future episode will cover this pattern in detail):

```yaml
# n8n workflow (conceptual example)
# Listen for service-a deployments, trigger service-b
trigger:
  type: webhook
  filter: event.type == 'dev.cdevents.service.deployed.0.2.0'
  condition: event.subject.id == 'service-a/production'

actions:
  - name: Trigger Service B deployment
    type: github_dispatch
    repository: my-org/service-b
    event_type: service-a-deployed
```

**What this achieves**:

- ✅ **Event-driven orchestration**: Services coordinate via CDEvents
- ✅ **Loose coupling**: Services don't call each other directly
- ✅ **Audit trail**: Complete deployment history in CDviz
- ✅ **Conditional triggers**: Deploy only when dependencies update

### Cross-Platform Orchestration

CDEvents enable orchestration across different CI/CD platforms:

**GitHub Actions** deploys frontend → **Jenkins** deploys backend → **GitLab CI** runs smoke tests

All connected through CDEvents without tight coupling between platforms.

## Migration Strategy: From Direct to Advanced

Progressively adopt advanced patterns across your organization:

### Phase 1: Pilot with One Team

1. **Create reusable component** (Pattern D) for one common workflow
2. **Migrate 2-3 services** to use the component
3. **Measure adoption friction** and iterate

### Phase 2: Organization-Wide Rollout

1. **Publish shared library** (Pattern E) with automatic instrumentation
2. **Require new services** to use standard pipeline templates
3. **Migrate existing services** incrementally (brownfield)

### Phase 3: Platform Integration

1. **Develop custom plugins** (Pattern F) for maximum automation
2. **Enforce organization-wide standards** via platform configuration
3. **Monitor compliance** through CDviz dashboards

### Migration Checklist

- [ ] Identify most common pipeline patterns (deploy, build, test)
- [ ] Create reusable components for top 3 patterns
- [ ] Document usage examples and best practices
- [ ] Pilot with early adopter team
- [ ] Gather feedback and iterate
- [ ] Roll out to all teams with training
- [ ] Monitor adoption via CDviz dashboards
- [ ] Enforce standards for new services
- [ ] Plan incremental migration for existing services

## Real-World Example: Platform Engineering Team

**Scenario**: 50 microservices across 3 teams using GitHub Actions

**Before Advanced Patterns**:

- Each service has copy-pasted CDEvents code
- Updates require 50 pull requests
- Inconsistent event formats
- No enforcement of standards

**After Advanced Patterns**:

- One reusable workflow (Pattern D)
- Services call workflow with 5 lines of YAML
- Updates deployed to all services in 1 day
- Dashboards show 100% adoption compliance

**Code Reduction**:

- Before: ~150 lines of CDEvents code per service × 50 services = 7,500 lines
- After: ~200 lines in shared workflow + ~5 lines per service = 450 lines
- **95% reduction in total CDEvents code**

## Key Takeaways

🎯 **Reusability over repetition**: Centralize CDEvents logic in shared components
🔧 **Progressive complexity**: Start with templates (D), graduate to libraries (E), consider plugins (F)
📊 **Organization-wide consistency**: Enforce standards through platform patterns
🔒 **Automatic instrumentation**: Best pattern = teams don't think about observability
📈 **Loose coupling**: Multi-pipeline orchestration via CDEvents, not direct calls
⚙️ **Incremental migration**: Pilot → rollout → enforce → measure
🚀 **Massive scale**: Maintain 100+ pipelines with minimal CDEvents code

Advanced patterns transform CDEvents from "integration work" into "platform capability". Centralized logic, automatic instrumentation, and reusable components make observability sustainable at enterprise scale.

---

## Next Steps

**Try these experiments**:

1. Identify your most common pipeline pattern (build/deploy/test)
2. Create a reusable component (Pattern D) for that pattern
3. Migrate 2-3 pipelines to use the component
4. Measure code reduction and adoption friction
5. Expand to shared library (Pattern E) if successful

**Coming next in Episode #5**: Webhook transformers and passive monitoring - collect CDEvents from tools that already send webhooks (GitHub, GitLab, ArgoCD) without modifying pipelines.

**Also explore**: Episodes 6-7 will cover Kubernetes passive monitoring and GitOps integration patterns.

## Resources

- [GitHub Reusable Workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows) - Official documentation
- [Jenkins Shared Libraries](https://www.jenkins.io/doc/book/pipeline/shared-libraries/) - Complete guide
- [GitLab CI/CD Templates](https://docs.gitlab.com/ee/ci/yaml/includes.html) - Include documentation
- [Episode #3: Direct CI/CD Integration](./episode-3-cicd-integration.md) - Foundation patterns
- [CDviz Documentation](https://cdviz.dev) - Complete collector configuration
