---
title: pytest Integration
description: |
  Emit testSuiteRun CDEvents from pytest: wrap your test command with cdviz-collector send --run
  and get per-suite results, pass/fail counts, and CI context in your delivery dashboards.
plans:
  - community
  - cloud
  - pro
---

# pytest Integration

Report pytest results as `testSuiteRun.started` / `testSuiteRun.finished` CDEvents by wrapping the test command with [`cdviz-collector send --run`](../cdviz-collector/send-run.md). pytest writes JUnit XML; the collector parses it after the run and attaches per-suite results.

## Setup

In your CI job (or locally), replace the plain `pytest` invocation:

```bash
cdviz-collector send --run testsuiterun_junit \
  --metadata "tested_artifact_id=pkg:oci/my-app@sha256:$IMAGE_SHA" \
  --url "$CDVIZ_URL" \
  --header "Authorization: Bearer $CDVIZ_TOKEN" \
  -- pytest --junit-xml=TEST-results.xml
```

- `--junit-xml=TEST-results.xml` makes pytest write a report matching the built-in `**/TEST-*.xml` glob (or pass `--data` to point at another path).
- Branch, commit, and job name are auto-detected from CI environment variables — see [CI auto-detection](../cdviz-collector/send-run.md#ci-env-detection).
- `tested_artifact_id` links the test run to the artifact under test for cross-referencing in dashboards.

## CI Guides

Step-by-step pipeline examples, including secrets setup:

- **[GitHub Actions CI](./github-actions-ci.md)**
- **[GitLab CI](./gitlab-ci.md)**
- **[Jenkins](./jenkins.md)**

## Reference

Run types, result globs, custom metadata, and all flags: [`send --run` reference](../cdviz-collector/send-run.md).
