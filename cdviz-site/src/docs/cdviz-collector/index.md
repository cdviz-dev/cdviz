# CDviz Collector

Collect events from your SDLC, transform them into [CDEvents](https://cdevents.dev/), and dispatch to various destinations.

![Inside a collector](/architectures/inside_collector.excalidraw.svg)

## Quick Start

**New to CDviz Collector?** Get a working setup in 5 minutes:

**[🚀 Quick Start Guide](./quick-start.md)** - Webhook → Transform → Save to files

## Learning Paths

### 📖 Tutorials (Learning-Oriented)
Step-by-step lessons to build understanding:

- **[Quick Start](./quick-start.md)** - 5 min setup with webhook and file output

### 🔧 How-to Guides (Problem-Oriented)
Practical solutions for specific tasks:

**Integrations:**
- **[GitHub](./integrations/github.md)** - Repository events with signatures
- **[Kubernetes](./integrations/kubewatch.md)** - Cluster events via Kubewatch

**Common Tasks:**
- **[Troubleshooting](./troubleshooting.md)** - Debug configuration and connectivity issues
- **[Authentication](./header-authentication.md)** - Secure outgoing requests
- **[Validation](./header-validation.md)** - Validate incoming webhooks

### 📚 Reference (Information-Oriented)
Complete technical specifications:

**Configuration:**
- **[Configuration Guide](./configuration.md)** - Main config structure and environment variables
- **[TOML Syntax](./toml-guide.md)** - Configuration file format help
- **[CLI Usage](./usage.md)** - Command-line interface

**Components:**
- **[Sources](./sources/)** - Event collection: [Webhook](./sources/webhook.md), [Files](./sources/opendal.md), [SSE](./sources/sse.md), [Noop](./sources/noop.md)
- **[Transformers](./transformers.md)** - Event processing with VRL
- **[Sinks](./sinks/)** - Event delivery: [Database](./sinks/db.md), [HTTP](./sinks/http.md), [Files](./sinks/folder.md), [SSE](./sinks/sse.md), [Debug](./sinks/debug.md)

### 🧠 Explanation (Understanding-Oriented)
Concepts and design decisions:

- **[CDEvents Standard](https://cdevents.dev/)** - Why we use CDEvents for standardization

**Architecture Concepts:**
- **Pipeline Flow**: External Systems → Sources → Transformers → Sinks → Destinations
- **Message Structure**: All events have `metadata`, `headers`, and `body` components
- **Parallel Processing**: Sources, transformers, and sinks run independently
- **Deployment Patterns**: Single instance (simple) → Multiple instances (scalable) → Hub-and-spoke (enterprise)

## Installation

```bash
# Quick install
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/cdviz-dev/cdviz-collector/releases/download/v0.6.4/cdviz-collector-installer.sh | sh

# Verify
cdviz-collector --version
```

**[Full Installation Guide](./install.md)** - Docker, Kubernetes, Homebrew, and more options