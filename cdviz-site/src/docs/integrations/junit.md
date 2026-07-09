---
title: JUnit Reports Integration
description: |
  Emit testSuiteRun CDEvents from any tool producing JUnit XML — Maven, Gradle, Jest, and more —
  by wrapping the test command with cdviz-collector send --run testsuiterun_junit.
plans:
  - community
  - cloud
  - pro
---

# JUnit Reports Integration

JUnit XML is the de-facto interchange format for test results — Maven Surefire, Gradle, Jest, Go test wrappers, and most test runners can produce it. [`cdviz-collector send --run testsuiterun_junit`](../cdviz-collector/send-run.md) wraps your test command, collects the XML after the process exits, and emits `testSuiteRun.started` / `testSuiteRun.finished` CDEvents with per-suite results.

## Setup

### Maven

```bash
# Maven generates TEST-*.xml under target/surefire-reports/
cdviz-collector send --run testsuiterun_junit \
  --metadata "tested_artifact_id=pkg:oci/my-app@sha256:$IMAGE_SHA" \
  --url "$CDVIZ_URL" \
  --header "Authorization: Bearer $CDVIZ_TOKEN" \
  -- mvn test
```

### Any JUnit XML producer

The built-in glob picks up `**/TEST-*.xml` and `**/*.xml`. If your tool writes elsewhere, point at the report explicitly:

```bash
cdviz-collector send --run testsuiterun_junit \
  --data build/test-results/test/*.xml \
  --url "$CDVIZ_URL" \
  -- ./gradlew test
```

Branch, commit, and job name are auto-detected from CI environment variables — see [CI auto-detection](../cdviz-collector/send-run.md#ci-env-detection). Use `--metadata tested_artifact_id=…` to link results to the artifact under test.

> [!NOTE]
> `testsuiterun_junit` requires the `parser_xml` feature flag. Verify with `cdviz-collector --version`.

## Related

- **[pytest](./pytest.md)** — Python-specific example (pytest emits JUnit XML)
- **[SARIF](./sarif.md)** — the same pattern for linters and scanners
- CI pipelines: **[GitHub Actions CI](./github-actions-ci.md)**, **[GitLab CI](./gitlab-ci.md)**, **[Jenkins](./jenkins.md)**
- Full flag list: [`send --run` reference](../cdviz-collector/send-run.md)
