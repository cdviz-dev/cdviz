---
title: GitHub Actions CI Integration
description: |
  Instrument GitHub Actions workflows with CDEvents using cdviz-collector send --run.
  <ul>
  <li>Wrap test steps to emit testSuiteRun CDEvents with JUnit XML or TAP results automatically parsed.</li>
  <li>Wrap non-test steps (build, deploy) with taskRun events — no changes to your existing scripts.</li>
  </ul>
editions:
  - community
  - enterprise
integration:
  icon: /icons/github.svg
  type: action/direct
  events:
    - input: test suite results (JUnit XML)
      output: testSuiteRun.started
    - input: test suite results (JUnit XML)
      output: testSuiteRun.finished
    - input: job step start
      output: taskRun.started
    - input: job step finish
      output: taskRun.finished
references:
  - title: cdviz-collector send --run reference
    url: /docs/cdviz-collector/send-run
  - title: cdviz-collector send documentation
    url: /docs/cdviz-collector/send
  - title: GitHub Actions Documentation
    url: https://docs.github.com/en/actions
  - title: CDEvents Specification
    url: https://cdevents.dev/
---

<script setup>
import IntegrationCard from '../../../../components/IntegrationCard.vue'
</script>

<IntegrationCard />

## Overview

Use `cdviz-collector send --run` to wrap individual steps in your GitHub Actions workflows. For test steps, use `--run testsuiterun_junit` (or `testsuiterun_tap`) — the collector parses JUnit XML output and emits `testSuiteRun.started` / `testSuiteRun.finished` events with structured test results. For non-test steps (build, deploy), use `--run taskrun` for exit-code observability.

Branch, commit, and job name are read automatically from GitHub Actions environment variables — **no `--metadata` needed for those**. Use `--metadata` to cross-reference the artifact or environment under test.

This complements the [GitHub Webhook integration](/docs/cdviz-collector/integrations/github) (which tracks repository events) and the [GitHub Action](/docs/cdviz-collector/integrations/github-action) (which sends hand-crafted CDEvents).

## Quick Start

### 1. Install cdviz-collector

Download the binary in a workflow step before using it:

```yaml
- name: Install cdviz-collector
  run: |
    curl -sSfL https://github.com/cdviz-dev/cdviz-collector/releases/latest/download/cdviz-collector-x86_64-unknown-linux-musl.tar.gz \
      | tar xz -C /usr/local/bin
    chmod +x /usr/local/bin/cdviz-collector
```

### 2. Add secrets

In your repository settings (**Settings > Secrets and variables > Actions**), add:

| Secret        | Value                                         |
| ------------- | --------------------------------------------- |
| `CDVIZ_URL`   | Your cdviz-collector HTTP endpoint            |
| `CDVIZ_TOKEN` | Bearer token for authentication (if required) |

### 3. Wrap a test step

Replace a plain `run:` step with a `cdviz-collector send --run testsuiterun_junit` invocation:

```yaml
- name: Run tests
  run: |
    cdviz-collector send --run testsuiterun_junit \
      --metadata tested_artifact_id="pkg:oci/my-app@sha256:${{ env.IMAGE_SHA }}" \
      --url ${{ secrets.CDVIZ_URL }} \
      --header "Authorization: Bearer ${{ secrets.CDVIZ_TOKEN }}" \
      -- mvn test
```

The collector globs `**/TEST-*.xml` and `**/*.xml` after the process exits and includes parsed results in the `testSuiteRun.finished` event.

## Complete Workflow Example

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install cdviz-collector
        run: |
          curl -sSfL https://github.com/cdviz-dev/cdviz-collector/releases/latest/download/cdviz-collector-x86_64-unknown-linux-musl.tar.gz \
            | tar xz -C /usr/local/bin

      # Build: exit-code only, no test result parsing
      - name: Build
        run: |
          cdviz-collector send --run taskrun \
            --url ${{ secrets.CDVIZ_URL }} \
            --header "Authorization: Bearer ${{ secrets.CDVIZ_TOKEN }}" \
            -- npm run build

      # Unit tests: JUnit XML parsed automatically from **/TEST-*.xml
      - name: Unit Tests
        run: |
          cdviz-collector send --run testsuiterun_junit \
            --metadata tested_artifact_id="pkg:oci/my-app@sha256:${{ env.IMAGE_SHA }}" \
            --url ${{ secrets.CDVIZ_URL }} \
            --header "Authorization: Bearer ${{ secrets.CDVIZ_TOKEN }}" \
            -- mvn test

      # Integration tests with TAP output
      - name: Integration Tests
        run: |
          cdviz-collector send --run testsuiterun_tap \
            --metadata tested_artifact_id="pkg:oci/my-app@sha256:${{ env.IMAGE_SHA }}" \
            --metadata tested_env_id="/cluster/staging" \
            --url ${{ secrets.CDVIZ_URL }} \
            --header "Authorization: Bearer ${{ secrets.CDVIZ_TOKEN }}" \
            -- node --test --test-reporter=tap

      # Security scan: SARIF output collected from **/*.sarif after the tool exits
      - name: Security Scan
        run: |
          cdviz-collector send --run testsuiterun_sarif \
            --metadata tested_artifact_id="pkg:oci/my-app@sha256:${{ env.IMAGE_SHA }}" \
            --url ${{ secrets.CDVIZ_URL }} \
            --header "Authorization: Bearer ${{ secrets.CDVIZ_TOKEN }}" \
            -- trivy image --format sarif --output results.sarif my-app:latest
```

> [!TIP]
> Branch (`$GITHUB_REF_NAME`) and commit (`$GITHUB_SHA`) are detected automatically by `ci_env_detection` — omit `--metadata branch=...` and `--metadata commit=...`.

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
| `--fail-on-collector-error`            | Fail the step if the collector sink is unreachable          |

See the [send --run reference](../send-run.md) and [send command reference](../send.md) for the full option list.

## Related Integrations

- **[GitHub Webhook](./github.md)** — passive tracking of all repository, PR, and pipeline events
- **[GitHub Action](./github-action.md)** — send hand-crafted CDEvents from workflow steps
