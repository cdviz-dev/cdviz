---
title: GitLab CI Integration
description: |
  Instrument GitLab CI/CD pipelines with CDEvents using cdviz-collector send --run.
  <ul>
  <li>Wrap test jobs to emit testSuiteRun CDEvents with JUnit XML or TAP results automatically parsed.</li>
  <li>Wrap non-test jobs (build, deploy) with taskRun events — no changes to your existing scripts.</li>
  </ul>
editions:
  - community
  - enterprise
integration:
  icon: /icons/gitlab.svg
  type: action/direct
  events:
    - input: test suite results (JUnit XML)
      output: testSuiteRun.started
    - input: test suite results (JUnit XML)
      output: testSuiteRun.finished
    - input: job start
      output: taskRun.started
    - input: job finish
      output: taskRun.finished
references:
  - title: cdviz-collector send --run reference
    url: /docs/cdviz-collector/send-run
  - title: cdviz-collector send documentation
    url: /docs/cdviz-collector/send
  - title: GitLab CI/CD Documentation
    url: https://docs.gitlab.com/ee/ci/
  - title: CDEvents Specification
    url: https://cdevents.dev/
---

<script setup>
import IntegrationCard from '../../../../components/IntegrationCard.vue'
</script>

<IntegrationCard />

## Overview

Use `cdviz-collector send --run` to wrap commands inside GitLab CI jobs. For test jobs, use `--run testsuiterun_junit` (or `testsuiterun_tap`) — the collector parses JUnit XML output and emits `testSuiteRun.started` / `testSuiteRun.finished` events with structured test results. For non-test jobs (build, deploy), use `--run taskrun` for exit-code observability.

Branch, commit SHA, and job name are read automatically from GitLab CI environment variables — **no `--metadata` needed for those**. Use `--metadata` to cross-reference the artifact or environment under test.

This complements the [GitLab Webhook integration](/docs/cdviz-collector/integrations/gitlab), which passively tracks repository and pipeline events.

## Quick Start

### 1. Configure CI variables

In **Settings > CI/CD > Variables**, add:

| Variable                | Value                                           |
| ----------------------- | ----------------------------------------------- |
| `CDVIZ_COLLECTOR_URL`   | Your cdviz-collector HTTP endpoint              |
| `CDVIZ_COLLECTOR_TOKEN` | Your cdviz-collector config (see example below) |

Mark both as **masked** to prevent them from appearing in job logs.

Using token to sign or as bearer token depends of the configuration of your cdevents consummer (could be a cdviz-collector running in server mode).

### 2. Install cdviz-collector

Add an installation step in your `.gitlab-ci.yml`, either as a `before_script` entry or a dedicated job:

```yaml
.install-cdviz:
  before_script:
    - curl --proto '=https' --tlsv1.2 -LsSf https://github.com/cdviz-dev/cdviz-collector/releases/latest/download/cdviz-collector-x86_64-unknown-linux-musl.tar.xz
      | tar xJ -C /usr/local/bin --strip-components=1 cdviz-collector-x86_64-unknown-linux-musl/cdviz-collector
    - chmod +x /usr/local/bin/cdviz-collector
    - |
        cat >"$CI_PROJECT_DIR/.cdviz-collector.toml" <<-EOF
        [sinks.http.headers.x-signature]
        type = "signature"
        token = "$CDVIZ_COLLECTOR_TOKEN"
        signature_prefix = "sha256="
        signature_encoding = "hex"
        EOF
  after_script:
    - rm -f "$CI_PROJECT_DIR/.cdviz-collector.toml"
```

> [!WARNING]
> cdviz-collector allow to define / override any configuration via environment variable. But GitLab uses bash `export` that doesn't support variable name with `-`. So use configuration file for variable with a `-` like some http header.

### 3. Wrap a test command

```yaml
test:
  extends: .install-cdviz
  script:
    - cdviz-collector send -q
      --run testsuiterun_junit
      --metadata "tested_artifact_id=pkg:oci/my-app@sha256:$IMAGE_SHA"
      --url "$CDVIZ_COLLECTOR_URL"
      --config "$CI_PROJECT_DIR/.cdviz-collector.toml"
      -- mvn test
```

The collector globs `**/TEST-*.xml` and `**/*.xml` after the process exits and includes parsed results in the `testSuiteRun.finished` event.

## Complete `.gitlab-ci.yml` Example

```yaml
stages:
  - build
  - test
  - deploy

.install-cdviz:
  before_script:
    - curl --proto '=https' --tlsv1.2 -LsSf https://github.com/cdviz-dev/cdviz-collector/releases/latest/download/cdviz-collector-x86_64-unknown-linux-musl.tar.xz
      | tar xJ -C /usr/local/bin --strip-components=1 cdviz-collector-x86_64-unknown-linux-musl/cdviz-collector
    - chmod +x /usr/local/bin/cdviz-collector
    - |
        cat >"$CI_PROJECT_DIR/.cdviz-collector.toml" <<-EOF
        [sinks.http.headers.x-signature]
        type = "signature"
        token = "$CDVIZ_COLLECTOR_TOKEN"
        signature_prefix = "sha256="
        signature_encoding = "hex"
        EOF
  after_script:
    - rm -f "$CI_PROJECT_DIR/.cdviz-collector.toml"

# Build: exit-code only, no test result parsing
build:
  extends: .install-cdviz
  stage: build
  script:
    - cdviz-collector send
      --run taskrun
      --url "$CDVIZ_COLLECTOR_URL"
      --config "$CI_PROJECT_DIR/.cdviz-collector.toml"
      -- make build

# Unit tests: JUnit XML parsed automatically from **/TEST-*.xml
test:
  extends: .install-cdviz
  stage: test
  script:
    - cdviz-collector send -q
      --run testsuiterun_junit
      --metadata "tested_artifact_id=pkg:oci/my-app@sha256:$IMAGE_SHA"
      --url "$CDVIZ_COLLECTOR_URL"
      --config "$CI_PROJECT_DIR/.cdviz-collector.toml"
      -- mvn test

# Deploy: exit-code only
deploy:
  extends: .install-cdviz
  stage: deploy
  when: on_success
  script:
    - cdviz-collector send
      --run taskrun
      --url "$CDVIZ_COLLECTOR_URL"
      --config "$CI_PROJECT_DIR/.cdviz-collector.toml"
      -- ./deploy.sh
  only:
    - main
```

> [!TIP]
> `$CI_COMMIT_REF_NAME` (branch) and `$CI_COMMIT_SHA` (commit) are detected automatically by `ci_env_detection` — omit `--metadata branch=...` and `--metadata commit=...`.

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
| `--fail-on-collector-error`            | Fail the job if the collector sink is unreachable           |

See the [send --run reference](../send-run.md) and [send command reference](../send.md) for the full option list.

## Related Integrations

- **[GitLab Webhook](./gitlab.md)** — passive tracking of all repository, MR, and pipeline events
