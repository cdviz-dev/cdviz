# Configuration

CDviz Collector uses TOML configuration files with environment variable overrides.

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
- **`[http]`** - Server host and port (default: `0.0.0.0:8080`)
- **`[sources.*]`** - Event collection (see [Sources](./sources/))
- **`[transformers.*]`** - Event processing (see [Transformers](./transformers.md))
- **`[sinks.*]`** - Event delivery (see [Sinks](./sinks/))

## Environment Overrides

Override any TOML config value at runtime using environment variables:

**Pattern:** `CDVIZ_COLLECTOR__<PATH_TO_KEY>`

Environment variables take precedence over values in the TOML file.

### Building Environment Variable Names

1. **Start with prefix:** `CDVIZ_COLLECTOR__`
2. **Add TOML path:** Convert each level to UPPERCASE
3. **Use double underscores:** `__` separates each TOML section/key
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
# TOML config path: sources.github.extractor.headers[0].rule.token
[[sources.github.extractor.headers]]
header = "X-Hub-Signature-256"
[sources.github.extractor.headers.rule]
type = "signature"
token = "secret"
```
```bash
# Environment variable (array index 0 for first header)
CDVIZ_COLLECTOR__SOURCES__GITHUB__EXTRACTOR__HEADERS__0__RULE__TOKEN="github-secret"
```

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

# Deep nesting (headers, rules, etc.)
CDVIZ_COLLECTOR__SOURCES__GITHUB__EXTRACTOR__HEADERS__0__RULE__TOKEN="secret"
CDVIZ_COLLECTOR__SINKS__HTTP__HEADERS__0__RULE__VALUE="Bearer token123"

# Multiple overrides
CDVIZ_COLLECTOR__SINKS__DEBUG__ENABLED="false" \
CDVIZ_COLLECTOR__SINKS__DATABASE__ENABLED="true" \
cdviz-collector connect --config config.toml
```

## File Loading

### External Files
Load large content from files instead of inline:

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
url = "postgresql://user:pass@host:5432/cdviz"  # Set actual values or use env overrides

[sources.github]
enabled = true
transformer_refs = ["github_events"]
[sources.github.extractor]
type = "webhook"
id = "github"

# Headers with signature validation
[[sources.github.extractor.headers]]
header = "X-Hub-Signature-256"
[sources.github.extractor.headers.rule]
type = "signature"
token = "github-webhook-secret"  # Set actual value or use env overrides
```

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
CDVIZ_COLLECTOR__SINKS__CDVIZ_DB__ENABLED="true"

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

## Next Steps

- **[Quick Start](./quick-start.md)** - Working example in 5 minutes
- **[Sources](./sources/)** - Configure event collection
- **[Transformers](./transformers.md)** - Process and transform events
- **[Sinks](./sinks/)** - Configure event delivery
- **[Troubleshooting](./troubleshooting.md)** - Debug configuration issues
