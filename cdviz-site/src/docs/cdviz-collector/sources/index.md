# Sources

A Source is a pipeline (like a ETL pipeline) where a Message travels from extractor through a series of [Transformers].

![inside a source](/architectures/inside_source.excalidraw.svg)

- 1 Extractor, read (by pull or push) Messages from an origin
- 0-n [Transformers], a chain of transformers that process the Message, at the end of the chain the payload is should be "CDEvent structure".
- 1 Loader, always the same that convert the Message into a CDEvent pushed into a queue (no need to configure it).

Every source has a name (value of the section under `sources`) and it is configured with the following parameters:

- `enabled`: A boolean value indicating whether the source is enabled or not (so you can configure it in configuration file and enable/disable by environment variable).
- `extractor`: The configuration of the extractor
- `transformer_refs`: the chain of transformers, defined by a list of transformer names (defined in the [transformers] section)
- `transformers`: the chain of transformers, defined by a list of configurations for transformers (it is recommended to prefer `transformer_refs`, if boths are provided the `transformer_refs` are appended at the end of the chain)

📚 **TOML Syntax Help:** See our [TOML Configuration Guide](../toml-guide.md) for help with arrays, tables, and nested configurations.

```toml
[sources.aaaa]
enabled = false
transformer_refs = ["bbbb", "log"]

[sources.aaaa.extractor]
type = "xzy"
parser = "json"
# ... parameters for `xzy` extractor

[transformers.bbbb]
type = "abc"
# ... parameters for `abc` transformer
```

## Messages

A Message is composed of:

- `metadata`: a `Map<String, JSON>`
- `headers`: a `Map<String, String>`
- `body`: a `JSON` like structure, also named `payload`

## Extractors

CDviz Collector supports several types of extractors for different event sources. Each extractor type has its own configuration options and use cases.

### Available Extractors

| Type | Description | Use Cases |
|------|-------------|-----------|
| [`noop`](./noop.md) | No-operation extractor for testing | Configuration testing, pipeline validation |
| [`webhook`](./webhook.md) | HTTP webhook endpoints | CI/CD systems, GitHub/GitLab webhooks, API integrations |
| [`opendal`](./opendal.md) | File system and cloud storage | Log files, artifact monitoring, batch processing |
| [`sse`](./sse.md) | Server-Sent Events client | Real-time event streams, SSE endpoints |

### Quick Reference

#### Noop/Sleep Extractor

For testing and development:

```toml
[sources.test.extractor]
type = "noop"  # or "sleep"
```

**[→ Full Documentation](./noop.md)**

#### Webhook Extractor

For HTTP-based event ingestion:

```toml
[sources.github.extractor]
type = "webhook"
id = "github-events"
headers_to_keep = ["X-GitHub-Event"]
```

**[→ Full Documentation](./webhook.md)**

#### OpenDAL Extractor

For file-based event sources:

```toml
[sources.files.extractor]
type = "opendal"
kind = "fs"  # or "s3", "gcs", etc.
polling_interval = "30s"
path_patterns = ["**/*.json"]
parser = "json"

[sources.files.extractor.parameters]
root = "/events"
```

**[→ Full Documentation](./opendal.md)**

#### SSE Extractor

For Server-Sent Events:

```toml
[sources.events.extractor]
type = "sse"
url = "https://events.example.com/stream"
max_retries = 10
```

**[→ Full Documentation](./sse.md)**

## Shared Configuration

### Header Configuration

Headers are used differently by various components:

- **Header Validation**: Validate incoming HTTP requests (Source webhook, Sink SSE)
- **Header Authentication**: Authenticate outgoing HTTP requests (Source SSE, Sink webhook)

**[→ Header Validation Guide](../header-validation.md)** - For incoming request validation
**[→ Header Authentication Guide](../header-authentication.md)** - For outgoing request authentication

## Loader

No configuration is required.

The loader is responsible for converting the Message into CDEvent. What is done is mainly:

- to compute a `context.id` from the Message's `body` if `context.id` is set to `"0"`.
  Having a `context.id` based on content allow to identify / filter duplicates later (this filtering is not DONE by the collector).
- to serialize the Message's body into a CDEvent.
- to push the CDEvent to the queue to be broadcasted to every [Sinks].

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
    "header": .header,
    "body": {
        "context": {
            "version": "0.4.0-draft",
            "id": "0",
            "source": "/event/source/123",
            "type": "dev.cdevents.service.deployed.0.1.1",
            "timestamp": .body.timestamp,
        },
        "subject": {
            "id": .body.id,
            "source": "/event/source/123",
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

[Sinks]: sinks
[Transformers]: transformers
[service]: <https://docs.rs/opendal/latest/opendal/services/index.html>
