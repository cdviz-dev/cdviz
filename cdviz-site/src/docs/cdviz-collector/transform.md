# Transform Command

Batch-process local files through configured transformers and write CDEvent JSON to an output directory.

Useful for testing transformers offline, migrating historical data, and validating transformer output in CI.

## Usage

```bash
cdviz-collector transform --input <DIR> --output <DIR> [OPTIONS]
```

<<< @/docs/cdviz-collector/transform-help.txt

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
