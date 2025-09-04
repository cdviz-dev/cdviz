# Send Command

Send JSON data directly to configured sinks for testing and scripting scenarios.

The `send` command provides a simple way to test sink configurations, debug transformations, or script event dispatch without running a full server. It uses the same pipeline architecture as the `connect` command but reads data from the command line instead of external sources.

## Usage

```bash
cdviz-collector send [OPTIONS] --data <DATA>
```

```text
Send JSON data directly to a sink for testing and scripting.

This command allows sending JSON data directly to configured sinks without running a full server. Useful for testing transformations, debugging sink configurations, or scripting event dispatch.

Usage: cdviz-collector send [OPTIONS] --data <DATA>

Options:
  -d, --data <DATA>
          JSON data to send to the sink.

          Can be specified as: - Direct JSON string: '{"test": "value"}' - File path: @data.json - Stdin: @-

          The JSON data will be processed through the configured pipeline and sent to the specified sink.

  -v, --verbose...
          Increase logging verbosity

  -q, --quiet...
          Decrease logging verbosity

  -u, --url <URL>
          HTTP URL to send the data to.

          When specified, automatically enables the HTTP sink and disables the debug sink. The data will be sent as CloudEvents format to the specified endpoint.

          Example: `--url https://api.example.com/webhook`

      --config <CONFIG>
          Configuration file for advanced sink settings.

          Optional TOML configuration file for advanced sink configuration such as authentication, headers generation, or custom sink types. Command line arguments will override configuration file settings.

          [env: CDVIZ_COLLECTOR_CONFIG=]

      --disable-otel
          Disable OpenTelemetry initialization and use minimal tracing setup.

          This is useful for testing environments or when you want to avoid OpenTelemetry overhead. When disabled, only basic console logging will be available without distributed tracing capabilities.

  -C, --directory <DIRECTORY>
          Working directory for relative paths.

          Changes the working directory before processing. This affects relative paths in configuration files and data file references.

  -H, --header <HEADERS>
          Additional HTTP headers for the request.

          Specify custom headers for HTTP sink requests. Can be used multiple times to add several headers. Format: "Header-Name: value"

          Example: `--header "X-API-Key: secret" --header "Content-Type: application/json"`

  -h, --help
          Print help (see a summary with '-h')
```

## Input Data Requirements

> [!WARNING]
> The `send` command expects **CDEvent-compliant JSON** as input. Without transformers configured to convert your data, the input must already be a valid CDEvent or it will be rejected.

## Automatic Field Generation

The collector automatically generates missing required fields:

> [!TIP] Recommended: Let the Collector Generate IDs
> It's **recommended** to let cdviz-collector generate `context.id` instead of creating random IDs or reusing existing ones. CIDs are content-based and provide better traceability and deduplication.
>
> If `context.id` is missing or set to `"0"`, a [CID (Content Identifier)](https://github.com/multiformats/cid) will be automatically generated based on the event content.

> [!TIP] Recommended: Auto-Generate Timestamps When Origin Time is Unknown
> If the exact datetime of the original action is unknown, it's better to let the collector generate the timestamp rather than guessing.
>
> If `context.timestamp` is missing, the current datetime will be automatically set.

### CDEvent Format Examples

#### Complete CDEvent (when you know the exact origin time)

Use this format only when you know the **exact timestamp** of the original event:

```json
{
  "context": {
    "version": "0.4.1",
    "source": "/webhook/github",
    "type": "dev.cdevents.change.created.0.3.0",
    "timestamp": "2024-01-01T12:00:00Z"
  },
  "subject": {
    "id": "myChange123",
    "source": "/webhook/github",
    "type": "change",
    "content": {
      "description": "Fix critical bug in user authentication",
      "repository": {
        "id": "my-org/my-repo",
        "source": "https://github.com"
      }
    }
  }
}
```

#### Recommended: Minimal CDEvent (auto-generated ID and timestamp)

**Recommended approach** for most use cases - let the collector generate what it can:

```json
{
  "context": {
    "version": "0.4.1",
    "source": "/my-app",
    "type": "dev.cdevents.change.created.0.3.0"
  },
  "subject": {
    "id": "myChange123",
    "source": "/my-app",
    "type": "change",
    "content": {
      "description": "Fix critical bug"
    }
  }
}
```

#### Force ID generation with "0"

```json
{
  "context": {
    "version": "0.4.1",
    "id": "0",
    "source": "/my-app",
    "type": "dev.cdevents.change.created.0.3.0",
    "timestamp": "2024-01-01T12:00:00Z"
  },
  "subject": {
    "id": "myChange123",
    "source": "/my-app",
    "type": "change",
    "content": {
      "description": "This will get a generated CID"
    }
  }
}
```

> [!NOTE] Best Practices for CDEvent Fields
>
> - **context.id**: Let the collector generate content-based CIDs for better traceability
> - **context.timestamp**: Only provide if you know the exact origin time, otherwise let collector generate
> - **Avoid**: Random UUIDs for IDs, estimated/guessed timestamps
> - **Benefits**: Content-based deduplication, accurate event timing, simplified event creation

> [!TIP]
> See [CDEvents Standard](https://cdevents.dev/) for complete format specification.

## Input Data Formats

The `--data` flag accepts three input formats:

### Single CDEvent JSON String

```bash
cdviz-collector send --data '{
  "context": {
    "version": "0.4.1",
    "id": "271069a8-fc18-44f1-b38f-9d70a1695819",
    "source": "/my-app/component",
    "type": "dev.cdevents.change.created.0.3.0",
    "timestamp": "2024-01-01T12:00:00Z"
  },
  "subject": {
    "id": "myChange123",
    "source": "/my-app/component",
    "type": "change",
    "content": {
      "description": "Example change event"
    }
  }
}'
```

### Multiple CDEvents (Array)

Send multiple events in a single command by providing a JSON array:

```bash
cdviz-collector send --data '[
  {
    "context": {
      "version": "0.4.1",
      "id": "event-1",
      "source": "/batch-system",
      "type": "dev.cdevents.change.created.0.3.0",
      "timestamp": "2024-01-01T12:00:00Z"
    },
    "subject": {
      "id": "change-1",
      "source": "/batch-system",
      "type": "change",
      "content": {"description": "First change in batch"}
    }
  },
  {
    "context": {
      "version": "0.4.1",
      "id": "event-2",
      "source": "/batch-system",
      "type": "dev.cdevents.change.merged.0.2.0",
      "timestamp": "2024-01-01T12:05:00Z"
    },
    "subject": {
      "id": "change-2",
      "source": "/batch-system",
      "type": "change",
      "content": {"description": "Second change in batch"}
    }
  }
]'
```

> [!TIP]
> Each item in the array will be sent as an individual event. This is useful for batch processing multiple related events.

### File Input

Use `@filename` to read CDEvent JSON (single object or array) from a file:

```bash
# Single event file
cdviz-collector send --data @cdevent.json

# Multiple events file
cdviz-collector send --data @batch-events.json
```

### Stdin Input

Use `@-` to read CDEvent JSON from stdin:

```bash
# Single event
echo '{
  "context": {
    "version": "0.4.1",
    "id": "stdin-event",
    "source": "/stdin",
    "type": "dev.cdevents.test.0.1.0",
    "timestamp": "2024-01-01T12:00:00Z"
  },
  "subject": {
    "id": "test-stdin",
    "source": "/stdin",
    "type": "test"
  }
}' | cdviz-collector send --data @-

# Multiple events from file
cat batch-events.json | cdviz-collector send --data @-
```

## Output Destinations

### Debug Output (Default)

By default, the send command outputs to stdout for testing:

```bash
cdviz-collector send --data '{
  "context": {
    "version": "0.4.1",
    "id": "test-event-123",
    "source": "/cli-test",
    "type": "dev.cdevents.test.0.1.0",
    "timestamp": "2024-01-01T12:00:00Z"
  },
  "subject": {
    "id": "test",
    "source": "/cli-test",
    "type": "test"
  }
}'
```

### HTTP Endpoint

Specify a URL to send CDEvent data to an HTTP endpoint in CloudEvents format:

```bash
cdviz-collector send --data '{
  "context": {
    "version": "0.4.1",
    "id": "deployment-123",
    "source": "/ci-system",
    "type": "dev.cdevents.service.deployed.0.2.0",
    "timestamp": "2024-01-01T12:00:00Z"
  },
  "subject": {
    "id": "my-service",
    "source": "/ci-system",
    "type": "service",
    "content": {
      "environment": {"id": "production"}
    }
  }
}' --url https://api.example.com/webhook
```

When `--url` is specified:

- HTTP sink is automatically enabled
- Debug sink is automatically disabled
- Data is sent in CloudEvents format

## Headers and Authentication

Add custom HTTP headers for authentication or metadata:

```bash
# Single header with CDEvent data
cdviz-collector send --data '{
  "context": {
    "version": "0.4.1",
    "id": "auth-test-456",
    "source": "/secure-system",
    "type": "dev.cdevents.change.created.0.3.0",
    "timestamp": "2024-01-01T12:00:00Z"
  },
  "subject": {
    "id": "commit-abc123",
    "source": "/secure-system",
    "type": "change",
    "content": {"description": "Security fix commit"}
  }
}' \
  --url https://api.example.com/webhook \
  --header "Authorization: Bearer token123"

# Multiple headers
cdviz-collector send --data '@cdevent.json' \
  --url https://api.example.com/webhook \
  --header "X-API-Key: secret" \
  --header "X-Source: cdviz-collector"
```

## Using Transformers for Non-CDEvent Data

If your input data is NOT already a CDEvent, you need to configure transformers to convert it:

```toml
# send-with-transform.toml
[[transformers]]
name = "to_cdevent"
type = "vrl"
script = '''
  # Convert arbitrary JSON to CDEvent format
  # Let collector generate ID and timestamp for better practices
  .context = {
    "version": "0.4.1",
    "source": "/custom-source",
    "type": "dev.cdevents.custom.0.1.0"
  }
  .subject = {
    "id": string(.id) || "custom-event",
    "source": "/custom-source",
    "type": "custom",
    "content": .
  }
'''

[sinks.http]
enabled = true
destination = "https://api.example.com/webhook"
```

```bash
# Now you can send non-CDEvent data
cdviz-collector send --data '{"test": "value", "user": "john"}' --config send-with-transform.toml
```

> [!TIP]
> See [Transformers Guide](./transformers.md) for more transformation examples.

## Advanced Configuration

For complex scenarios, use a configuration file with the `--config` flag:

```toml
# send-config.toml
[sinks.http]
enabled = true
destination = "https://api.example.com/webhook"

# Add HMAC signature for webhook security
[sinks.http.headers.x-signature-256]
type = "signature"
token = "your-webhook-secret"
algorithm = "sha256"
prefix = "sha256="
```

```bash
# Send CDEvent data with advanced sink configuration
cdviz-collector send --data '@cdevent.json' --config send-config.toml
```

Command line arguments override configuration file settings.

## Common Use Cases

### Testing Webhooks

Test if your webhook endpoint accepts CDEvent data:

```bash
# Using a CDEvent file
cdviz-collector send --data @cdevent.json --url http://localhost:8080/webhook
```

### Debugging Transformations

Test data transformation without external sources:

```bash
# Transform non-CDEvent data using transformers
cdviz-collector send --data '{"raw": "data", "version": "1.0"}' --config transform-config.toml
```

### Scripting Event Dispatch

Send CDEvents from scripts or automation:

```bash
#!/bin/bash
# Minimal CDEvent - let collector generate ID and timestamp
CDEVENT_DATA='{
  "context": {
    "version": "0.4.1",
    "source": "/deployment-script",
    "type": "dev.cdevents.service.deployed.0.2.0"
  },
  "subject": {
    "id": "my-service",
    "source": "/deployment-script",
    "type": "service",
    "content": {
      "environment": {"id": "production"},
      "artifactId": "pkg:oci/my-service@sha256:abc123"
    }
  }
}'
cdviz-collector send --data "$CDEVENT_DATA" --url "$WEBHOOK_URL"
```

### Quick Testing with Minimal Events

Perfect for rapid testing without worrying about IDs and timestamps:

````bash
# Ultra-minimal CDEvent for quick testing
cdviz-collector send --data '{
  "context": {
    "version": "0.4.1",
    "source": "/test",
    "type": "dev.cdevents.test.0.1.0"
  },
  "subject": {
    "id": "quick-test",
    "source": "/test",
    "type": "test",
    "content": {"message": "Hello World"}
  }
}' --url https://webhook.site/your-unique-url

### Batch Processing
Send multiple related events in a single command:
```bash
# Create a batch of related deployment events
cdviz-collector send --data '[
  {
    "context": {
      "version": "0.4.1",
      "id": "deploy-start-123",
      "source": "/ci-system",
      "type": "dev.cdevents.service.deployed.0.2.0",
      "timestamp": "2024-01-01T12:00:00Z"
    },
    "subject": {
      "id": "my-service",
      "source": "/ci-system",
      "type": "service",
      "content": {
        "environment": {"id": "production"},
        "artifactId": "pkg:oci/my-service@sha256:abc123"
      }
    }
  },
  {
    "context": {
      "version": "0.4.1",
      "id": "deploy-complete-123",
      "source": "/ci-system",
      "type": "dev.cdevents.service.deployed.0.2.0",
      "timestamp": "2024-01-01T12:05:00Z"
    },
    "subject": {
      "id": "my-service",
      "source": "/ci-system",
      "type": "service",
      "content": {
        "environment": {"id": "production"},
        "artifactId": "pkg:oci/my-service@sha256:abc123"
      }
    }
  }
]' --url https://api.example.com/webhook
````

### Load Testing

Generate test CDEvents for load testing:

```bash
# Traditional approach: loop with individual commands
for i in {1..100}; do
  CDEVENT='{
    "specversion": "1.0",
    "id": "load-test-'$i'",
    "source": "load-test",
    "type": "dev.cdevents.test.v1",
    "time": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "subject": {"id": "test-'$i'", "type": "test"}
  }'
  cdviz-collector send --data "$CDEVENT" --url https://api.example.com/webhook
done

# More efficient: batch approach (send 10 events at once)
for batch in {1..10}; do
  BATCH_EVENTS='['
  for i in $(seq $((($batch-1)*10+1)) $(($batch*10))); do
    EVENT='{
      "specversion": "1.0",
      "id": "load-test-'$i'",
      "source": "load-test",
      "type": "dev.cdevents.test.v1",
      "time": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
      "subject": {"id": "test-'$i'", "type": "test"}
    }'
    BATCH_EVENTS+="$EVENT"
    if [ $i -lt $(($batch*10)) ]; then
      BATCH_EVENTS+=','
    fi
  done
  BATCH_EVENTS+=']'
  cdviz-collector send --data "$BATCH_EVENTS" --url https://api.example.com/webhook
done
```

## Architecture

The send command follows the same pipeline architecture as the connect command:

1. **CLI Source**: Reads and parses JSON data from command line arguments
2. **Event Pipeline**: Converts raw JSON to CDEvents format via broadcast channel
3. **Sinks**: Processes and dispatches events to configured destinations

### Configuration Layers

The command uses a layered configuration approach:

1. **Base Configuration**: Embedded TOML with debug sink enabled by default
2. **User Configuration**: Optional config file via `--config` flag
3. **CLI Overrides**: Command line arguments override previous layers

## Examples

### Basic Testing

```bash
# Test basic functionality with complete CDEvent
cdviz-collector send --data '{
  "context": {
    "version": "0.4.1",
    "id": "test-basic",
    "source": "/test",
    "type": "dev.cdevents.test.0.1.0",
    "timestamp": "2024-01-01T12:00:00Z"
  },
  "subject": {
    "id": "hello",
    "source": "/test",
    "type": "test"
  }
}'

# Test with auto-generated ID and timestamp (minimal)
cdviz-collector send --data '{
  "context": {
    "version": "0.4.1",
    "source": "/test",
    "type": "dev.cdevents.test.0.1.0"
  },
  "subject": {
    "id": "hello-minimal",
    "source": "/test",
    "type": "test",
    "content": {"note": "ID and timestamp will be auto-generated"}
  }
}'

# Test with multiple CDEvents in one command
cdviz-collector send --data '[
  {
    "specversion": "1.0",
    "id": "test-1",
    "source": "test",
    "type": "dev.cdevents.test.v1",
    "time": "2024-01-01T12:00:00Z",
    "subject": {"id": "hello", "type": "test"}
  },
  {
    "specversion": "1.0",
    "id": "test-2",
    "source": "test",
    "type": "dev.cdevents.test.v1",
    "time": "2024-01-01T12:01:00Z",
    "subject": {"id": "world", "type": "test"}
  }
]'

# Test with CDEvent file input (single or array)
cdviz-collector send --data @cdevent.json
```

### Production Integration

```bash
# Send CDEvent to production webhook with authentication
cdviz-collector send \
  --data @production-cdevent.json \
  --url https://api.company.com/events \
  --header "Authorization: Bearer $API_TOKEN" \
  --header "X-Source: cdviz-collector"
```

### Configuration Testing

```bash
# Test complex sink configuration with CDEvent
cdviz-collector send \
  --data @cdevent.json \
  --config production-sinks.toml \
  --verbose
```

## Error Handling

The send command returns:

- **Exit code 0**: Success
- **Exit code 1**: Error (invalid data, network failure, configuration error)

Use verbose logging to debug issues:

```bash
cdviz-collector send --data @event.json --url $URL --verbose
```

## Related

- [Configuration Guide](./configuration.md) - Complete configuration reference
- [Sinks Documentation](./sinks/) - Available sink types and their configuration
- [HTTP Sink](./sinks/http.md) - HTTP sink configuration details
- [Troubleshooting](./troubleshooting.md) - Debug common issues
