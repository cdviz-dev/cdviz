# Kafka Source

Consumes events from Kafka topics. Supports Apache Kafka, Confluent Kafka, Redpanda, Amazon MSK, and other Kafka-compatible brokers.

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

- **`brokers`** (string): Kafka broker addresses (comma-separated)
- **`topics`** (array of strings): Topics to consume from
- **`group_id`** (string): Consumer group ID

### Optional Parameters

- **`headers_to_keep`** (array of strings): Kafka header names to preserve through the pipeline
- **`poll_timeout`** (duration): Polling timeout (default: `1s`)
- **`auto_commit`** (boolean): Commit offsets automatically (default: `true`)
- **`rdkafka_config`** (object): Additional rdkafka consumer configuration
- **`headers`** (array): Header validation rules for incoming messages
- **`metadata`** (object): Static metadata for all events; `context.source` is auto-populated if unset

## Security

```toml
[sources.secure_kafka.extractor]
type = "kafka"
brokers = "secure-kafka.company.com:9093"
topics = ["events"]
group_id = "cdviz-secure"

[sources.secure_kafka.extractor.rdkafka_config]
"security.protocol" = "SASL_SSL"
"sasl.mechanisms" = "PLAIN"
"sasl.username" = "cdviz-user"
"sasl.password" = "secure-password"
"ssl.ca.location" = "/path/to/ca-cert.pem"
```

**[→ Complete Header Validation Guide](../header-validation.md)**

## Example

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

## Configuration Reference

- [Apache Kafka Consumer Configuration](https://kafka.apache.org/documentation/#consumerconfigs)
- [librdkafka Configuration Reference](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md)
