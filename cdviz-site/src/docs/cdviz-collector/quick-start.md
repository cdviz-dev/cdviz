# Quick Start Guide

Get CDviz Collector running in 5 minutes with a working example.

## What You'll Build

```txt
Webhook Endpoint → Transform to CDEvent → Save to Files
```

- ✅ Webhook endpoint receiving events
- ✅ Events transformed to CDEvents format
- ✅ Events saved as JSON files

## Install & Start

```bash
# Install
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/cdviz-dev/cdviz-collector/releases/download/v0.6.4/cdviz-collector-installer.sh | sh

# Create config file
cat > quick-start.toml << 'EOF'
[http]
host = "0.0.0.0"
port = 8080

[sources.api_events]
enabled = true
transformer_refs = ["to_cdevents"]

[sources.api_events.extractor]
type = "webhook"
id = "api"

[transformers.to_cdevents]
type = "vrl"
template = '''
[{
    "metadata": .metadata,
    "headers": .headers,
    "body": {
        "context": {
            "version": "0.4.1",
            "id": "0",
            "source": "/cdviz/api",
            "type": "dev.cdevents.service.deployed.0.2.0",
            "timestamp": now()
        },
        "subject": {
            "id": (.body.service // "unknown"),
            "type": "service"
        }
    }
}]
'''

# ⚠️ CDEvents Transformation Disclaimer:
# This VRL template is a simplified example and may be incomplete or outdated.
# For production use:
# - Check the official CDEvents specification: https://cdevents.dev/
# - Use provided VRL transformers: /etc/cdviz-collector/transformers/
# - Validate your CDEvents format before deployment

[sinks.files]
enabled = true
type = "folder"
kind = "fs"
parameters = { root = "./events" }

[sinks.debug]
enabled = true
type = "debug"
EOF

# Start collector
cdviz-collector connect --config quick-start.toml
```

## Test Your Setup

```bash
# Send test event
curl -X POST http://localhost:8080/webhooks/api \
  -H "Content-Type: application/json" \
  -d '{"service": "user-api", "version": "v1.2.3"}'

# Check saved files
ls -la events/
cat events/*.json
```

You should see:

- ✅ HTTP 200 response
- ✅ Debug logs in terminal
- ✅ JSON file created in `./events/`

## What You've Learned

- **Sources** collect events via webhooks
- **Transformers** convert to CDEvents using VRL
- **Sinks** deliver events to destinations
- **TOML config** defines the pipeline

## Ready for More?

### Real Integrations

- **[GitHub](./integrations/github.md)** - Repository events with proper signatures
- **[GitHub Action](./integrations/github-action.md)** - Send events directly from workflows
- **[Kubernetes](./integrations/kubewatch.md)** - Cluster events via Kubewatch
- **GitLab** and **Jenkins** - CI/CD events (coming soon)

### Other Sources & Sinks

- **[File processing](./sources/opendal.md)** - Monitor log files and artifacts
- **[Database storage](./sinks/db.md)** - PostgreSQL for dashboards
- **[HTTP forwarding](./sinks/http.md)** - Send to external APIs

### Production Ready

- **[Installation](./install.md)** - Docker, Kubernetes deployment
- **[Configuration](./configuration.md)** - Environment variables, authentication
- **[Troubleshooting](./troubleshooting.md)** - Debug common issues
