# Send Command

Send CDEvent JSON directly to configured sinks for testing and scripting, without running a full server.

## Usage

```bash
cdviz-collector send [OPTIONS] --data <DATA>
```

```text
Send JSON data directly to a sink for testing and scripting.

This command allows sending JSON data directly to configured sinks without running a full server. Useful for testing transformations, debugging sink configurations, or scripting event dispatch.

Usage: cdviz-collector send [OPTIONS] --data <DATA>

Options:
  -d, --data <DATA>
          Data to send to the sink.

          Can be specified as: - Direct string: '{"test": "value"}' or raw text/XML/YAML content - File path: @data.json (format auto-detected from extension) - Stdin: @-

          The data will be parsed according to `--input-parser` and processed through the configured pipeline before being sent to the specified sink.

  -v, --verbose...
          Increase logging verbosity

  -q, --quiet...
          Decrease logging verbosity

  -u, --url <URL>
          HTTP URL to send the data to.

          When specified, automatically enables the HTTP sink and disables the debug sink. The data will be sent as `CloudEvents` format to the specified endpoint.

          Example: `--url <https://api.example.com/webhook>`

      --disable-otel
          Disable OpenTelemetry initialization and use minimal tracing setup.

          This is useful for testing environments or when you want to avoid OpenTelemetry overhead. When disabled, only basic console logging will be available without distributed tracing capabilities.

      --total-duration-of-retries <TOTAL_DURATION_OF_RETRIES>
          Total duration of retries on failed http request. (default 30s)

          Example: `--total-duration-of-retries 1m`

      --config <CONFIG>
          Configuration file for advanced sink settings.

          Optional TOML configuration file for advanced sink configuration such as authentication, headers generation, or custom sink types. Command line arguments will override configuration file settings.

          [env: CDVIZ_COLLECTOR_CONFIG=]

  -C, --directory <DIRECTORY>
          Working directory for relative paths.

          Changes the working directory before processing. This affects relative paths in configuration files and data file references.

  -H, --header <HEADERS>
          Additional HTTP headers for the request.

          Specify custom headers for HTTP sink requests. Can be used multiple times to add several headers. Format: "Header-Name: value"

          Example: `--header "X-API-Key: secret" --header "Content-Type: application/json"`

      --input-parser <PARSER>
          Input data format parser selection.

          Determines how input data is parsed. Use 'auto' for automatic format detection based on file extension (when using @file), or specify an explicit format.

          Supported formats: - auto: Auto-detect format based on file extension (default) - json: Parse as JSON - xml: Parse as XML (requires `parser_xml` feature) - yaml: Parse as YAML (requires `parser_yaml` feature) - tap: Parse as TAP format (requires `parser_tap` feature) - text: Entire input as a single event with body `{"text": "..."}` - text-line: Each non-empty line as a separate event with body `{"text": "..."}`

          Possible values:
          - auto:      Auto-detect format based on file extension
          - json:      Parse as JSON
          - xml:       Parse as XML
          - yaml:      Parse as YAML
          - tap:       Parse as TAP (Test Anything Protocol)
          - text:      Entire input as raw text
          - text-line: Each line as a separate raw text event

          [default: auto]

  -h, --help
          Print help (see a summary with '-h')
```

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
