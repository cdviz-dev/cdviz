---
title: GitHub Action Integration
description: |
  Send CDEvents directly from GitHub workflows using the send-cdevents action.
  <ul>
  <li>Integrate CDEvents into your CI/CD pipelines without webhooks or external infrastructure.</li>
  <li>Send custom CDEvents directly from your GitHub Actions workflows to any CDEvents consumer or HTTP endpoint.</li>
  </ul>
editions:
  - community
  - enterprise
integration:
  icon: /icons/github.svg
  type: action/direct
  events:
    - input: workflow trigger
      output: custom cdevents
    - input: deployment success
      output: service.deployed
    - input: test completion
      output: test.finished
    - input: artifact build
      output: artifact.packaged
references:
  - title: send-cdevents GitHub Action
    url: https://github.com/cdviz-dev/send-cdevents
  - title: CDEvents Specification
    url: https://cdevents.dev/
  - title: GitHub Actions Documentation
    url: https://docs.github.com/en/actions
---

<script setup>
import IntegrationCard from '../../../../components/IntegrationCard.vue'
</script>

<IntegrationCard />

## Overview

The `send-cdevents` GitHub Action provides a direct way to send CDEvents from your GitHub workflows to any CDEvents consumer or HTTP endpoint. Unlike webhook-based integrations, this action gives you full control over when and what events are sent, making it perfect for custom CI/CD scenarios.

While this documentation focuses on using the action with CDviz, the action works with any CDEvents-compatible system or HTTP endpoint that can receive JSON payloads.

The action supports all standard CDEvents types. For a complete list, see the [CDEvents Specification](https://cdevents.dev/).

## Key Benefits

- **Direct Integration**: No need to configure webhooks or external services
- **Custom Events**: Send exactly the events you need, when you need them
- **Universal Compatibility**: Works with any CDEvents consumer or HTTP endpoint
- **Workflow Control**: Trigger events based on specific workflow conditions
- **Secure**: Uses GitHub's built-in secrets management

## Quick Start

### 1. Basic Usage

Add the action to your workflow to send a CDEvent:

```yaml
name: Send CDEvent
on:
  push:
    branches: [main]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send deployment event
        uses: cdviz-dev/send-cdevents@v1
        with:
          data: |
            {
              "context": {
                "version": "0.4.1",
                "source": "github.com/${{ github.repository }}",
                "type": "dev.cdevents.service.deployed.0.1.4"
              },
              "subject": {
                "id": "myapp/production",
                "type": "service",
                "content": {
                  "version": "${{ github.sha }}",
                  "environment": "production"
                }
              }
            }
          url: ${{ secrets.CDEVENTS_ENDPOINT_URL }}
```

### 2. With Authentication

If your CDEvents endpoint requires authentication, use custom headers:

```yaml
- name: Send authenticated event
  uses: cdviz-dev/send-cdevents@v1
  with:
    data: |
      {
        "context": {
          "version": "0.4.1",
          "source": "github.com/${{ github.repository }}",
          "type": "dev.cdevents.artifact.packaged.0.1.1"
        },
        "subject": {
          "id": "pkg:...",
          "type": "artifact",
          "content": {
            "change": {
              "id": "${{ github.sha }}"
            }
          }
        }
      }
    url: ${{ secrets.CDEVENTS_ENDPOINT_URL }}
    headers: |
      Authorization: Bearer ${{ secrets.CDEVENTS_AUTH_TOKEN }}
```

### 3. With Signature

```yaml
- name: Send authenticated event
  uses: cdviz-dev/send-cdevents@v1
  with:
    data: |
      {
        "context": {
          "version": "0.4.1",
          "source": "github.com/${{ github.repository }}",
          "type": "dev.cdevents.artifact.packaged.0.1.1"
        },
        "subject": {
          "id": "pkg:...",
          "type": "artifact",
          "content": {
            "change": {
              "id": "${{ github.sha }}"
            }
          }
        }
      }
    url: ${{ secrets.CDEVENTS_ENDPOINT_URL }}
    config: |
      [sinks.http.headers.x-signature-256]
      type = "signature"
      algorithm = "sha256"
      prefix = "sha256="
    env:
      CDVIZ_COLLECTOR__SINKS__HTTP__HEADERS__X_SIGNATURE_256__TOKEN: ${{ secrets.CDEVENTS_ENDPOINT_TOKEN }}
```

## Configuration

### Parameters

| Parameter | Required | Description                              | Example                               |
| --------- | -------- | ---------------------------------------- | ------------------------------------- |
| `data`    | Yes      | JSON data containing the CDEvent         | See examples above                    |
| `url`     | No       | HTTP endpoint for sending events         | `https://events.example.com/cdevents` |
| `config`  | No       | TOML configuration for advanced settings | See advanced section                  |
| `headers` | No       | Additional HTTP headers (one per line)   | `Authorization: Bearer token`         |
| `version` | No       | cdviz-collector container version        | `latest` (default)                    |

### Data Input Formats

The `data` parameter accepts multiple formats:

- **Direct JSON**: Inline JSON string (as shown in examples above)
- **From file**: `@path/to/file.json` - reads JSON from a file
- **From stdin**: `@-` - reads JSON from standard input

### CDEvent Structure

Your JSON data should follow the CDEvents specification structure.

> [!TIP] let the action generate `context.id` and `context.timestamp`
> It's recommended to let the action generate `context.id` and `context.timestamp` automatically by omitting these fields from your JSON. The action will populate them with appropriate values (id based on content of the event and current timestamp).

Example minimal structure:

```json
{
  "context": {
    "version": "0.4.1",
    "source": "github.com/myorg/myrepo",
    "type": "dev.cdevents.service.deployed.0.1.4"
  },
  "subject": {
    "id": "myapp/production",
    "type": "service"
  }
}
```

<!--
## Common Use Cases

### Service Deployment Tracking

Track when services are deployed to different environments:

```yaml
name: Deploy to Production
on:
  release:
    types: [published]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy application
        run: |
          # Your deployment steps here
          echo "Deploying ${{ github.event.release.tag_name }}"

      - name: Notify deployment
        if: success()
        uses: cdviz-dev/send-cdevents@v1
        with:
          data: |
            {
              "context": {
                "version": "0.4.1",
                "source": "github.com/${{ github.repository }}",
                "type": "dev.cdevents.service.deployed.0.1.4"
              },
              "subject": {
                "id": "${{ github.event.repository.name }}/production",
                "type": "service",
                "content": {
                  "version": "${{ github.event.release.tag_name }}",
                  "environment": {
                    "id": "production",
                    "source": "github.com/${{ github.repository }}"
                  }
                }
              },
              "customData": {
                "deployer": "${{ github.actor }}"
              }
            }
          url: ${{ secrets.CDEVENTS_ENDPOINT_URL }}
```

### Test Result Reporting

Report test completion and results:

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run tests
        id: test
        run: |
          # Run your tests
          npm test
          echo "result=success" >> $GITHUB_OUTPUT
        continue-on-error: true

      - name: Report test completion
        if: always()
        uses: cdviz-dev/send-cdevents@v1
        with:
          data: |
            {
              "context": {
                "version": "0.4.1",
                "source": "github.com/${{ github.repository }}",
                "type": "dev.cdevents.testcaserun.finished.0.2.0"
              },
              "subject": {
                "id": "test-suite/${{ github.run_id }}",
                "type": "testCaseRun",
                "content": {
                  "outcome": "${{ steps.test.outcome }}",
                  "trigger": {
                    "type": "change",
                    "id": "${{ github.sha }}"
                  }
                }
              },
              "customData": {
                "branch": "${{ github.ref_name }}",
                "commit": "${{ github.sha }}"
              }
            }
          url: ${{ secrets.CDEVENTS_ENDPOINT_URL }}
```

### Artifact Publishing

Track when artifacts are built and published:

```yaml
name: Build and Publish
on:
  push:
    tags: ["v*"]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build artifact
        run: |
          # Build your artifact
          docker build -t myapp:${{ github.ref_name }} .

      - name: Notify artifact packaged
        uses: cdviz-dev/send-cdevents@v1
        with:
          data: |
            {
              "context": {
                "version": "0.4.1",
                "source": "github.com/${{ github.repository }}",
                "type": "dev.cdevents.artifact.packaged.0.1.1"
              },
              "subject": {
                "id": "myapp:${{ github.ref_name }}",
                "type": "artifact",
                "content": {
                  "change": {
                    "id": "${{ github.sha }}"
                  }
                }
              },
              "customData": {
                "artifact_type": "container",
                "tag": "${{ github.ref_name }}"
              }
            }
          url: ${{ secrets.CDEVENTS_ENDPOINT_URL }}
```
-->

## Complementary: GitHub Webhook Integration

For comprehensive GitHub activity tracking, you can use the **[GitHub Webhook integration](/docs/cdviz-collector/integrations/github)** alongside this GitHub Action.

**These approaches can be used together** for complete event coverage:

| Feature           | GitHub Action          | Webhook Integration           |
| ----------------- | ---------------------- | ----------------------------- |
| **Setup**         | Add action to workflow | Configure webhook + collector |
| **Event Control** | Custom events only     | All GitHub events             |
| **Custom Data**   | Full control           | Limited to webhook payload    |
| **Timing**        | Workflow-controlled    | Real-time                     |
| **Maintenance**   | Per-workflow setup     | Central configuration         |

**Recommended combinations:**

- **GitHub Action only**: Custom events for specific workflows with full control
- **Webhooks only**: Complete GitHub activity tracking with automatic setup
- **Both together**: Comprehensive GitHub events (webhooks) + custom workflow data (actions)

**Example combined use case**: Use webhooks to track all repository activity automatically, while adding GitHub Actions to specific deployment workflows to send detailed deployment context and custom metrics.

For step-by-step webhook setup instructions, see the [GitHub Webhook Integration Guide](/docs/cdviz-collector/integrations/github).

## Advanced Configuration

As the action is a wrapper over [`cdviz-collector send`](../send.md), you can configure it to use:

- transformers
- all kind of sinks, except those running in server mode (like SSE) and when available (Kafka, NATS, ...)
