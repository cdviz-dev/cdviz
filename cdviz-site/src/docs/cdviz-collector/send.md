# Send Command

Send CDEvent JSON directly to configured sinks for testing and scripting, without running a full server.

## Usage

```bash
cdviz-collector send [OPTIONS] --data <DATA>
```

| Option | Description |
| --- | --- |
| `-d, --data <DATA>` | JSON data: inline string, `@file.json`, or `@-` for stdin |
| `-u, --url <URL>` | HTTP endpoint — enables HTTP sink, disables debug sink |
| `-H, --header <HEADER>` | HTTP header for the request (`-H "Name: value"`, repeatable) |
| `--input-parser <PARSER>` | Parser for non-CDEvent input formats (see [Parsers](#parsers)) |
| `--config <CONFIG>` | TOML config file for advanced sink settings |
| `-C, --directory <DIR>` | Working directory for relative paths |
| `-v` / `-q` | Increase / decrease log verbosity |
| `--disable-otel` | Skip OpenTelemetry initialization |

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
      "environment": {"id": "production"},
      "artifactId": "pkg:oci/my-service@sha256:abc123"
    }
  }
}
```

## Parsers

Use `--input-parser` to send test results, logs, and other non-CDEvent formats. Requires transformers to convert the parsed data into CDEvents.

| Parser | Format | Use Case |
| --- | --- | --- |
| `auto` | Auto-detect | By file extension |
| `json` | JSON | Single JSON object |
| `jsonl` | JSON Lines | One JSON per line |
| `csv_row` | CSV | One message per row |
| `xml` | XML | JUnit reports, Maven/Gradle output |
| `tap` | TAP | Test Anything Protocol |
| `text` | Plain text | Full file as one message |
| `text_line` | Plain text | One message per line (linters, logs) |

**[→ Parsers Documentation](./parsers/index.md)**

> [!NOTE]
> `xml` and `tap` require the `parser_xml` and `parser_tap` feature flags. Check with `cdviz-collector --version`.

```bash
# JUnit XML from CI
cdviz-collector send --data @junit.xml --input-parser xml --url $CDVIZ_URL --header "Authorization: Bearer $TOKEN"

# TAP results from stdin
npm test --reporter=tap | cdviz-collector send --data @- --input-parser tap --url $CDVIZ_URL
```

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
