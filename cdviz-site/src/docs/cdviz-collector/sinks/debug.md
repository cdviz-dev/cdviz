# Debug Sink

The debug sink is the simplest sink in CDviz Collector. It prints CDEvents to the log at `INFO` level, making it useful for development, testing, and debugging event pipelines.

## Configuration

```toml
[sinks.debug]
enabled = true
type = "debug"
```

## Parameters

### Required Parameters

- **`type`** (string): Must be set to `"debug"`

### Optional Parameters

- **`enabled`** (boolean): Enable/disable the debug sink (default: `true`)

## Behavior

When the debug sink receives a CDEvent, it:

1. **Serializes** the event to JSON format
2. **Logs** the JSON at `INFO` level with prefix `[DEBUG SINK]`
3. **Continues** processing (non-blocking operation)

## Log Output Format

```
[timestamp] INFO cdviz_collector::sinks::debug: [DEBUG SINK] {"context":{"version":"0.4.0","id":"...","source":"...","type":"...","timestamp":"..."},"subject":{"id":"...","type":"...","content":{...}}}
```

## Use Cases

### Development and Testing

Debug sink is perfect for:

- **Pipeline validation**: Verify events flow through the system correctly
- **Transformer testing**: See the output of transformation rules
- **Configuration debugging**: Check event structure and content
- **Integration testing**: Monitor event flow during development

### Troubleshooting

Use debug sink to:

- **Diagnose pipeline issues**: See exactly what events are being processed
- **Validate event structure**: Ensure events conform to CDEvents specification
- **Monitor event volume**: Track the number and frequency of events
- **Debug transformations**: Verify transformer logic produces expected output

## Examples

### Basic Debug Output

```toml
[sinks.debug]
enabled = true
type = "debug"
```

### Debug with Other Sinks

```toml
# Debug sink for development
[sinks.debug]
enabled = true
type = "debug"

# Production database sink
[sinks.database]
enabled = false  # Disabled in development
type = "db"
url = "postgresql://postgres:passwd@localhost:5432/cdviz"

# Enable debug in development
[sinks.debug]
enabled = true
```

### Environment-Based Configuration

```toml
# Configuration file
[sinks.debug]
enabled = false  # Disabled by default
type = "debug"
```

```bash
# Enable via environment variable
CDVIZ_COLLECTOR__SINKS__DEBUG__ENABLED="true" cdviz-collector connect --config config.toml
```

### Debug Specific Event Types

Combine with transformers to debug specific event types:

```toml
# Source with filtering
[sources.filtered_events]
enabled = true
transformer_refs = ["build_events_only"]

[transformers.build_events_only]
type = "vrl"
template = """
if !starts_with(.body.context.type, "dev.cdevents.build.") {
    abort
}
[{
    "metadata": .metadata,
    "headers": .headers,
    "body": .body
}]
"""

# Debug only build events
[sinks.debug]
enabled = true
type = "debug"
```

## Performance Considerations

### Log Volume

- **High event volume** may generate large amounts of log output
- **Disk space** can fill up quickly with verbose logging
- **Log rotation** should be configured appropriately

### Performance Impact

- **Minimal overhead**: Debug sink is lightweight and non-blocking
- **Serialization cost**: JSON serialization adds small CPU overhead
- **I/O impact**: Writing to logs may impact disk I/O performance

### Production Use

- **Disable in production**: Debug sink is primarily for development
- **Conditional enabling**: Use environment variables for runtime control
- **Log level filtering**: Configure log levels to control output

## Integration

### With Other Sinks

Debug sink works alongside other sinks:

```toml
# Multiple sinks receive the same events
[sinks.debug]
enabled = true
type = "debug"

[sinks.database]
enabled = true
type = "db"
url = "postgresql://user:pass@host:port/db"

[sinks.webhook]
enabled = true
type = "http"
url = "https://external-service.com/webhook"
```

### With Log Aggregation

Send debug output to log aggregation systems:

```bash
# Docker with log driver
docker run -d \
  --log-driver=fluentd \
  --log-opt fluentd-address=localhost:24224 \
  cdviz-collector:latest

# Kubernetes with log collection
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: cdviz-collector
    image: cdviz-collector:latest
    env:
    - name: CDVIZ_COLLECTOR__SINKS__DEBUG__ENABLED
      value: "true"
```

### With Monitoring

Monitor debug sink output:

```bash
# Count debug sink messages
journalctl -u cdviz-collector | grep "\[DEBUG SINK\]" | wc -l

# Filter by event type
journalctl -u cdviz-collector | grep "\[DEBUG SINK\]" | grep "build.started"

# Real-time monitoring
journalctl -f -u cdviz-collector | grep "\[DEBUG SINK\]"
```

## Testing

### Verify Debug Output

```bash
# Start collector with debug sink enabled
CDVIZ_COLLECTOR__SINKS__DEBUG__ENABLED="true" \
RUST_LOG=info \
cdviz-collector connect --config config.toml

# In another terminal, send test event
curl -X POST http://localhost:8080/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": "event"}'

# Check logs for debug output
journalctl -u cdviz-collector | tail -10
```

### Log Level Configuration

```bash
# Show only debug sink output
RUST_LOG=cdviz_collector::sinks::debug=info cdviz-collector connect --config config.toml

# Show all info and above
RUST_LOG=info cdviz-collector connect --config config.toml

# Detailed debugging
RUST_LOG=debug cdviz-collector connect --config config.toml
```

## Default Configuration

The debug sink is included in the default configuration:

```toml
[sinks.debug]
enabled = false
type = "debug"
```

To enable it, either:

1. **Edit configuration**: Set `enabled = true` in config file
2. **Environment variable**: Set `CDVIZ_COLLECTOR__SINKS__DEBUG__ENABLED="true"`
3. **Override configuration**: Create a custom configuration file

## Related

- [Sinks Overview](./index.md) - Understanding sink pipelines
- [Database Sink](./db.md) - PostgreSQL storage
- [HTTP Sink](./http.md) - Webhook posting
- [Configuration](../configuration.md) - General configuration options
