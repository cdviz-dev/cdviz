# OpenDAL Extractor

The OpenDAL extractor provides unified access to files from various storage systems including local filesystem, cloud storage (AWS S3, Google Cloud Storage, Azure Blob), and other data sources. It polls for new or modified files and processes them according to configured patterns.

## Configuration

```toml
[sources.file_source.extractor]
type = "opendal"
kind = "fs"  # or "s3", "gcs", etc.
polling_interval = "30s"
recursive = true
path_patterns = ["**/*.json", "events/*.csv"]
parser = "json"
```

## Parameters

### Required Parameters

- **`kind`** (string): Storage service type (lowercase OpenDAL scheme name)
- **`parameters`** (object): Service-specific configuration parameters
- **`polling_interval`** (duration): Interval between polls (e.g., "10s", "1m", "5m")
- **`path_patterns`** (array): Glob patterns to match files for processing
- **`parser`** (string): How to parse file contents

### Optional Parameters

- **`recursive`** (boolean): Search subdirectories recursively (default: true)
- **`try_read_headers_json`** (boolean): Attempt to read headers from `.headers.json` files (default: false)

## Supported Storage Services

### Local Filesystem (`kind = "fs"`)

Access files from local filesystem:

```toml
[sources.local_files.extractor]
type = "opendal"
kind = "fs"
polling_interval = "10s"
recursive = true
path_patterns = ["**/*.json"]
parser = "json"

[sources.local_files.extractor.parameters]
root = "/path/to/events"
```

### AWS S3 (`kind = "s3"`)

Access files from AWS S3 or S3-compatible storage:

```toml
[sources.s3_events.extractor]
type = "opendal"
kind = "s3"
polling_interval = "1m"
recursive = true
path_patterns = ["events/*.json", "logs/*.csv"]
parser = "json"

[sources.s3_events.extractor.parameters]
bucket = "my-events-bucket"
region = "us-west-2"
access_key_id = "AKIA..."
secret_access_key = "..."
endpoint = "https://s3.us-west-2.amazonaws.com"  # optional
```

### Google Cloud Storage (`kind = "gcs"`)

```toml
[sources.gcs_events.extractor]
type = "opendal"
kind = "gcs"
polling_interval = "2m"
recursive = false
path_patterns = ["daily-reports/*.json"]
parser = "json"

[sources.gcs_events.extractor.parameters]
bucket = "my-gcs-bucket"
# Authentication via service account key file or environment
credential_path = "/path/to/service-account.json"
```

### Azure Blob Storage (`kind = "azblob"`)

```toml
[sources.azure_events.extractor]
type = "opendal"
kind = "azblob"
polling_interval = "5m"
recursive = true
path_patterns = ["**/*.json"]
parser = "json"

[sources.azure_events.extractor.parameters]
container = "events-container"
account_name = "mystorageaccount"
account_key = "..."
```

## File Parsers

### JSON Parser (`parser = "json"`)

Parse entire file as single JSON object:

```toml
parser = "json"
```

**Input file** (`event.json`):
```json
{
  "event": "deployment",
  "service": "api",
  "version": "1.2.3"
}
```

**Output**: Single message with JSON as body

### JSON Lines Parser (`parser = "jsonl"`)

Parse each line as separate JSON object:

```toml
parser = "jsonl"
```

**Input file** (`events.jsonl`):
```json
{"event": "build", "status": "started"}
{"event": "build", "status": "completed"}
{"event": "test", "status": "passed"}
```

**Output**: Three separate messages

### CSV Parser (`parser = "csv_row"`)

Parse each CSV row as separate message:

```toml
parser = "csv_row"
```

**Input file** (`deployments.csv`):
```csv
timestamp,service,version,environment
2024-01-01T10:00:00Z,api,1.2.3,production
2024-01-01T11:00:00Z,web,2.1.0,staging
```

**Output**: Two messages (header row skipped), each row in message body

### Metadata Parser (`parser = "metadata"`)

Extract only file metadata (no content):

```toml
parser = "metadata"
```

**Output**: Messages with empty body but rich metadata about file activity

## Pattern Matching

Use glob patterns to select which files to process:

```toml
# Match all JSON files recursively
path_patterns = ["**/*.json"]

# Match specific directories
path_patterns = ["events/*.json", "logs/*.csv"]

# Match with complex patterns
path_patterns = [
  "production/**/deployments.json",
  "staging/*/events/*.jsonl",
  "**/artifact-*.json"
]
```

## Metadata Enhancement

Files can have associated header files for additional metadata:

```toml
try_read_headers_json = true
```

**Example**: For `event.json`, create `event.headers.json`:
```json
{
  "X-Source-System": "jenkins",
  "X-Pipeline-ID": "build-123",
  "X-Event-Type": "deployment"
}
```

These headers will be included in the message metadata.

## Examples

### CI/CD Artifact Processing

```toml
[sources.build_artifacts]
enabled = true
transformer_refs = ["artifact_to_cdevents"]

[sources.build_artifacts.extractor]
type = "opendal"
kind = "s3"
polling_interval = "30s"
recursive = true
path_patterns = ["builds/**/artifacts.json", "releases/*.json"]
parser = "json"

[sources.build_artifacts.extractor.parameters]
bucket = "ci-cd-artifacts"
region = "us-east-1"
access_key_id = "AKIA..."
secret_access_key = "..."
```

### Local Event Log Processing

```toml
[sources.local_events]
enabled = true
transformer_refs = ["standardize_events"]

[sources.local_events.extractor]
type = "opendal"
kind = "fs"
polling_interval = "10s"
recursive = true
path_patterns = ["**/*.json", "**/*.jsonl"]
parser = "jsonl"
try_read_headers_json = true

[sources.local_events.extractor.parameters]
root = "/var/log/application-events"
```

### Multi-Cloud Monitoring

```toml
# AWS S3 source
[sources.aws_metrics]
enabled = true
transformer_refs = ["aws_transformer"]

[sources.aws_metrics.extractor]
type = "opendal"
kind = "s3"
polling_interval = "1m"
recursive = false
path_patterns = ["metrics/*.csv"]
parser = "csv_row"

[sources.aws_metrics.extractor.parameters]
bucket = "aws-monitoring-data"
region = "us-west-2"
access_key_id = "AKIA..."
secret_access_key = "..."

# Google Cloud source
[sources.gcp_metrics]
enabled = true
transformer_refs = ["gcp_transformer"]

[sources.gcp_metrics.extractor]
type = "opendal"
kind = "gcs"
polling_interval = "1m"
recursive = false
path_patterns = ["metrics/*.json"]
parser = "json"

[sources.gcp_metrics.extractor.parameters]
bucket = "gcp-monitoring-data"
credential_path = "/etc/gcp-service-account.json"
```

### Development Environment

```toml
[sources.local_dev]
enabled = true
transformer_refs = ["dev_events"]

[sources.local_dev.extractor]
type = "opendal"
kind = "fs"
polling_interval = "5s"
recursive = true
path_patterns = ["*.json"]
parser = "json"

[sources.local_dev.extractor.parameters]
root = "./test-events"
```

## Service Capabilities

OpenDAL services must support these capabilities:
- **`read`**: Read file contents
- **`list`**: List directory contents
- **`stat`**: Get file metadata

## Authentication

### AWS S3
- Access keys (access_key_id, secret_access_key)
- IAM roles (when running on EC2)
- Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)

### Google Cloud Storage
- Service account key file (credential_path)
- Environment variables (GOOGLE_APPLICATION_CREDENTIALS)
- Metadata service (when running on GCP)

### Azure Blob Storage
- Account name and key
- Connection string
- Managed identity (when running on Azure)

## Performance Considerations

### Polling Interval
- Shorter intervals provide lower latency but higher resource usage
- Consider file creation frequency when setting polling_interval
- Use longer intervals for large buckets with infrequent changes

### Pattern Efficiency
- More specific patterns reduce scanning overhead
- Avoid overly broad patterns like `**/*` on large directories
- Use directory-specific patterns when possible

### File Size
- Large files may cause memory pressure during parsing
- Consider breaking large files into smaller chunks
- Use appropriate parser for file format

## Troubleshooting

### Permission Issues
```bash
# Check AWS credentials
aws s3 ls s3://your-bucket/

# Verify GCP access
gsutil ls gs://your-bucket/

# Test Azure connection
az storage blob list --container-name your-container
```

### Pattern Debugging
Enable debug logging to see which files match patterns:
```toml
[logging]
level = "debug"
```

### File Not Found
- Verify bucket/container exists
- Check path patterns for typos
- Ensure recursive setting matches directory structure

## Related

- [Sources Overview](./index.md) - Understanding the source pipeline
- [Webhook Extractor](./webhook.md) - For HTTP event ingestion
- [SSE Extractor](./sse.md) - For Server-Sent Events
- [Transformers](../transformers.md) - Processing extracted data
- [OpenDAL Documentation](https://opendal.apache.org/) - Official OpenDAL docs