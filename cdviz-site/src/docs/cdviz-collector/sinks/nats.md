# NATS Sink

The NATS sink forwards CDEvents to NATS subjects. It supports both NATS Core (fire-and-forget pub/sub) and NATS JetStream (persistent, acknowledged publishing).

## Configuration

```toml
[sinks.nats]
enabled = true
type = "nats"
url = "nats://localhost:4222"
subject = "cdevents"
```

## Parameters

### Required Parameters

- **`type`** (string): Must be set to `"nats"`
- **`url`** (string): NATS server URL (e.g. `nats://localhost:4222`, `tls://secure-nats:4222`)
- **`subject`** (string): Target NATS subject for publishing messages

### Optional Parameters

- **`enabled`** (boolean): Enable/disable the NATS sink (default: `true`)
- **`timeout`** (duration): Timeout for message publishing (default: `30s`)
- **`credentials`** (string): Path to a NATS credentials file (`.creds`) for NKey/JWT authentication
- **`token`** (string): Authentication token for NATS token authentication
- **`username`** (string): Username for NATS user/password authentication
- **`password`** (string): Password for NATS user/password authentication
- **`headers`** (array): Header generation configuration for outgoing messages
- **`jetstream`** (object): JetStream publisher configuration (see [JetStream](#jetstream))

### JetStream Parameters

When the `jetstream` table is present, messages are published via JetStream with acknowledgement from the server.

- **`jetstream.enabled`** (boolean): Publish via JetStream instead of NATS Core (default: `false`)

## Message Format

### JSON Serialization

CDEvents are serialized to JSON and published to the configured NATS subject:

```json
{
  "context": {
    "version": "0.4.0",
    "id": "dev.cdevents.build.started.0.1.0-12345",
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

### Message Headers

NATS messages include:

- **Content-Type**: Always set to `application/json`
- **Source Headers**: Preserved headers from the original pipeline message
- **Generated Headers**: Configured authentication or signature headers

## JetStream

[NATS JetStream](https://docs.nats.io/nats-concepts/jetstream) provides durable, acknowledged publishing. Use JetStream publishing when you need confirmation that the message was persisted to a stream before continuing.

```toml
[sinks.nats_persistent]
enabled = true
type = "nats"
url = "nats://localhost:4222"
subject = "cdevents"

[sinks.nats_persistent.jetstream]
enabled = true
```

> The target stream must already exist in NATS JetStream and must be configured to capture the subject used by this sink.

## Authentication

NATS sinks support flexible authentication through credentials files, tokens, or user/password, and outgoing message headers for downstream consumers.

### Message Headers

Generate custom headers for downstream consumers:

```toml
[sinks.nats]
type = "nats"
url = "nats://localhost:4222"
subject = "events"

[sinks.nats.headers]
# Bearer token for downstream authentication
"Authorization" = { type = "static", value = "Bearer downstream-token" }

# HMAC signature for message integrity
"X-Message-Signature" = { type = "signature", token = "signing-secret", signature_prefix = "sha256=", signature_on = "body", signature_encoding = "hex" }
```

### NKey / JWT Credentials

```toml
[sinks.nats]
type = "nats"
url = "tls://secure-nats.company.com:4222"
subject = "cdevents"
credentials = "/etc/nats/cdviz.creds"
```

**[→ Complete Header Authentication Guide](../header-authentication.md)**

## Examples

### Basic NATS Publisher

```toml
[sinks.nats_events]
enabled = true
type = "nats"
url = "nats://localhost:4222"
subject = "cdevents"
```

### JetStream Publisher

```toml
[sinks.nats_persistent]
enabled = true
type = "nats"
url = "nats://localhost:4222"
subject = "cdevents"

[sinks.nats_persistent.jetstream]
enabled = true
```

### Secure NATS Integration

```toml
[sinks.secure_nats]
enabled = true
type = "nats"
url = "tls://secure-nats.company.com:4222"
subject = "secure-events"
credentials = "/etc/nats/cdviz.creds"

# Add headers for downstream consumers
[sinks.secure_nats.headers]
"X-Producer-ID" = { type = "static", value = "cdviz-collector" }
```

### Token Authentication

```toml
[sinks.nats_token]
enabled = true
type = "nats"
url = "nats://nats.company.com:4222"
subject = "cdevents"
token = "s3cr3t-t0ken"
```

## Configuration Reference

For NATS server and client configuration, see:

- [NATS Documentation](https://docs.nats.io/)
- [NATS JetStream Concepts](https://docs.nats.io/nats-concepts/jetstream)
- [NATS Security](https://docs.nats.io/nats-concepts/security)
