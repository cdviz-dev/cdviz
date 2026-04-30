---
description: "CDviz Collector text_line parser: parse plain text files line-by-line into individual CDEvents messages."
---

# Text Line Parser

Parse text files line-by-line — one message per non-empty line.

## Configuration

```toml
parser = "text_line"
```

## Behavior

- Each non-empty line → 1 message with body `{"text": "...line content..."}`
- Empty and whitespace-only lines are skipped
- Line breaks not preserved in output
- Use `text` if the complete file content is needed as one message

## Output

Input `linter-output.txt`:

```
src/api.js:42:10 - Error: 'response' is not defined
src/utils.js:12:1 - Error: Missing semicolon
```

Output (2 messages):

```json
{"text": "src/api.js:42:10 - Error: 'response' is not defined"}
{"text": "src/utils.js:12:1 - Error: Missing semicolon"}
```

## Primary Use Case

```bash
# Send linter output from CI/CD pipeline
eslint src/ > eslint-report.txt
cdviz-collector send --data @eslint-report.txt --input-parser text_line --url $CDVIZ_URL
```

## Example

```toml
[sources.eslint_results.extractor]
type = "opendal"
kind = "fs"
polling_interval = "30s"
path_patterns = ["**/eslint-report.txt"]
parser = "text_line"
parameters = { root = "./ci-outputs" }
```

## CLI Usage

```bash
cdviz-collector send --data @lint-results.txt --input-parser text_line
cat build.log | cdviz-collector send --data @- --input-parser text_line
```
