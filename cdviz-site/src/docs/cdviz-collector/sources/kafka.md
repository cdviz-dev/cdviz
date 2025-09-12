# Kafka Source

The Kafka source allows CDviz Collector to consume events from Kafka topics and process them through the pipeline. It supports all Kafka-compatible brokers including Apache Kafka, Confluent Kafka, Redpanda, Amazon MSK, and other implementations of the Kafka protocol.

## Configuration

```toml
[sources.kafka_events.extractor]
type = "kafka"
brokers = "localhost:9092"
topics = ["cdevents", "alerts"]
group_id = "cdviz-collector"
```

## Parameters

### Required Parameters

- **`type`** (string): Must be set to `"kafka"`
- **`brokers`** (string): Kafka broker addresses (comma-separated)
- **`topics`** (array of strings): List of topics to consume from
- **`group_id`** (string): Consumer group ID for Kafka consumer group management

### Optional Parameters

- **`headers_to_keep`** (array of strings): List of Kafka header names to preserve and forward through the pipeline
- **`poll_timeout`** (duration): Polling timeout for the consumer (default: `1s`)
- **`auto_commit`** (boolean): Whether to commit offsets automatically (default: `true`)
- **`rdkafka_config`** (object): Additional rdkafka consumer configuration options
- **`headers`** (array): Header validation rules for incoming messages (see [Security](#security))

## Message Processing

### 1. Message Consumption

The Kafka source subscribes to the specified topics using the configured consumer group and continuously polls for new messages.

### 2. Payload Parsing

Messages are parsed as JSON. If JSON parsing fails, the payload is treated as a string value.

### 3. Header Processing

Kafka message headers are processed and filtered:

- Only headers listed in `headers_to_keep` are preserved
- Headers are converted to HTTP-style format for pipeline processing

### 4. Header Validation

If header validation rules are configured, incoming messages are validated against them. Failed validation results in message rejection.

### 5. Metadata Preservation

Kafka-specific metadata is preserved in the event:

```json
{
  "kafka_topic": "events",
  "kafka_partition": 0,
  "kafka_offset": 12345,
  "kafka_timestamp": 1640995200000
}
```

## Security

Kafka sources support header validation for incoming messages using the same validation system as webhook sources.

### Header Validation Examples

```toml
[sources.secure_kafka.extractor]
type = "kafka"
brokers = "localhost:9092"
topics = ["events"]
group_id = "cdviz-secure"

# Require content-type header
[sources.secure_kafka.extractor.headers]
"Content-Type" = { type = "equals", value = "application/json", case_sensitive = false }

# Validate authorization token
"Authorization" = { type = "matches", pattern = "^Bearer [A-Za-z0-9\\\\\\\\-_]+$" }

# Environment secret validation
"X-API-Key" = { type = "secret", value = "KAFKA_API_SECRET" }
```

**[→ Complete Header Validation Guide](../header-validation.md)**

## Examples

### Basic Kafka Consumer

```toml
[sources.kafka_events]
enabled = true
transformer_refs = ["process_events"]

[sources.kafka_events.extractor]
type = "kafka"
brokers = "localhost:9092"
topics = ["cdevents"]
group_id = "cdviz-collector"
headers_to_keep = ["content-type", "x-event-type"]
```

### Secure Kafka Consumer

```toml
[sources.secure_kafka]
enabled = true
transformer_refs = ["validate_and_process"]

[sources.secure_kafka.extractor]
type = "kafka"
brokers = "secure-kafka.company.com:9093"
topics = ["sensitive-events"]
group_id = "cdviz-secure-consumer"
headers_to_keep = ["content-type", "x-correlation-id"]

# SSL/SASL configuration
[sources.secure_kafka.extractor.rdkafka_config]
"security.protocol" = "SASL_SSL"
"sasl.mechanisms" = "PLAIN"
"sasl.username" = "cdviz-user"
"sasl.password" = "secure-password"
"ssl.ca.location" = "/path/to/ca-cert.pem"

# Header validation
[sources.secure_kafka.extractor.headers]
"Authorization" = { type = "matches", pattern = "^Bearer [A-Za-z0-9\\\\\\\\-_]+$" }
```

## Configuration Reference

For advanced Kafka consumer configuration, see:

- [Apache Kafka Consumer Configuration](https://kafka.apache.org/documentation/#consumerconfigs)
- [librdkafka Configuration Reference](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md)

## Related

- [Sources Overview](./index.md) - Understanding the source pipeline
- [WebHook Source](./webhook.md) - For HTTP-based event ingestion
- [Kafka Sink](../sinks/kafka.md) - For publishing events to Kafka
- [Header Validation](../header-validation.md) - Securing incoming messages
- [Transformers](../transformers.md) - Processing consumed messages
