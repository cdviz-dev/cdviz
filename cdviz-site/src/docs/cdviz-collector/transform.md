# Transform Command

Transform local JSON files using configured transformers with batch processing capabilities.

The `transform` command processes JSON files from an input directory through configured transformers and writes results to an output directory. It supports validation against CDEvents specification and provides interactive review, overwrite, or check modes for managing output files.

## Usage

```bash
cdviz-collector transform [OPTIONS] --input <INPUT> --output <OUTPUT> --transformer-refs <TRANSFORMER_REFS>
```

```text
Transform local JSON files using configured transformers.

Processes JSON files from an input directory through configured transformers and writes results to an output directory. Supports validation against CDEvents specification and provides interactive review, overwrite, or check modes for managing output files.

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

          Example: `--transformer-refs github_events,add_metadata`
          Example: `-t github_events -t add_metadata`

          [default: passthrough]

      --disable-otel
          Disable OpenTelemetry initialization and use minimal tracing setup.

          This is useful for testing environments or when you want to avoid OpenTelemetry overhead. When disabled, only basic console logging will be available without distributed tracing capabilities.

  -i, --input <INPUT>
          Input directory containing JSON files to transform.

          Directory path containing the JSON files to be processed. The tool will recursively search for *.json files, excluding *.headers.json, *.metadata.json, and *.json.new files.

  -C, --directory <DIRECTORY>
          Change working directory before executing the command.

          This affects relative paths in configuration files and data files. Useful when running the collector from a different location than where your configuration and data files are located.

  -o, --output <OUTPUT>
          Output directory for transformed JSON files.

          Directory where transformed files will be written. The directory structure from the input will be preserved. Files will initially be created with .json.new extension before being processed according to the selected mode.

  -m, --mode <MODE>
          How to handle conflicts between new and existing output files.

          Controls the behavior when output files already exist: - review: Interactive review of differences (default) - overwrite: Replace existing files without prompting - check: Fail if differences are found

          Possible values:
          - review:    Interactive review of differences between new and existing output files
          - overwrite: Overwrite existing output files without prompting
          - check:     Check for differences and fail if any are found

          [default: review]

      --no-check-cdevent
          Skip validation that output body is a valid CDEvent.

          By default, the tool validates that transformation results produce valid CDEvent objects. Use this flag to disable validation if you're working with non-CDEvent JSON data.

      --export-headers
          Export headers to separate .headers.json files.

          When enabled, HTTP headers from the original request will be exported to .headers.json files alongside the main JSON output files.

      --export-metadata
          Export metadata to separate .metadata.json files.

          When enabled, event metadata (timestamps, source info, etc.) will be exported to .metadata.json files alongside the main JSON output files.

      --keep-new-files
          Keep temporary .json.new files after processing.

          Normally, temporary .json.new files created during transformation are cleaned up after processing. Use this flag to preserve them for debugging.

  -h, --help
          Print help (see a summary with '-h')
```

## Input and Output Structure

### Input Directory

The transform command recursively searches the input directory for `*.json` files, excluding:

- `*.headers.json` files
- `*.metadata.json` files
- `*.json.new` files

### Output Directory

Transformed files maintain the same directory structure as the input. Files are initially created with `.json.new` extension before being processed according to the selected mode.

### File Processing Modes

| Mode        | Behavior                                                                             |
| ----------- | ------------------------------------------------------------------------------------ |
| `review`    | **Default.** Interactive review of differences between new and existing output files |
| `overwrite` | Overwrite existing output files without prompting                                    |
| `check`     | Check for differences and fail if any are found                                      |

## Basic Usage

### Simple Transformation

```bash
# Transform files with default passthrough transformer
cdviz-collector transform --input ./raw-events --output ./processed-events
```

### With Custom Transformers

Custom transformers are defined into the configuration file

```bash
# Use specific transformers
cdviz-collector transform \
  --input ./raw-events \
  --output ./processed-events \
  --config transform-config.toml \
  --transformer-refs github_events,add_metadata
```

## Configuration

### Configuration File Structure

```toml
# transform-config.toml

# Define transformers
[[transformers]]
name = "github_events"
type = "vrl"
script = '''
  .event_type = "github"
  .source = "github.com"
  .timestamp = now()

  # Normalize GitHub webhook data
  if exists(.action) {
    .cdevent_type = .action
  }

  # Add repository context
  if exists(.repository) {
    .context.repository = .repository.full_name
  }
'''

[[transformers]]
name = "add_metadata"
type = "vrl"
script = '''
  .metadata = {}
  .metadata.processed_at = now()
  .metadata.processor = "cdviz-collector"
  .metadata.version = "1.0"
'''

[[transformers]]
name = "cdevents_format"
type = "vrl"
script = '''
  # Convert to CDEvents format
  .specversion = "1.0"
  .id = uuid_v4()
  .time = .timestamp
  .type = "dev.cdevents." + .cdevent_type + ".v1"

  # Move data to subject
  .subject = {
    "id": .id,
    "type": .event_type,
    "content": .
  }

  # Clean up top-level fields
  del(.event_type)
  del(.cdevent_type)
  del(.timestamp)
'''
```

### Transformer Chaining

Transformers are applied in the order specified:

```bash
# Chain multiple transformers
cdviz-collector transform \
  --input ./raw-events \
  --output ./processed-events \
  --config transform-config.toml \
  --transformer-refs github_events,add_metadata,cdevents_format
```

Multiple `-t` flags can also be used:

```bash
cdviz-collector transform \
  --input ./raw-events \
  --output ./processed-events \
  --config transform-config.toml \
  -t github_events \
  -t add_metadata \
  -t cdevents_format
```

## Processing Modes

### Interactive Review Mode (Default)

```bash
cdviz-collector transform \
  --input ./events \
  --output ./processed \
  --mode review
```

In review mode, the tool shows differences when output files already exist and prompts for action:

```
File: user-login.json
Changes detected:

- "timestamp": "2024-01-01T10:00:00Z"
+ "timestamp": "2024-01-01T12:00:00Z"
+ "metadata": {
+   "processed_at": "2024-01-01T12:00:00Z"
+ }

Actions:
[a]ccept changes, [r]eject changes, [s]kip file, [A]ccept all, [R]eject all:
```

### Overwrite Mode

```bash
cdviz-collector transform \
  --input ./events \
  --output ./processed \
  --mode overwrite
```

Automatically overwrites existing output files without prompting.

### Check Mode

```bash
cdviz-collector transform \
  --input ./events \
  --output ./processed \
  --mode check
```

Fails if differences are found, useful for CI/CD validation:

```bash
# In CI pipeline
cdviz-collector transform \
  --input ./test-events \
  --output ./expected-output \
  --mode check || exit 1
```

## Validation and Quality Control

### CDEvents Validation

By default, the tool validates that transformation results produce valid CDEvent objects:

```bash
# Skip CDEvents validation
cdviz-collector transform \
  --input ./events \
  --output ./processed \
  --no-check-cdevent
```

### Export Additional Data

Export headers and metadata to separate files:

```bash
cdviz-collector transform \
  --input ./events \
  --output ./processed \
  --export-headers \
  --export-metadata
```

This creates additional files:

- `event.json` - Main transformed content
- `event.headers.json` - HTTP headers from original request
- `event.metadata.json` - Event metadata (timestamps, source info, etc.)

### Debug Mode

Keep temporary files for debugging:

```bash
cdviz-collector transform \
  --input ./events \
  --output ./processed \
  --keep-new-files \
  --verbose
```

## Common Use Cases

### Development and Testing

```bash
# Test transformations during development
cdviz-collector transform \
  --input ./test-events \
  --output ./test-results \
  --config dev-transformers.toml \
  --verbose
```

### Data Migration

```bash
# Migrate historical data
cdviz-collector transform \
  --input /data/historical-events \
  --output /data/cdevents-format \
  --config migration-config.toml \
  --transformer-refs my-transformer \
  --mode overwrite
```

### CI/CD Validation

```bash
# Validate transformation results in CI
cdviz-collector transform \
  --input ./test-data \
  --output ./expected-results \
  --config .ci/transform-config.toml \
  --transformer-refs my-transformer \
  --mode check
```

### Batch Processing

```bash
# Process large datasets
cdviz-collector transform \
  --input /data/raw-events-2024 \
  --output /data/processed-events-2024 \
  --config production-transformers.toml \
  --transformer-refs my-transformer \
  --mode overwrite \
  --verbose
```

## Advanced Transformations

### Data Enrichment

```toml
[[transformers]]
name = "enrich_metadata"
type = "vrl"
script = '''
# Add enrichment metadata
.metadata = .metadata || {}
.metadata.enriched_at = now()
.metadata.enrichment_version = "1.0"

# Add environment context
.metadata.environment = get_env_var!("ENVIRONMENT") || "unknown"
.metadata.region = get_env_var!("AWS_REGION") || "unknown"

# Normalize timestamps
if exists(.metadata.timestamp) && is_string(.metadata.timestamp) {
  .metadata.timestamp = parse_timestamp!(.metadata.timestamp, "%Y-%m-%dT%H:%M:%SZ")
}

# Add data quality scores
.metadata.quality = {}
.metadata.quality.completeness = length(keys(.)) / 10.0
.metadata.quality.has_timestamp = exists(.time)
.metadata.quality.has_source = exists(.source)
'''
```

## Performance Optimization

### Large Dataset Processing

```bash
# Process large datasets efficiently
cdviz-collector transform \
  --input /data/large-dataset \
  --output /data/processed \
  --config optimized-config.toml \
  --transformer-refs my-transformer \
  --mode overwrite \
  --disable-otel
```

### Memory Management

For very large files, consider processing in smaller batches:

```bash
# Split large directory into batches
find /data/events -name "*.json" | split -l 1000 - batch_

# Process each batch
for batch in batch_*; do
  mkdir -p /tmp/batch_input
  cat "$batch" | xargs -I {} cp {} /tmp/batch_input/

  cdviz-collector transform \
    --input /tmp/batch_input \
    --output /data/processed \
    --mode overwrite

  rm -rf /tmp/batch_input
done
```

### Parallel Processing

```bash
# Process multiple directories in parallel
parallel cdviz-collector transform \
  --input {} \
  --output /data/processed/{/} \
  --mode overwrite ::: /data/events/*/
```

### Recovery Strategies

```bash
# Recover from failed transformations
cdviz-collector transform \
  --input ./events \
  --output ./processed \
  --keep-new-files \
  --verbose

# Inspect failed files
ls *.json.new

# Fix issues and retry
cdviz-collector transform \
  --input ./events \
  --output ./processed \
  --mode overwrite
```

## Related

- [Configuration Guide](./configuration.md) - Complete configuration reference
- [Transformers](./transformers.md) - VRL transformation language guide
- [Connect Command](./connect.md) - Server mode for real-time processing
- [Send Command](./send.md) - Send single events for testing
- [Quick Start](./quick-start.md) - Get started with basic transformations
- [Troubleshooting](./troubleshooting.md) - Debug transformation issues
