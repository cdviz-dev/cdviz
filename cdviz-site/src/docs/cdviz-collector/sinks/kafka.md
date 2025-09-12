# Kafka Sink

The Kafka sink forwards CDEvents to Kafka topics. It supports all Kafka-compatible brokers including Apache Kafka, Confluent Kafka, Redpanda, Amazon MSK, and other implementations of the Kafka protocol.

## Configuration

```toml
[sinks.kafka]
enabled = true
type = "kafka"
brokers = "localhost:9092"
topic = "cdevents"
```

## Parameters

### Required Parameters

- **`type`** (string): Must be set to `"kafka"`
- **`brokers`** (string): Kafka broker addresses (comma-separated)
- **`topic`** (string): Target topic for publishing messages

### Optional Parameters

- **`enabled`** (boolean): Enable/disable the Kafka sink (default: `true`)
- **`timeout`** (duration): Timeout for message production (default: `30s`)
- **`key_policy`** (enum): Message key strategy - `"unset"` or `"cdevent_id"` (default: `"unset"`)
- **`rdkafka_config`** (object): Additional rdkafka producer configuration options
- **`headers`** (array): Header generation configuration for outgoing messages

## Message Format

### JSON Serialization

CDEvents are serialized to JSON and published to Kafka:

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

Kafka messages include:

- **Content-Type**: Always set to `application/json`
- **Source Headers**: Preserved headers from the original pipeline message
- **Generated Headers**: Configured authentication or signature headers

### Message Keys

Message keys are set based on the `key_policy` configuration:

- **`unset`**: No message key (default)
- **`cdevent_id`**: Uses the CDEvent ID (`context.id`) as the message key

## Authentication

Kafka sinks support flexible authentication through outgoing message headers and rdkafka configuration for broker authentication.

### Message Headers

Generate custom headers for downstream consumers:

```toml
[sinks.kafka]
type = "kafka"
brokers = "localhost:9092"
topic = "events"

[sinks.kafka.headers]
# Bearer token for downstream authentication
"Authorization" = { type = "static", value = "Bearer downstream-token" }

# HMAC signature for message integrity
"X-Message-Signature" = { type = "signature", token = "signing-secret", signature_prefix = "sha256=", signature_on = "body", signature_encoding = "hex" }
```

### Broker Authentication

Configure broker authentication using rdkafka options:

```toml
# SASL/SCRAM authentication
[sinks.kafka.rdkafka_config]
"security.protocol" = "SASL_SSL"
"sasl.mechanisms" = "SCRAM-SHA-256"
"sasl.username" = "kafka-user"
"sasl.password" = "kafka-password"
"ssl.ca.location" = "/path/to/ca-cert.pem"
```

**[→ Complete Header Authentication Guide](../header-authentication.md)**

## Examples

### Basic Kafka Publisher

```toml
[sinks.kafka_events]
enabled = true
type = "kafka"
brokers = "localhost:9092"
topic = "cdevents"
key_policy = "cdevent_id"
```

### Secure Kafka Integration

```toml
[sinks.secure_kafka]
enabled = true
type = "kafka"
brokers = "secure-kafka.company.com:9093"
topic = "secure-events"
key_policy = "cdevent_id"

# SSL/SASL configuration
[sinks.secure_kafka.rdkafka_config]
"security.protocol" = "SASL_SSL"
"sasl.mechanisms" = "PLAIN"
"sasl.username" = "cdviz-producer"
"sasl.password" = "secure-password"
"ssl.ca.location" = "/etc/ssl/certs/ca-certificates.crt"
"ssl.certificate.location" = "/path/to/client-cert.pem"
"ssl.key.location" = "/path/to/client-key.pem"

# Add authentication headers for consumers
[sinks.secure_kafka.headers]
"X-Producer-ID" = { type = "static", value = "cdviz-collector" }
```

## Configuration Reference

For advanced Kafka producer configuration, see:

- [Apache Kafka Producer Configuration](https://kafka.apache.org/documentation/#producerconfigs)
- [librdkafka Configuration Reference](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md)

## Related

- [Sinks Overview](./index.md) - Understanding sink pipelines
- [Kafka Source](../sources/kafka.md) - For consuming events from Kafka
- [Header Authentication](../header-authentication.md) - Outgoing message authentication
- [HTTP Sink](./http.md) - Alternative event delivery method
- [Database Sink](./db.md) - Persistent storage option
