# Transform Command

Batch-process local files through configured transformers and write CDEvent JSON to an output directory.

Useful for testing transformers offline, migrating historical data, and validating transformer output in CI.

## Usage

```bash
cdviz-collector transform --input <DIR> --output <DIR> [OPTIONS]
```

```text
Transform local JSON files using configured transformers.

Processes JSON files from an input directory through configured transformers and writes results to an output directory. Supports validation against `CDEvents` specification and provides interactive review, overwrite, or check modes for managing output files.

Usage: cdviz-collector transform [OPTIONS] --input <INPUT> --output <OUTPUT>

Options:
      --config <CONFIG>
          Configuration file defining transformers and their settings.

          TOML configuration file that defines available transformers. The file should contain transformer definitions that can be referenced by name using the --transformer-refs option.

          [env: CDVIZ_COLLECTOR_CONFIG=]

  -v, --verbose...
          Increase logging verbosity

  -q, --quiet...
          Decrease logging verbosity

  -t, --transformer-refs <TRANSFORMER_REFS>...
          Names of transformers to chain together.

          Comma-separated list or multiple arguments specifying which transformers to apply in sequence. Transformers are applied in the order specified.

          Example: `--transformer-refs github_events,add_metadata` Example: `-t github_events -t add_metadata`

          [default: passthrough]

      --disable-otel
          Disable OpenTelemetry initialization and use minimal tracing setup.

          This is useful for testing environments or when you want to avoid OpenTelemetry overhead. When disabled, only basic console logging will be available without distributed tracing capabilities.

  -i, --input <INPUT>
          Input directory containing files to transform.

          Directory path containing the files to be processed. The tool will recursively search for files matching the selected `--input-parser` format (json, jsonl, csv, xml, yaml, tap), excluding *.headers.json, *.metadata.json, and *.json.new files.

  -C, --directory <DIRECTORY>
          Change working directory before executing the command.

          This affects relative paths in configuration files and data files. Useful when running the collector from a different location than where your configuration and data files are located.

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
```

## Input Formats

The command recursively finds files by extension and parses them automatically:

| Extension           | Parser      | Format             |
| ------------------- | ----------- | ------------------ |
| `.json`             | `json`      | JSON document      |
| `.jsonl`, `.ndjson` | `jsonl`     | JSON Lines         |
| `.csv`              | `csv_row`   | CSV rows           |
| `.xml`              | `xml`       | XML (JUnit, Maven) |
| `.tap`              | `tap`       | TAP test results   |
| `.txt`, `.log`      | `text_line` | Line-by-line text  |

Files named `*.headers.json`, `*.metadata.json`, and `*.json.new` are excluded.

**[→ Parsers Documentation](./parsers/index.md)**

## Processing Modes

| Mode        | Behavior                                                   |
| ----------- | ---------------------------------------------------------- |
| `review`    | Interactive diff review when output files already exist    |
| `overwrite` | Replace existing output files without prompting            |
| `check`     | Fail if output differs from existing files (CI validation) |

## Configuration

Transformers are defined in a TOML config file and referenced by name:

```toml
# transform-config.toml
[transformers.github_events]
type = "vrl"
source = '''
  # normalize GitHub webhook payload into CDEvent format
'''
```

```bash
cdviz-collector transform \
  --input ./raw-events \
  --output ./processed \
  --config transform-config.toml \
  --transformer-refs github_events
```

Multiple transformers chain in the order specified:

```bash
cdviz-collector transform ... --transformer-refs normalize,enrich,to_cdevent
# or equivalently
cdviz-collector transform ... -t normalize -t enrich -t to_cdevent
```

**[→ Transformers Guide](./transformers.md)**

## Common Use Cases

```bash
# Offline transformer testing
cdviz-collector transform \
  --input ./test-events --output ./test-results \
  --config dev-transformers.toml --verbose

# CI validation (fail if output changes)
cdviz-collector transform \
  --input ./test-data --output ./expected-results \
  --config .ci/transform-config.toml -t my-transformer \
  --mode check

# Migrate historical data
cdviz-collector transform \
  --input /data/historical --output /data/migrated \
  --config migration.toml -t my-transformer \
  --mode overwrite
```
