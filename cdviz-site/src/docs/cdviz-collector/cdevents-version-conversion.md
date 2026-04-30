---
description: "CDviz Collector CDEvents version conversion: automatically upgrade or downgrade CDEvents schema versions across pipeline stages."
---

# CDEvents Version Conversion

Normalize CDEvents from older versions (v0.3, v0.4) to v0.5 using a global transformer chain.

## Why Version Conversion Is Needed

Different tools in your pipeline may emit CDEvents at different spec versions. ArgoCD, Tekton, or custom integrations built before CDEvents v0.5 will produce v0.3 or v0.4 events. Storing mixed-version events makes dashboards and queries more complex.

The solution is to normalize all events to the current version at ingestion time, before they reach your sinks.

## `pipeline.transformer_refs`

The `[pipeline]` section applies a transformer chain to **every** event from **every** source globally. This is the right place for cross-cutting concerns like version normalization.

```toml
[pipeline]
# Applied to every event from every source, in order.
# Use this for cross-cutting concerns like version normalization.
transformer_refs = ["cdevents_v0_3_to_v0_4", "cdevents_v0_4_to_v0_5"]
```

The pipeline chain runs **after** per-source `transformer_refs`. This means:

1. Source-specific transformers convert raw tool events into CDEvents (any version).
2. Pipeline transformers then normalize the version to v0.5.

## Configuration

```toml
[pipeline]
transformer_refs = ["cdevents_v0_3_to_v0_4", "cdevents_v0_4_to_v0_5"]

[remote.transformers-community]
type = "github"
owner = "cdviz-dev"
repo = "transformers-community"

[transformers]
cdevents_v0_3_to_v0_4 = { type = "vrl", template_rfile = "transformers-community:///cdevents/cdevents_v0_3/to_v0_4.vrl" }
cdevents_v0_4_to_v0_5 = { type = "vrl", template_rfile = "transformers-community:///cdevents/cdevents_v0_4/to_v0_5.vrl" }
```

Save this as `conversion.toml`. Add your `[sources.*]` and `[sinks.*]` sections as needed.

## Chain Mechanics

Events flow through the transformer chain in order:

```
Source event (v0.3, v0.4, or v0.5)
  → cdevents_v0_3_to_v0_4   # v0.3 → v0.4; v0.4/v0.5 pass through unchanged
  → cdevents_v0_4_to_v0_5   # v0.4 → v0.5; v0.5 passes through unchanged
  → Sinks (always v0.5)
```

Both transformers are idempotent: a v0.4 event passing through the v0.3→v0.4 transformer comes out unchanged. A v0.5 event passing through both transformers comes out unchanged. This means you can safely apply the full chain to all events regardless of their version.

## CLI Testing

### Quick test with `send`

Use `cdviz-collector send` without `--url` to see the transformed output on stdout (debug sink):

```bash
# Test a v0.4 CDEvent — output goes to stdout
cdviz-collector send \
  --data '{"context":{"version":"0.4.1","id":"0","source":"/my-app","type":"dev.cdevents.service.deployed.0.2.0","timestamp":"2024-01-01T00:00:00Z"},"subject":{"id":"my-service","source":"/my-app","type":"service","content":{"environment":{"id":"production"},"artifactId":"pkg:oci/my-service@sha256:abc123"}}}' \
  --config conversion.toml

# Or from a file
cdviz-collector send --data @old-event.json --config conversion.toml
```

### Batch conversion with `transform`

Convert a directory of v0.3/v0.4 CDEvent JSON files to v0.5 offline:

```bash
cdviz-collector transform \
  --input ./old-events \
  --output ./converted \
  --config conversion.toml \
  --transformer-refs cdevents_v0_3_to_v0_4,cdevents_v0_4_to_v0_5
```

**[→ Transform Command](./transform.md)**

### Continuous mode with `connect`

Run in server mode — all incoming events are normalized to v0.5 before reaching sinks:

```bash
cdviz-collector connect --config conversion.toml
```

Add your `[sources.*]` (e.g. webhook) and `[sinks.*]` to `conversion.toml`. Events already at v0.5 pass through unchanged.

**[→ Connect Command](./connect.md)**

## VRL Source Files

The conversion logic lives in the [transformers-community](https://github.com/cdviz-dev/transformers-community) repository. These files serve as human-readable migration guides showing exactly what changed between versions:

- [`cdevents/cdevents_v0_3/to_v0_4.vrl`](https://github.com/cdviz-dev/transformers-community/blob/main/cdevents/cdevents_v0_3/to_v0_4.vrl) — field-by-field mapping from v0.3 to v0.4
- [`cdevents/cdevents_v0_4/to_v0_5.vrl`](https://github.com/cdviz-dev/transformers-community/blob/main/cdevents/cdevents_v0_4/to_v0_5.vrl) — field-by-field mapping from v0.4 to v0.5

## See Also

- **[Transformers](./transformers.md)** — full transformer reference, VRL syntax, remote sources
- **[transformers-community](https://github.com/cdviz-dev/transformers-community)** — production-ready transformer library
