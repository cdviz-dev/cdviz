---
title: "send --run: Test Reporting"
description: |
  Instrument CI jobs with cdviz-collector send --run to emit testSuiteRun and taskRun CDEvents.
  Parses JUnit XML, TAP, and SARIF output automatically; uses CI environment variables for branch and commit.
---

# `send --run`: Test Reporting

## Why `--run`?

Webhook integrations (GitHub, GitLab, Jenkins) track pipeline and job-level events — when a workflow started, when it succeeded or failed. They do **not** capture what tests ran inside a job, which suites passed or failed, or how many assertions were skipped.

`cdviz-collector send --run testsuiterun_junit` fills that gap: it wraps your test command, collects JUnit XML (or TAP) output after the process exits, and emits structured `testSuiteRun.started` / `testSuiteRun.finished` CDEvents with per-suite results attached. This data drives test trend dashboards and cross-references test results with the artifact or environment under test.

For non-test steps (build, deploy) where you only need exit-code observability, use `--run taskrun`.

## Built-in Run Types

| `--run` value        | CDEvent emitted                      | Result collection                                     |
| -------------------- | ------------------------------------ | ----------------------------------------------------- |
| `testsuiterun_junit` | `testSuiteRun.started` / `.finished` | Globs `**/TEST-*.xml`, `**/*.xml` via XML parser      |
| `testsuiterun_tap`   | `testSuiteRun.started` / `.finished` | Globs `**/*.tap` via TAP parser                       |
| `testsuiterun_sarif` | `testSuiteRun.started` / `.finished` | Globs `**/*.sarif`, `**/*.sarif.json` via JSON parser |
| `taskrun`            | `taskRun.started` / `.finished`      | Exit code only (no file parsing)                      |

> [!NOTE]
> `testsuiterun_junit` and `testsuiterun_tap` require the `parser_xml` and `parser_tap` feature flags. Verify with `cdviz-collector --version`.

## CI Auto-Detection

The built-in `ci_env_detection` transformer automatically populates context fields from standard CI environment variables. **No `--metadata` flags are needed for branch, commit, or job name.**

| CI system      | Variables read automatically                                               |
| -------------- | -------------------------------------------------------------------------- |
| GitHub Actions | `GITHUB_REF_NAME`, `GITHUB_SHA`, `GITHUB_JOB`, `GITHUB_RUN_ID`             |
| GitLab CI      | `CI_COMMIT_REF_NAME`, `CI_COMMIT_SHA`, `CI_JOB_NAME`, `CI_PIPELINE_ID`     |
| Jenkins        | `JENKINS_URL`, `JOB_BASE_NAME`, `BUILD_NUMBER`, `GIT_BRANCH`, `GIT_COMMIT` |

## `customData.links` — Cross-Referencing

`customData.links` is the CDEvents standard mechanism for cross-referencing related subjects (until `context.links` gains full subject support in spec 0.6+). Use `--metadata` to supply identifiers that `--run` cannot auto-detect:

| `--metadata` key     | Link kind       | Target subject type                                                |
| -------------------- | --------------- | ------------------------------------------------------------------ |
| `tested_artifact_id` | `testedAgainst` | `artifact` (repeatable — one link per value)                       |
| `tested_env_id`      | `testedAgainst` | `environment`                                                      |
| `tested_repo_id`     | `testedAgainst` | `repository`                                                       |
| `results_url`        | `storedAt`      | `testoutput` — also triggers an extra `testoutput.published` event |

Example resulting `customData.links` in the emitted CDEvent:

```jsonc
{
  "customData": {
    "links": [
      {
        "linkKind": "testedAgainst",
        "target": { "subject": { "type": "artifact", "id": "pkg:oci/my-app@sha256:abc123" } }
      },
      {
        "linkKind": "testedAgainst",
        "target": { "subject": { "type": "environment", "id": "/cluster/staging" } }
      }
    ]
  }
}
```

## Examples by Test Framework

### Maven (JUnit XML)

```bash
# Maven generates TEST-*.xml under target/surefire-reports/
cdviz-collector send --run testsuiterun_junit \
  --metadata "tested_artifact_id=pkg:oci/my-app@sha256:$IMAGE_SHA" \
  --url "$CDVIZ_URL" \
  --header "Authorization: Bearer $CDVIZ_TOKEN" \
  -- mvn test
```

### pytest (JUnit XML via `--junit-xml`)

```bash
cdviz-collector send --run testsuiterun_junit \
  --metadata "tested_artifact_id=pkg:oci/my-app@sha256:$IMAGE_SHA" \
  --url "$CDVIZ_URL" \
  --header "Authorization: Bearer $CDVIZ_TOKEN" \
  -- pytest --junit-xml=TEST-results.xml
```

### Node.js (TAP reporter)

```bash
cdviz-collector send --run testsuiterun_tap \
  --metadata "tested_artifact_id=pkg:npm/my-package@$NPM_VERSION" \
  --url "$CDVIZ_URL" \
  --header "Authorization: Bearer $CDVIZ_TOKEN" \
  -- node --test --test-reporter=tap
```

### SARIF (static analysis / security scanning)

```bash
# SARIF output collected from **/*.sarif after the scan exits
cdviz-collector send --run testsuiterun_sarif \
  --metadata "tested_artifact_id=pkg:oci/my-app@sha256:$IMAGE_SHA" \
  --url "$CDVIZ_URL" \
  --header "Authorization: Bearer $CDVIZ_TOKEN" \
  -- trivy image --format sarif --output results.sarif my-app:latest
```

### Non-test step (exit-code only)

```bash
cdviz-collector send --run taskrun \
  --url "$CDVIZ_URL" \
  --header "Authorization: Bearer $CDVIZ_TOKEN" \
  -- make build
```

### Override the result file path with `--data`

By default each `--run` type uses a built-in glob to find result files (e.g. `**/TEST-*.xml` for JUnit). Pass `--data` to point at a specific file or pattern instead:

```bash
# Explicit file path — avoids picking up unrelated XML files in the workspace
cdviz-collector send --run testsuiterun_junit \
  --data target/surefire-reports/TEST-MyModule.xml \
  --url "$CDVIZ_URL" \
  -- mvn test

# Or pass the path as an absolute file reference
cdviz-collector send --run testsuiterun_sarif \
  --data /tmp/scan-results.sarif \
  --url "$CDVIZ_URL" \
  -- ./run-scan.sh
```

`--data` replaces the built-in `data_globs` for that invocation; the command still runs normally.

### Using signature instead of Bearer token

see examples from [GitLab CI](./integrations/gitlab-ci.md)

## Custom Run Types

Define custom source keys in a TOML config file and reference them with `--run`:

```toml
# my-run.toml
[sources.testsuiterun_cargo]
type = "send_run"
data_globs = ["**/test-results.json"]
parser = { type = "json" }
transformer_refs = ["ci_env_detection", "to_testsuiterun"]
```

```bash
cdviz-collector send --run testsuiterun_cargo \
  --config my-run.toml \
  --url $CDVIZ_URL \
  -- cargo test
```

The `--config` file is merged on top of the built-in `send.base.toml`, so built-in keys (`testsuiterun_junit`, `testsuiterun_tap`, `testsuiterun_sarif`, `taskrun`) remain available.

## Additional Flags

| Flag                           | Description                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------ |
| `--no-data`                    | Skip result file parsing entirely; use exit code only (overrides `data_globs`) |
| `--fail-on-collector-error`    | Exit non-zero if the sink is unreachable (default: warn and continue)          |
| `--log-full-response-on-error` | Log full HTTP response body on non-2xx errors — useful for CI debugging        |

## CI Integration Guides

- **[GitHub Actions CI](./integrations/github-actions-ci.md)**
- **[GitLab CI](./integrations/gitlab-ci.md)**
- **[Jenkins](./integrations/jenkins.md)**
