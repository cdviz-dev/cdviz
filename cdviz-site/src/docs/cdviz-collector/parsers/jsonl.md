---
description: "CDviz Collector JSONL parser: parse JSON Lines files into multiple CDEvents messages, one per line."
---

# JSONL Parser

Parse JSON Lines format — one JSON object per line, one message per line.

## Configuration

```toml
parser = "jsonl"
```

## Behavior

- Each line becomes a separate message
- Empty lines are skipped
- Each line must be valid JSON
- File extensions recognized by `auto`: `.jsonl`, `.ndjson`

## Output

Input `events.jsonl` (4 lines → 4 messages):

```json
{"event": "build", "status": "started"}
{"event": "build", "status": "running"}
{"event": "build", "status": "completed"}
```

## Example

```toml
[sources.app_logs.extractor]
type = "opendal"
kind = "fs"
polling_interval = "30s"
path_patterns = ["**/*.jsonl", "**/*.ndjson"]
parser = "jsonl"
parameters = { root = "/var/log/application" }
```

## CLI Usage

```bash
cdviz-collector send --data @events.jsonl --input-parser jsonl
```
