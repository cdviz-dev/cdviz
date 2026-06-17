---
title: Jenkins Integration
description: |
  Instrument Jenkins pipelines with CDEvents using cdviz-collector send --run.
  <ul>
  <li>Wrap sh/bat steps in Declarative or Scripted pipelines to emit testSuiteRun CDEvents with JUnit XML results.</li>
  <li>Wrap non-test stages (build, deploy) with taskRun events — no changes to your existing scripts.</li>
  </ul>
editions:
  - community
  - enterprise
integration:
  icon: /icons/jenkins.svg
  type: action/direct
  events:
    - input: test suite results (JUnit XML)
      output: testSuiteRun.started
    - input: test suite results (JUnit XML)
      output: testSuiteRun.finished
    - input: stage start
      output: taskRun.started
    - input: stage finish
      output: taskRun.finished
references:
  - title: cdviz-collector send --run reference
    url: /docs/cdviz-collector/send-run
  - title: cdviz-collector send documentation
    url: /docs/cdviz-collector/send
  - title: Jenkins Pipeline Documentation
    url: https://www.jenkins.io/doc/book/pipeline/
  - title: Jenkins Credentials Binding Plugin
    url: https://plugins.jenkins.io/credentials-binding/
  - title: CDEvents Specification
    url: https://cdevents.dev/
---

<script setup>
import IntegrationCard from '../../../../components/IntegrationCard.vue'
</script>

<IntegrationCard />

## Overview

Use `cdviz-collector send --run` inside Jenkins `sh` steps to wrap existing build, test, or deploy commands. For test stages, use `--run testsuiterun_junit` — the collector parses JUnit XML output and emits `testSuiteRun.started` / `testSuiteRun.finished` events with structured test results. For non-test stages (build, deploy), use `--run taskrun` for exit-code observability.

Jenkins-specific environment variables (`JENKINS_URL`, `JOB_BASE_NAME`, `BUILD_NUMBER`) are read automatically by `ci_env_detection` — **no `--metadata` needed for those**. Use `--metadata` to cross-reference the artifact or environment under test.

## Quick Start

### 1. Install cdviz-collector on agents

The simplest approach is to download the binary at the start of each build. Alternatively, pre-install it on your Jenkins agents via a configuration management tool.

```groovy
sh '''
  curl -sSfL https://github.com/cdviz-dev/cdviz-collector/releases/latest/download/cdviz-collector-x86_64-unknown-linux-musl.tar.gz \
    | tar xz -C /usr/local/bin
  chmod +x /usr/local/bin/cdviz-collector
'''
```

### 2. Store secrets in Jenkins credentials

Add the following in **Manage Jenkins > Credentials**:

| ID            | Kind        | Value                              |
| ------------- | ----------- | ---------------------------------- |
| `cdviz-url`   | Secret text | Your cdviz-collector HTTP endpoint |
| `cdviz-token` | Secret text | Bearer token for authentication    |

### 3. Wrap a test stage

Use the [Credentials Binding Plugin](https://plugins.jenkins.io/credentials-binding/) to inject secrets, then wrap your command:

```groovy
withCredentials([
  string(credentialsId: 'cdviz-url',   variable: 'CDVIZ_URL'),
  string(credentialsId: 'cdviz-token', variable: 'CDVIZ_TOKEN'),
]) {
  sh """
    cdviz-collector send --run testsuiterun_junit \\
      --metadata tested_artifact_id="pkg:oci/my-app@sha256:\$IMAGE_SHA" \\
      --url \$CDVIZ_URL \\
      --header "Authorization: Bearer \$CDVIZ_TOKEN" \\
      -- mvn test
  """
}
```

The collector globs `**/TEST-*.xml` and `**/*.xml` after the process exits and includes parsed results in the `testSuiteRun.finished` event.

## Complete Declarative Pipeline Example

```groovy
pipeline {
  agent any

  environment {
    CDVIZ_URL   = credentials('cdviz-url')
    CDVIZ_TOKEN = credentials('cdviz-token')
  }

  stages {
    stage('Setup') {
      steps {
        sh '''
          curl -sSfL https://github.com/cdviz-dev/cdviz-collector/releases/latest/download/cdviz-collector-x86_64-unknown-linux-musl.tar.gz \
            | tar xz -C /usr/local/bin
          chmod +x /usr/local/bin/cdviz-collector
        '''
      }
    }

    // Build: exit-code only, no test result parsing
    stage('Build') {
      steps {
        sh """
          cdviz-collector send --run taskrun \\
            --url \$CDVIZ_URL \\
            --header "Authorization: Bearer \$CDVIZ_TOKEN" \\
            -- make build
        """
      }
    }

    // Test: JUnit XML parsed automatically from **/TEST-*.xml
    stage('Test') {
      steps {
        sh """
          cdviz-collector send --run testsuiterun_junit \\
            --metadata tested_artifact_id="pkg:oci/my-app@sha256:\$IMAGE_SHA" \\
            --url \$CDVIZ_URL \\
            --header "Authorization: Bearer \$CDVIZ_TOKEN" \\
            -- make test
        """
      }
    }

    // Deploy: exit-code only
    stage('Deploy') {
      when { branch 'main' }
      steps {
        sh """
          cdviz-collector send --run taskrun \\
            --url \$CDVIZ_URL \\
            --header "Authorization: Bearer \$CDVIZ_TOKEN" \\
            -- ./deploy.sh
        """
      }
    }
  }
}
```

> [!TIP]
> `$JENKINS_URL`, `$JOB_BASE_NAME`, and `$BUILD_NUMBER` are detected automatically by `ci_env_detection`. `$GIT_BRANCH` and `$GIT_COMMIT` are also read automatically — omit `--metadata branch=...` and `--metadata commit=...`.

## Options Reference

| Flag                                   | Description                                                 |
| -------------------------------------- | ----------------------------------------------------------- |
| `--run testsuiterun_junit`             | Parse JUnit XML; emit `testSuiteRun` events                 |
| `--run testsuiterun_tap`               | Parse TAP output; emit `testSuiteRun` events                |
| `--run testsuiterun_sarif`             | Parse SARIF JSON; emit `testSuiteRun` events                |
| `--run taskrun`                        | Exit code only; emit `taskRun` events                       |
| `--data <path>`                        | Override the built-in glob with a specific result file path |
| `--metadata tested_artifact_id=<purl>` | Cross-reference artifact under test (repeatable)            |
| `--metadata tested_env_id=<id>`        | Cross-reference environment under test                      |
| `--metadata results_url=<url>`         | Link to results page; also emits `testoutput.published`     |
| `--url <URL>`                          | cdviz-collector HTTP endpoint                               |
| `--header "..."`                       | Additional HTTP header (repeatable)                         |
| `--fail-on-collector-error`            | Fail the stage if the collector sink is unreachable         |

See the [send --run reference](../send-run.md) and [send command reference](../send.md) for the full option list.

## Polling the Jenkins Remote API (no plugin, no pipeline changes)

`send --run` is a **push** integration: you add it inside your pipeline scripts. As an
alternative, the collector can **pull** build data directly from the
[Jenkins Remote API](https://www.jenkins.io/doc/book/using/remote-access-api/) using the
[`http_polling`](../sources/http_polling.md) source — **no Jenkins plugin to install and no
changes to your pipelines**. The collector just needs network access and a read-only
credential.

This suits teams who cannot (or prefer not to) modify every job, want to onboard an existing
Jenkins instance without touching it, or need to ingest builds that already ran.

A multi-pass driver lists a job's builds, then fetches each build's detail, polling on an
interval:

```toml
[sources.jenkins_api]
enabled = true
transformer_refs = ["jenkins_builds"]

[sources.jenkins_api.extractor]
type             = "http_polling"
polling_interval = "1m"
parser           = "json"
min_request_interval = "200ms"
# ts_after        = "2024-12-01T00:00:00Z"   # optional: also backfill from this date
# ts_before_limit = "2025-01-01T00:00:00Z"   # optional: stop after this window (one-shot)

driver_vrl = """
if .response == null {
    # pass 1: list builds for the pipeline, feed back
    .requests = [{
        "url": "https://jenkins.example.com/job/my-pipeline/api/json",
        "query": { "tree": "builds[number,url]" },
        "route": "feedback"
    }]
} else {
    # pass 2: fetch each build's detail
    reqs = []
    for_each(array!(.response.body.builds)) -> |_index, build| {
        reqs = push(reqs, {
            "url": string!(build.url) + "api/json",
            "route": "pipeline"
        })
    }
    .requests = reqs
}
"""

[sources.jenkins_api.extractor.headers]
Authorization = { type = "secret", value = "Basic BASE64_ENCODED_CREDENTIALS" }
```

> [!NOTE] Requires cdviz-collector >= 0.42
> The `http_polling` driver (`driver_vrl`) is available from cdviz-collector 0.42.

Push and poll are complementary:

| Approach            | Setup                          | Latency            | Best for                                     |
| ------------------- | ------------------------------ | ------------------ | -------------------------------------------- |
| `send --run` (push) | Edit each pipeline             | Real-time          | Rich events (JUnit results, custom metadata) |
| API polling (pull)  | One collector source, no edits | `polling_interval` | Zero-touch onboarding, un-instrumented jobs  |

Set `ts_after` / `ts_before_limit` on the same source to also backfill a bounded historical
window. See the [HTTP Polling Source reference](../sources/http_polling.md) for the routing
model, time window, and rate-limit handling.
