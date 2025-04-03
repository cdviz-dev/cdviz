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

### `type = "noop"`

This extractor does nothing.

```toml
[sources.aaaa.extractor]
type = "noop"
```

### `type = "webhook"`

Webhook extractor allows to receive messages via HTTP POST requests (over http or https).
A request is received then:

- headers values are kept (only those listed in `headers_to_keep` and not sensitive)
- payload is extracted from body and converted to JSON
- if `signature` is configured, the signature is validated

the configured URL path is `/webhook/{id}` where `id` is the value configured.

Parameters:

- `id`: An identifier used in the URL path (to identify the target webhook)
- `headers_to_keep`: A list of header names to save into message's header (optional)
- `signature`: Optional verification of request signature (unset => no verification)
  - `signature_encoding`: The encoding format: `base64` or `hex` (default: `hex`)
  - `signature_on`: The content to sign: `body` or `headers_then_body` (default: `body`)
    for `headers_then_body`, it means that the signature (digest) is computed on
    the concatenation of the value of some headers and the body2 fields are required:
    - `separator`: the separator used to concatenate the parts
    - `headers`: A list (same order than in the signature) of header names to concatenate
  - `signature_prefix`: A prefix to add to the computed signature (default: `""`)
  - `header`: Header name containing the signature to verify
  - `token`: Token/secret used to sign and to verify
  - `token_encoding`: The encoding format: unset (read as bytestring) or `base64` or `hex` (default: unset)

```toml
[sources.aaaa.extractor]
type = "webhook"
id = "000"
headers_to_keep = []
signature = { signature_encoding = "hex", signature_on = "body", signature_prefix = "sha256=", header = "x-hub-signature-256", token = "changeme" }
```

#### Examples with signature_on

Signature on `body` like for GitHub.

```toml
[sources.aaaa.extractor]
type = "webhook"
id = "000"
headers_to_keep = []
signature = { signature_encoding = "hex", signature_on = "body", signature_prefix = "sha256=", header = "x-hub-signature-256", token = "changeme" }
```

Signature on `headers_then_body` like [Svix]

```toml
[sources.aaaa.extractor]
type = "webhook"
id = "001"
headers_to_keep = []

[sources.aaaa.extractor.signature]
signature_encoding = "hex"
signature_on = { headers_then_body = {separator = ".", headers = ["svix-id", "svix-timestamp"]}}
signature_prefix = "v1,"
header = "svix-signature"
token = "changeme"
```

### `type = "opendal"`

[OpenDAL](https://opendal.apache.org/) means Open Data Access Layer. It is a unified data access layer for cloud storage, file system, and other data sources.
So you can use it to read from any cloud storage, file system, or other data sources (All drivers are not included into the cdviz-collector prebuilt binary).

The Opendal extractor polls the source and it creates a message for each created/modified file detected.

```toml
[sources.cdevents_local_json.extractor]
type = "opendal"
kind = ... # lowercase, name of the opendal driver/service
parameters = ... # parameters of the service depends on value `kind`
polling_interval = "10s" # interval between two polls, including the unit, e.g. "10s", "1m", "1h"
recursive = true # is search files recursively into folders
path_patterns = ["**/*.json"] # patterns to match files to extract
parser = "json" # how/what to extract to build a message
```

- The possible values of `kind` match the [service]'s `scheme`, and the `parameters` corresponding to Configurations section in the selected [service].
- `parser` can be one of the following:
  - `csv_row`: read the content of the file and create one message per row, content of the row as message's body (and extract metadata)
  - `json`: read the content of the file as json and place it as message's body (and extract metadata)
  - `jsonl`: read the content of the file and parse each line as a json and place it as message's body (and extract metadata)
  - `metadata`: only extract metadata from the file (=> empty body), can be useful to react to activity (creation, modification => artifact's publication)

Only service with the following capabilities can be used as an extractor:

- `read` capability
- `list` capability
- `stat` capability

#### Parameters Examples

##### `kind = "fs"`

Translated from Configurations of [FS](https://docs.rs/opendal/latest/opendal/services/struct.Fs.html)

> - `root`: Set the work dir for backend.

```toml
[sources.aaaa.extractor]
type = "opendal"
kind = "fs"
parameters = { root = "./source" }
# other...
```

##### `kind = "s3"`

The page [S3](https://docs.rs/opendal/latest/opendal/services/struct.S3.html) includes details about the configuration, and sample/details for compatible services like:

- Aliyun OSS
- AWS S3
- Azure Blob Storage
- Cloudflare R2
- Google Cloud Storage
- Huawei OBS
- MinIO
- Tencent COS
- Wasabi Object Storage
- Scaleway Object Storage

Translated from Configurations of [S3](https://docs.rs/opendal/latest/opendal/services/struct.S3.html):

> - `root`: Set the work dir for backend.
> - `bucket`: Set the container name for backend.
> - `endpoint`: Set the endpoint for backend.
> - `region`: Set the region for backend.
> - `access_key_id`: Set the access_key_id for backend.
> - `secret_access_key`: Set the secret_access_key for backend.
> - `session_token`: Set the session_token for backend.
> - `default_storage_class`: Set the default storage_class for backend.
> - `server_side_encryption`: Set the server_side_encryption for backend.
> - `server_side_encryption_aws_kms_key_id`: Set the server_side_encryption_aws_kms_key_id for backend.
> - `server_side_encryption_customer_algorithm`: Set the server_side_encryption_customer_algorithm for backend.
> - `server_side_encryption_customer_key`: Set the server_side_encryption_customer_key for backend.
> - `server_side_encryption_customer_key_md5`: Set the server_side_encryption_customer_key_md5 for backend.
> - `disable_config_load`: Disable aws config load from env.
> - `enable_virtual_host_style`: Enable virtual host style.
> - `disable_write_with_if_match`: Disable write with if match.

```toml
[sources.aaaa.extractor]
type = "opendal"
kind = "fs"
parameters = { root = "/source", bucket ="...", endpoint ="...", region ="...", access_key_id ="...", secret_access_key ="...", ... }
...
```

If the inline "table" is too long, with toml, you can also use the following syntax:

```toml
[sources.aaaa.extractor]
type = "opendal"
kind = "fs"
...

[sources.aaaa.extractor.parameters]
root = "/source"
bucket ="..."
endpoint ="..."
region ="..."
access_key_id ="..."
secret_access_key ="..."
...
```

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
