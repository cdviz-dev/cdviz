---
description: "CDviz Collector parsers: parse JSON, JSON Lines, CSV, XML, TAP, plain text, and metadata from files collected by the OpenDAL source."
---

# Parsers

Parsers convert file contents into JSON messages for the CDviz pipeline.

## Where Parsers Are Used

- **[`send` command](../send.md)**: Submit CI/CD artifacts directly from pipelines (`--input-parser`)
- **[OpenDAL source](../sources/opendal.md)**: Parse files from filesystem or cloud storage (`parser = "..."`)
- **[`transform` command](../transform.md)**: Batch file processing (auto-detects format)

## Quick Reference

| Parser      | Format      | Output     | Auto-detected extensions | Use Case                             |
| ----------- | ----------- | ---------- | ------------------------ | ------------------------------------ |
| `auto`      | Auto-detect | Varies     | —                        | Default — detects by file extension  |
| `json`      | JSON        | 1 message  | `.json`                  | Single JSON object per file          |
| `jsonl`     | JSON Lines  | N messages | `.jsonl`, `.ndjson`      | One message per line                 |
| `csv_row`   | CSV         | N messages | `.csv`                   | One message per row (header as keys) |
| `text`      | Plain text  | 1 message  | —                        | Entire file as `{"text": "..."}`     |
| `text_line` | Plain text  | N messages | `.txt`, `.log`           | One message per non-empty line       |
| `xml`       | XML         | 1 message  | `.xml` _(feature flag)_  | XML converted to JSON structure      |
| `tap`       | TAP format  | 1 message  | `.tap` _(feature flag)_  | Test Anything Protocol results       |
| `metadata`  | Any         | 1 message  | —                        | File metadata only (no content)      |

## Feature Flags

`xml` and `tap` require feature flags in the collector build:

```bash
cargo install cdviz-collector --features parser_xml,parser_tap
```

Built-in (always available): `json`, `jsonl`, `csv_row`, `text`, `text_line`, `metadata`, `auto`

## Parsers and Transformers

Parsers produce an intermediate message — the body is raw parsed content (text, CSV row, XML-as-JSON, etc.), not a CDEvent. A [transformer](../transformers.md) is required to map that body to a valid CDEvent before delivery to a sink.

Exception: `json` and `jsonl` parsers can be used directly when the source files are already valid CDEvents.

## CLI Usage

```bash
# Source file is already a CDEvent — no transformer needed
cdviz-collector send --data @event.json --input-parser json --url $CDVIZ_URL

# Non-CDEvents input — provide a config with a transformer
cdviz-collector send --data @junit.xml --input-parser xml --config pipeline.toml --url $CDVIZ_URL

# Wrap a process: capture exit code and result files as CDEvents
cdviz-collector send --run testsuiterun_junit --url $CDVIZ_URL -- pytest --junit-xml=TEST-results.xml
```

## Parser Reference

### auto

```toml
parser = "auto"  # default — can omit
```

Detects format by file extension (see Quick Reference table). Falls back to `text_line` for unknown extensions. Never selects `metadata` — that must be specified explicitly.

```toml
[sources.ci_outputs.extractor]
type = "opendal"
kind = "fs"
polling_interval = "30s"
recursive = true
path_patterns = ["**/*.json", "**/*.xml", "**/*.tap", "**/*.log", "**/*.csv"]
parser = "auto"
parameters = { root = "/var/ci/outputs" }
```

### json

```toml
parser = "json"
```

- Entire file → 1 message; body is the parsed JSON object
- Fails if file contains invalid JSON or multiple JSON objects

```toml
[sources.cdevents_json.extractor]
type = "opendal"
kind = "fs"
polling_interval = "10s"
path_patterns = ["**/*.json"]
parser = "json"
parameters = { root = "./cdevents" }
```

### jsonl

```toml
parser = "jsonl"
```

- Each non-empty line → 1 message; empty lines are skipped
- Each line must be individually valid JSON
- Use directly with `send` only when each line is already a valid CDEvent; otherwise use with a transformer

### csv_row

```toml
parser = "csv_row"
```

- First row is the header; column names become JSON keys
- Each data row → 1 message; all values are strings

```toml
[sources.release_exports.extractor]
type = "opendal"
kind = "s3"
polling_interval = "15m"
path_patterns = ["releases/**/*.csv"]
parser = "csv_row"

[sources.release_exports.extractor.parameters]
bucket = "company-release-exports"
region = "us-east-1"
```

Map CSV columns to CDEvents with a VRL transformer:

```vrl
.context.type = "dev.cdevents.service.deployed.0.3.0"
.context.source = "csv-import"
.context.timestamp = .body.timestamp
.subject.id = .body.service
.subject.content.artifactId = "pkg:generic/" + .body.service + "@" + .body.version
```

### text

```toml
parser = "text"
```

- Entire file → 1 message with body `{"text": "...file content..."}`
- Preserves all whitespace and line breaks; use `text_line` for per-line messages
- Requires a transformer to map `body.text` to a CDEvent

```toml
[sources.build_logs.extractor]
type = "opendal"
kind = "fs"
polling_interval = "1m"
path_patterns = ["**/build.log"]
parser = "text"
parameters = { root = "/var/ci/logs" }
```

### text_line

```toml
parser = "text_line"
```

- Each non-empty line → 1 message with body `{"text": "...line content..."}`
- Default fallback for `.txt` and `.log` files when using `auto`
- Requires a transformer to map each line to a CDEvent

Parse structured fields from each line in a VRL transformer:

```vrl
# Parse ESLint format: "path:line:col - Severity: message"
parts = parse_regex!(.body.text, r'^(.+?):(\d+):(\d+) - (Error|Warning): (.+)$')
.subject.content = {
  "file": parts[1],
  "line": to_int!(parts[2]),
  "severity": parts[4],
  "message": parts[5]
}
```

### xml

```toml
parser = "xml"
```

> [!IMPORTANT]
> Requires `parser_xml` feature flag.

- Entire XML document → 1 message; attributes prefixed with `@`, text content as `#text`
- Commonly used for JUnit test reports (Jest, pytest, Maven Surefire, PHPUnit, xUnit)
- Requires a transformer (via `--config` or configured source) to map the XML-as-JSON body to a CDEvent

```bash
# Send a JUnit report with a transformer config
cdviz-collector send --data @test-results.xml --input-parser xml --config pipeline.toml --url $CDVIZ_URL

# Or wrap the test runner — captures exit code and result files
cdviz-collector send --run testsuiterun_junit --url $CDVIZ_URL -- pytest --junit-xml=TEST-results.xml
```

Map JUnit results to a CDEvents test run with VRL:

```vrl
suite = .body.testsuite
.context.type = "dev.cdevents.testsuiterun.finished.0.2.0"
.subject.content.outcome = if to_int!(suite["@failures"]) + to_int!(suite["@errors"]) > 0 {
  "failure"
} else {
  "pass"
}
.subject.content.testSuiteName = suite["@name"]
```

### tap

```toml
parser = "tap"
```

> [!IMPORTANT]
> Requires `parser_tap` feature flag.

- Entire TAP file → 1 message with `version`, `plan`, and `tests` array
- Supports TAP 13: ok/not ok results, YAML diagnostic blocks, skip/todo directives
- Supported in JavaScript (tap, node-tap), Perl, Ruby, Go, Rust
- Requires a transformer (via `--config` or configured source) to map the parsed body to a CDEvent

```bash
# Send a TAP file with a transformer config
cdviz-collector send --data @test-results.tap --input-parser tap --config pipeline.toml --url $CDVIZ_URL

# Or wrap the test runner — captures exit code and TAP output files
cdviz-collector send --run testsuiterun_tap --url $CDVIZ_URL -- node --test --test-reporter=tap
```

Map TAP results to CDEvents with VRL:

```vrl
passed = length(filter(.body.tests, |_, t| t.ok == true))
failed = length(filter(.body.tests, |_, t| t.ok == false))
.context.type = "dev.cdevents.testsuiterun.finished.0.2.0"
.subject.content.outcome = if failed > 0 { "failure" } else { "pass" }
.subject.content.testSuiteName = .metadata.file_name
```

### metadata

```toml
parser = "metadata"
```

- No file content is read — emits file metadata only
- 1 message per file; body is empty; fields: `file_path`, `file_name`, `file_size`, `last_modified`, `content_type`
- Must be specified explicitly — `auto` never selects this parser

Emit a CDEvent when a new artifact appears in S3 without downloading it:

```toml
[sources.artifact_tracking.extractor]
type = "opendal"
kind = "s3"
polling_interval = "1m"
path_patterns = ["artifacts/**/*.jar", "releases/**/*.tar.gz"]
parser = "metadata"

[sources.artifact_tracking.extractor.parameters]
bucket = "build-artifacts"
region = "us-east-1"
```

Map to CDEvents ArtifactPublished with VRL:

```vrl
.context.type = "dev.cdevents.artifact.published.0.3.0"
.context.source = "s3-artifact-bucket"
.context.timestamp = .metadata.last_modified
.subject.id = "pkg:generic/" + .metadata.file_name
```
