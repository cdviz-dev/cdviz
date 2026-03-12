# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# AGENTS.md - CDviz Monorepo

AI agent instructions for CDviz, an SDLC observability platform built around CDEvents.

## Project Context

**What**: Software delivery pipeline visibility and event tracking\
**Who**: DevOps engineers, tech leads, platform engineers\
**Architecture**: See [README.md](README.md) for comprehensive overview\
**Development**: See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed setup and workflows

## Monorepo Structure

This is a **mise monorepo** with `experimental_monorepo_root = true` configuration. Components are organized as:

- **cdviz-db/**: PostgreSQL + TimescaleDB schema with golang-migrate migrations
- **cdviz-grafana/**: TypeScript-based Grafana dashboard generator (Bun + Grafana Foundation SDK)
- **cdviz-site/**: VitePress documentation site (Bun + TailwindCSS)
- **charts/**: Helm charts for Kubernetes deployment (cdviz-collector, cdviz-db, cdviz-grafana)
- **demos/**: Integration testing environments (Docker Compose & Kubernetes)
- **cdevents-spec/**: Git submodule with CDEvents specification and conformance tests

**Note**: [cdviz-collector](https://github.com/cdviz-dev/cdviz-collector) (event collection service) is a separate repository.

### Task Execution Pattern

Run tasks from monorepo root using mise's path syntax:

```bash
mise tasks --all                      # List all available tasks across components
mise run //cdviz-site:dev             # Run task in specific component
mise run //cdviz-db:migrate:create    # Run nested task
mise run '//...:ci'                   # Run :ci task in all components
```


## AI-Specific Guidance

### Component-Specific Instructions

Each component has detailed AGENTS.md with specialized guidance:

- **[cdviz-db/AGENTS.md](cdviz-db/AGENTS.md)**: Database schema, golang-migrate migrations, TimescaleDB patterns
- **[cdviz-grafana/AGENTS.md](cdviz-grafana/AGENTS.md)**: TypeScript dashboard generation, ECharts panels, query patterns
- **[cdviz-site/AGENTS.md](cdviz-site/AGENTS.md)**: VitePress documentation, Vue components, content guidelines

**When to use component-specific files**: If working primarily in one component (e.g., writing dashboards, updating docs, modifying schema), read that component's AGENTS.md for detailed patterns and workflows.

### Critical Code Patterns

#### Generated Content Workflow

**NEVER** edit generated files directly. Always modify source and rebuild:

- **Grafana Dashboards**: Edit TypeScript in `cdviz-grafana/dashboards_generator/src/`, then `mise run //cdviz-grafana:build`
- **Database Schema**: Create golang-migrate migration files via `mise run //cdviz-db:migrate:create name`, NOT manual SQL edits

#### CDEvents Compliance

All events must conform to [CDEvents specification](cdevents-spec/). The `cdevents-spec/` submodule contains:

- Official CDEvents schema definitions
- Conformance test suites
- Event type reference documentation

#### Direct Database Access Pattern

Grafana dashboards query PostgreSQL directly without API abstraction:

- Leverages TimescaleDB optimizations (hypertables, time-bucket functions)
- Full SQL capability for complex analytics
- JSONB operators for CDEvents payload extraction
- No backend service layer between Grafana and database

#### Signed Commits Requirement

All commits **must** include DCO sign-off:

```bash
git commit -s -m "feat: add new feature"
```

This adds `Signed-off-by: Your Name <email@example.com>` to comply with [Contributor License Agreement](https://cla-assistant.io/cdviz-dev/cdviz).

### Common Development Workflows

#### Database Schema Changes

```bash
mise run //cdviz-db:migrate:create add_new_column   # Create migration files
# Edit generated .up.sql and .down.sql files
mise run //cdviz-db:lint                            # Lint SQL with sqruff
mise run //cdviz-db:db-local:start                  # Test migration locally
mise run //cdviz-db:migrate:version                 # Verify migration applied
```

#### Dashboard Development

```bash
# Edit TypeScript in cdviz-grafana/dashboards_generator/src/dashboards/
mise run //cdviz-grafana:build                      # Generate JSON dashboards
# Import generated JSON into Grafana for testing
git add cdviz-grafana/dashboards_generator/src cdviz-grafana/dashboards/*.json  # Commit both source and output
```

#### Documentation Updates

```bash
mise run //cdviz-site:dev                           # Start dev server at http://localhost:5173
# Edit markdown in cdviz-site/src/ or Vue components in cdviz-site/components/
mise run //cdviz-site:build                         # Verify production build
```

#### Full Stack Integration Testing

```bash
mise run //demos/stack-compose:up                   # Start PostgreSQL + Grafana + collector via Docker Compose
# Test event ingestion and dashboard queries
mise run //demos/stack-compose:down                 # Clean up
```

Or for Kubernetes testing:

```bash
mise run //demos/stack-k8s:up                       # Deploy via Helmwave
```

### Technology-Specific Patterns

#### Database (PostgreSQL + TimescaleDB)

- **Migration Tool**: golang-migrate (NOT Atlas) - timestamp-based versioning
- **Table Structure**: `cdviz.cdevents_lake` hypertable with JSONB payload + extracted metadata
- **Partitioning**: Time-based (7-day chunks) + hash partitioning by subject
- **Retention**: Automatic deletion after 13 months via TimescaleDB policies

#### Dashboard Generation (TypeScript + Grafana Foundation SDK)

- **Runtime**: Bun (NOT Node.js)
- **Framework**: Grafana Foundation SDK for type-safe dashboard generation
- **Custom Panels**: Apache ECharts scripts via volkovlabs-echarts-panel in `src/panels/browser_scripts/`
- **Versioning**: Auto-generated from git history or timestamp for dirty files

#### Documentation Site (VitePress)

- **Framework**: VitePress 2.0 (Vue-based static site generator)
- **Styling**: TailwindCSS 4.x with custom plugins
- **Assets**: ImageMagick-based optimization pipeline
- **Target**: DevOps engineers, tech leads, platform engineers

## Critical Constraints

- **Schema Evolution**: All database changes via golang-migrate migrations (see cdviz-db/AGENTS.md)
- **Event Standards**: Must conform to CDEvents specification in `cdevents-spec/`
- **Container-First**: All components designed for containerized deployment
- **DCO Compliance**: All commits require `git commit -s` sign-off
- **Generated Files**: Commit both source and generated output (TypeScript + JSON for dashboards)

## Quick Command Reference

**Monorepo-wide tasks** (run from root):

```bash
mise tasks --all                      # List all tasks
mise run '//...:ci'                   # Run CI in all components
```

**Component tasks** (examples):

```bash
# Documentation
mise run //cdviz-site:dev             # Start dev server
mise run //cdviz-site:build           # Production build

# Dashboards
mise run //cdviz-grafana:build        # Generate dashboards from TypeScript
mise run //cdviz-grafana:ci           # Full CI pipeline

# Database
mise run //cdviz-db:migrate:create    # Create new migration
mise run //cdviz-db:db-local:start    # Start local PostgreSQL with schema
mise run //cdviz-db:migrate:up        # Apply pending migrations

# Integration Testing
mise run //demos/stack-compose:up     # Docker Compose full stack
mise run //demos/stack-k8s:up         # Kubernetes deployment

# Helm Charts
mise run //charts/cdviz-collector:lint   # Lint chart
mise run //charts/cdviz-db:test          # Test chart in k8s cluster
```

## Resources

- **Project Overview & Architecture**: [README.md](README.md)
- **Development Setup & Commands**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Component-Specific Instructions**: [cdviz-db/AGENTS.md](cdviz-db/AGENTS.md), [cdviz-grafana/AGENTS.md](cdviz-grafana/AGENTS.md), [cdviz-site/AGENTS.md](cdviz-site/AGENTS.md)
- **Architecture Decisions**: [adr/](adr/) directory
- **Live Documentation**: [cdviz.dev](https://cdviz.dev)
- **CDEvents Specification**: [cdevents-spec/](cdevents-spec/) (git submodule)
