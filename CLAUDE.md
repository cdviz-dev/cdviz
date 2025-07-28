# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

- **Project Overview**: See [README.md](README.md) for comprehensive information about CDviz architecture, components, and technologies
- **Development Setup**: See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development commands, workflow, and component-specific instructions
- **Architecture Details**: See [README.md](README.md) for event flow, database design, dashboard system, and deployment options

## Development Quick Start

All development commands use `mise` task runner. Each component has a `.mise.toml` file with specific tasks:

```bash
cd {{component}}
mise install    # Install component dependencies
mise tasks      # List available tasks
mise run ci     # Run all CI tasks (build, test, lint)
```

## Key Commands by Component

### Site (cdviz-site/)
- `mise run dev` - Start development server
- `mise run build` - Build documentation

### Grafana (cdviz-grafana/)
- `mise run build` - Generate dashboards from TypeScript
- `mise run test` - Run dashboard tests

### Database (cdviz-db/)
- `mise run plan` - Create migration for schema changes
- `mise run apply` - Apply migrations
- `mise run db-local:start` - Start local database

### Charts (charts/)
- `mise run lint:*` - Lint Helm charts
- `mise run publish` - Publish to OCI registry

### Demos (demos/)
- `mise run stack:compose:up` - Start Docker Compose stack
- `mise run stack:k8s:deploy` - Deploy to Kubernetes
- `mise run use_cases:run` - Run with sample data

## Architecture Summary

CDviz is an SDLC observability platform using:
- **Event Flow**: Sources → cdviz-collector → PostgreSQL → Grafana dashboards
- **Database**: PostgreSQL + TimescaleDB with Atlas migrations
- **Dashboards**: Generated TypeScript using Grafana Foundation SDK with custom D3.js panels
- **Deployment**: Docker Compose for local dev, Helm charts for Kubernetes

## Important Notes

- **Direct Database Access**: Dashboards query PostgreSQL directly (not through API)
- **Generated Dashboards**: Modify TypeScript in `dashboards_generator/`, not JSON directly
- **Schema Changes**: Use Atlas migrations via `mise run plan` in cdviz-db/
- **Multi-Component**: Each directory has separate `.mise.toml` configuration
- **CDEvents Standard**: All events follow Cloud Native Delivery Events specification

For complete details, refer to [README.md](README.md) and [CONTRIBUTING.md](CONTRIBUTING.md).
