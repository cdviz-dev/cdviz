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

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **cdviz** (3011 symbols, 3934 relationships, 33 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/cdviz/context` | Codebase overview, check index freshness |
| `gitnexus://repo/cdviz/clusters` | All functional areas |
| `gitnexus://repo/cdviz/processes` | All execution flows |
| `gitnexus://repo/cdviz/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
