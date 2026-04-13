---
title: "CDEvents in Action #7: Instrument Any CI Step in a Few Lines"
description: "cdviz-collector send --run wraps any CI command and automatically emits CDEvents — branch, commit, and job name auto-detected from the CI environment."
tags:
  [
    "cdevents",
    "cicd",
    "testing",
    "observability",
    "devops",
  ]
author: "David B."
author_github: "davidB"
date: "2026-04-13"
target_audience: "DevOps Engineers, CI/CD Practitioners"
reading_time: "4 minutes"
series: "CDEvents in Action"
series_part: 7
status: published
---

# CDEvents in Action #7: Instrument Any CI Step in a Few Lines

_Webhook integrations ([ep#3](/blog/20251007-episode-3-cicd-integration), [ep#4](/blog/20251020-episode-4-webhook-transformers)) tell you when a pipeline started and whether it passed. They don't tell you which test suites ran, which failed, or how long each step took. `send --run` fills that gap._

![sample testsuite dashboard](/screenshots/testsuite-sample-20260413_1135.jpg)

## The Pattern

Prefix any CI command with `cdviz-collector send --run <type> [options] --`:

```bash
# before
npm test

# after — expects npm test to produce JUnit XML output
cdviz-collector send --run testsuiterun_junit \
  --url $CDVIZ_URL \
  --header "Authorization: Bearer $CDVIZ_TOKEN" \
  -- npm test
```

The collector runs your command normally. When it exits, it emits `testSuiteRun.started` + `testSuiteRun.finished` CDEvents with parsed test results included. Your exit code is preserved — CI still fails if tests fail.

> [!NOTE]
> Authentication: `--header "Authorization: Bearer $TOKEN"` is shown here for clarity. HMAC signature authentication is also supported and may be preferred depending on your server configuration. See the [send documentation](/docs/cdviz-collector/send) for options.

## Choose the Right `--run` Type

| `--run` value        | CDEvents emitted                     | When to use                        |
| -------------------- | ------------------------------------ | ---------------------------------- |
| `testsuiterun_junit` | `testSuiteRun.started` / `.finished` | Tests that output JUnit XML        |
| `testsuiterun_tap`   | `testSuiteRun.started` / `.finished` | Tests that output TAP format       |
| `testsuiterun_sarif` | `testSuiteRun.started` / `.finished` | Security/lint scans (SARIF output) |
| `taskrun`            | `taskRun.started` / `.finished`      | Any other step (build, deploy, …)  |

> [!TIP]
> More options, custom run types, and output path overrides are available — see the [send --run reference](/docs/cdviz-collector/send-run).

## CI Auto-Detection

Branch, commit SHA, and job name are read automatically — **no `--metadata` flags needed for those**:

| CI system      | Variables detected automatically                                           |
| -------------- | -------------------------------------------------------------------------- |
| GitHub Actions | `GITHUB_REF_NAME`, `GITHUB_SHA`, `GITHUB_JOB`, `GITHUB_RUN_ID`             |
| GitLab CI      | `CI_COMMIT_REF_NAME`, `CI_COMMIT_SHA`, `CI_JOB_NAME`, `CI_PIPELINE_ID`     |
| Jenkins        | `JENKINS_URL`, `JOB_BASE_NAME`, `BUILD_NUMBER`, `GIT_BRANCH`, `GIT_COMMIT` |

## GitHub Actions Example

Install the binary once, then wrap each step:

```yaml
- name: Install cdviz-collector
  run: |
    curl -sSfL https://github.com/cdviz-dev/cdviz-collector/releases/latest/download/cdviz-collector-x86_64-unknown-linux-musl.tar.gz \
      | tar xz -C /usr/local/bin

- name: Build
  run: |
    cdviz-collector send --run taskrun \
      --url ${{ secrets.CDVIZ_URL }} \
      --header "Authorization: Bearer ${{ secrets.CDVIZ_TOKEN }}" \
      -- npm run build

- name: Test # expects JUnit XML output from npm test
  run: |
    cdviz-collector send --run testsuiterun_junit \
      --url ${{ secrets.CDVIZ_URL }} \
      --header "Authorization: Bearer ${{ secrets.CDVIZ_TOKEN }}" \
      -- npm test
```

Add `CDVIZ_URL` and `CDVIZ_TOKEN` as repository secrets (**Settings → Secrets and variables → Actions**). See the [GitLab CI](/docs/cdviz-collector/integrations/gitlab-ci) and [Jenkins](/docs/cdviz-collector/integrations/jenkins) guides for equivalent setups.

## Cross-Reference with an Artifact (Optional)

If you built a Docker image earlier in the pipeline, pass its digest with `--metadata` to link test results to that exact image:

```bash
cdviz-collector send --run testsuiterun_junit \
  --metadata tested_artifact_id="pkg:oci/my-app@sha256:$IMAGE_SHA" \
  --url $CDVIZ_URL \
  --header "Authorization: Bearer $CDVIZ_TOKEN" \
  -- npm test
```

CDviz records a `testedAgainst` link between the test run and the artifact — useful for tracing which image version a test failure was against.

## What You Get

- **Test trend dashboards** — pass/fail rates per suite over time
- **Step durations** — how long build, test, and deploy steps take per commit
- **Failure context** — which suite failed, on which branch, at which commit
- **Artifact traceability** — which tests ran against which image (when `tested_artifact_id` is set)
