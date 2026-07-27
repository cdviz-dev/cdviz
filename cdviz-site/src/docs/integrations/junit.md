---
title: JUnit Reports Integration
description: |
  Emit testSuiteRun CDEvents from any tool producing JUnit XML — Maven, Gradle, pytest, Jest, and more —
  by wrapping the test command with cdviz-collector send --run testsuiterun_junit.
---

# JUnit Reports Integration

JUnit XML is the de-facto interchange format for test results — Maven Surefire, Gradle, Jest, Go test wrappers, and most test runners can produce it. [`cdviz-collector send --run testsuiterun_junit`](../cdviz-collector/send-run.md) wraps your test command, collects the XML after the process exits, and emits `testSuiteRun.started` / `testSuiteRun.finished` CDEvents with per-suite results.

## Setup

Wrap your test command; the collector picks up the report after the process exits. The built-in glob matches `**/TEST-*.xml` and `**/*.xml` — pass `--data <path-or-glob>` when the report lives elsewhere or unrelated XML files could match. Full flags shown once here, shortened in the per-tool examples below:

```bash
cdviz-collector send --run testsuiterun_junit \
  --metadata "tested_artifact_id=pkg:oci/my-app@sha256:$IMAGE_SHA" \
  --url "$CDVIZ_URL" \
  --header "Authorization: Bearer $CDVIZ_TOKEN" \
  -- <your test command>
```

Branch, commit, and job name are auto-detected from CI environment variables — see [CI auto-detection](../cdviz-collector/send-run.md#ci-env-detection). Use `--metadata tested_artifact_id=…` to link results to the artifact under test.

> [!NOTE]
> `testsuiterun_junit` requires the `parser_xml` feature flag. Verify with `cdviz-collector --version`.

## Examples by Ecosystem

### Java — Maven

```bash
# Surefire writes TEST-*.xml under target/surefire-reports/ (matches the default glob)
cdviz-collector send --run testsuiterun_junit \
  --url "$CDVIZ_URL" \
  -- mvn test
```

### Java / Kotlin — Gradle

```bash
# Gradle writes JUnit XML under build/test-results/test/
cdviz-collector send --run testsuiterun_junit \
  --data "build/test-results/test/*.xml" \
  --url "$CDVIZ_URL" \
  -- ./gradlew test
```

### Python — pytest

```bash
cdviz-collector send --run testsuiterun_junit \
  --url "$CDVIZ_URL" \
  -- pytest --junit-xml=TEST-results.xml
```

The `TEST-` prefix matches the default glob; use `--data` for another path.

### JavaScript / TypeScript — Bun

```bash
cdviz-collector send --run testsuiterun_junit \
  --data TEST-results.xml \
  --url "$CDVIZ_URL" \
  -- bun test --reporter=junit --reporter-outfile=TEST-results.xml
```

### JavaScript / TypeScript — Vitest

```bash
cdviz-collector send --run testsuiterun_junit \
  --data TEST-results.xml \
  --url "$CDVIZ_URL" \
  -- npx vitest run --reporter=junit --outputFile=TEST-results.xml
```

### JavaScript / TypeScript — Jest

Jest needs the [`jest-junit`](https://www.npmjs.com/package/jest-junit) reporter package (writes `junit.xml` by default):

```bash
cdviz-collector send --run testsuiterun_junit \
  --data junit.xml \
  --url "$CDVIZ_URL" \
  -- npx jest --ci --reporters=default --reporters=jest-junit
```

### Node.js — built-in test runner

Node 21+ ships a `junit` reporter (older versions emit TAP — see [TAP Reports](./tap.md)):

```bash
cdviz-collector send --run testsuiterun_junit \
  --data TEST-results.xml \
  --url "$CDVIZ_URL" \
  -- node --test --test-reporter=junit --test-reporter-destination=TEST-results.xml
```

### Rust — cargo-nextest

`cargo test` has no JUnit output; [cargo-nextest](https://nexte.st/) does, via a profile:

```toml
# .config/nextest.toml
[profile.ci.junit]
path = "junit.xml" # written under target/nextest/ci/
```

```bash
cdviz-collector send --run testsuiterun_junit \
  --data target/nextest/ci/junit.xml \
  --url "$CDVIZ_URL" \
  -- cargo nextest run --profile ci
```

### Go — gotestsum

`go test` has no JUnit output; [gotestsum](https://github.com/gotestyourself/gotestsum) wraps it:

```bash
cdviz-collector send --run testsuiterun_junit \
  --data TEST-results.xml \
  --url "$CDVIZ_URL" \
  -- gotestsum --junitfile TEST-results.xml ./...
```

### .NET

With the [JunitXml.TestLogger](https://www.nuget.org/packages/JunitXml.TestLogger) NuGet package:

```bash
cdviz-collector send --run testsuiterun_junit \
  --data TEST-results.xml \
  --url "$CDVIZ_URL" \
  -- dotnet test --logger "junit;LogFilePath=TEST-results.xml"
```

## Related

- **[TAP Reports](./tap.md)** — the same pattern for TAP output (node --test, bats, prove)
- **[SARIF](./sarif.md)** — the same pattern for linters and scanners
- CI pipelines: **[GitHub Actions CI](./github-actions-ci.md)**, **[GitLab CI](./gitlab-ci.md)**, **[Jenkins](./jenkins.md)**
- Full flag list: [`send --run` reference](../cdviz-collector/send-run.md)
