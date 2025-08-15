# Folder Sink

The folder sink writes CDEvents as JSON files to various storage backends using the OpenDAL library. It supports local filesystems, cloud storage (S3, GCS, Azure Blob), and other storage services for event archival, backup, and batch processing.

## Configuration

```toml
[sinks.cdevents_local_json]
enabled = true
type = "folder"
kind = "fs"
parameters = { root = "./sink" }
```

## Parameters

### Required Parameters

- **`type`** (string): Must be set to `"folder"`
- **`kind`** (string): Storage backend type (e.g., `"fs"`, `"s3"`, `"gcs"`, `"azblob"`)
- **`parameters`** (object): Backend-specific configuration parameters

### Optional Parameters

- **`enabled`** (boolean): Enable/disable the folder sink (default: `true`)

## Storage Backends

The folder sink uses [OpenDAL](https://opendal.apache.org/) to support multiple storage backends. Each backend requires specific parameters.

### Local Filesystem (`kind = "fs"`)

```toml
[sinks.local_files]
enabled = true
type = "folder"
kind = "fs"
parameters = { root = "/path/to/events" }
```

**Parameters:**

- **`root`** (string): Base directory path for storing files

### Amazon S3 (`kind = "s3"`)

```toml
[sinks.s3_backup]
enabled = true
type = "folder"
kind = "s3"
parameters = {
  bucket = "cdviz-events",
  region = "us-east-1",
  root = "events/"
}
```

**Parameters:**

- **`bucket`** (string): S3 bucket name
- **`region`** (string): AWS region
- **`root`** (string, optional): Prefix/folder within bucket
- **`access_key_id`** (string, optional): AWS access key (or use IAM roles)
- **`secret_access_key`** (string, optional): AWS secret key

### Google Cloud Storage (`kind = "gcs"`)

```toml
[sinks.gcs_archive]
enabled = true
type = "folder"
kind = "gcs"
parameters = {
  bucket = "cdviz-events-archive",
  root = "events/",
  credential_path = "/path/to/service-account.json"
}
```

**Parameters:**

- **`bucket`** (string): GCS bucket name
- **`root`** (string, optional): Prefix/folder within bucket
- **`credential_path`** (string, optional): Path to service account JSON file

### Azure Blob Storage (`kind = "azblob"`)

```toml
[sinks.azure_storage]
enabled = true
type = "folder"
kind = "azblob"
parameters = {
  container = "cdviz-events",
  account_name = "mystorageaccount",
  root = "events/"
}
```

**Parameters:**

- **`container`** (string): Azure Blob container name
- **`account_name`** (string): Azure storage account name
- **`root`** (string, optional): Prefix/folder within container
- **`account_key`** (string, optional): Account key for authentication

## File Naming and Structure

### File Naming Pattern

Each CDEvent is written as a separate JSON file:

```
{event-id}.json
```

Example:

```
dev.cdevents.build.started.0.1.0-12345678-abcd-1234-5678-123456789abc.json
```

### Directory Structure

Files are written to the configured root directory:

```
{root}/
├── dev.cdevents.build.started.0.1.0-12345678-abcd-1234-5678-123456789abc.json
├── dev.cdevents.build.finished.0.1.0-87654321-dcba-4321-8765-987654321fed.json
└── dev.cdevents.service.deployed.0.1.1-11111111-2222-3333-4444-555555555555.json
```

### File Content

Each file contains a complete CDEvent as JSON:

```json
{
  "context": {
    "version": "0.4.0",
    "id": "dev.cdevents.build.started.0.1.0-12345678",
    "source": "github.com/myorg/myrepo",
    "type": "dev.cdevents.build.started.0.1.0",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "subject": {
    "id": "build-456",
    "type": "build",
    "content": {
      "id": "build-456",
      "source": "github.com/myorg/myrepo"
    }
  }
}
```

## Examples

### Local Development

```toml
[sinks.dev_files]
enabled = true
type = "folder"
kind = "fs"
parameters = { root = "./events" }
```

### Production S3 Archive

```toml
[sinks.s3_archive]
enabled = true
type = "folder"
kind = "s3"
parameters = {
  bucket = "company-cdviz-events",
  region = "us-west-2",
  root = "production/events/",
  # Use IAM roles instead of keys in production
}
```

### Multi-Environment Setup

```toml
# Development - local files
[sinks.dev_backup]
enabled = true
type = "folder"
kind = "fs"
parameters = { root = "/tmp/cdviz-events" }

# Staging - GCS
[sinks.staging_archive]
enabled = false  # Enable in staging
type = "folder"
kind = "gcs"
parameters = {
  bucket = "staging-cdviz-events",
  root = "staging/",
  credential_path = "/etc/gcp/service-account.json"
}

# Production - S3 with lifecycle policies
[sinks.prod_archive]
enabled = false  # Enable in production
type = "folder"
kind = "s3"
parameters = {
  bucket = "prod-cdviz-events",
  region = "us-east-1",
  root = "production/events/"
}
```

### Time-Based Organization

Use transformers to organize files by date:

```toml
[sources.timestamped_events]
enabled = true
transformer_refs = ["add_date_path"]

[transformers.add_date_path]
type = "vrl"
template = """
.date_path = format_timestamp(.body.context.timestamp, "%Y/%m/%d")
[{
    "metadata": merge(.metadata, {"file_path": .date_path}),
    "headers": .headers,
    "body": .body
}]
"""

[sinks.organized_files]
enabled = true
type = "folder"
kind = "fs"
parameters = { root = "./events" }
```

### Filtered Archival

Archive only specific event types:

```toml
[sources.build_events_only]
enabled = true
transformer_refs = ["filter_build_events"]

[transformers.filter_build_events]
type = "vrl"
template = """
if !starts_with(.body.context.type, "dev.cdevents.build.") {
    abort
}
[{
    "metadata": .metadata,
    "headers": .headers,
    "body": .body
}]
"""

[sinks.build_archive]
enabled = true
type = "folder"
kind = "s3"
parameters = {
  bucket = "build-events-archive",
  region = "us-east-1",
  root = "builds/"
}
```

## Authentication

### AWS S3 Authentication

#### IAM Roles (Recommended)

```toml
[sinks.s3_with_iam]
enabled = true
type = "folder"
kind = "s3"
parameters = {
  bucket = "cdviz-events",
  region = "us-east-1",
  root = "events/"
  # No keys needed - uses IAM role
}
```

#### Access Keys

```toml
[sinks.s3_with_keys]
enabled = true
type = "folder"
kind = "s3"
parameters = {
  bucket = "cdviz-events",
  region = "us-east-1",
  root = "events/",
  access_key_id = "AKIAEXAMPLE",
  secret_access_key = "your-secret-key"
}
```

#### Environment Variables

```bash
# AWS credentials via environment
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="us-east-1"
```

### Google Cloud Storage Authentication

#### Service Account File

```toml
[sinks.gcs_with_service_account]
enabled = true
type = "folder"
kind = "gcs"
parameters = {
  bucket = "cdviz-events",
  root = "events/",
  credential_path = "/etc/gcp/cdviz-service-account.json"
}
```

#### Application Default Credentials

```toml
[sinks.gcs_with_adc]
enabled = true
type = "folder"
kind = "gcs"
parameters = {
  bucket = "cdviz-events",
  root = "events/"
  # Uses Application Default Credentials
}
```

### Azure Blob Storage Authentication

#### Account Key

```toml
[sinks.azure_with_key]
enabled = true
type = "folder"
kind = "azblob"
parameters = {
  container = "cdviz-events",
  account_name = "myaccount",
  account_key = "your-account-key",
  root = "events/"
}
```

#### Connection String

```bash
# Azure via environment variable
export AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=..."
```

## Use Cases

### Event Archival

Long-term storage of events for compliance and analysis:

```toml
[sinks.compliance_archive]
enabled = true
type = "folder"
kind = "s3"
parameters = {
  bucket = "compliance-cdviz-events",
  region = "us-east-1",
  root = "archive/",
  # Configure S3 lifecycle policies for automatic archival to Glacier
}
```

### Backup and Disaster Recovery

Backup events to multiple locations:

```toml
# Primary backup
[sinks.primary_backup]
enabled = true
type = "folder"
kind = "s3"
parameters = {
  bucket = "primary-cdviz-backup",
  region = "us-east-1",
  root = "backup/"
}

# Secondary backup in different region
[sinks.secondary_backup]
enabled = true
type = "folder"
kind = "s3"
parameters = {
  bucket = "secondary-cdviz-backup",
  region = "us-west-2",
  root = "backup/"
}
```

### Batch Processing Integration

Store events for batch processing systems:

```toml
[sinks.batch_processing]
enabled = true
type = "folder"
kind = "s3"
parameters = {
  bucket = "cdviz-batch-input",
  region = "us-east-1",
  root = "input/events/",
  # Batch systems can poll this location for new files
}
```

### Development and Testing

Local file storage for development:

```toml
[sinks.dev_local]
enabled = true
type = "folder"
kind = "fs"
parameters = { root = "./test-events" }
```

## Security Considerations

### Access Control

#### S3 Bucket Policies

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT:role/cdviz-collector-role"
      },
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::cdviz-events/*"
    }
  ]
}
```

#### IAM Policies

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::cdviz-events/*"
    }
  ]
}
```

### Encryption

#### S3 Server-Side Encryption

```toml
[sinks.encrypted_s3]
enabled = true
type = "folder"
kind = "s3"
parameters = {
  bucket = "encrypted-cdviz-events",
  region = "us-east-1",
  root = "events/",
  server_side_encryption = "AES256"
}
```

#### GCS Encryption

```toml
[sinks.encrypted_gcs]
enabled = true
type = "folder"
kind = "gcs"
parameters = {
  bucket = "encrypted-cdviz-events",
  root = "events/",
  encryption_key = "your-encryption-key"
}
```

## Performance Considerations

### Write Performance

- **Concurrent writes**: Multiple events can be written simultaneously
- **Network latency**: Cloud storage introduces network delays
- **File size**: Small files (typical CDEvents) are written efficiently

### Storage Optimization

#### S3 Lifecycle Policies

```json
{
  "Rules": [
    {
      "Id": "CDEventLifecycle",
      "Status": "Enabled",
      "Filter": { "Prefix": "events/" },
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        },
        {
          "Days": 365,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ]
    }
  ]
}
```

#### GCS Lifecycle Management

```json
{
  "rule": [
    {
      "action": { "type": "SetStorageClass", "storageClass": "NEARLINE" },
      "condition": { "age": 30 }
    },
    {
      "action": { "type": "SetStorageClass", "storageClass": "COLDLINE" },
      "condition": { "age": 90 }
    },
    {
      "action": { "type": "SetStorageClass", "storageClass": "ARCHIVE" },
      "condition": { "age": 365 }
    }
  ]
}
```

## Troubleshooting

### Connection Issues

```bash
# Test S3 connectivity
aws s3 ls s3://your-bucket/

# Test GCS connectivity
gsutil ls gs://your-bucket/

# Test Azure connectivity
az storage blob list --container-name your-container --account-name your-account
```

### Permission Issues

```bash
# Check AWS IAM permissions
aws sts get-caller-identity
aws iam simulate-principal-policy --policy-source-arn arn:aws:iam::ACCOUNT:role/ROLE --action-names s3:PutObject --resource-arns arn:aws:s3:::bucket/*

# Check GCS permissions
gcloud auth application-default print-access-token
gsutil iam get gs://your-bucket/
```

### Debug Folder Sink

```bash
# Enable folder sink debug logging
RUST_LOG=cdviz_collector::sinks::folder=debug cdviz-collector connect --config config.toml

# Monitor file operations
journalctl -f -u cdviz-collector | grep "folder\|storage"
```

## Backend Support

The folder sink requires specific OpenDAL backends to be enabled during compilation. Common backends:

```toml
# In Cargo.toml
[features]
default = ["sink_folder_fs", "sink_folder_s3"]
sink_folder_fs = ["dep:opendal/services-fs"]
sink_folder_s3 = ["dep:opendal/services-s3"]
sink_folder_gcs = ["dep:opendal/services-gcs"]
sink_folder_azblob = ["dep:opendal/services-azblob"]
```

**Note**: Not all backends are enabled by default. Contact the CDviz team or rebuild with specific features for additional storage backends.

## Related

- [Sinks Overview](./index.md) - Understanding sink pipelines
- [OpenDAL Documentation](https://opendal.apache.org/) - Storage backend details
- [Sources OpenDAL](../sources/opendal.md) - Reading from storage
- [Configuration](../configuration.md) - Environment variables and setup
