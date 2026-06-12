---
description: "CDviz Collector debug sink: log CDEvents to stdout for development, testing, and pipeline troubleshooting."
---

# Debug Sink

Prints every CDEvent to the log at `INFO` level. Use during development to verify pipeline flow and transformer output without needing a real database or message broker.

## Configuration

```toml
[sinks.debug]
enabled = true
type = "debug"
```

## Parameters

| Parameter | Type    | Default | Description              |
| --------- | ------- | ------- | ------------------------ |
| `type`    | string  | —       | Must be `"debug"`        |
| `enabled` | boolean | `true`  | Enable/disable this sink |

## Log Output

Each event is logged as a single JSON line:

```
[timestamp] INFO cdviz_collector::sinks::debug: [DEBUG SINK] {"context":{...},"subject":{...}}
```

## Default Configuration

The debug sink is included but disabled by default in production configs. Enable it at runtime without changing your config file:

```bash
CDVIZ_COLLECTOR__SINKS__DEBUG__ENABLED="true" cdviz-collector connect --config config.toml
```

## Development Workflow

Start with debug sink + noop or webhook source, send a test event, iterate on your VRL transformer until the output looks correct, then enable the production sink alongside debug to verify both receive events.

```toml
# dev-config.toml
[sources.test_webhook.extractor]
type = "webhook"
id = "test"

[sources.test_webhook]
enabled = true
transformer_refs = ["my_transformer"]

[sinks.debug]
enabled = true
type = "debug"

# [sinks.db]
# enabled = false  # enable when transformer output is correct
```

## Combining with Other Sinks

The debug sink can run alongside production sinks. Add it temporarily to inspect events in a staging environment:

```toml
[sinks.db]
enabled = true
type = "db"
# ...

[sinks.debug]
enabled = true
type = "debug"
```
