---
title: "CDEvents in Action #2: Send Your First CDEvent"
description: "Learn three approaches to send CDEvents: basic curl, production bash script with HMAC signatures, and cdviz-collector send. From simple testing to production-ready integration."
tags: ["cdevents", "devops", "cicd", "integration", "webhooks", "security"]
target_audience: "DevOps Engineers, CI/CD Practitioners"
reading_time: "10 minutes"
series: "CDEvents in Action"
series_part: 2
published: true
---

# CDEvents in Action #2: Send Your First CDEvent

_You've tested receiving CDEvents. Now learn how to send them from your pipelines with three progressive approaches: basic curl for testing, production bash scripts with security, and the recommended cdviz-collector send command._

## The Producer Problem

In [Episode #1](./episode-1-simulate-consumer.md), you learned how to simulate receiving CDEvents. Now you need to **send** events from your actual pipelines and tools.

But sending events properly means handling:

- **Correct CDEvent format**: Valid JSON structure and required fields
- **Security**: Authentication and request signing
- **Unique identifiers**: Content-based IDs for deduplication
- **Accurate timestamps**: ISO 8601 format with timezone
- **Multiple destinations**: Database, webhooks, Kafka, S3

Starting with hardcoded curl commands helps you understand the basics. Then you'll graduate to production-ready solutions.

## Quick Setup: Test Your Sending

Before we start sending events, let's set up a local test consumer to validate what we send. As we learned in episode 1, `cdviz-collector connect` makes this easy.

### Launch a Local Test Consumer

Create a minimal configuration file:

```toml
# cdviz-collector-debug.toml
[http]
host = "0.0.0.0"
port = 8080

[sinks.debug]
enabled = true
type = "debug"
format = "json"
destination = "stdout"

[sources.cdevents_webhook]
enabled = true

[sources.cdevents_webhook.extractor]
type = "webhook"
id = "000-cdevents"
```

Launch the collector:

```bash
cdviz-collector connect -v --config ./cdviz-collector-debug.toml
```

**What this does**:

- ✅ Accepts CDEvents at `http://localhost:8080/webhook/000-cdevents`
- ✅ Validates CDEvent format and rejects invalid events
- ✅ Shows events in real-time on stdout as they arrive
- ✅ Provides immediate feedback for your testing

Keep this running in one terminal while you test sending events from another terminal.

## Three Approaches to Send CDEvents

Each approach serves different needs and skill levels:

| Approach                    | Best For                              | Setup Time | Security     | Flexibility |
| --------------------------- | ------------------------------------- | ---------- | ------------ | ----------- |
| **Basic curl**              | Learning, quick testing               | 30 seconds | ❌ None      | Low         |
| **Production bash script**  | CI/CD without dependencies            | 5 minutes  | ✅ HMAC      | Medium      |
| **cdviz-collector send** ⭐ | Production use, multiple destinations | 2 minutes  | ✅ Full auth | High        |

Let's explore each approach and understand when to use them.

## Approach 1: Basic Curl - Understanding the Structure

**When to use**: Learning CDEvents structure, quick prototyping, understanding HTTP basics

**Perfect for**: Developers new to CDEvents who want hands-on experience

### Send a Basic CDEvent

```bash
# Send a deployment event with hardcoded values
curl -X POST http://localhost:8080/webhook/000-cdevents \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "version": "0.4.1",
      "id": "test-123",
      "source": "my-pipeline",
      "type": "dev.cdevents.service.deployed.0.2.0",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    "subject": {
      "id": "my-service",
      "type": "service",
      "content": {
        "environment": {"id": "production"},
        "artifactId": "pkg:oci/my-service@v1.2.3"
      }
    }
  }'
```

Check your test consumer terminal - you should see the event appear immediately.

### What You Learn

- ✅ **CDEvent structure**: See exactly what fields are required
- ✅ **HTTP basics**: Understand headers and request format
- ✅ **Quick iteration**: Test different event types rapidly
- ✅ **Immediate validation**: See results in test consumer

- ❌ **No security**: No authentication or request signing
- ❌ **Static IDs**: Hardcoded ID causes deduplication issues
- ❌ **Not production-ready**: Missing security and proper ID generation

**Best practice**: Use basic curl to understand CDEvents structure, then graduate to more robust approaches.

## Approach 2: Production-Ready Bash Script

**When to use**: CI/CD integration with minimal dependencies (bash, curl, openssl, uuidgen), production pipelines

**Perfect for**: Teams that need security but can't install cdviz-collector

### Production-Ready Script Example

This script demonstrates three critical production features:

1. **HMAC-SHA256 signature** for request authentication
2. **Unique ID** using UUID v7 (time-ordered)
3. **Current timestamp** for accurate event timing

```bash
#!/usr/bin/env bash
#
# send-cdevent.sh - Production-ready CDEvent sender
#
set -euo pipefail

# Configuration (can be parameterized via environment variables)
API_TOKEN="${API_TOKEN:-your-secret-token-here}"
WEBHOOK_URL="${WEBHOOK_URL:-http://localhost:8080/webhook/000-cdevents}"

# Generate unique ID (UUID v7 - time-ordered)
EVENT_ID=$(uuidgen -7)

# Create CDEvent payload
cat > body.json <<EOF
{
  "context": {
    "version": "0.4.1",
    "id": "$EVENT_ID",
    "source": "my-pipeline",
    "type": "dev.cdevents.service.deployed.0.2.0",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  },
  "subject": {
    "id": "my-service",
    "type": "service",
    "content": {
      "environment": {"id": "production"},
      "artifactId": "pkg:oci/my-service@v1.2.3"
    }
  }
}
EOF

# Generate HMAC-SHA256 signature
SIGNATURE=$(openssl dgst -hex -sha256 -hmac "$API_TOKEN" body.json)
SIGNATURE=${SIGNATURE#* }  # Remove "SHA256(filename)= " prefix

# Send the CDEvent with signature
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-Signature: sha256=$SIGNATURE" \
  --data @body.json

# Cleanup
rm -f body.json

echo "CDEvent sent successfully with ID: $EVENT_ID"
```

### How to Use the Production Script

```bash
# Basic usage with defaults
./send-cdevent.sh

# Production usage with environment variables
export API_TOKEN="your-production-secret"
export WEBHOOK_URL="https://events.company.com/webhook"

./send-cdevent.sh

# Parameterize the script further by editing hardcoded values
# (service name, environment, artifact ID, etc.)
```

### Understanding the Security Features

**1. HMAC-SHA256 Signature**

```bash
SIGNATURE=$(openssl dgst -hex -sha256 -hmac "$API_TOKEN" body.json)
```

- Cryptographic proof that the sender has the secret token
- Prevents unauthorized event submission
- Verifiable by the receiver without sending the token

**2. UUID v7 for Unique IDs**

```bash
EVENT_ID=$(uuidgen -7)
```

- Time-ordered UUIDs (includes timestamp component)
- Guaranteed uniqueness without coordination
- Sortable by creation time
- No content-based ID chicken-and-egg problem

**3. Current Timestamp**

```bash
"timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

- ISO 8601 format with UTC timezone
- Accurate event timing for correlation
- Prevents replay attacks when combined with signature

### Validating Signatures with cdviz-collector

To test signature validation, update your test consumer configuration to verify the HMAC signature by adding:

```toml
# cdviz-collector-debug.toml

...

# Validate HMAC signature
[sources.cdevents_webhook.extractor.headers.x-signature]
type = "signature"
token = "your-secret-token-here"  # Must match API_TOKEN in script
algorithm = "sha256"
prefix = "sha256="
```

Restart your test consumer with the updated configuration:

```bash
cdviz-collector connect -v --config ./cdviz-collector-debug.toml
```

Now when you run your script, the collector will **Reject events** with invalid or missing signatures.

Try sending with the wrong token to see rejection:

```bash
# This will be rejected
export API_TOKEN="wrong-token"
./send-cdevent.sh
```

### What You Learn

- ✅ **Production security**: HMAC signatures for authentication
- ✅ **Unique IDs**: Time-ordered UUIDs for guaranteed uniqueness
- ✅ **Accurate timing**: Current timestamps in correct format
- ✅ **Minimal dependencies**: Requires only bash, curl, openssl, uuidgen (common Unix tools)
- ✅ **CI/CD ready**: Easy to integrate into existing pipelines

- ❌ **No content-based deduplication**: UUIDs are always unique (unlike content-based CIDs)
- ❌ **Limited destinations**: Only sends to one HTTP endpoint
- ❌ **Manual parameterization**: Must edit script or use environment variables

**Best practice**: Use production bash scripts when you can't install cdviz-collector but need production-grade security.

## Approach 3: cdviz-collector send - Recommended ⭐

**When to use**: Production deployments, multiple destinations, simplicity

**Perfect for**: Teams wanting production features without custom scripting

> [!NOTE]
> You already installed `cdviz-collector` for the test consumer setup. If you need to install it on a different machine, see the **[complete installation guide](https://cdviz.dev/docs/cdviz-collector/install.html)**.

### Step 1: Send Your First Event (Simple)

The simplest approach - let cdviz-collector generate IDs and timestamps:

```bash
# Minimal CDEvent - automatic ID and timestamp
cdviz-collector send --data '{
  "context": {
    "version": "0.4.1",
    "source": "my-pipeline",
    "type": "dev.cdevents.service.deployed.0.2.0"
  },
  "subject": {
    "id": "my-service",
    "type": "service",
    "content": {
      "environment": {"id": "production"},
      "artifactId": "pkg:oci/my-service@v1.2.3"
    }
  }
}' --url http://localhost:8080/webhook/000-cdevents
```

**What just happened**:

- ✅ Collector generated a content-based CID automatically
- ✅ Collector added current timestamp automatically
- ✅ Event validated against CDEvents specification
- ✅ Sent to the webhook endpoint

Check your test consumer - the event appears with generated ID and timestamp!

### Step 2: Add Authentication

Create a configuration file for authentication:

```toml
# send-config.toml
[sinks.http]
enabled = true
destination = "http://localhost:8080/webhook/000-cdevents"

# Add HMAC signature (same as bash script)
[sinks.http.headers.x-signature]
type = "signature"
token = "your-secret-token-here"
algorithm = "sha256"
prefix = "sha256="
```

Now send with authentication:

```bash
# Send with automatic signature generation
cdviz-collector send \
  --data '{
    "context": {
      "version": "0.4.1",
      "source": "my-pipeline",
      "type": "dev.cdevents.service.deployed.0.2.0"
    },
    "subject": {
      "id": "my-service",
      "type": "service",
      "content": {
        "environment": {"id": "production"},
        "artifactId": "pkg:oci/my-service@v1.2.3"
      }
    }
  }' \
  --config send-config.toml
```

### Step 3: Production Deployment

For production, use environment variables to override configuration values securely:

```toml
# send-production.toml
[sinks.http]
enabled = true
destination = "https://events.company.com/webhook"

# HMAC signature (token will be overridden by environment variable)
[sinks.http.headers.x-signature]
type = "signature"
token = "placeholder"  # Will be overridden by CDVIZ_COLLECTOR__SINKS__HTTP__HEADERS__X_SIGNATURE__TOKEN
algorithm = "sha256"
prefix = "sha256="

# Additional production headers (value will be overridden by environment variable)
[sinks.http.headers.authorization]
type = "secret"
value = "placeholder"  # Will be overridden by CDVIZ_COLLECTOR__SINKS__HTTP__HEADERS__AUTHORIZATION__VALUE
```

Deploy in production using environment variable overrides:

```bash
# Set secrets via environment variables that override TOML configuration
export CDVIZ_COLLECTOR__SINKS__HTTP__HEADERS__X_SIGNATURE__TOKEN="your-production-secret"
export CDVIZ_COLLECTOR__SINKS__HTTP__HEADERS__AUTHORIZATION__VALUE="Bearer your-api-token"

# Send events in production
cdviz-collector send \
  --data @event.json \
  --config send-production.toml
```

> [!TIP]
> Configuration values can be overridden using environment variables with the pattern `CDVIZ_COLLECTOR__SECTION__SUBSECTION__KEY`. This allows keeping secrets out of configuration files. See **[Environment Overrides documentation](https://cdviz.dev/docs/cdviz-collector/configuration.html#environment-overrides)** for complete details.

### What You Learn

✅ **Simplicity**: Minimal JSON, automatic ID/timestamp generation
✅ **Production security**: Built-in authentication without scripting
✅ **Configuration-based**: Secrets in config files, not code
✅ **Format validation**: Built-in CDEvent validation
✅ **Flexibility**: Easy to change destinations without code changes
✅ **Best practices**: Follows CDEvents recommendations automatically

❌ **External dependency**: Requires installing cdviz-collector
❌ **Learning curve**: Need to understand configuration format

**Best practice**: Use `cdviz-collector send` for all production deployments. It's simpler, more secure, and more flexible than custom scripts.

> [!NOTE]
> **Beyond HTTP**: `cdviz-collector send` can send to any sink type - just Kafka, just Database, just S3, or any combination of multiple destinations simultaneously. One command can target HTTP + Database, multiple Kafka topics, or any mix of available sinks. See the **[complete sinks documentation](https://cdviz.dev/docs/cdviz-collector/sinks/)** for all sink types and configuration examples.
> Let us know if you'd like to see examples in future episodes!

## Choosing Your Sending Approach

### Decision Framework

**Start with basic curl if**:

- You're learning CDEvents and want to understand the structure
- You need quick experimentation without setup
- You're prototyping and testing locally

**Use production bash script if**:

- You need production security (HMAC signatures)
- You can't install external dependencies in your CI/CD
- You only need to send to one HTTP endpoint
- You're comfortable maintaining bash scripts

**Use cdviz-collector send if** (⭐ Recommended):

- You want production-ready features without custom scripting
- You need to send to multiple destinations
- You want automatic ID and timestamp generation
- You prefer configuration over code
- You're building for long-term maintainability

### Progression Strategy

**Recommended learning path**:

1. **Basic curl** (5 minutes) → Understand CDEvent structure
2. **Test with cdviz-collector connect** (5 minutes) → Validate your events
3. **cdviz-collector send** (10 minutes) → Production implementation ⭐

For most teams, **cdviz-collector send** provides the best balance of simplicity, security, and flexibility.

## Key Takeaways

🎯 **Start simple**: Begin with curl to understand CDEvents structure
🔒 **Add security**: Production requires HMAC signatures and proper IDs
⭐ **Use the right tool**: cdviz-collector send for production deployments
📊 **Test locally**: Use cdviz-collector connect to validate events
🚀 **Multiple destinations**: Send to HTTP, Database, Kafka, S3 simultaneously
📈 **Follow best practices**: Let tools generate IDs and timestamps automatically

Understanding how to send CDEvents properly is essential for SDLC observability. These three approaches give you options for every scenario, from learning to production.

---

## Next Steps

**Try these experiments**:

1. Send a basic curl event to your local test consumer
2. Enhance the bash script with your own authentication
3. Install cdviz-collector and send with automatic ID generation
4. Configure multiple destinations in a single send command

In the next episode, we'll explore **GitHub Actions integration** - how to automatically send CDEvents from your GitHub workflows.

## Resources

### CDviz Documentation

- [cdviz-collector send documentation](https://cdviz.dev/docs/cdviz-collector/send.html) - Complete command reference
- [HTTP Sink documentation](https://cdviz.dev/docs/cdviz-collector/sinks/http.html) - Authentication patterns
- [Episode #1: Simulate a Consumer](./episode-1-simulate-consumer.md) - Learn to test event reception

### Alternative Tools

- [cdevents-tools CLI](https://brunseba.github.io/cdevents-tools/) - CDEvents-native CLI for generation and sending
- [CDEvents Specification](https://cdevents.dev) - Complete event standard reference
