---
description: "CDviz Collector Kafka source: consume CDEvents from Apache Kafka, Confluent, Redpanda, and Amazon MSK topics with consumer group support."
---

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
- **`headers`** (table): Header validation rules for incoming messages
- **`metadata`** (object): Static metadata for all events; `context.source` is auto-populated if unset

## Security

### SASL/SSL (recommended for production)

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

### Confluent Cloud

```toml
[sources.confluent_events.extractor]
type = "kafka"
brokers = "pkc-xxx.us-east-1.aws.confluent.cloud:9092"
topics = ["ci-events"]
group_id = "cdviz-collector"

[sources.confluent_events.extractor.rdkafka_config]
"security.protocol" = "SASL_SSL"
"sasl.mechanisms" = "PLAIN"
"sasl.username" = "API_KEY"
"sasl.password" = "API_SECRET"
```

**[→ Complete Header Validation Guide](../header-validation.md)**

## Full Example

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

## Consumer Group Behavior

CDviz Collector acts as a standard Kafka consumer group member. Important notes for production:

- Use a stable, unique `group_id` for CDviz — do not share consumer groups with other applications
- Offsets are committed automatically (`auto_commit = true` by default) after each message is processed
- If CDviz restarts, it resumes from the last committed offset
- To reprocess events from the beginning, reset the consumer group offset using Kafka admin tools

## Related

- [NATS Source](./nats.md) — lighter-weight alternative for smaller-scale messaging
- [Webhook Source](./webhook.md) — receive events via HTTP POST for push-based integrations
- [Kafka Sink](../sinks/kafka.md) — publish transformed CDEvents back to Kafka topics
- [Header Validation](../header-validation.md) — validate Kafka message headers

## Configuration Reference

- [Apache Kafka Consumer Configuration](https://kafka.apache.org/documentation/#consumerconfigs)
- [librdkafka Configuration Reference](https://github.com/confluentinc/librdkafka/blob/master/CONFIGURATION.md)
