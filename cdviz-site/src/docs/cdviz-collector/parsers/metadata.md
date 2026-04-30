---
description: "CDviz Collector metadata parser: emit file metadata (name, size, modified time) as CDEvents without reading file contents."
---

# Metadata Parser

Extract file metadata without reading content.

## Configuration

```toml
parser = "metadata"
```

## Behavior

- No file content is read
- Produces 1 message with empty body and file metadata
- Ideal for large or binary files where content is not needed

## Output

```json
{
  "metadata": {
    "file_path": "/var/logs/app.log",
    "file_name": "app.log",
    "file_size": 1024000,
    "last_modified": "2024-01-15T14:30:00Z",
    "content_type": "text/plain"
  },
  "headers": {},
  "body": {}
}
```

Available fields: `file_path`, `file_name`, `file_size`, `last_modified`, `content_type` (plus storage-specific fields from S3, GCS, Azure).

## Use Cases

- **Artifact tracking**: Detect new releases or build artifacts without downloading content
- **File system monitoring**: Track when configs or files change
- **Cost optimization**: Avoid reading large files in cloud storage

## Example

```toml
[sources.artifact_tracking.extractor]
type = "opendal"
kind = "s3"
polling_interval = "1m"
path_patterns = ["artifacts/**/*.jar", "releases/**/*.tar.gz"]
parser = "metadata"

[sources.artifact_tracking.extractor.parameters]
bucket = "build-artifacts"
region = "us-east-1"
```

## CLI Usage

```bash
cdviz-collector send --data @large-file.bin --input-parser metadata
```
