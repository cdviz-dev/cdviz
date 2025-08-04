# Server-Sent Events (SSE) Sink

The SSE sink enables cdviz-collector to expose CDEvents as real-time Server-Sent Events streams over HTTP. This allows external applications, dashboards, and services to consume events in real-time by connecting to SSE endpoints.

## Overview

The SSE sink creates HTTP endpoints that stream CDEvents using the Server-Sent Events protocol (RFC 6455). Each configured SSE sink creates a dedicated endpoint that broadcasts all processed events to connected clients. This is ideal for building real-time dashboards, monitoring systems, and event-driven integrations.

## Key Features

- **Real-time Event Broadcasting**: Stream CDEvents to multiple clients simultaneously
- **HTTP/HTTPS Endpoints**: Standard web-compatible SSE endpoints
- **Client Authentication**: Header-based validation for secure access control
- **Automatic Reconnection Support**: Built-in keep-alive and reconnection capabilities
- **Buffer Management**: Configurable message buffering with lag handling
- **Multiple Endpoints**: Support for multiple SSE endpoints with different configurations
- **Security Integration**: Full integration with cdviz-collector's security framework

## Configuration

### Basic Configuration

Add an SSE sink to your `cdviz-collector.toml` configuration:

```toml
[sinks.my_sse_endpoint]
enabled = true
type = "sse"
id = "events"
```

This creates an SSE endpoint accessible at `http://localhost:8080/sse/events`.

### Configuration Parameters

| Parameter | Type    | Default | Description                                               |
| --------- | ------- | ------- | --------------------------------------------------------- |
| `enabled` | boolean | `true`  | Enable/disable the SSE sink                               |
| `type`    | string  | -       | Must be set to `"sse"`                                    |
| `id`      | string  | -       | Unique identifier for the SSE endpoint (used in URL path) |
| `headers` | array   | `[]`    | HTTP header validation rules for incoming SSE connections |

### URL Pattern

SSE endpoints follow the pattern: `http://{host}:{port}/sse/{id}`

- `host` and `port` are defined in the `[http]` section of the configuration
- `id` is the unique identifier specified in the sink configuration

## Authentication and Security

### Header Validation Rules

The SSE sink supports comprehensive header validation for incoming connections. For complete documentation on validation rules and patterns, see the [Header Validation Guide](../header-validation.md).

### Quick Examples

#### Require Specific Headers

```toml
[sinks.secure_events]
enabled = true
type = "sse"
id = "secure"

# Require Authorization header to exist
[[sinks.secure_events.headers]]
header = "Authorization"
rule = { type = "exists" }
```

#### Token-Based Authentication

```toml
[sinks.api_events]
enabled = true
type = "sse"
id = "api"

# Require specific bearer token
[[sinks.api_events.headers]]
header = "Authorization"
rule = { type = "equals", value = "Bearer secret-token-123", case_sensitive = true }
```

#### Pattern Matching

```toml
[sinks.validated_events]
enabled = true
type = "sse"
id = "validated"

# Validate API key format
[[sinks.validated_events.headers]]
header = "X-API-Key"
rule = { type = "matches", pattern = "^[a-zA-Z0-9]{32}$" }

# Require Bearer token format
[[sinks.validated_events.headers]]
header = "Authorization"
rule = { type = "matches", pattern = "^Bearer [\\w-]+$" }
```

#### HMAC Signature Validation

```toml
[sinks.webhook_events]
enabled = true
type = "sse"
id = "webhooks"

# Validate webhook signature
[[sinks.webhook_events.headers]]
header = "X-Hub-Signature-256"
rule = { type = "signature", token = "webhook-secret", signature_prefix = "sha256=" }
```

#### Multiple Validation Rules

```toml
[sinks.enterprise_events]
enabled = true
type = "sse"
id = "enterprise"

# Require API key
[[sinks.enterprise_events.headers]]
header = "X-API-Key"
rule = { type = "exists" }

# Validate client ID format
[[sinks.enterprise_events.headers]]
header = "X-Client-ID"
rule = { type = "matches", pattern = "^client-[0-9]+$" }

# Require specific user agent
[[sinks.enterprise_events.headers]]
header = "User-Agent"
rule = { type = "matches", pattern = "^MyApp/" }
```

## Event Stream Format

### SSE Message Structure

Each CDEvent is streamed as a Server-Sent Events message with the following format:

```
event: cdevent
id: {cdevent-id}
data: {cdevent-json}

```

#### Example SSE Stream

```
event: cdevent
id: dev.cdevents.build.started.0.1.0-12345678
data: {"context":{"version":"0.4.0","id":"dev.cdevents.build.started.0.1.0-12345678","source":"github.com/myorg/myrepo","type":"dev.cdevents.build.started.0.1.0","timestamp":"2024-01-15T10:30:00Z"},"subject":{"id":"build-456","type":"build","content":{"id":"build-456","source":"github.com/myorg/myrepo"}}}

event: cdevent
id: dev.cdevents.build.finished.0.1.0-87654321
data: {"context":{"version":"0.4.0","id":"dev.cdevents.build.finished.0.1.0-87654321","source":"github.com/myorg/myrepo","type":"dev.cdevents.build.finished.0.1.0","timestamp":"2024-01-15T10:35:00Z"},"subject":{"id":"build-456","type":"build","content":{"id":"build-456","outcome":"success"}}}
```

### Keep-Alive Messages

The SSE sink automatically sends keep-alive messages every 30 seconds to maintain connections:

```
: keep-alive

```

### Error Messages

When serialization or other errors occur, error events are sent:

```
event: error
data: serialization error: invalid JSON structure

event: error
data: lagged: 15 messages skipped
```

## Client Connection Management

### Buffer Management

- **Buffer Size**: 1000 messages per SSE sink
- **Overflow Handling**: When clients fall behind, they receive lag notification messages
- **Message Ordering**: Events are delivered in the order they were processed

### Connection Lifecycle

1. **Connection**: Client connects to `/sse/{id}` endpoint
2. **Validation**: Headers are validated against configured rules
3. **Streaming**: Client receives all subsequent CDEvents in real-time
4. **Keep-Alive**: Periodic keep-alive messages maintain the connection
5. **Disconnection**: Client disconnects or connection times out

## Use Cases

### Real-time Dashboard

Stream events to a web dashboard for live monitoring:

```toml
[sinks.dashboard]
enabled = true
type = "sse"
id = "dashboard"

# Optional: Require dashboard authentication
[sinks.dashboard.headers]
"Authorization" = { type = "matches", pattern = "^Bearer dashboard-[\\w-]+$" }
```

**JavaScript Client Example:**

```javascript
const eventSource = new EventSource("http://localhost:8080/sse/dashboard", {
  headers: {
    Authorization: "Bearer dashboard-secret-123",
  },
});

eventSource.addEventListener("cdevent", function (event) {
  const cdEvent = JSON.parse(event.data);
  console.log("Received CDEvent:", cdEvent.context.type, cdEvent.subject.id);
  // Update dashboard with new event
  updateDashboard(cdEvent);
});

eventSource.onerror = function (event) {
  console.error("SSE connection error:", event);
};
```

### External Service Integration

Stream events to external monitoring or orchestration services:

```toml
[sinks.monitoring]
enabled = true
type = "sse"
id = "monitoring"

# Validate monitoring service credentials
[sinks.monitoring.headers]
"X-Service-Token" = { type = "equals", value = "monitoring-service-token", case_sensitive = true }
```

### Development and Testing

Provide real-time event streams for development and testing:

```toml
[sinks.dev_stream]
enabled = true
type = "sse"
id = "dev"

# No authentication for development
# headers = []  # Empty - no validation
```

**curl Example:**

```bash
# Connect to SSE stream and display events
curl -N -H "Accept: text/event-stream" http://localhost:8080/sse/dev
```

### Multi-Client Broadcasting

Support multiple types of clients with different access levels:

```toml
# Public events (limited authentication)
[sinks.public_events]
enabled = true
type = "sse"
id = "public"

[sinks.public_events.headers]
"X-Client-Type" = { type = "exists" }

# Admin events (strict authentication)
[sinks.admin_events]
enabled = true
type = "sse"
id = "admin"

[sinks.admin_events.headers]
"Authorization" = { type = "equals", value = "Bearer admin-secret-key", case_sensitive = true }
"X-Admin-Role" = { type = "matches", pattern = "^(super-admin|admin)$" }
```

### Collector-to-Collector Integration

SSE sinks enable powerful collector-to-collector integration patterns for distributed event processing:

#### Regional Event Aggregation

Stream events from regional collectors to a central aggregation hub:

```toml
# Regional collector exposing events for central aggregation
[sinks.regional_stream]
enabled = true
type = "sse"
id = "regional"

# Authenticate central aggregator
[sinks.regional_stream.headers]
"Authorization" = { type = "secret", value = "CENTRAL_AGGREGATOR_TOKEN" }
"X-Collector-Region" = { type = "exists" }

# Optional: Filter events for aggregation
[sources.filtered_for_aggregation]
enabled = true
transformer_refs = ["add_regional_metadata"]

[transformers.add_regional_metadata]
type = "vrl"
template = """
[{
    "metadata": merge(.metadata, {
        "region": "us-east-1",
        "aggregation_ready": true,
        "collector_id": "regional-us-east"
    }),
    "headers": .headers,
    "body": .body
}]
"""
```

#### Public-to-Internal Event Bridge

Expose events from public-facing collectors to internal systems without exposing internal infrastructure:

```toml
# Public DMZ collector streaming to internal networks
[sinks.internal_bridge]
enabled = true
type = "sse"
id = "public"

# Authenticate internal collectors only
[sinks.internal_bridge.headers]
"Authorization" = { type = "secret", value = "INTERNAL_BRIDGE_TOKEN" }
"X-Internal-Network" = { type = "matches", pattern = "^(vpn|internal)-.*" }
# Additional security: Require client certificate validation
"X-Client-Certificate-Subject" = { type = "matches", pattern = "^CN=internal-collector.*" }

# Filter sensitive data before streaming to internal
[sources.public_sanitized]
enabled = true
transformer_refs = ["sanitize_for_internal"]

[transformers.sanitize_for_internal]
type = "vrl"
template = """
[{
    "metadata": merge(.metadata, {
        "sanitized_for": "internal_consumption",
        "public_collector_id": "dmz-collector-1"
    }),
    "headers": .headers,
    "body": {
        "context": .body.context,
        "subject": {
            "id": .body.subject.id,
            "type": .body.subject.type,
            "content": del(.body.subject.content.sensitive_data) ?? .body.subject.content
        }
    }
}]
"""
```

#### Hierarchical Event Distribution

Create multi-level collector hierarchies for organizational event distribution:

```toml
# Department-level collector streaming to team collectors
[sinks.team_distribution]
enabled = true
type = "sse"
id = "teams"

# Authenticate team collectors
[sinks.team_distribution.headers]
"Authorization" = { type = "secret", value = "TEAM_COLLECTOR_TOKEN" }
# Team identification for filtering
"X-Team-Filter" = { type = "matches", pattern = "^(backend|frontend|devops|qa)-team$" }

# Corporate-level collector for company-wide events
[sinks.corporate_stream]
enabled = true
type = "sse"
id = "corporate"

# Strict authentication for corporate access
[sinks.corporate_stream.headers]
"Authorization" = { type = "secret", value = "CORPORATE_COLLECTOR_TOKEN" }
"X-Corporate-Access-Level" = { type = "matches", pattern = "^(executive|director|manager)$" }

# Filter events by importance level
[sources.corporate_filtered]
enabled = true
transformer_refs = ["filter_corporate_events"]

[transformers.filter_corporate_events]
type = "vrl"
template = """
# Only stream high-importance events to corporate level
if !(.body.subject.content.importance == "high" ||
     .body.subject.content.category == "security" ||
     .body.subject.content.category == "compliance") {
    return []
}

[{
    "metadata": merge(.metadata, {
        "corporate_filtered": true,
        "escalation_level": "corporate"
    }),
    "headers": .headers,
    "body": .body
}]
"""
```

#### Cross-Environment Event Mirroring

Mirror events between environments for testing, validation, and compliance:

```toml
# Production collector streaming to staging for testing
[sinks.staging_mirror]
enabled = true
type = "sse"
id = "mirror"

# Authenticate staging environment
[sinks.staging_mirror.headers]
"Authorization" = { type = "secret", value = "STAGING_MIRROR_TOKEN" }
"X-Environment-Target" = { type = "equals", value = "staging", case_sensitive = true }

# Development environment for feature testing
[sinks.dev_preview]
enabled = true
type = "sse"
id = "preview"

# Less strict auth for development
[sinks.dev_preview.headers]
"X-Dev-Token" = { type = "exists" }

# Filter production data for development safety
[sources.dev_safe_events]
enabled = true
transformer_refs = ["anonymize_for_dev"]

[transformers.anonymize_for_dev]
type = "vrl"
template = """
[{
    "metadata": merge(.metadata, {
        "anonymized_for": "development",
        "original_environment": "production"
    }),
    "headers": .headers,
    "body": {
        "context": merge(.body.context, {
            "source": "anonymized-" + .body.context.source
        }),
        "subject": {
            "id": "dev-" + .body.subject.id,
            "type": .body.subject.type,
            "content": merge(.body.subject.content, {
                "user_id": "anonymous",
                "sensitive_field": null
            })
        }
    }
}]
"""
```

#### Multi-Cloud Event Distribution

Distribute events across different cloud providers or regions:

```toml
# Primary cloud region
[sinks.primary_cloud]
enabled = true
type = "sse"
id = "primary"

[sinks.primary_cloud.headers]
"Authorization" = { type = "secret", value = "PRIMARY_CLOUD_TOKEN" }
"X-Cloud-Provider" = { type = "equals", value = "aws", case_sensitive = true }

# Secondary cloud for disaster recovery
[sinks.disaster_recovery]
enabled = true
type = "sse"
id = "dr"

[sinks.disaster_recovery.headers]
"Authorization" = { type = "secret", value = "DR_CLOUD_TOKEN" }
"X-Cloud-Provider" = { type = "equals", value = "azure", case_sensitive = true }

# Cross-cloud compliance and auditing
[sinks.compliance_stream]
enabled = true
type = "sse"
id = "compliance"

[sinks.compliance_stream.headers]
"Authorization" = { type = "secret", value = "COMPLIANCE_AUDIT_TOKEN" }
"X-Audit-Purpose" = { type = "matches", pattern = "^(sox|gdpr|hipaa|pci)$" }
```

## Client Implementation Examples

### Python Client

```python
import sseclient
import requests
import json

def stream_events(url, headers=None):
    response = requests.get(url, headers=headers, stream=True)
    client = sseclient.SSEClient(response)

    for event in client.events():
        if event.event == 'cdevent':
            cdevent = json.loads(event.data)
            print(f"Event: {cdevent['context']['type']}")
            print(f"Subject: {cdevent['subject']['id']}")
            # Process event...
        elif event.event == 'error':
            print(f"Error: {event.data}")

# Usage
headers = {'Authorization': 'Bearer your-token-here'}
stream_events('http://localhost:8080/sse/events', headers)
```

### Node.js Client

```javascript
const EventSource = require("eventsource");

const url = "http://localhost:8080/sse/events";
const options = {
  headers: {
    Authorization: "Bearer your-token-here",
    "X-Client-ID": "client-123",
  },
};

const eventSource = new EventSource(url, options);

eventSource.on("cdevent", function (event) {
  const cdEvent = JSON.parse(event.data);
  console.log(`Received: ${cdEvent.context.type}`);
  // Process event...
});

eventSource.on("error", function (event) {
  console.error("Connection error:", event);
});

eventSource.on("open", function (event) {
  console.log("Connected to SSE stream");
});
```

### Go Client

```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "github.com/r3labs/sse/v2"
)

func main() {
    client := sse.NewClient("http://localhost:8080/sse/events")

    // Add authentication headers
    client.Headers = map[string]string{
        "Authorization": "Bearer your-token-here",
        "X-Client-ID":   "go-client",
    }

    client.Subscribe("cdevent", func(msg *sse.Event) {
        var cdEvent map[string]interface{}
        if err := json.Unmarshal(msg.Data, &cdEvent); err != nil {
            log.Printf("Error parsing CDEvent: %v", err)
            return
        }

        fmt.Printf("Event: %s\n", cdEvent["context"].(map[string]interface{})["type"])
        // Process event...
    })

    // Handle connection errors
    client.OnDisconnect(func(c *sse.Client) {
        log.Println("Disconnected from SSE stream")
    })

    select {} // Keep running
}
```

## HTTP Response Codes

| Status Code              | Description               | Cause                                          |
| ------------------------ | ------------------------- | ---------------------------------------------- |
| `200 OK`                 | Successful SSE connection | Valid request with proper headers              |
| `401 Unauthorized`       | Missing required header   | Header validation rule failed (missing header) |
| `403 Forbidden`          | Invalid header value      | Header validation rule failed (invalid value)  |
| `404 Not Found`          | Invalid SSE endpoint      | Incorrect SSE ID in URL path                   |
| `405 Method Not Allowed` | Invalid HTTP method       | Only GET requests are supported                |

## Security Considerations

### Authentication Best Practices

1. **Use Strong Tokens**: Generate cryptographically secure tokens for API access
2. **Token Rotation**: Regularly rotate authentication tokens
3. **Least Privilege**: Grant minimal required access to each client
4. **Monitor Access**: Log authentication attempts and connection patterns

### Network Security

1. **Use HTTPS**: Deploy SSE endpoints over encrypted connections in production
2. **Rate Limiting**: Implement rate limiting at the reverse proxy level
3. **IP Allowlisting**: Restrict access to known client IP addresses
4. **CORS Configuration**: Configure CORS headers appropriately for web clients

### Example Secure Configuration

```toml
# HTTP server configuration
[http]
host = "0.0.0.0"
port = 8080

# Secure SSE endpoint
[sinks.secure_stream]
enabled = true
type = "sse"
id = "secure"

# Multi-layer authentication
[sinks.secure_stream.headers]
"Authorization" = { type = "matches", pattern = "^Bearer [A-Za-z0-9+/]{40,}$" }
"X-Client-Certificate" = { type = "exists" }
"User-Agent" = { type = "matches", pattern = "^MySecureClient/" }
```

## Troubleshooting

### Common Issues

#### Connection Refused

**Symptoms**: Clients cannot connect to SSE endpoint
**Solutions**:

- Verify cdviz-collector is running and listening on correct port
- Check firewall / proxy rules and network connectivity
- Ensure the SSE sink is enabled and configured correctly
- Verify the endpoint URL path matches the configured ID

#### Authentication Failures

**Symptoms**: 401/403 HTTP responses
**Solutions**:

- Verify header validation rules in configuration
- Check client headers match expected format
- Review authentication token validity
- Enable debug logging to see validation details

#### Missing Events

**Symptoms**: Clients don't receive some events
**Solutions**:

- Check client connection stability
- Monitor for lag messages indicating buffer overflow
- Verify event processing pipeline is functioning
- Review cdviz-collector logs for errors

#### Connection Drops

**Symptoms**: Frequent disconnections
**Solutions**:

- Implement client-side reconnection logic
- Check network stability and timeout settings
- Monitor server resource usage
- Review proxy/load balancer timeout configurations

### Debugging Configuration

Enable detailed logging for SSE operations:

```bash
# Start with debug logging
RUST_LOG=cdviz_collector::sinks::sse=debug cdviz-collector connect --config config.toml
```

### Testing SSE Endpoints

#### Basic Connection Test

```bash
# Test endpoint availability
curl -I http://localhost:8080/sse/events

# Connect and display events
curl -N -H "Accept: text/event-stream" http://localhost:8080/sse/events
```

#### Authentication Test

```bash
# Test with authentication headers
curl -N -H "Accept: text/event-stream" \
     -H "Authorization: Bearer your-token" \
     http://localhost:8080/sse/events
```

## Performance Considerations

### Connection Limits

- Each SSE sink can handle hundreds of concurrent connections
- Monitor system resources (memory, file descriptors) with many clients
- Consider using a reverse proxy for connection pooling and load balancing

### Buffer Management

- Default buffer size is 1000 messages per sink
- Slow clients may receive lag notifications if they fall behind
- Consider event filtering at the source to reduce stream volume

### Network Bandwidth

- Each connected client receives all events in real-time
- Monitor network bandwidth usage with multiple clients
- Implement event filtering for high-volume scenarios

## Feature Flags

The SSE sink requires the `sink_sse` feature flag to be enabled during compilation:

```toml
# In Cargo.toml
[features]
default = ["sink_sse", "sink_http", "source_webhook"]
sink_sse = ["dep:tokio-stream"]
```

When building cdviz-collector:

```bash
cargo build --features sink_sse
```

## Integration with Other Components

### Event Filtering

Combine SSE sinks with event transformation to filter events:

```toml
# Filter only build events for dashboard
[sources.filtered_builds]
enabled = true
transformer_refs = ["build_filter"]

[transformers.build_filter]
type = "vrl"
script = '''
  if !starts_with(.type, "dev.cdevents.build.") {
    return []
  }
  return [.]
'''

# Stream filtered events
[sinks.build_dashboard]
enabled = true
type = "sse"
id = "builds"
```

### Multiple Endpoints

Configure multiple SSE endpoints for different purposes:

```toml
# Development events
[sinks.dev_events]
enabled = true
type = "sse"
id = "dev"

# Production monitoring
[sinks.prod_events]
enabled = true
type = "sse"
id = "production"

[sinks.prod_events.headers]
"Authorization" = { type = "exists" }

# Admin notifications
[sinks.admin_events]
enabled = true
type = "sse"
id = "admin"

[sinks.admin_events.headers]
"X-Admin-Token" = { type = "matches", pattern = "^admin-[\\w-]{20,}$" }
```
