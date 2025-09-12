# AGENTS.md - CDviz Monorepo

AI agent instructions for CDviz, an SDLC observability platform built around CDEvents.

## Project Context

**What**: Software delivery pipeline visibility and event tracking\
**Who**: DevOps engineers, tech leads, platform engineers\
**Architecture**: See [README.md](README.md) for comprehensive overview\
**Development**: See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed setup and workflows

## AI-Specific Guidance

### Code Patterns to Follow

- **CDEvents Compliance**: All events must follow [CDEvents specification](cdevents-spec/)
- **Direct Database Access**: Dashboards query PostgreSQL directly (no API abstraction)
- **Generated Content**: Never edit generated files - modify sources and rebuild:
  - Grafana dashboards: Edit TypeScript in `dashboards_generator/src/`, not JSON
  - Database schema: Use Atlas migrations via `mise run plan`
- **Signed Commits**: Always use `git commit -s` for DCO compliance

### Multi-Component Architecture

Each component has `.mise.toml` for tasks. Component-specific AI instructions:

- **cdviz-site/**: Documentation site → [cdviz-site/AGENTS.md](cdviz-site/AGENTS.md)
- **cdviz-grafana/**: Dashboard generation (TypeScript → JSON)
- **cdviz-db/**: Database schema with Atlas migrations
- **charts/**: Helm charts for Kubernetes
- **demos/**: Full stack testing environments

### Development Workflow

```bash
cd {{component}}
mise install      # Install dependencies
mise tasks        # List available tasks
mise run ci       # Full CI pipeline
```

Key patterns:

- Database changes: `cd cdviz-db && mise run plan && mise run apply`
- Dashboard updates: `cd cdviz-grafana && mise run build`
- Documentation: `cd cdviz-site && mise run dev`
- Full stack testing: `cd demos && mise run stack:compose:up`

### Critical Constraints

- **Schema Evolution**: Database changes require Atlas migrations
- **Dashboard Build Process**: Grafana dashboards generated from TypeScript
- **Event Standards**: Must conform to CDEvents specification
- **Container-First**: All components designed for containerized deployment

## Quick Command Reference

| Task                | Command                     | Location       |
| ------------------- | --------------------------- | -------------- |
| Start dev server    | `mise run dev`              | cdviz-site/    |
| Generate dashboards | `mise run build`            | cdviz-grafana/ |
| Create DB migration | `mise run plan`             | cdviz-db/      |
| Full stack demo     | `mise run stack:compose:up` | demos/         |
| Lint Helm charts    | `mise run lint:*`           | charts/        |

## Resources

- **Project Overview & Architecture**: [README.md](README.md)
- **Development Setup & Commands**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Component-Specific Instructions**: Each directory has local AGENTS.md/CLAUDE.md
- **Architecture Decisions**: [adr/](adr/) directory
- **Live Documentation**: [cdviz.dev](https://cdviz.dev)
