# Noop Extractor

A no-operation extractor that does nothing — sleeps until cancelled. Use for testing configurations and pipeline setups without processing actual events.

## Configuration

```toml
[sources.test_source.extractor]
type = "noop"  # also accepts "sleep"
```

## Parameters

No additional parameters beyond `type`.

## Use Cases

- Test transformer and sink configuration without a real event source
- Placeholder while developing pipeline logic

```toml
[sources.test_pipeline]
enabled = true
transformer_refs = ["my_transformer"]

[sources.test_pipeline.extractor]
type = "noop"
```
