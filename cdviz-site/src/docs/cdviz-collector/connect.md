# Connect Command

Launch the collector as a server to connect configured sources to sinks.

The `connect` command runs the collector in server mode, enabling configured sources to collect events and dispatch them to configured sinks through the pipeline. This is the primary operational mode for continuous event processing in production environments.

## Usage

```bash
cdviz-collector connect [OPTIONS]
```

<<< @/docs/cdviz-collector/connect-help.txt

> [!TIP]
> See [Configuration Guide](./configuration.md) for complete configuration reference and examples.

## Server Features

When running, the server provides HTTP endpoints for:

- **Webhook Sources** - Receive events from external systems
- **SSE Sinks** - Real-time event streaming to clients
- **Health Checks** - Monitoring and load balancer integration

The exact endpoints depend on your configuration.

## Common Usage

### Development

```bash
# Start with verbose logging
cdviz-collector connect --config dev-config.toml --verbose
```

### Production

```bash
# Production with specific working directory
cdviz-collector connect \
  --config /etc/cdviz/config.toml \
  --directory /opt/cdviz
```

### Testing

```bash
# Disable OpenTelemetry for testing
cdviz-collector connect --config test-config.toml --disable-otel
```

## Observability

### Logging Control

```bash
# Increase verbosity (can use multiple times: -vvv)
cdviz-collector connect --config config.toml --verbose

# Quiet mode
cdviz-collector connect --config config.toml --quiet
```

### OpenTelemetry

By default, OpenTelemetry is enabled for distributed tracing. Disable with `--disable-otel` for testing environments.
