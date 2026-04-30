---
description: "CDviz Collector auto parser: automatically detect and parse file format by extension for JSON, JSONL, CSV, and text files."
---

# Auto Parser

Automatically select the parser based on file extension. Default when `parser` is omitted.

## Configuration

```toml
parser = "auto"
# or omit entirely — auto is the default
```

## Detection Rules

| Extension           | Parser Used | Notes                         |
| ------------------- | ----------- | ----------------------------- |
| `.json`             | `json`      | Single JSON object            |
| `.jsonl`, `.ndjson` | `jsonl`     | JSON Lines                    |
| `.csv`              | `csv_row`   | CSV with header row           |
| `.xml`              | `xml`       | Requires `parser_xml` feature |
| `.tap`              | `tap`       | Requires `parser_tap` feature |
| `.txt`, `.log`      | `text_line` | Line-by-line                  |
| Other / none        | `text_line` | Default fallback              |

## Use Cases

- Mixed file format directories
- Dynamic input sources where format is determined by extension

## Example

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

## CLI Usage

```bash
cdviz-collector send --data @event.json --input-parser auto
cdviz-collector send --data @junit.xml --input-parser auto
```
