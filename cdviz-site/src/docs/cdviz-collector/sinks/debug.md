---
description: "CDviz Collector debug sink: log CDEvents to stdout for development, testing, and pipeline troubleshooting."
---

# Debug Sink

Prints every CDEvent to the log at `INFO` level. Use during development to verify pipeline flow and transformer output.

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

The debug sink is included but disabled by default:

```toml
[sinks.debug]
enabled = false
type = "debug"
```

Enable it via config (`enabled = true`) or environment variable:

```bash
CDVIZ_COLLECTOR__SINKS__DEBUG__ENABLED="true" cdviz-collector connect --config config.toml
```
