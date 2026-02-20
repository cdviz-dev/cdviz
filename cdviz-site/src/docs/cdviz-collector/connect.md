# Connect Command

Launch the collector as a server to connect configured sources to sinks.

The `connect` command runs the collector in server mode, enabling configured sources to collect events and dispatch them to configured sinks through the pipeline. This is the primary operational mode for continuous event processing in production environments.

## Usage

```bash
cdviz-collector connect [OPTIONS]
```

```text
Launch collector as a server to connect sources to sinks.

Runs the collector in server mode, enabling configured sources to collect events and dispatch them to configured sinks through the pipeline. The server provides HTTP endpoints for webhook sources and SSE sinks.

Usage: cdviz-collector connect [OPTIONS]

Options:
      --config <CONFIG>
          Configuration file path for sources, sinks, and transformers.

          Specifies the TOML configuration file that defines the pipeline behavior. If not provided, the collector will use the base configuration with default settings. The configuration can also be specified via the `CDVIZ_COLLECTOR_CONFIG` environment variable.

          Example: `--config cdviz-collector.toml`

          [env: CDVIZ_COLLECTOR_CONFIG=]

  -v, --verbose...
          Increase logging verbosity

  -q, --quiet...
          Decrease logging verbosity

      --disable-otel
          Disable OpenTelemetry initialization and use minimal tracing setup.

          This is useful for testing environments or when you want to avoid OpenTelemetry overhead. When disabled, only basic console logging will be available without distributed tracing capabilities.

  -C, --directory <DIRECTORY>
          Change working directory before executing the command.

          This affects relative paths in configuration files and data files. Useful when running the collector from a different location than where your configuration and data files are located.

  -h, --help
          Print help (see a summary with '-h')
```

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
