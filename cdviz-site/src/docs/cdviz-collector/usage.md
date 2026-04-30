---
description: "CDviz Collector CLI usage reference: available commands, global flags, and common invocation patterns."
---

# Usage of cdviz-collector

```bash
cdviz-collector --help
```

<<< @/docs/cdviz-collector/help.txt

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
