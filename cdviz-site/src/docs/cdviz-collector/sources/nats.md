# NATS Source

Consumes events from NATS subjects. Supports NATS Core (pub/sub with queue groups) and NATS JetStream (persistent, replay-capable messaging).

## Configuration

```toml
[sources.nats_events.extractor]
type = "nats"
url = "nats://localhost:4222"
subject = "cdevents.>"
```

## Parameters

### Required Parameters

- **`url`** (string): NATS server URL (e.g. `nats://localhost:4222`, `tls://secure-nats:4222`)
- **`subject`** (string): NATS subject to subscribe to (supports wildcards: `*` for single token, `>` for multiple tokens)

### Optional Parameters

- **`queue_group`** (string): Queue group for load-balanced consumption across multiple collector instances (NATS Core)
- **`headers_to_keep`** (array of strings): NATS header names to preserve through the pipeline
- **`credentials`** (string): Path to a NATS credentials file (`.creds`) for NKey/JWT authentication
- **`token`** (string): Token for NATS token authentication
- **`username`** / **`password`** (string): User/password authentication
- **`headers`** (array): Header validation rules for incoming messages
- **`metadata`** (object): Static metadata for all events; `context.source` is auto-populated if unset
- **`jetstream`** (object): JetStream consumer configuration (see [JetStream](#jetstream))

### JetStream Parameters

When `jetstream` is present, subscribes as a JetStream consumer:

- **`jetstream.stream`** (string): JetStream stream name
- **`jetstream.durable`** (string): Durable consumer name (persists position across restarts)
- **`jetstream.deliver_policy`** (string): `"all"`, `"last"`, `"new"`, or `"by_start_sequence"` (default: `"new"`)
- **`jetstream.ack_policy`** (string): `"explicit"`, `"none"`, or `"all"` (default: `"explicit"`)

## Examples

### NATS Core consumer

```toml
[sources.nats_events]
enabled = true
transformer_refs = ["process_events"]

[sources.nats_events.extractor]
type = "nats"
url = "nats://localhost:4222"
subject = "cdevents.>"
queue_group = "cdviz-collector"
headers_to_keep = ["content-type", "x-event-type"]
```

### JetStream consumer

```toml
[sources.nats_persistent]
enabled = true
transformer_refs = ["process_events"]

[sources.nats_persistent.extractor]
type = "nats"
url = "nats://localhost:4222"
subject = "cdevents.>"

[sources.nats_persistent.extractor.jetstream]
stream = "CDEVENTS"
durable = "cdviz-collector"
deliver_policy = "new"
ack_policy = "explicit"
```

### Secure with NKey credentials

```toml
[sources.secure_nats.extractor]
type = "nats"
url = "tls://secure-nats.company.com:4222"
subject = "events.>"
credentials = "/etc/nats/cdviz.creds"
```

**[→ Complete Header Validation Guide](../header-validation.md)**

## Configuration Reference

- [NATS Documentation](https://docs.nats.io/)
- [NATS JetStream Concepts](https://docs.nats.io/nats-concepts/jetstream)
- [NATS Security](https://docs.nats.io/nats-concepts/security)
