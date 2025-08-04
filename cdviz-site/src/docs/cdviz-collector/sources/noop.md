# Noop Extractor

The `noop` (no-operation) extractor is a testing utility that does nothing - it simply sleeps until cancelled. This extractor is primarily used for testing configurations and pipeline setups without processing any actual events.

## Configuration

The noop extractor requires minimal configuration:

```toml
[sources.test_source.extractor]
type = "noop"
```

Alternative alias:

```toml
[sources.test_source.extractor]
type = "sleep"
```

## Parameters

The noop extractor accepts no additional parameters beyond the `type` field.

## Behavior

When enabled, the noop extractor:

1. **Sleeps indefinitely** - Does not generate any events
2. **Waits for cancellation** - Responds to shutdown signals
3. **Closes cleanly** - Properly closes the pipeline when cancelled

## Use Cases

### Testing Configurations

Use the noop extractor to test source pipeline configurations without processing real data:

```toml
[sources.test_pipeline]
enabled = true
transformer_refs = ["validate_events", "log_debug"]

[sources.test_pipeline.extractor]
type = "noop"
```

### Pipeline Validation

Validate that transformers and sinks are properly configured:

```toml
[sources.config_test]
enabled = true
transformer_refs = ["my_custom_transformer"]

[sources.config_test.extractor]
type = "noop"

[transformers.my_custom_transformer]
type = "vrl"
template = """
[{
    "metadata": .metadata,
    "headers": .headers,
    "body": {
        "context": {
            "version": "0.4.0-draft",
            "id": "test-event",
            "source": "/test/source",
            "type": "test.event.1.0.0",
            "timestamp": now()
        },
        "subject": {
            "id": "test-subject",
            "type": "test"
        }
    }
}]
"""
```

### Placeholder Source

Use as a placeholder while developing other parts of the system:

```toml
[sources.future_integration]
enabled = false  # Disable until real implementation is ready
transformer_refs = ["convert_to_cdevents"]

[sources.future_integration.extractor]
type = "noop"
```

## Example Complete Configuration

```toml
# Test source using noop extractor
[sources.test_source]
enabled = true
transformer_refs = ["log"]

[sources.test_source.extractor]
type = "noop"

# Simple logging transformer
[transformers.log]
type = "vrl"
template = """
log(.metadata, level: "info")
[]
"""
```

## Related

- [Sources Overview](./index.md) - Understanding the source pipeline
- [Webhook Extractor](./webhook.md) - For HTTP event ingestion
- [OpenDAL Extractor](./opendal.md) - For file-based event sources
- [SSE Extractor](./sse.md) - For Server-Sent Events