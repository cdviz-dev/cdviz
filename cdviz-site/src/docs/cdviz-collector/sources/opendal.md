# OpenDAL Extractor

Polls files from local filesystems, cloud storage (S3, GCS, Azure Blob), and other sources supported by [OpenDAL](https://docs.rs/opendal). Processes matching files according to path patterns and parser configuration.

## Configuration

```toml
[sources.file_source.extractor]
type = "opendal"
kind = "fs"
polling_interval = "30s"
recursive = true
path_patterns = ["**/*.json"]
parser = "json"
parameters = { root = "/path/to/events" }
```

## Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `kind` | string | — | Storage service type (`"fs"`, `"s3"`, `"gcs"`, `"azblob"`, etc.) |
| `parameters` | object | — | Service-specific configuration (root, bucket, credentials, etc.) |
| `polling_interval` | duration | — | Interval between polls (e.g. `"10s"`, `"1m"`) |
| `path_patterns` | array | — | Glob patterns to match files |
| `parser` | string | `"auto"` | How to parse file contents |
| `recursive` | boolean | `true` | Search subdirectories recursively |
| `try_read_headers_json` | boolean | `false` | Read headers from companion `.headers.json` files |
| `metadata` | object | — | Static metadata for all events; `context.source` is auto-populated if unset |

## Parsers

| Parser | Format | Output | Documentation |
| --- | --- | --- | --- |
| [`auto`](../parsers/auto.md) | Auto-detect | Varies | Default — detects by extension |
| [`json`](../parsers/json.md) | JSON | 1 message | Single JSON object |
| [`jsonl`](../parsers/jsonl.md) | JSON Lines | N messages | One per line |
| [`csv_row`](../parsers/csv_row.md) | CSV | N messages | One per row |
| [`text`](../parsers/text.md) | Plain text | 1 message | Complete file |
| [`text_line`](../parsers/text_line.md) | Plain text | N messages | One per line |
| [`xml`](../parsers/xml.md) | XML | 1 message | XML to JSON (`parser_xml` feature) |
| [`tap`](../parsers/tap.md) | TAP | 1 message | Test results (`parser_tap` feature) |
| [`metadata`](../parsers/metadata.md) | Any | 1 message | File metadata only |

**[→ Complete Parsers Documentation](../parsers/index.md)**

## Examples

### Local filesystem

```toml
[sources.local_events.extractor]
type = "opendal"
kind = "fs"
polling_interval = "10s"
path_patterns = ["**/*.json"]
parser = "json"
parameters = { root = "/var/events" }
```

### AWS S3

```toml
[sources.s3_events.extractor]
type = "opendal"
kind = "s3"
polling_interval = "1m"
path_patterns = ["events/*.json", "logs/*.csv"]
parser = "auto"

[sources.s3_events.extractor.parameters]
bucket = "my-events-bucket"
region = "us-west-2"
access_key_id = "AKIA..."
secret_access_key = "..."
```
