---
title: "CDEvents in Action #3: Direct CI/CD Pipeline Integration"
description: "Learn universal patterns to send CDEvents from any CI/CD system. Progressive examples from curl+bash to platform plugins, with CDEvents best practices."
tags:
  [
    "cdevents",
    "devops",
    "cicd",
    "github-actions",
    "jenkins",
    "gitlab",
    "circleci",
    "automation",
  ]
target_audience: "CI/CD Practitioners, DevOps Engineers"
reading_time: "8 minutes"
series: "CDEvents in Action"
series_part: 3
published: false
---

# CDEvents in Action #3: Direct CI/CD Pipeline Integration

_Automate CDEvents directly from your CI/CD pipelines. Learn three universal integration patterns - from curl+bash to platform plugins - with production-ready best practices for any CI/CD system._

## From Manual to Automated

In Episode #2, you learned how to send CDEvents manually using curl, bash scripts, and `cdviz-collector send`. Now it's time to **automate** this within your CI/CD pipelines.

Manual event sending works for testing, but production requires:

- **Automatic execution**: Events sent without manual intervention
- **Pipeline integration**: Events triggered by deployments, tests, builds
- **Context enrichment**: Include git commits, build numbers, environments
- **Error handling**: Graceful failures that don't break pipelines
- **Secrets management**: Secure authentication without exposing tokens

**This episode focuses on direct integration** - modifying your pipelines to send CDEvents. In later episodes, we'll explore **passive monitoring** approaches that collect events without changing every pipeline.

## Three Universal Integration Patterns

These patterns work across **all CI/CD systems** - GitHub Actions, Jenkins, GitLab CI, CircleCI, and any platform with shell support:

| Pattern                                 | Description                                    | Best For                                       | Complexity |
| --------------------------------------- | ---------------------------------------------- | ---------------------------------------------- | ---------- |
| **Pattern A: Curl + bash script**       | Direct HTTP POST with bash                     | Constrained environments, minimal dependencies | Low        |
| **Pattern B: cdviz-collector send**     | Install collector CLI, send events via command | Multiple destinations, flexibility             | Medium     |
| **Pattern C: Platform-specific plugin** | Use native actions/plugins/orbs                | Simplest when available                        | Very Low   |

This ordering reflects **progressive complexity**: Pattern A shows the foundational HTTP mechanics, Pattern B adds tooling benefits, and Pattern C provides platform integration convenience.

### Pattern Decision Matrix

**Use Pattern A (curl + bash) if**:

- Your environment restricts installing binaries
- You only need simple HTTP POST
- You want minimal dependencies
- You're comfortable maintaining bash scripts

**Use Pattern B (cdviz-collector send) if**:

- You need to send to various destination types (HTTP, Kafka, Database, S3)
- You want automatic ID and timestamp generation
- You need advanced features (transformers, signatures, validation)
- You're building for long-term flexibility

**Use Pattern C (platform-specific plugin) if**:

- Your platform has a native CDEvents plugin/action
- You want the simplest possible setup

## Platform Compatibility Matrix

Before diving into detailed examples, here's how each pattern maps to popular CI/CD platforms:

| Platform                | Pattern A (Curl + Bash) | Pattern B (cdviz-collector) | Pattern C (Plugin)  |
| ----------------------- | ----------------------- | --------------------------- | ------------------- |
| **Jenkins**             | ✅ Yes                  | ✅ Yes                      | ❓ Plugins TBD      |
| **GitLab CI**           | ✅ Yes                  | ✅ Yes                      | ❌ No native        |
| **GitHub Actions**      | ✅ Yes                  | ✅ Yes                      | ✅ send-cdevents@v1 |
| **CircleCI**            | ✅ Yes                  | ✅ Yes                      | ❓ Orbs TBD         |
| **Azure DevOps**        | ✅ Yes                  | ✅ Yes                      | ❓ Tasks TBD        |
| **Bitbucket Pipelines** | ✅ Yes                  | ✅ Yes                      | ❌ No native        |
| **Generic/Custom**      | ✅ If bash available    | ✅ If bash/curl available   | ❌ No native        |

**Key Takeaway**: Patterns A and B work universally on any platform with shell access. Pattern C provides the simplest experience but depends on platform-specific plugin availability.

## Pattern Examples: From Curl to Plugin

The following sections show one detailed example per pattern, demonstrating the progression from foundational HTTP mechanics to platform-integrated convenience.

### Pattern A: Curl + Bash (Jenkins) - Most Portable

**When to use**: Restricted environments, can't install binaries, minimal dependencies

Jenkins Declarative Pipeline using direct HTTP POST with bash - works anywhere with curl and openssl:

```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        CDEVENTS_ENDPOINT_URL = credentials('cdevents-endpoint-url')
        API_TOKEN = credentials('api-token')
    }

    stages {
        stage('Deploy') {
            steps {
                sh './deploy.sh'

                // Send deployment event with curl
                sh '''
                    cat > body.json <<EOF
                    {
                      "context": {
                        "version": "0.4.1",
                        "source": "${BUILD_URL}",
                        "type": "dev.cdevents.service.deployed.0.2.0",
                        "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
                      },
                      "subject": {
                        "id": "my-namespace/my-service",
                        "type": "service",
                        "content": {
                          "environment": {"id": "production"},
                          "artifactId": "pkg:oci/my-service@sha256:{digest}?repository_url=docker.io/my-org/my-service&tag={version}"
                        }
                      }
                    }
                    EOF

                    SIGNATURE=$(openssl dgst -hex -sha256 -hmac "$API_TOKEN" body.json)
                    SIGNATURE=${SIGNATURE#* }

                    curl -X POST "$CDEVENTS_ENDPOINT_URL" \
                      -H "Content-Type: application/json" \
                      -H "X-Signature: sha256=$SIGNATURE" \
                      --data @body.json

                    rm body.json
                '''
            }
        }
    }
}
```

**What this does**:

- ✅ Zero external dependencies (uses curl + openssl)
- ✅ Works in any environment with bash
- ✅ Full control over event payload and HTTP request
- ✅ HMAC signature authentication for secure delivery

**Adaptation for other platforms**: Replace Jenkins-specific variables (`$BUILD_URL`, `$GIT_COMMIT`) with your platform's equivalents. The curl command works identically across all systems.

### Pattern B: cdviz-collector send (GitLab CI) - More Flexible

**When to use**: Need multiple destinations, advanced configuration, automatic ID/timestamp generation

GitLab CI using `cdviz-collector` CLI for enhanced features:

```yaml
# .gitlab-ci.yml
stages:
  - build
  - deploy

variables:
  CDEVENTS_ENDPOINT_URL: $CDEVENTS_ENDPOINT_URL # From CI/CD variables

build:
  stage: build
  script:
    - npm install
    - npm run build

deploy:
  stage: deploy
  script:
    # Install cdviz-collector (cache this in practice)
    - curl -LO https://github.com/cdviz-dev/cdviz-collector/releases/latest/download/cdviz-collector-linux-x86_64
    - chmod +x cdviz-collector-linux-x86_64
    - mv cdviz-collector-linux-x86_64 /usr/local/bin/cdviz-collector

    # Deploy application
    - ./deploy.sh

    # Send deployment event (minimal format - collector generates ID/timestamp)
    - |
        cdviz-collector send --data '{
          "context": {
            "version": "0.4.1",
            "source": "'"${CI_PIPELINE_URL}"'",
            "type": "dev.cdevents.service.deployed.0.2.0"
          },
          "subject": {
            "id": "/my-namespace/'"${CI_PROJECT_NAME}"'",
            "type": "service",
            "content": {
              "environment": {"id": "production"},
              "artifactId": "pkg:oci/'"${CI_PROJECT_NAME}"'@sha256:{digest}?repository_url=registry.example.com/'"${CI_PROJECT_NAME}"'&tag='"${CI_COMMIT_SHORT_SHA}"'"
            }
          }
        }' --url "${CDEVENTS_ENDPOINT_URL}" \
           --header "Authorization: Bearer ${CDEVENTS_AUTH_TOKEN}"
```

**What this does**:

- ✅ Automatic ID and timestamp generation (no manual `context.id` or `context.timestamp`)
- ✅ Built-in validation of CDEvent format
- ✅ Support for various destination types (HTTP, Kafka, S3, Database, and more)
- ✅ Advanced authentication (HMAC, Bearer tokens, custom headers)
- ✅ Transformers and data manipulation capabilities

**Adaptation for other platforms**: Install `cdviz-collector` binary, replace GitLab variables (`$CI_PIPELINE_URL`, `$CI_COMMIT_SHA`) with your platform's equivalents.

**[→ cdviz-collector send documentation](https://cdviz.dev/docs/cdviz-collector/send.html)**

### Pattern C: Platform Plugin (GitHub Actions) - Easiest

**When to use**: Simplest approach for GitHub users, platform-native integration

GitHub Actions using the `send-cdevents` action for zero-configuration setup:

```yaml
# .github/workflows/deploy.yml
name: Deploy Service

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy application
        run: |
          echo "Deploying to production..."
          # Your deployment commands here

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
                "id": "/my-namespace/${{ github.event.repository.name }}",
                "type": "service",
                "content": {
                  "environment": {"id": "production"},
                  "artifactId": "pkg:oci/${{ github.event.repository.name }}@sha256:{digest}?repository_url=ghcr.io/${{ github.repository }}&tag=${{ github.ref_name }}"
                }
              }
            }
          url: ${{ secrets.CDEVENTS_ENDPOINT_URL }}
```

**What this does**:

- ✅ Automatic ID and timestamp generation
- ✅ Built-in validation of CDEvent format
- ✅ Native GitHub Actions integration
- ✅ Secure secrets management
- ✅ Zero installation required

**Adaptation for other platforms**: Check if your platform has a native CDEvents plugin (see Platform Compatibility Matrix). If not, use Pattern A or B.

**[→ send-cdevents action documentation](https://cdviz.dev/docs/cdviz-collector/integrations/github-action.html)**

## Complete Multi-Event Workflow Example

Real-world CI/CD pipelines generate multiple events tracking the entire software delivery lifecycle. This GitHub Actions example shows a simplified instrumentation:

```yaml
# .github/workflows/complete-pipeline.yml
name: Complete CI/CD Pipeline

on:
  push:
    branches: [main]

jobs:
  build-test-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      # Build started
      - name: Build started event
        uses: cdviz-dev/send-cdevents@v1
        with:
          data: |
            {
              "context": {
                "version": "0.4.1",
                "source": "https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}",
                "type": "dev.cdevents.taskrun.started.0.2.0"
              },
              "subject": {
                "id": "build-job/${{ github.run_id }}",
                "type": "taskRun",
                "content": {
                  "taskName": "build"
                }
              }
            }
          url: ${{ secrets.CDEVENTS_ENDPOINT_URL }}

      # Build application
      - name: Build
        run: |
          npm install
          npm run build

      # Build finished
      - name: Build finished event
        if: always()
        uses: cdviz-dev/send-cdevents@v1
        with:
          data: |
            {
              "context": {
                "version": "0.4.1",
                "source": "https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}",
                "type": "dev.cdevents.taskrun.finished.0.2.0"
              },
              "subject": {
                "id": "build-job/${{ github.run_id }}",
                "type": "taskRun",
                "content": {
                  "taskName": "build",
                  "outcome": "${{ job.status }}"
                }
              }
            }
          url: ${{ secrets.CDEVENTS_ENDPOINT_URL }}

      # Test execution
      - name: Run tests
        id: test
        run: npm test
        continue-on-error: true

      # Test finished
      - name: Test finished event
        if: always()
        uses: cdviz-dev/send-cdevents@v1
        with:
          data: |
            {
              "context": {
                "version": "0.4.1",
                "source": "https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}",
                "type": "dev.cdevents.testcaserun.finished.0.2.0"
              },
              "subject": {
                "id": "test-suite/${{ github.run_id }}",
                "type": "testCaseRun",
                "content": {
                  "outcome": "${{ steps.test.outcome }}"
                }
              }
            }
          url: ${{ secrets.CDEVENTS_ENDPOINT_URL }}

      # Deploy
      - name: Deploy to production
        if: steps.test.outcome == 'success'
        run: |
          echo "Deploying to production..."

      # Deployment event
      - name: Deployment event
        if: steps.test.outcome == 'success'
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
                "id": "${{ github.event.repository.name }}/production",
                "type": "service",
                "content": {
                  "environment": {"id": "production"},
                  "artifactId": "pkg:oci/${{ github.event.repository.name }}@sha256:{digest}?repository_url=ghcr.io/${{ github.repository }}&tag=${{ github.ref_name }}"
                }
              }
            }
          url: ${{ secrets.CDEVENTS_ENDPOINT_URL }}
```

**⚠️ Note on Complete Instrumentation**: This example shows **simplified** instrumentation with 4 events. A **fully instrumented** CI/CD pipeline would generate:

- `pipelinerun.started` + `pipelinerun.finished` (workflow level)
- `taskrun.started` + `taskrun.finished` (for each job/stage)
- `testsuiterun.started` + `testsuiterun.finished` (test suite execution)
- `testrun.started` + `testrun.finished` (individual test cases)
- `artifact.packaged` + `artifact.published` (when building/pushing OCI images)

Full instrumentation provides complete observability but requires more integration work. Start with key lifecycle events (build, test, deploy) and expand based on observability needs.

_Interested in a dedicated article on complete pipeline instrumentation patterns? Let us know (via comment) !_

## Authentication & Security

All patterns support secure delivery with platform-native secrets management.

### Adding Authentication to Your Pattern

**Pattern A (Curl + Bash)** - Already includes HMAC signature (see Jenkins example above).

**Pattern B (cdviz-collector send)** - Add Bearer token header:

```yaml
# GitLab CI example - add authentication
deploy:
  script:
    # ... (existing deployment steps)
    - |
        cdviz-collector send --data '{...}' \
          --url "${CDEVENTS_ENDPOINT_URL}" \
          --header "Authorization: Bearer ${CDEVENTS_AUTH_TOKEN}"  # ← Add this
```

**Pattern C (GitHub Actions)** - Add HMAC signature via config:

```yaml
# GitHub Actions - add HMAC signature
- name: Send with signature
  uses: cdviz-dev/send-cdevents@v1
  with:
    data: |
      {...}  # Your event payload
    url: ${{ secrets.CDEVENTS_ENDPOINT_URL }}
    config: | # ← Add this section
      [sinks.http.headers.x-signature-256]
      type = "signature"
      algorithm = "sha256"
      prefix = "sha256="
  env:
    CDVIZ_COLLECTOR__SINKS__HTTP__HEADERS__X_SIGNATURE_256__TOKEN: ${{ secrets.CDEVENTS_ENDPOINT_TOKEN }}
```

### Error Handling

Prevent CDEvents delivery failures from breaking your pipeline:

```yaml
# GitHub Actions
- name: Send event
  continue-on-error: true # ← Pipeline continues even if event fails
  uses: cdviz-dev/send-cdevents@v1
```

```groovy
// Jenkins
try {
    sh 'cdviz-collector send ...'
} catch (Exception e) {
    echo "Failed to send CDEvent: ${e}"  // Log but don't fail
}
```

```yaml
# GitLab CI
send_event:
  script:
    - cdviz-collector send ... || true # ← Continue on failure
```

## My Opinionated CDEvents Best Practices

When creating CDEvents, choosing good values for key fields improves observability and event correlation.

**Note**: Some examples in this article simplify these rules for clarity. Follow these practices in production deployments.

### context.source - Event Origin

**Rule**: Use the **URL of the specific workflow/job execution**, not just the repository.

**Why**: Enables tracing events back to the exact pipeline run that generated them.

```yaml
# ✅ Good - Specific workflow run
"source": "https://github.com/myorg/myrepo/actions/runs/12345"
"source": "https://gitlab.com/myorg/myrepo/-/pipelines/67890"
"source": "https://jenkins.example.com/job/deploy/123"

# ❌ Avoid - Too generic - conflict when aggregated within a bigger scope
"source": "github.com/myorg/myrepo"
"source": "myrepo"
```

### subject.id - Event Subject Identifier

**Rule**: Use **unique, hierarchical identifiers** scoped to your organization where all events are collected.

**Why**: Enables filtering and grouping events by service, environment, or component when events from multiple sources are aggregated together.

**Important**: Do NOT use `subject.source` - it's confusing and optional. Instead, make `subject.id` unique within your organization's scope and let `context.source` identify the event origin.

```yaml
# ✅ Good - Unique within organization, hierarchical, semantic
"subject.id": "my-service/production"
"subject.id": "frontend/staging/web-app"
"subject.id": "backend/dev/api-gateway"
"subject.id": "/team/my-service/production" # Include team for larger orgs

# ❌ Avoid - Not unique or too generic within your scope
"subject.id": "550e8400-e29b-41d4-a716-446655440000" # UUID (use context.id for that)
"subject.id": "run-12345" # Run-specific (use context.id for that)
"subject.id": "production" # Too generic - which service?
```

### environment.id - Deployment Environment

**Rule**: Use **consistent, lowercase environment names** across all services.

**Why**: Enables environment-level dashboards and alerts.

```yaml
# ✅ Good - Consistent naming
"environment": { "id": "production" }
"environment": { "id": "staging" }
"environment": { "id": "dev" }

# ❌ Avoid - Inconsistent naming
"environment": { "id": "prod" } # vs "production"
"environment": { "id": "STAGING" } # vs "staging"
"environment": { "id": "dev-123" } # too specific
```

### artifactId - Package URL (PURL)

**Rule**: Follow the [Package URL specification](https://github.com/package-url/purl-spec) for your artifact type.

**Why**: Enables universal artifact identification and dependency tracking.

**Common Patterns**:

```yaml
# OCI images (Docker/container registries)
# Note: OCI type doesn't support namespace - use query params for registry/repo
"artifactId": "pkg:oci/my-app@sha256:abc123def456...?repository_url=ghcr.io/myorg/my-app&tag=v1.2.3"
"artifactId": "pkg:oci/nginx@sha256:def456abc123...?repository_url=docker.io/library/nginx&tag=latest"

# NPM packages
"artifactId": "pkg:npm/lodash@4.17.21"

# Maven artifacts
"artifactId": "pkg:maven/org.springframework/spring-core@5.3.10"

# Generic packages
"artifactId": "pkg:generic/my-app@1.2.3"
```

**Common Gotchas**:

- **Digest vs Tag**: Use digest (`@sha256:...`) for immutability, not commit SHA - this is the image digest, not the source code commit
- **OCI Namespace Limitation**: `pkg:oci/` type does NOT support namespace in the path - use `repository_url` query parameter instead
- **Registry Encoding**: OCI requires `repository_url` query param; other types may encode registry differently
- **Version Semantics**: For OCI, the version is the **image digest**, not the git commit that built it
- **Type-Specific Rules**: Each PURL type (`pkg:oci/`, `pkg:npm/`, etc.) has unique encoding rules - always check the spec

**[→ Full PURL specification](https://github.com/package-url/purl-spec)**

### Automatic ID and Timestamp Generation

**Rule**: Let tools generate `context.id` and `context.timestamp` when possible.

**Why**: Avoids manual errors and ensures content-based deduplication.

```json
{
  "context": {
    "version": "0.4.1",
    // ✅ Omit "id" - cdviz-collector generates content-based ID
    "source": "https://github.com/myorg/myrepo/actions/runs/12345",
    "type": "dev.cdevents.service.deployed.0.2.0"
    // ✅ Omit "timestamp" - cdviz-collector uses current time
  }
}
```

## Key Takeaways

🎯 **Three universal patterns**: Curl+bash → cdviz-collector → platform plugins (progressive complexity)
🔧 **One pattern per platform**: Jenkins (Pattern A), GitLab CI (Pattern B), GitHub Actions (Pattern C)
📊 **Cross-platform compatibility**: All patterns work on any platform with shell access
🔒 **Security built-in**: Native secrets management, HMAC signatures, error handling
📝 **CDEvents best practices**: Use workflow URLs for source, hierarchical subject IDs, PURL for artifacts
⚙️ **Auto-generated fields**: Let tools generate context.id and context.timestamp
📈 **Start simple**: Begin with key lifecycle events (build, test, deploy), expand as needed

Direct CI/CD integration gives you full control over CDEvents generation. These patterns work universally, letting you implement observability regardless of your tooling.

---

## Next Steps

**Try these experiments**:

1. Start with Pattern A (curl+bash) to understand the HTTP mechanics
2. Upgrade to Pattern B (cdviz-collector) for production flexibility
3. Use Pattern C (platform plugin) if available on your platform
4. Apply CDEvents best practices (workflow URLs, hierarchical IDs, PURL)
5. Add authentication (HMAC signatures) for production deployments

**Coming next in Episode #4**: Advanced patterns including Jenkins plugins, shared libraries, multi-pipeline orchestration, and reusable components for enterprise CI/CD.

**Also explore**: Episodes 5-7 will cover **passive monitoring** - collecting events without modifying pipelines, perfect for legacy systems.

## Resources

- [send-cdevents GitHub Action](https://cdviz.dev/docs/cdviz-collector/integrations/github-action.html) - Complete action reference
- [cdviz-collector send documentation](https://cdviz.dev/docs/cdviz-collector/send.html) - CLI command reference
- [Episode #2: Send Your First CDEvent](./20251001-episode-2-send-first-cdevent) - Foundation for these patterns
- [CDEvents Specification](https://cdevents.dev) - Complete event standard reference
