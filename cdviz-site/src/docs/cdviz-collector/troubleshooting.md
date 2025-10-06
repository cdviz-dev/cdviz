# Troubleshooting Guide

Systematic approaches to diagnose and resolve common CDviz Collector issues.

## Quick Diagnostic Steps

When CDviz Collector isn't working as expected, follow these steps:

1. **[Check logs](#check-logs)** - Most issues show up in logs
2. **[Validate configuration](#validate-configuration)** - Ensure syntax and values are correct
3. **[Test connectivity](#test-connectivity)** - Verify network connections
4. **[Verify event flow](#verify-event-flow)** - Confirm events are reaching each stage

## Check Logs

### Enable Verbose Logging

```bash
# More detailed logs
cdviz-collector connect --config config.toml -v

# Maximum detail (debug level)
cdviz-collector connect --config config.toml -vv

# Or use environment variable
RUST_LOG=debug cdviz-collector connect --config config.toml
```

### Log Levels and What They Show

- **ERROR**: Critical failures, startup errors, connection failures
- **WARN**: Recoverable issues, performance problems, misconfigurations
- **INFO**: Normal operations, startup messages, event counts
- **DEBUG**: Detailed event processing, configuration parsing, internal state

### Key Log Messages

**Successful startup:**

```
INFO cdviz_collector: Starting CDviz Collector
INFO cdviz_collector::http: HTTP server listening on 0.0.0.0:8080
INFO cdviz_collector::sources: Source 'github_webhook' started
INFO cdviz_collector::sinks: Sink 'database' connected
```

**Configuration errors:**

```
ERROR cdviz_collector::config: Failed to parse configuration: missing field `type` at line 15
ERROR cdviz_collector::sources: Source 'github' failed to start: invalid extractor type 'webhook_typo'
```

**Connection issues:**

```
ERROR cdviz_collector::sinks::db: Database connection failed: connection refused
WARN cdviz_collector::sinks::http: HTTP sink 'webhook' request failed: timeout after 30s
```

## Validate Configuration

### Check TOML Syntax

```bash
# Validate configuration without starting
cdviz-collector connect --config config.toml --validate-only

# Dry run to see parsed configuration
cdviz-collector connect --config config.toml --dry-run
```

### Common Configuration Mistakes

#### ❌ Wrong: Mixed inline and section syntax

```toml
[sources.example.extractor]
type = "webhook"
parameters = { id = "test" }

[sources.example.extractor.parameters]  # Conflicts!
additional_param = "value"
```

#### ✅ Correct: Choose one approach

```toml
# Option 1: All inline
[sources.example.extractor]
type = "webhook"
parameters = { id = "test", additional_param = "value" }

# Option 2: All sections
[sources.example.extractor]
type = "webhook"

[sources.example.extractor.parameters]
id = "test"
additional_param = "value"
```

#### ❌ Wrong: Single brackets for arrays

```toml
[sources.webhook.extractor.headers]  # Creates single table
header = "Authorization"
```

#### ✅ Correct: Double brackets for arrays

```toml
[[sources.webhook.extractor.headers]]  # Creates array of tables
header = "Authorization"
```

### Environment Variable Override Test

```bash
# Test if environment override works
CDVIZ_COLLECTOR__SINKS__DEBUG__ENABLED="true" \
cdviz-collector connect --config config.toml --dry-run
```

## Test Connectivity

### Database Connection

```bash
# Test PostgreSQL connection
psql "postgresql://user:pass@localhost:5432/cdviz" -c "SELECT 1;"

# Or using Docker
docker run --rm postgres:15 psql "postgresql://user:pass@host:5432/cdviz" -c "SELECT 1;"
```

### HTTP Endpoints

```bash
# Test outgoing HTTP connections
curl -v https://api.example.com/webhook

# Test webhook endpoint is listening
curl -v http://localhost:8080/healthz
```

### Network Troubleshooting

```bash
# Check if port is listening
netstat -tlnp | grep :8080

# Test from different machine
curl -v http://collector-host:8080/healthz

# Check DNS resolution
nslookup api.example.com
```

## Verify Event Flow

### Test with Debug Sink

Add debug sink to see events at each stage:

```toml
[sinks.debug]
enabled = true
type = "debug"
```

### Add Logging to Transformers

**Log transformer** - Add logging between transformation steps:

```toml
[sources.my_source]
enabled = true
transformer_refs = ["log", "my_transform", "log"]  # Log before and after

[transformers.log]
type = "log"
target = "transformers::debug"  # Custom log target for filtering
```

**VRL log function** - Add logging inside VRL templates:

```toml
[transformers.debug_transform]
type = "vrl"
template = '''
log("Input event: " + string!(.body), level: "info")

# Your transformation logic here
.body.processed = true

log("Output event: " + string!(.body), level: "info")

[.]
'''
```

> [!NOTE] CDEvents Transformation Note
> VRL examples are for debugging purposes and may not produce valid CDEvents. For production CDEvents transformations, use provided templates at `/etc/cdviz-collector/transformers/` and validate against the [CDEvents specification](https://cdevents.dev/).

**Filter logs:**

```bash
# Show only transformation logs
RUST_LOG=transformers::debug cdviz-collector connect --config config.toml

# Show VRL logs
RUST_LOG=cdviz_collector::transformers::vrl=debug cdviz-collector connect --config config.toml
```

### Test with Curl

Send test events to webhook sources:

```bash
# Basic webhook test
curl -X POST http://localhost:8080/webhooks/github \
  -H "Content-Type: application/json" \
  -d '{"test": "event"}'

# With authentication headers
curl -X POST http://localhost:8080/webhooks/secure \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token123" \
  -d '{"test": "event"}'
```

### Verify Database Storage

```sql
-- Check if events are being stored
SELECT COUNT(*) FROM cdevents WHERE created_at > NOW() - INTERVAL '1 hour';

-- See recent events
SELECT id, type, source, created_at FROM cdevents ORDER BY created_at DESC LIMIT 10;

-- Check for specific event types
SELECT type, COUNT(*) FROM cdevents GROUP BY type;
```

## Common Issues and Solutions

### 1. "Connection Refused" Errors

**Symptoms:**

```
ERROR cdviz_collector::sinks::db: Database connection failed: connection refused
```

**Causes & Solutions:**

| Cause                | Check                                        | Solution                                      |
| -------------------- | -------------------------------------------- | --------------------------------------------- |
| Database not running | `docker ps` or `systemctl status postgresql` | Start database service                        |
| Wrong host/port      | `netstat -tlnp \| grep :5432`                | Verify database is listening on expected port |
| Wrong credentials    | Test with `psql` manually                    | Update connection string                      |
| Network firewall     | `telnet db-host 5432`                        | Configure firewall rules                      |
| DNS issues           | `nslookup db-host`                           | Use IP address or fix DNS                     |

### 2. "No Route to Host" Errors

**Symptoms:**

```
WARN cdviz_collector::sinks::http: HTTP request failed: No route to host
```

**Solutions:**

- Check external API is accessible: `curl -v https://api.example.com`
- Verify DNS resolution: `nslookup api.example.com`
- Test from collector host, not your local machine
- Check corporate proxy settings
- Verify API endpoint URL is correct

### 3. "Unauthorized" or "Forbidden" Errors

**Symptoms:**

```
ERROR cdviz_collector::sources::webhook: Authentication failed: invalid signature
WARN cdviz_collector::sinks::http: HTTP 401: Unauthorized
```

**For Incoming Webhooks (Sources):**

```bash
# Check webhook signature calculation
echo -n "payload" | openssl dgst -sha256 -hmac "your-secret"

# Verify header configuration
curl -X POST http://localhost:8080/webhooks/github \
  -H "X-Hub-Signature-256: sha256=calculated-signature" \
  -d "payload"
```

**For Outgoing HTTP (Sinks):**

```bash
# Test API authentication manually
curl -H "Authorization: Bearer your-token" https://api.example.com/webhook
```

### 4. "Parse Error" or "Invalid Format" Errors

**Symptoms:**

```
ERROR cdviz_collector::transformers::vrl: VRL compilation failed: function 'unknown_func' not found
WARN cdviz_collector::extractors: Failed to parse JSON: unexpected character
```

**VRL Transformer Issues:**

```bash
# Test VRL template in isolation
echo '{"test": "data"}' | vrl '.body.test'

# Check VRL documentation
# https://vector.dev/docs/reference/vrl/
```

**JSON Parsing Issues:**

```bash
# Validate JSON payload
echo '{"test": "data"}' | jq .

# Check for hidden characters
cat -A payload.json
```

### 5. High Memory or CPU Usage

**Symptoms:**

- Collector becomes slow or unresponsive
- High memory usage in monitoring tools
- System becomes sluggish

**Diagnostics:**

```bash
# Check collector resource usage
top -p $(pgrep cdviz-collector)

# Monitor HTTP connections
netstat -an | grep :8080 | wc -l

# Check database connection pool
```

**Solutions:**

```toml
# Tune database connection pool
[sinks.database]
pool_connections_max = 5  # Reduce from default 10
pool_connections_min = 1

# Add rate limiting (if available)
[sources.webhook.extractor]
rate_limit = "100/minute"

# Tune transformation complexity
[transformers.complex_transform]
# Simplify VRL template or split into multiple transformers
```

### 6. Events Not Appearing in Destination

**Diagnostic Steps:**

1. **Check source is receiving events:**

   ```bash
   # Look for log messages
   grep "Processing event from" collector.log
   ```

2. **Check transformation is working:**

   ```toml
   # Enable debug sink temporarily
   [sinks.debug]
   enabled = true
   type = "debug"
   ```

3. **Check sink is enabled and configured:**

   ```bash
   # Verify in logs
   grep "Sink.*connected" collector.log
   ```

4. **Check destination is reachable:**

   ```bash
   # Test database
   psql $DATABASE_URL -c "SELECT 1;"

   # Test HTTP endpoint
   curl -v $WEBHOOK_URL
   ```

## Performance Troubleshooting

### Performance Factors

**Throughput limitations:**

- **File processing**: Limited by disk I/O and polling interval
- **Database writes**: Limited by database performance and connection pool
- **HTTP forwarding**: Limited by destination API response times
- **Complex transformers**: VRL template complexity affects processing speed

**Resource usage:**

- **CPU**: Low when idle, scales with event volume and transformation complexity
- **Memory**: Base usage plus buffers that scale with throughput
- **Network**: Minimal overhead, primarily event data transfer
- **Disk**: Minimal, mainly for configuration and logs

### Slow Event Processing

**Check event throughput:**

```bash
# Count recent events in database
SELECT COUNT(*) FROM cdevents WHERE created_at > NOW() - INTERVAL '5 minutes';

# Monitor HTTP request rates
grep "POST /webhooks" access.log | wc -l
```

**Common bottlenecks:**

- **Database writes**: Check connection pool size, add indexes
- **HTTP sinks**: Check destination API response times
- **Complex transformers**: Simplify VRL templates
- **High event volume**: Consider multiple collector instances

### Memory Leaks

**Monitor memory usage:**

```bash
# Check memory trend over time
ps -o pid,vsz,rss,comm -p $(pgrep cdviz-collector)

# Enable detailed memory logging
RUST_LOG=debug,cdviz_collector::memory=trace
```

**Common causes:**

- Unbounded queues during sink failures
- Large event payloads accumulating in memory
- Connection leaks to external services

## Debug Configuration

### Minimal Working Configuration

Start with this minimal config to isolate issues:

```toml
[http]
host = "0.0.0.0"
port = 8080

[sources.test]
enabled = true

[sources.test.extractor]
type = "noop"

[sinks.debug]
enabled = true
type = "debug"
```

### Incremental Testing

Add components one at a time:

1. Start with noop source + debug sink
2. Add your real source, keep debug sink
3. Add transformers one by one
4. Replace debug sink with real sinks

## Getting Help

### Collect Diagnostic Information

When reporting issues, include:

```bash
# Collector version
cdviz-collector --version

# Configuration (remove secrets!)
cat config.toml

# Recent logs with debug level
RUST_LOG=debug cdviz-collector connect --config config.toml 2>&1 | tail -100

# Environment
env | grep CDVIZ_COLLECTOR

# System information
uname -a
```

### Enable Debug Features

```toml
# Maximum logging
RUST_LOG=debug

# Add debug sink to see event flow
[sinks.debug]
enabled = true
type = "debug"

# Enable dry-run mode
cdviz-collector connect --config config.toml --dry-run
```

### Common Support Resources

- **Configuration examples**: [GitHub repository](https://github.com/cdviz-dev/cdviz-collector/tree/main/examples)
- **VRL documentation**: [Vector docs](https://vector.dev/docs/reference/vrl/)
- **TOML syntax**: [TOML guide](./toml-guide.md)
- **CDEvents spec**: [CDEvents website](https://cdevents.dev/)

## Still Having Issues?

If these steps don't resolve your issue:

1. **Double-check** the [configuration guide](./configuration.md)
2. **Review** component-specific documentation ([sources](./sources/), [sinks](./sinks/), [transformers](./transformers.md))
3. **Browse** [integration examples](./integrations/github.md) for similar setups
4. **Search** existing issues in the [GitHub repository](https://github.com/cdviz-dev/cdviz-collector/issues)
