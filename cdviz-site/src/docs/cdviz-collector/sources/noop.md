---
description: "CDviz Collector noop source: no-operation extractor for pipeline testing and configuration validation without external dependencies."
---

# Noop Extractor

A no-operation extractor that does nothing — sleeps until cancelled. Use for testing sink connectivity, validating transformer configuration, and CI/CD config syntax checks without a live event source.

## Configuration

```toml
[sources.test_source.extractor]
type = "noop"  # also accepts "sleep"
```

## Parameters

No additional parameters beyond `type`.

## Use Cases

### Validate transformer logic without a live event source

```toml
[sources.test_pipeline]
enabled = true
transformer_refs = ["my_transformer"]

[sources.test_pipeline.extractor]
type = "noop"
```

### Development environment placeholder

Keep the same config structure across dev and prod:

```toml
# dev-config.toml — avoids Kafka dependency in development
[sources.build_events]
enabled = true
transformer_refs = ["process_build"]

[sources.build_events.extractor]
type = "noop"  # swap to type = "kafka" in production config
```

The noop extractor respects cancellation signals, making it useful for testing pipeline shutdown behavior and verifying your sinks flush correctly on termination.
