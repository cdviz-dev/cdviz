# Usage of cdviz-collector

```bash
cdviz-collector help
```

```text
cdviz-collector provides a configurable pipeline architecture that can receive events from various sources (webhooks, files, SSE), transform them using VRL or Handlebars, and send them to multiple destinations (HTTP endpoints, databases, files). It supports real-time event processing with CloudEvents format and CDEvents specification compliance.

Usage: cdviz-collector connect [OPTIONS]
       cdviz-collector send [OPTIONS] --data <DATA>
       cdviz-collector transform [OPTIONS] --input <INPUT> --output <OUTPUT>
       cdviz-collector help [COMMAND]...

Options:
  -v, --verbose...
          Increase logging verbosity

  -q, --quiet...
          Decrease logging verbosity

      --disable-otel
          Disable OpenTelemetry initialization and use minimal tracing setup.

          This is useful for testing environments or when you want to avoid OpenTelemetry overhead. When disabled, only basic console logging will be available without distributed tracing capabilities.

  -C, --directory <DIRECTORY>
          Change working directory before executing the command.

          This affects relative paths in configuration files and data files. Useful when running the collector from a different location than where your configuration and data files are located.

  -h, --help
          Print help (see a summary with '-h')

  -V, --version
          Print version

cdviz-collector connect:
Launch collector as a server to connect sources to sinks
      --config <CONFIG>
          Configuration file path for sources, sinks, and transformers.

          Specifies the TOML configuration file that defines the pipeline behavior. If not provided, the collector will use the base configuration with default settings. The configuration can also be specified via the `CDVIZ_COLLECTOR_CONFIG` environment variable.

          Example: `--config cdviz-collector.toml`

          [env: CDVIZ_COLLECTOR_CONFIG=]

  -h, --help
          Print help (see a summary with '-h')

cdviz-collector send:
Send JSON data directly to a sink for testing and scripting
  -d, --data <DATA>
          Data to send to the sink.

          Can be specified as: - Direct string: '{"test": "value"}' or raw text/XML/YAML content - File path: @data.json (format auto-detected from extension) - Stdin: @-

          The data will be parsed according to `--input-parser` and processed through the configured pipeline before being sent to the specified sink.

  -u, --url <URL>
          HTTP URL to send the data to.

          When specified, automatically enables the HTTP sink and disables the debug sink. The data will be sent as `CloudEvents` format to the specified endpoint.

          Example: `--url <https://api.example.com/webhook>`

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

cdviz-collector transform:
Transform local JSON files using configured transformers
      --config <CONFIG>
          Configuration file defining transformers and their settings.

          TOML configuration file that defines available transformers. The file should contain transformer definitions that can be referenced by name using the --transformer-refs option.

          [env: CDVIZ_COLLECTOR_CONFIG=]

  -t, --transformer-refs <TRANSFORMER_REFS>...
          Names of transformers to chain together.

          Comma-separated list or multiple arguments specifying which transformers to apply in sequence. Transformers are applied in the order specified.

          Example: `--transformer-refs github_events,add_metadata` Example: `-t github_events -t add_metadata`

          [default: passthrough]

  -i, --input <INPUT>
          Input directory containing files to transform.

          Directory path containing the files to be processed. The tool will recursively search for files matching the selected `--input-parser` format (json, jsonl, csv, xml, yaml, tap), excluding *.headers.json, *.metadata.json, and *.json.new files.

  -o, --output <OUTPUT>
          Output directory for transformed files (always written as JSON).

          Directory where transformed files will be written. The directory structure from the input will be preserved. Regardless of input format, output files are always written as JSON. Files will initially be created with .json.new extension before being processed according to the selected mode.

  -m, --mode <MODE>
          How to handle conflicts between new and existing output files.

          Controls the behavior when output files already exist: - review: Interactive review of differences (default) - overwrite: Replace existing files without prompting - check: Fail if differences are found

          Possible values:
          - review:    Interactive review of differences between new and existing output files
          - overwrite: Overwrite existing output files without prompting
          - check:     Check for differences and fail if any are found

          [default: review]

      --no-check-cdevent
          Skip validation that output body is a valid `CDEvent`.

          By default, the tool validates that transformation results produce valid `CDEvent` objects. Use this flag to disable validation if you're working with non-CDEvent JSON data.

      --export-headers
          Export headers to separate .headers.json files.

          When enabled, HTTP headers from the original request will be exported to .headers.json files alongside the main JSON output files.

      --export-metadata
          Export metadata to separate .metadata.json files.

          When enabled, event metadata (timestamps, source info, etc.) will be exported to .metadata.json files alongside the main JSON output files.

      --keep-new-files
          Keep temporary .json.new files after processing.

          Normally, temporary .json.new files created during transformation are cleaned up after processing. Use this flag to preserve them for debugging.

      --input-parser <PARSER>
          Input file format parser selection.

          Determines how input files are parsed. Use 'auto' for automatic format detection based on file extension, or specify an explicit format.

          Supported formats: - auto: Auto-detect (json, xml, yaml, yml, tap, csv) - json: JSON files - jsonl: JSON Lines (one object per line) - csv: CSV files (one event per row) - xml: XML files (requires `parser_xml` feature) - yaml: YAML files (requires `parser_yaml` feature) - tap: TAP format (requires `parser_tap` feature)

          Possible values:
          - auto:  Auto-detect format based on file extension
          - json:  Parse as JSON
          - jsonl: Parse as JSON Lines (one JSON object per line)
          - csv:   Parse as CSV (one event per row)
          - xml:   Parse as XML
          - yaml:  Parse as YAML
          - tap:   Parse as TAP (Test Anything Protocol)

          [default: auto]

  -h, --help
          Print help (see a summary with '-h')

cdviz-collector help:
Print this message or the help of the given subcommand(s)
  [COMMAND]...
          Print help for the subcommand(s)
```

## Subcommands

- [`connect`](./connect.md) - Launch collector as a server to connect sources to sinks.
- [`send`](./send.md) - Send JSON data directly to a sink for testing and scripting.
- [`transform`](./transform.md) - Transform local JSON files using configured transformers or test transformer.

## Common Usage Patterns

### Development and Testing

```bash
# Start development server
cdviz-collector connect --config dev-config.toml --verbose

# Test webhook endpoint
cdviz-collector send --data '{"test": "event"}' --url http://localhost:8080/webhook

# Transform test files
cdviz-collector transform --input ./test-events --output ./transformed --verbose
```

### Production Deployment

```bash
# Production server with specific config
cdviz-collector connect --config /etc/cdviz/config.toml --directory /opt/cdviz

# Batch process files in production
cdviz-collector transform \
  --input /data/input \
  --output /data/output \
  --config /etc/cdviz/config.toml \
  --mode overwrite
```

### Scripting and Automation

```bash
# Send events from scripts
cdviz-collector send --data @event.json --url "$WEBHOOK_URL"

# Pipeline for processing files
find /events -name "*.json" | while read file; do
  cdviz-collector send --data "@$file" --url "$WEBHOOK_URL"
done
```
