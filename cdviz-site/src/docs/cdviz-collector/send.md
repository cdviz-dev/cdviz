# Send Command

Send CDEvent JSON directly to configured sinks for testing and scripting, without running a full server.

## Usage

```bash
cdviz-collector send [OPTIONS] --data <DATA>
```

<<< @/docs/cdviz-collector/send-help.txt

## Input Data

`--data` accepts a CDEvent as an inline JSON string, a file reference (`@event.json`), or stdin (`@-`). An array of CDEvents is also accepted — each item is dispatched individually.

> [!WARNING]
> Without `--input-parser`, the input must already be valid CDEvent JSON.

### CDEvent format

> [!TIP]
> Omit `context.id` (or set it to `"0"`) and `context.timestamp` to let the collector auto-generate them as content-based CIDs and current time.

```json
{
  "context": {
    "version": "0.4.1",
    "source": "/my-app",
    "type": "dev.cdevents.service.deployed.0.2.0"
  },
  "subject": {
    "id": "my-service",
    "source": "/my-app",
    "type": "service",
    "content": {
      "environment": { "id": "production" },
      "artifactId": "pkg:oci/my-service@sha256:abc123"
    }
  }
}
```

## Parsers

Use `--input-parser` to send test results, logs, and other non-CDEvent formats. Requires transformers to convert the parsed data into CDEvents.

| Parser      | Format      | Use Case                             |
| ----------- | ----------- | ------------------------------------ |
| `auto`      | Auto-detect | By file extension                    |
| `json`      | JSON        | Single JSON object                   |
| `jsonl`     | JSON Lines  | One JSON per line                    |
| `csv_row`   | CSV         | One message per row                  |
| `xml`       | XML         | JUnit reports, Maven/Gradle output   |
| `tap`       | TAP         | Test Anything Protocol               |
| `text`      | Plain text  | Full file as one message             |
| `text_line` | Plain text  | One message per line (linters, logs) |

**[→ Parsers Documentation](./parsers/index.md)**

> [!NOTE]
> `xml` and `tap` require the `parser_xml` and `parser_tap` feature flags. Check with `cdviz-collector --version`.

```bash
# JUnit XML from CI
cdviz-collector send --data @junit.xml --input-parser xml --url $CDVIZ_URL --header "Authorization: Bearer $TOKEN"

# TAP results from stdin
npm test --reporter=tap | cdviz-collector send --data @- --input-parser tap --url $CDVIZ_URL
```

## Process Wrapping (`--run`)

`--run` wraps a child process and emits CDEvents around its execution — a `started` event before the process begins and a `finished` event when it completes. This is the primary way to capture **test result observability** from CI jobs: webhook integrations track pipeline-level events, but `--run testsuiterun_junit` (or `_tap`) additionally parses JUnit/TAP output and emits structured `testSuiteRun` events.

### Syntax

```bash
cdviz-collector send --run <NAME> [OPTIONS] -- <COMMAND>...
```

- `<NAME>`: a **source key** from the built-in config (or your own config overlay). The key determines which CDEvent type is emitted and how result files are collected.
- `-- <COMMAND>...`: the child process to execute (everything after `--`)

### Built-in run types

| `--run` value        | CDEvent emitted                      | Result collection                     |
| -------------------- | ------------------------------------ | ------------------------------------- |
| `testsuiterun_junit` | `testSuiteRun.started` / `.finished` | Globs `**/TEST-*.xml`, `**/*.xml`     |
| `testsuiterun_tap`   | `testSuiteRun.started` / `.finished` | Globs `**/*.tap`                      |
| `testsuiterun_sarif` | `testSuiteRun.started` / `.finished` | Globs `**/*.sarif`, `**/*.sarif.json` |
| `taskrun`            | `taskRun.started` / `.finished`      | Exit code only                        |

> [!NOTE]
> `--run testsuiterun_junit` and `--run testsuiterun_tap` require the `parser_xml` / `parser_tap` feature flags respectively. Check with `cdviz-collector --version`.

### CI auto-detection

The built-in `ci_env_detection` transformer automatically reads branch, commit SHA, and job name from standard CI environment variables (`GITHUB_ACTIONS`, `GITLAB_CI`, `JENKINS_URL`, …). **You do not need `--metadata branch=...` or `--metadata commit=...`.**

### `--metadata` for cross-referencing

Use `--metadata` to supply data that cannot be auto-detected — primarily identifiers for the artifact, environment, or repository being tested. These feed `customData.links` in the emitted CDEvent, enabling cross-referencing between test results and other subjects.

```bash
# JUnit test suite with artifact cross-reference
cdviz-collector send --run testsuiterun_junit \
  --metadata tested_artifact_id="pkg:oci/my-app@sha256:abc123" \
  --url $CDVIZ_URL \
  -- mvn test

# TAP test suite
cdviz-collector send --run testsuiterun_tap \
  --url $CDVIZ_URL \
  -- npm test --reporter=tap

# Exit-code only for non-test steps (build, deploy)
cdviz-collector send --run taskrun \
  --url $CDVIZ_URL \
  -- make build
```

### Custom run types

Supply your own TOML config with `--config my-run.toml` to define additional `[sources.*]` entries with custom `data_globs`, parsers, and transformers. This file is merged on top of the built-in `send.base.toml`.

**[→ Complete `--run` reference and CI examples](./send-run.md)**

For real-world CI/CD usage see the integration guides:

- **[GitHub Actions CI](./integrations/github-actions-ci.md)**
- **[GitLab CI](./integrations/gitlab-ci.md)**
- **[Jenkins](./integrations/jenkins.md)**

## Examples

```bash
# Debug output (default, no --url)
cdviz-collector send --data @event.json

# Send to HTTP endpoint with auth
cdviz-collector send \
  --data @event.json \
  --url https://api.example.com/events \
  --header "Authorization: Bearer $TOKEN"

# Advanced sink config (authentication, signatures, etc.)
cdviz-collector send --data @event.json --config sinks.toml --verbose
```

## Non-CDEvent Data

If input is not already a CDEvent, configure a transformer to convert it:

```toml
# send-config.toml
[transformers.to_cdevent]
type = "vrl"
source = '''
  # map .body fields into CDEvent format
'''
```

```bash
cdviz-collector send --data '{"raw": "data"}' --config send-config.toml
```

**[→ Transformers Guide](./transformers.md)**
