---
title: TAP Reports Integration
description: |
  Emit testSuiteRun CDEvents from any tool producing TAP (Test Anything Protocol) output —
  Node's test runner, bats, shellspec, prove — with cdviz-collector send --run testsuiterun_tap.
---

# TAP Reports Integration

[TAP](https://testanything.org/) (Test Anything Protocol) is the native output format of Node.js's built-in test runner, [bats](https://bats-core.readthedocs.io/), [shellspec](https://shellspec.info/), Perl's `prove`, and many smaller runners. [`cdviz-collector send --run testsuiterun_tap`](../cdviz-collector/send-run.md) wraps your test command, collects the TAP report after the process exits, and emits `testSuiteRun.started` / `testSuiteRun.finished` CDEvents.

## Setup

```bash
cdviz-collector send --run testsuiterun_tap \
  --metadata "tested_artifact_id=pkg:npm/my-package@$NPM_VERSION" \
  --url "$CDVIZ_URL" \
  --header "Authorization: Bearer $CDVIZ_TOKEN" \
  -- node --test --test-reporter=tap --test-reporter-destination=TEST-results.tap
```

Branch, commit, and job name are auto-detected from CI environment variables — see [CI auto-detection](../cdviz-collector/send-run.md#ci-env-detection). Use `--metadata tested_artifact_id=…` to link results to the artifact under test.

> [!IMPORTANT]
> The collector does **not** capture the test command's stdout — it reads report _files_ after the
> process exits. Most TAP producers print to stdout, so redirect (`> TEST-results.tap`) or use the
> runner's file-output flag. The built-in glob is `**/*.tap`; pass `--data <path-or-glob>` for
> another location.

> [!NOTE]
> `testsuiterun_tap` requires the `parser_tap` feature flag. Verify with `cdviz-collector --version`.

## Examples by Ecosystem

### Node.js — built-in test runner

```bash
cdviz-collector send --run testsuiterun_tap \
  --url "$CDVIZ_URL" \
  -- node --test --test-reporter=tap --test-reporter-destination=TEST-results.tap
```

Node 21+ also ships a `junit` reporter — see [JUnit Reports](./junit.md) if you prefer XML.

### Bash — bats

```bash
cdviz-collector send --run testsuiterun_tap \
  --url "$CDVIZ_URL" \
  -- bash -c 'bats --formatter tap tests/ > TEST-results.tap'
```

### Shell — shellspec

```bash
cdviz-collector send --run testsuiterun_tap \
  --url "$CDVIZ_URL" \
  -- bash -c 'shellspec --format tap > TEST-results.tap'
```

### Perl — prove

```bash
cdviz-collector send --run testsuiterun_tap \
  --url "$CDVIZ_URL" \
  -- bash -c 'prove --verbose t/ > TEST-results.tap'
```

### Python — pytest

pytest can emit TAP with the [`pytest-tap`](https://pypi.org/project/pytest-tap/) plugin:

```bash
cdviz-collector send --run testsuiterun_tap \
  --data testresults.tap \
  --url "$CDVIZ_URL" \
  -- pytest --tap-combined
```

pytest's built-in `--junit-xml` needs no plugin and reports more detail — see [JUnit Reports](./junit.md#python-pytest).

## Reported Summary

The `testSuiteRun.finished` event carries `customData.testsuiterun.summary` with `results_count`,
`passed`, `failed`, and `exit_code`. `# SKIP` / `# TODO` directives are parsed but not broken out as
a `skipped` count (JUnit XML reports `skipped`, `errors`, and duration) — use JUnit output if that
breakdown matters.

## Related

- **[JUnit Reports](./junit.md)** — same pattern for XML test reports
- **[SARIF](./sarif.md)** — same pattern for linters and scanners
- CI pipelines: **[GitHub Actions CI](./github-actions-ci.md)**, **[GitLab CI](./gitlab-ci.md)**, **[Jenkins](./jenkins.md)**
- Full flag list: [`send --run` reference](../cdviz-collector/send-run.md)
