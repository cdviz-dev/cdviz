# Folder Sink

Writes each CDEvent as a JSON file to a storage backend via [OpenDAL](https://opendal.apache.org/). Supports local filesystem, Amazon S3, Google Cloud Storage, Azure Blob Storage, and other OpenDAL-compatible services.

## Configuration

```toml
[sinks.archive]
enabled = true
type = "folder"
kind = "fs"
parameters = { root = "./events" }
```

## Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | string | — | Must be `"folder"` |
| `kind` | string | — | Storage backend: `fs`, `s3`, `gcs`, `azblob`, … |
| `parameters` | object | — | Backend-specific settings (see below) |
| `enabled` | boolean | `true` | Enable/disable this sink |

## Storage Backends

### Local filesystem (`kind = "fs"`)

```toml
parameters = { root = "/path/to/events" }
```

### Amazon S3 (`kind = "s3"`)

```toml
parameters = {
  bucket = "cdviz-events",
  region = "us-east-1",
  root = "events/",           # optional prefix
  access_key_id = "...",      # omit to use IAM role / env vars
  secret_access_key = "...",
}
```

AWS credentials are also read from the standard `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` environment variables and IAM instance profiles.

### Google Cloud Storage (`kind = "gcs"`)

```toml
parameters = {
  bucket = "cdviz-events",
  root = "events/",
  credential_path = "/etc/gcp/service-account.json",  # omit for Application Default Credentials
}
```

### Azure Blob Storage (`kind = "azblob"`)

```toml
parameters = {
  container = "cdviz-events",
  account_name = "mystorageaccount",
  root = "events/",
  account_key = "...",   # or use AZURE_STORAGE_CONNECTION_STRING env var
}
```

## File Structure

Each event is written as `{event-id}.json` directly under the configured `root`:

```
{root}/
├── dev.cdevents.build.started.0.1.0-12345678.json
├── dev.cdevents.build.finished.0.1.0-87654321.json
└── dev.cdevents.service.deployed.0.1.1-11111111.json
```

## Examples

```toml
# Local dev
[sinks.dev_files]
enabled = true
type = "folder"
kind = "fs"
parameters = { root = "./events" }

# S3 production archive (using IAM role, no keys needed)
[sinks.s3_archive]
enabled = true
type = "folder"
kind = "s3"
parameters = { bucket = "company-cdviz-events", region = "us-west-2", root = "production/" }

# GCS staging
[sinks.gcs_staging]
enabled = false
type = "folder"
kind = "gcs"
parameters = { bucket = "staging-cdviz-events", root = "staging/", credential_path = "/etc/gcp/sa.json" }
```

> [!NOTE]
> Not all OpenDAL backends are compiled in by default. Check available backends with `cdviz-collector --version` or consult the build configuration.
