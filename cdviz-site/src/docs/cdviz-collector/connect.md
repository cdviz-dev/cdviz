---
description: "Run CDviz Collector in server mode with the connect command. Starts HTTP endpoints for webhooks, SSE streaming, and health checks."
---

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

- **Webhook Sources** - Receive events from external systems at `POST /webhook/{id}`
- **SSE Sinks** - Real-time event streaming to subscribers at `GET /sse/{id}`
- **Health Checks** - Liveness probe at `GET /healthz` for Kubernetes and load balancers

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

OpenTelemetry is enabled by default for distributed tracing and metrics. Configure the OTLP endpoint via environment variable:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317 cdviz-collector connect --config config.toml
```

Disable in environments without an OTLP receiver:

```bash
cdviz-collector connect --config config.toml --disable-otel
```

## Kubernetes Deployment

In Kubernetes, `connect` is the entry point for the deployed pod. The health endpoint supports readiness/liveness probes:

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 2
  periodSeconds: 30
readinessProbe:
  httpGet:
    path: /readyz
    port: 8080
  initialDelaySeconds: 3
  periodSeconds: 10
```

See [Installation](./install.md) for Helm chart configuration.

## Environment Variable Configuration

Any config value can be set or overridden via environment variables using the pattern `CDVIZ_COLLECTOR__<SECTION>__<KEY>` — the key does not need to exist in the TOML file:

```bash
# Set database URL (no TOML entry needed)
CDVIZ_COLLECTOR__SINKS__DATABASE__URL="postgresql://prod-db:5432/cdviz" \
  cdviz-collector connect --config config.toml

# Enable specific sink at runtime
CDVIZ_COLLECTOR__SINKS__DATABASE__ENABLED="true" \
  cdviz-collector connect --config config.toml
```

## Related

- [Configuration Guide](./configuration.md) — full TOML config reference
- [Installation](./install.md) — Helm chart and Docker setup
- [Send Command](./send.md) — one-shot event delivery without starting a server
- [Troubleshooting](./troubleshooting.md) — common issues and solutions
