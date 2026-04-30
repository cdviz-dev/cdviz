---
description: "CDviz Collector JSON parser: parse a single JSON object from a file into one CDEvents message."
---

# JSON Parser

Parse entire file as a single JSON object.

## Configuration

```toml
parser = "json"
```

## Behavior

- Entire file parsed as one JSON document; must be valid JSON
- Produces 1 message per file; the body is the parsed JSON object

## Output

Input `event.json`:

```json
{ "event_type": "deployment", "service": "api", "version": "1.2.3" }
```

Output body:

```json
{ "event_type": "deployment", "service": "api", "version": "1.2.3" }
```

## Example

```toml
[sources.cdevents_json.extractor]
type = "opendal"
kind = "fs"
polling_interval = "10s"
path_patterns = ["**/*.json"]
parser = "json"
parameters = { root = "./cdevents" }
```

## CLI Usage

```bash
cdviz-collector send --data @event.json --input-parser json
```
