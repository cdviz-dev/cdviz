# Configuration of cdviz-collector

`cdviz-collector` is configured via a config file & override by environment variables.

## Configuration File

The configuration file is a [TOML](https://toml.io/en/v1.0.0) file, named `cdviz-collector.toml` (by convention).

📚 **New to TOML?** See our [TOML Configuration Guide](./toml-guide.md) for syntax help with arrays, tables, and complex structures.

It is composed of multiple sections, each representing a different aspect of the collector's configuration:

- `http` : Configuration of the HTTP server used by the collector.
- `sinks` : Configuration of the sinks used by the collector.
- `sources` : Configuration of the sources used by the collector.
- `transformers` : Configuration of the transformers used by the collector.

## Default / Base Configuration

A [base configuration](https://github.com/cdviz-dev/cdviz-collector/blob/main/src/assets/cdviz-collector.base.toml) is loaded by default and overrided by the configuration file set via the argument `--config`.
The base configuration is embedded into the binary.

Some additional configuration, script, etc can be provided, they are not embedded into the binary, but they are packaged into the container and available at path `/etc/cdviz-collector`.
The additional configuration are available at <https://github.com/cdviz-dev/cdviz-collector/tree/main/config>.

### HTTP section

The http section defines on which host and port the HTTP server used by the collector will listen for webhooks'sources (`/webhooks/...`), health checks (`/healthz`) and metrics (`/metrics`).
The base configuration of the HTTP section is:

```toml
[http]
host = "0.0.0.0"
port = 8080
```

### Sinks section

see [sinks]

### Sources section

see [sources]

### Transformers section

see [transformers]

### Path & Files

Some values can be reference to a local file or folder, in this case the path could absolute or relative to the current working directory or the directory defined by the argument `--directory`.

It is also possible to load the content of a file, instead of inline string. In this case the key should be suffixed by `_file` (this is useful for large strings and mainly used by [transformers] to load template / script).
Do not forgot to also deploy this file with the configuration, it could be packaged into your container image, or into a configmap (for kubernetes).

## Environment Variables

Every entry in the configuration file can be overridden by environment variables following the pattern `CDVIZ_COLLECTOR__<KEY_PATH>`.
`KEY_PATH` is the path to the key in the configuration file, in uppercase with double underscores as section'separators.

Example:

```toml
[sinks.cdviz_db]
enabled = false
```

Can be overridden by environment variables:

```bash
CDVIZ_COLLECTOR__SINKS__CDVIZ_DB__ENABLED="true"
```

## Usages Examples

### CLI

```bash
CDVIZ_COLLECTOR__SINKS__DEBUG__ENABLED="false"
cdviz-collector connect -vv --config ./cdviz-collector.toml
```

### Kubernetes / Helm

Provides a configuration file (that will be stored into a configmap) and uses environment variables for secret values.
Examples fragment to place in the [values.yaml](install#values-yaml) file:

```yaml
configFiles:
  "cdviz-collector.toml": |-
    [sinks.debug]
    enabled = false

    [sinks.cdviz_db]
    enabled = true

    [sources.cdevents_webhook]
    enabled = false

    [sources.cdevents_webhook.extractor]
    type = "webhook"
    id = "000"

    [sources.github_webhook]
    enabled = true
    transformer_refs = [ "github_events"]

    [sources.github_webhook.extractor]
    type = "webhook"
    id = "001"
    headers_to_keep = []
    # token override by environment variable reads from the secret
    signature = { signature_encoding = "hex", signature_on = "body", signature_prefix = "sha256=", header = "x-hub-signature-256", token = "changeme" }

    [transformers.github_events]
    type = "vrl"
    template_file = "/etc/cdviz-collector/transformers/github_events.vrl"

log:
  level: "info"

env:
  CDVIZ_COLLECTOR__SINKS__CDVIZ_DB__URL:
    valueFrom:
      secretKeyRef:
        name: "cdviz-collector" # secret defined below
        key: DATABASE_URL
  CDVIZ_COLLECTOR__SOURCES__GITHUB_WEBHOOK__EXTRACTOR__SIGNATURE__TOKEN:
    valueFrom:
      secretKeyRef:
        name: "cdviz-collector"
        key: GITHUB_WEBHOOK_SIGNATURE_TOKEN
```

You can also use `configFiles` for additional configuration files, templates, ... The files are mounted into the folder's path `/mnt/config` (it's also the value of `--directory`, so every path are relative to it).

[cdevents]: <https://cdevents.dev/>
[Sources]: sources
[Sinks]: sinks
[Transformers]: transformers
