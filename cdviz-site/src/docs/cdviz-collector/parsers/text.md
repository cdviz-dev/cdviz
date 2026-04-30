---
description: "CDviz Collector text parser: read a complete plain text file as a single CDEvents message body."
---

# Text Parser

Parse entire file content as raw text, wrapped in `{"text": "..."}`.

## Configuration

```toml
parser = "text"
```

## Behavior

- Entire file → 1 message with body `{"text": "...file content..."}`
- Line breaks preserved as `\n`; all whitespace preserved
- Use `text_line` if each line should be an independent message

## Output

Input `build-error.log`:

```
Build failed at 2024-01-15 14:30:22
Error: Failed to compile src/main.rs
```

Output:

```json
{ "text": "Build failed at 2024-01-15 14:30:22\nError: Failed to compile src/main.rs" }
```

## Primary Use Case

```bash
# Send complete build log from CI/CD pipeline
./build.sh 2>&1 > build.log
cdviz-collector send --data @build.log --input-parser text --url $CDVIZ_URL
```

## Example

```toml
[sources.build_logs.extractor]
type = "opendal"
kind = "fs"
polling_interval = "1m"
path_patterns = ["**/build.log"]
parser = "text"
parameters = { root = "/var/ci/logs" }
```

## CLI Usage

```bash
cdviz-collector send --data @error.log --input-parser text
docker logs container_id | cdviz-collector send --data @- --input-parser text
```
