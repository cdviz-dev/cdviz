---
description: "CDviz Collector sources: webhook, Kafka, NATS, OpenDAL (S3/GCS/local), SSE, and HTTP polling extractors for CI/CD event collection."
---

# Sources

Sources collect events from external systems and feed them into the CDviz pipeline.

![inside a source](/architectures/inside_source.excalidraw.svg)

## Quick Reference

```toml
[sources.my_source]
enabled = true
transformer_refs = ["my_transformer"]

[sources.my_source.extractor]
type = "webhook"  # webhook | opendal | sse | kafka | nats | noop | http_polling
# ... extractor-specific parameters
```

The `opendal` extractor supports **parsers** for different file formats (json, jsonl, csv, xml, tap, text, etc.).
Other extractors parse their native protocol format directly.

**[→ Parsers Documentation](../parsers/index.md)**

## Messages

A Message is composed of:

- `metadata`: a `Map<String, JSON>` - Includes base extractor metadata with automatic `context.source` population
- `headers`: a `Map<String, String>`
- `body`: a `JSON` like structure, also named `payload`

### Extractor Metadata Configuration

All extractors accept a `metadata` field to inject static key/value pairs into every event — useful for tagging events with environment, team, or region without a custom transformer.

If `metadata.context.source` is not set, it defaults to `{http.root_url}/?source={source_name}`.

```toml
[sources.my_webhook.extractor]
type = "webhook"
id = "events"
metadata.environment = "production"
metadata.team = "platform"
# metadata.context.source = "/my-custom-source"  # override auto-generated URL
```

## Available Extractors

| Type                                | Description                        | Use Cases                                                   |
| ----------------------------------- | ---------------------------------- | ----------------------------------------------------------- |
| [`noop`](./noop.md)                 | No-operation extractor for testing | Configuration testing, pipeline validation                  |
| [`webhook`](./webhook.md)           | HTTP webhook endpoints             | CI/CD systems, GitHub/GitLab webhooks, API integrations     |
| [`sse`](./sse.md)                   | Server-Sent Events client          | Real-time event streams, SSE endpoints                      |
| [`http_polling`](./http_polling.md) | Periodic HTTP polling              | Legacy APIs, historical backfill, services without webhooks |
| [`opendal`](./opendal.md)           | File system and cloud storage      | Log files, artifact monitoring, batch processing            |
| [`kafka`](./kafka.md)               | Apache Kafka consumer              | Event streaming, message queues, Kafka-compatible brokers   |
| [`nats`](./nats.md)                 | NATS Core / JetStream consumer     | Cloud-native messaging, lightweight pub/sub, JetStream      |

## Shared Configuration

### Header Configuration

Headers are used differently by various components:

- **Header Validation**: Validate incoming HTTP requests (Source webhook, Sink SSE)
- **Header Authentication**: Authenticate outgoing HTTP requests (Source SSE, Sink webhook)

**[→ Header Validation Guide](../header-validation.md)** - For incoming request validation
**[→ Header Authentication Guide](../header-authentication.md)** - For outgoing request authentication

## Loader

No configuration required. The loader converts each Message into a CDEvent:

- Computes a content-based `context.id` (CID) when `context.id` is `"0"` or absent — enables downstream deduplication.
- Serializes the message body as a CDEvent.
- Pushes the CDEvent to all configured [Sinks].

## Examples

Some examples come from the cdviz-collector repository (you can look at [cdviz-collector.toml](https://github.com/cdviz-dev/cdviz-collector/blob/main/examples/assets/cdviz-collector.toml) to see an up-to-date configuration)

### Read a CDEvent from json files

Read from 1 folder, with 1 json file already in cdevents format.

```toml
[sources.cdevents_local_json]
enabled = false

[sources.cdevents_local_json.extractor]
type = "opendal"
kind = "fs"
polling_interval = "10s"
parameters = { root = "./source" }
recursive = true
path_patterns = ["**/*.json"]
parser = "json"
```

As this source (with this name) is already part of the base configuration, You only need to copy (and rename) it or to enable it and override the parameters you want.

```toml
[sources.cdevents_local_json]
enabled = true

[sources.cdevents_local_json.extractor]
parameters = { root = "./inputs/cdevents_json" }
```

### Read a CSV file

Read a CSV file from local filesystem and convert each row into a CDEvents: `1 row/line -> 1 message -> 1 event`

```toml
[sources.cdevents_local_csv]
enabled = true
transformer_refs = ["service_deployed"]

[sources.cdevents_local_csv.extractor]
type = "opendal"
kind = "fs"
polling_interval = "10s"
parameters = { root = "./inputs" }
recursive = false
path_patterns = ["cdevents.csv"]
parser = "csv_row"

[transformers.service_deployed]
type = "vrl"
template = """
[{
    "metadata": .metadata,
    "headers": .headers,
    "body": {
        "context": {
            "version": "0.4.1",
            "type": "dev.cdevents.service.deployed.0.1.1",
            "timestamp": .body.timestamp,
        },
        "subject": {
            "id": .body.id,
            "type": "service",
            "content": {
                "environment": {
                    "id": .body.env,
                },
                "artifactId": .body.artifact_id,
            }
        }
    }
}]
"""
```

[Sinks]: ../sinks/
[Transformers]: transformers
[service]: https://docs.rs/opendal/latest/opendal/services/index.html
