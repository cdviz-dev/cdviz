---
description: "CDviz Collector configuration reference: TOML structure, environment variable configuration, sources, transformers, sinks, and HTTP server settings."
---

# Configuration

CDviz Collector uses TOML configuration files. Environment variables can set or override any value at runtime.

📚 **TOML Help:** See [TOML Syntax Guide](./toml-guide.md) for configuration file format.

## Basic Configuration

### Minimal Setup

```toml
[http]
port = 8080

[sources.my_source]
enabled = true
[sources.my_source.extractor]
type = "webhook"
id = "api"

[sinks.files]
enabled = true
type = "folder"
kind = "fs"
parameters = { root = "./events" }
```

### Main Sections

- **`[http]`** - HTTP server configuration (host, port, root_url, request_timeout)
- **`[vrl]`** - VRL runtime settings (`allowed_env_vars`)
- **`[sources.*]`** - Event collection (see [Sources](./sources/))
- **`[transformers.*]`** - Event processing (see [Transformers](./transformers.md))
- **`[sinks.*]`** - Event delivery (see [Sinks](./sinks/))

### HTTP Configuration

The `[http]` section configures the HTTP server:

```toml
[http]
host = "0.0.0.0"           # Bind address (default: "0.0.0.0")
port = 8080                # Port to listen on (default: 8080)
root_url = "http://cdviz-collector.example.com"  # Base URL for generating source URLs
request_timeout = "3s"     # Per-request timeout; slower requests get 408 (default: "3s")

[http.access_log]
filter = ["4xx", "5xx"]    # Status codes ("404") or classes ("5xx") to log; [] disables
```

**`root_url`** is used to automatically populate `context.source` in CDEvents when not explicitly set. The format is:

```
{root_url}/?source={source_name}
```

For example, with `root_url = "https://cdviz.example.com"` and a source named `github_webhook`, the `context.source` will be:

```
https://cdviz.example.com/?source=github_webhook
```

### VRL Configuration

VRL's `get_env_var()` can only read environment variables matching the `[vrl] allowed_env_vars` glob patterns. The default is **empty** (no variable readable), so a transformer — possibly fetched from a [remote source](./transformers.md#using-remote-transformers) — cannot read the collector's secrets.

```toml
[vrl]
allowed_env_vars = ["DEPLOY_ENV", "MYAPP_*"]
```

Keep patterns narrow: `GITHUB_*` or `CI_*` would also match `GITHUB_TOKEN` or `CI_JOB_TOKEN`. The `send` command pre-allows the CI variables used by [`--run` CI detection](./send-run.md#ci-env-detection).

### Strict Keys

Unknown keys are rejected: a typo like `pool_conections_max` fails at startup instead of being silently ignored. Validate a config with `cdviz-collector config --config config.toml --check` (it also compiles VRL templates).

## Environment Variables

Set or override any config value at runtime using environment variables — the key does **not** need to exist in the TOML file.

**Pattern:** `CDVIZ_COLLECTOR__<PATH_TO_KEY>`

Environment variables take precedence over values in the TOML file.

### Building Environment Variable Names

1. **Start with prefix:** `CDVIZ_COLLECTOR__`
2. **Add config path:** Convert each level to UPPERCASE
3. **Use double underscores:** `__` separates each section/key
4. **Array elements:** Use index numbers for arrays

**Examples:**

```toml
# TOML config path: sinks.database.enabled
[sinks.database]
enabled = false
```

```bash
# Environment variable
CDVIZ_COLLECTOR__SINKS__DATABASE__ENABLED="true"
```

```toml
# TOML config path: sources.github.extractor.headers["x-hub-signature-256"].token
[sources.github.extractor.headers]
"x-hub-signature-256" = { type = "signature", token = "secret" }
```

```bash
# Environment variable — hyphens in header names must stay as hyphens (underscores create a different key)
CDVIZ_COLLECTOR__SOURCES__GITHUB__EXTRACTOR__HEADERS__X-HUB-SIGNATURE-256__TOKEN="github-secret"
```

> [!NOTE] Bash limitation for hyphenated names
> Bash does not allow `export` for names containing hyphens. Alternatives:
>
> - **Preferred**: use [`--set`](#set-flag) — no quoting tricks needed
> - `env` wrapper: `env 'CDVIZ_COLLECTOR__...X-HUB-SIGNATURE-256__TOKEN=secret' cdviz-collector connect --config config.toml`
> - Kubernetes `env[].name` and GitHub Actions `env:` support hyphens natively

```toml
# TOML config path: http.port
[http]
port = 8080
```

```bash
# Environment variable
CDVIZ_COLLECTOR__HTTP__PORT="9090"
```

### Common Patterns

```bash
# Simple values
CDVIZ_COLLECTOR__HTTP__HOST="0.0.0.0"
CDVIZ_COLLECTOR__HTTP__PORT="8080"

# Nested configurations
CDVIZ_COLLECTOR__SINKS__DATABASE__URL="postgresql://prod:pass@host:5432/cdviz"
CDVIZ_COLLECTOR__SOURCES__WEBHOOK__ENABLED="true"

# Deep nesting (headers) — preserve hyphens in header names
CDVIZ_COLLECTOR__SOURCES__GITHUB__EXTRACTOR__HEADERS__X-HUB-SIGNATURE-256__TOKEN="secret"
CDVIZ_COLLECTOR__SINKS__HTTP__HEADERS__AUTHORIZATION__VALUE="Bearer token123"

# Multiple overrides
CDVIZ_COLLECTOR__SINKS__DEBUG__ENABLED="false" \
CDVIZ_COLLECTOR__SINKS__DATABASE__ENABLED="true" \
cdviz-collector connect --config config.toml
```

## `--set` Flag

The `connect`, `send`, and `config` subcommands accept `--set` to inject raw TOML fragments at runtime. Can be repeated; fragments are merged in order.

```
--set <SET>    Override config with a raw TOML fragment. Can be repeated; fragments are concatenated.
```

**When to prefer `--set` over environment variables:**

- Header names contain hyphens — no bash quoting tricks needed
- Setting multiple typed values at once (booleans, integers, arrays)
- Quick variations without creating extra TOML files

**Examples:**

```bash
# Set a hyphenated header key — no env workaround needed
cdviz-collector connect --config config.toml \
  --set '[sources.github.extractor.headers."x-hub-signature-256"]
token = "my-secret"'

# Enable a sink and set URL in one fragment
cdviz-collector connect --config config.toml \
  --set '[sinks.database]
enabled = true
url = "postgresql://prod:pass@host:5432/cdviz"'

# Multiple --set flags (applied in order)
cdviz-collector connect --config config.toml \
  --set 'sinks.debug.enabled = false' \
  --set 'sinks.database.enabled = true'
```

## File Loading

### External Files

Load large content from files instead of inline: **add the suffix `_file`**

```toml
[transformers.github]
type = "vrl"
template_file = "./transforms/github.vrl"  # Instead of inline template
```

### File Paths

- **Absolute:** `/etc/cdviz-collector/config.toml`
- **Relative:** `./config.toml` (to current directory or `--directory`)
- **Container:** `/etc/cdviz-collector/` (for packaged templates)

## Production Patterns

### Development

```toml
[sinks.debug]
enabled = true
type = "debug"

[sinks.files]
enabled = true
type = "folder"
kind = "fs"
parameters = { root = "./dev-events" }
```

### Production with Secrets

```toml
[sinks.database]
enabled = true
type = "db"
url = "postgresql://user:pass@host:5432/cdviz"  # or set via env: CDVIZ_COLLECTOR__SINKS__DATABASE__URL

[sources.github]
enabled = true
transformer_refs = ["github_events"]
[sources.github.extractor]
type = "webhook"
id = "github"

# Headers with signature validation
[sources.github.extractor.headers]
"x-hub-signature-256" = { type = "signature", token = "github-webhook-secret" } # or set via env: CDVIZ_COLLECTOR__SOURCES__GITHUB__EXTRACTOR__HEADERS__X-HUB-SIGNATURE-256__TOKEN
```

see [Header Authentication](./header-authentication.md) & [Header Validation](./header-validation.md).

### Kubernetes ConfigMap + Secrets

```yaml
# ConfigMap for config file
configFiles:
  "collector.toml": |-
    [sinks.database]
    enabled = true
    type = "db"

# Secret for sensitive values
env:
  CDVIZ_COLLECTOR__SINKS__DATABASE__URL:
    valueFrom:
      secretKeyRef:
        name: collector-secrets
        key: database-url
```

## Default Configuration

CDviz Collector includes [built-in defaults](https://github.com/cdviz-dev/cdviz-collector/blob/main/src/assets/cdviz-collector.base.toml) with common sources and sinks pre-configured but disabled.

**Enable defaults:**

```bash
# Enable built-in database sink
CDVIZ_COLLECTOR__SINKS__DATABASE__ENABLED="true"

# Enable built-in debug sink
CDVIZ_COLLECTOR__SINKS__DEBUG__ENABLED="true"
```

## CLI Integration

```bash
# Specify config file
cdviz-collector connect --config ./config.toml

# Set working directory for relative paths
cdviz-collector connect --config config.toml --directory /app/config

# Environment + config combination
CDVIZ_COLLECTOR__SINKS__DEBUG__ENABLED="true" \
cdviz-collector connect --config config.toml -v
```
