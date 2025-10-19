---
title: "CDEvents in Action #1: Simulate a Consumer"
description: "Test your CDEvents integration strategy before building with webhook.site, CDviz docker compose, and cdviz-collector debug. Choose the right approach for your needs."
tags: ["cdevents", "devops", "cicd", "testing", "integration", "webhooks"]
target_audience: "Developers, DevOps Engineers"
reading_time: "8 minutes"
series: "CDEvents in Action"
series_part: 1
published: false
---

# CDEvents in Action #1: Simulate a Consumer

_Before you build your CDEvents integration, test your approach. Three methods help you understand event flows and validate your strategy before writing production code._

## The Testing Problem

You understand why CDEvents matter for pipeline visibility. Now you want to integrate, but you're facing the classic integration challenge:

- **How do I know my events will work?**
- **What should I expect to receive?**
- **How do I test without building everything first?**

Building an event consumer before understanding the data flow is like writing SQL queries before seeing the database schema. You need to **simulate receiving events first**.

## Three Approaches to Simulate CDEvents Consumption

Each approach serves different needs and skill levels:

| Approach                       | Best For                                    | Setup Time | Real Data      |
| ------------------------------ | ------------------------------------------- | ---------- | -------------- |
| **webhook.site**               | Quick testing, event structure exploration  | 30 seconds | ❌ Manual only |
| **CDviz docker compose**       | Full pipeline simulation, realistic testing | 3 minutes  | ✅ Demo events |
| **cdviz-collector connect** ⭐ | Local development, production debugging     | 2 minutes  | ✅ Real events |

Let's explore each approach and learn when to use them.

## Approach 1: webhook.site - Quick Event Structure Testing

**When to use**: Exploring CDEvents structure, quick prototyping, learning event schemas

**Perfect for**: Developers new to CDEvents who want to see event structure immediately

### Step 1: Get Your Unique Webhook URL

1. Visit [webhook.site](https://webhook.site)
2. Copy your unique URL (looks like `https://webhook.site/12345678-abcd-...`)
3. Leave the tab open to see incoming requests

### Step 2: Send a Test CDEvent

```bash
# Send a deployment event to your webhook.site URL
curl -X POST https://webhook.site/YOUR-UNIQUE-ID \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "version": "0.4.1",
      "id": "test-123",
      "source": "my-pipeline",
      "type": "dev.cdevents.service.deployed.0.2.0",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
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

### Step 3: Analyze the Event Structure

Switch back to webhook.site to see your event. Notice:

- **Headers**: `Content-Type`, user agent, IP address
- **Body**: Complete CDEvent structure
- **Timing**: When the event was received
- **Size**: Event payload size

### What You Learn

✅ **Event structure**: See exactly what CDEvents look like
✅ **Header requirements**: Understand HTTP headers needed
✅ **JSON schema**: Valid CDEvent format and required fields
✅ **Quick iteration**: Test different event types rapidly

❌ **No processing**: Events just display, no storage or correlation
❌ **Manual only**: You must send events yourself
❌ **No authentication**: Simple HTTP POST only

**Best practice**: Use webhook.site to understand CDEvents structure before building your consumer logic.

## Approach 2: CDviz docker compose - Realistic Pipeline Testing

**When to use**: Testing complete event flows, understanding CDviz integration, realistic event scenarios

**Perfect for**: Teams evaluating CDviz, developers building CDEvents integration, demonstrating event flows with visual dashboards

### Step 1: Start CDviz Demo Environment

```bash
# Clone and start the full CDviz stack
git clone https://github.com/cdviz-dev/cdviz.git
cd cdviz/demos/stack-compose
docker compose up
```

**What starts up**:

- CDviz collector (event ingestion)
- PostgreSQL + TimescaleDB (event storage)
- Grafana (visualization dashboards)
- Demo event generator (realistic test data)

### Step 2: Observe Automatic Demo Events

Open [localhost:3000](http://localhost:3000) for Grafana dashboards. You'll immediately see:

- **Service deployments** across different environments
- **Pipeline executions** with success/failure patterns
- **Artifact promotions** through staging to production
- **Timeline visualization** showing event correlations

### Step 3: Send Your Own Events

The CDviz collector accepts events at `http://localhost:8080/webhook/000-cdevents`:

```bash
# Send a custom deployment event
curl -X POST http://localhost:8080/webhook/000-cdevents \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "version": "0.4.1",
      "id": "my-test-deployment",
      "source": "my-testing",
      "type": "dev.cdevents.service.deployed.0.2.0",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    },
    "subject": {
      "id": "my-namespace/my-test-service/my-container",
      "type": "service",
      "content": {
        "environment": {"id": "testing"},
        "artifactId": "pkg:oci/my-test-service@v2.1.0"
      }
    }
  }'
```

**Result**: Your event appears in Grafana dashboards alongside demo events, showing realistic integration.

### Step 4: Explore Event Correlation

Browse different Grafana dashboards to understand:

- **Service Timeline**: How your events fit into deployment flows
- **Environment View**: Cross-environment event correlation
- **Activity Feed**: Chronological event stream
- **Direct Database**: Query PostgreSQL directly for custom analysis

### What You Learn

✅ **Complete integration**: Full event processing pipeline
✅ **Visual feedback**: See events in realistic dashboards
✅ **Event correlation**: Understand how events relate to each other
✅ **Storage patterns**: Events stored in PostgreSQL for analysis
✅ **Production simulation**: Realistic event processing behavior

❌ **Resource intensive**: Requires Docker and multiple containers
❌ **Complex setup**: More moving parts than simple webhook testing

**Best practice**: Use CDviz docker compose when evaluating CDEvents for your team or testing integration patterns.

## Approach 3: cdviz-collector connect - Recommended for Development ⭐

**When to use**: Local development, troubleshooting integrations, validating event flows

**Perfect for**: Developers building CDEvents integration, DevOps engineers debugging event flows

### Step 1: Install cdviz-collector CLI

All installation options are documented at [CDviz Collector Installation Guide](https://cdviz.dev/docs/cdviz-collector/install.html)

```bash
brew install cdviz-dev/tap/cdviz-collector
```

If native pre-built binary is not available for your platform (e.g. Windows) you can fallback to the docker image.

### Step 2: Launch with a local debug configuration

Create a configuration with a webhook as source (input) and a debug sink (output)

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

Launch

```bash
cdviz-collector connect -v --config ./cdviz-collector-debug.toml
```

**What this does**:

- Starts a local CDviz collector instance
- Shows real-time events as they arrive on stdout
- Validates CDEvent format and rejects invalid events
- Provides a lightweight development environment without Docker

### Step 3: Send Your Own Events

```bash
# Send a custom deployment event
curl -X POST http://localhost:8080/webhook/000-cdevents \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "version": "0.4.1",
      "id": "my-test-deployment",
      "source": "my-testing",
      "type": "dev.cdevents.service.deployed.0.2.0",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    },
    "subject": {
      "id": "my-namespace/my-test-service/my-container",
      "type": "service",
      "content": {
        "environment": {"id": "testing"},
        "artifactId": "pkg:oci/my-test-service@v2.1.0"
      }
    }
  }'
```

### What You Learn

✅ **CDEvent validation**: Immediate feedback on event format and structure
✅ **Lightweight development**: No Docker required, fast startup
✅ **Real-time debugging**: See events as they arrive with validation feedback
✅ **Configuration flexibility**: Easy to modify behavior via TOML config

❌ **Command-line only**: No visual interface like Grafana
❌ **Local only**: Events not persisted or aggregated

**Best practice**: Use cdviz-collector connect as your primary development tool for CDEvents integration.

## Choosing Your Testing Approach

### Decision Framework

**Start with webhook.site if**:

- You're new to CDEvents and want to understand event structure
- You need quick experimentation with different event formats
- You're prototyping and don't need full pipeline simulation

**Use CDviz docker compose if**:

- You're evaluating CDviz for your organization
- You want to see realistic event flows and correlations
- You need to test integration patterns before production deployment
- You want to explore Grafana dashboards and event visualization

**Use cdviz-collector connect if** (⭐ Recommended):

- You're developing CDEvents integration locally
- You want fast feedback on event validation
- You prefer lightweight tools without Docker overhead
- You need flexible configuration for different scenarios

### Progression Strategy

**Recommended learning path**:

1. **webhook.site** (5 minutes) → Understand CDEvent structure
2. **cdviz-collector connect** (10 minutes) → Validate and debug locally ⭐
3. **CDviz docker compose** (15 minutes) → See complete integration with dashboards

For most developers, **cdviz-collector connect** provides the best balance of simplicity and functionality for ongoing development work.

This progression gives you theoretical knowledge, practical experience, and production debugging skills.

## Next Steps: From Consumer to Producer

Now that you understand how to receive and inspect CDEvents, you're ready to learn how to **send** them from your own tools and pipelines.

**Try these experiments**:

1. Pick one simulation approach above and test it
2. Send different CDEvent types (`service.deployed`, `taskrun.finished`, `artifact.published`)
3. Note what you learned about event structure and timing

This foundation will help you build robust CDEvents integration in your own systems.

## Key Takeaways

🎯 **Test first**: Simulate receiving events before building producers
🔧 **Multiple tools**: Different approaches serve different testing needs
⭐ **Recommended approach**: cdviz-collector connect for most development work
📊 **Visual integration**: CDviz docker compose for complete pipeline visualization
📈 **Progressive learning**: Start simple (webhook.site) then build practical skills

Understanding how to consume CDEvents is essential before producing them. These simulation approaches give you the foundation to build robust CDEvents integration.

---

**Resources**:

- [webhook.site](https://webhook.site) - Instant webhook testing
- [CDviz Demo Setup](https://github.com/cdviz-dev/cdviz/tree/main/demos/stack-compose) - Full docker compose stack
- [CDEvents Specification](https://cdevents.dev) - Complete event standard reference
- [CDviz Documentation](https://cdviz.dev) - Complete installation and configuration guides
