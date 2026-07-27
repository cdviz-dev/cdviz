---
title: SARIF Integration (Linters & Scanners)
description: |
  Emit testSuiteRun CDEvents from linters, static analysis, and security scanners producing SARIF
  output — Trivy, Semgrep, ESLint, and more — with cdviz-collector send --run testsuiterun_sarif.
---

# SARIF Integration

[SARIF](https://sarifweb.azurewebsites.net/) (Static Analysis Results Interchange Format) is the standard output format for linters, static analysis, and security scanners — Trivy, Semgrep, CodeQL, ESLint (via formatter), and many others. [`cdviz-collector send --run testsuiterun_sarif`](../cdviz-collector/send-run.md) wraps the scan, collects the SARIF report, and emits `testSuiteRun.started` / `testSuiteRun.finished` CDEvents so quality gates show up next to your delivery events.

## Setup

```bash
# SARIF output collected from **/*.sarif after the scan exits
cdviz-collector send --run testsuiterun_sarif \
  --metadata "tested_artifact_id=pkg:oci/my-app@sha256:$IMAGE_SHA" \
  --url "$CDVIZ_URL" \
  --header "Authorization: Bearer $CDVIZ_TOKEN" \
  -- trivy image --format sarif --output results.sarif my-app:latest
```

- The built-in glob picks up `**/*.sarif` and `**/*.sarif.json`; pass `--data path/to/report.sarif` to target a specific file.
- Branch, commit, and job name are auto-detected from CI environment variables — see [CI auto-detection](../cdviz-collector/send-run.md#ci-env-detection).
- `tested_artifact_id` links the scan to the artifact it analyzed.

Works the same for any SARIF producer:

```bash
cdviz-collector send --run testsuiterun_sarif \
  --url "$CDVIZ_URL" \
  -- semgrep scan --sarif --output=results.sarif
```

## Related

- **[JUnit Reports](./junit.md)** and **[pytest](./pytest.md)** — same pattern for test results
- CI pipelines: **[GitHub Actions CI](./github-actions-ci.md)**, **[GitLab CI](./gitlab-ci.md)**, **[Jenkins](./jenkins.md)**
- Full flag list: [`send --run` reference](../cdviz-collector/send-run.md)
