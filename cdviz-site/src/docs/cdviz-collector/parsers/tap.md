---
description: "CDviz Collector TAP parser: parse Test Anything Protocol output into CDEvents testSuiteRun messages."
---

# TAP Parser

Parse Test Anything Protocol (TAP) format test results into structured JSON.

## Configuration

```toml
parser = "tap"
```

> [!IMPORTANT]
> Requires the `parser_tap` feature flag in your cdviz-collector build.

## Behavior

- Entire TAP file → 1 message with structured results
- Supports TAP version 13, test plans, ok/not ok results, YAML diagnostic blocks, skip/todo directives

## Output

Input `test-results.tap`:

```txt
TAP version 13
1..3
ok 1 - User authentication works
not ok 2 - Database connection
  ---
  message: Connection timeout
  ...
ok 3 - Cleanup completed
```

Output:

```json
{
  "version": 13,
  "plan": { "start": 1, "end": 3 },
  "tests": [
    { "ok": true, "id": 1, "description": "User authentication works" },
    {
      "ok": false,
      "id": 2,
      "description": "Database connection",
      "diagnostic": { "message": "Connection timeout" }
    },
    { "ok": true, "id": 3, "description": "Cleanup completed" }
  ]
}
```

## Primary Use Case

```bash
# Send TAP results from CI/CD pipeline
npm test --reporter=tap > test-results.tap
cdviz-collector send --data @test-results.tap --input-parser tap --url $CDVIZ_URL
```

## Example

```toml
[sources.tap_results.extractor]
type = "opendal"
kind = "fs"
polling_interval = "30s"
path_patterns = ["**/*.tap"]
parser = "tap"
parameters = { root = "./test-outputs" }
```

## CLI Usage

```bash
cdviz-collector send --data @test-results.tap --input-parser tap
npm test | cdviz-collector send --data @- --input-parser tap
```
