# Contributing

Every contribution is welcome!

## How to contribute

### Reporting bugs

If you found a bug, please open an [issue].

### Suggesting enhancements

If you have an idea for an enhancement, please open an [issue].

### Contributing documentation

If you want to contribute documentation, please open a pull request, and start a discussion on the PR.

### Contributing code

If you want to contribute code, please open an [issue] first to discuss what you want to do. Do not open a new [issue] to work on an existing [issue]. Then fork the repository, create a branch, and open a pull request.

## Development Setup

The repository is composed of multiple subfolders / modules, each with their own `.mise.toml` configuration.

### Prerequisites

- [mise-en-place](https://mise.jdx.dev/) to download tools, setup local environment (tools, environment variables) and to run the tasks
- [docker](https://docs.docker.com/get-started/) to run the containers and to execute some tests.
  To build the container locally you have to configure the container image store
  (see [Multi-platform | Docker Docs](https://docs.docker.com/build/building/multi-platform/#prerequisites)
  & [containerd image store | Docker Docs](https://docs.docker.com/engine/storage/containerd/))

### General Commands

All development commands are managed through `mise` configuration files (`.mise.toml`) in each component directory.

```bash
cd {{subfolder}}
mise install          # Install dependencies for the component

# to have list of tasks
mise tasks

# to run a task
mise run {{task}}

# to run the CI tasks
mise run ci
```

## Component-Specific Development

### Site Documentation (cdviz-site/)
```bash
cd cdviz-site
mise install          # Install dependencies (bun, biome)
mise run dev           # Start development server (bun run docs:dev)
mise run build         # Build for production (bun run docs:build)
mise run preview       # Preview built site
mise run format        # Format code with biome
```

### Grafana Dashboards (cdviz-grafana/)
```bash
cd cdviz-grafana
mise install                    # Install dependencies (yq, bun, biome)
mise run build                  # Build and normalize dashboards
mise run build:dashboards       # Generate dashboards from TypeScript
mise run check                  # Lint with TypeScript and biome
mise run test                   # Run tests with bun
mise run format                 # Format code
mise run ci                     # Run all CI tasks
```

### Database Management (cdviz-db/)
```bash
cd cdviz-db
mise install                    # Install Atlas
mise run plan                   # Create migration for schema changes
mise run apply                  # Apply migrations to local database
mise run db-local:start         # Start PostgreSQL container with migrations
mise run db-local:start-empty   # Start empty PostgreSQL container
mise run db-local:stop          # Stop PostgreSQL container
mise run db-local:psql          # Connect to database with psql
mise run test                   # Test database setup
mise run ci                     # Run CI tasks
```

### Charts Management (charts/)
```bash
cd charts
mise install                    # Install helm, kubectl
mise run lint:cdviz-collector   # Lint collector chart
mise run lint:cdviz-db          # Lint database chart
mise run lint:cdviz-grafana     # Lint grafana chart
mise run publish                # Publish all charts to OCI registry
mise run ci                     # Run all CI tasks
```

### Demo Environment (demos/)
```bash
cd demos
mise install                    # Install dependencies (kubectl, ctlptl, kind, helmwave)

# Docker Compose stack
mise run stack:compose:up       # Start compose demo
mise run stack:compose:down     # Stop compose demo
mise run stack:compose:delete   # Remove compose demo and data

# Kubernetes stack
mise run stack:k8s:create       # Create kind cluster
mise run stack:k8s:deploy       # Deploy full cdviz stack
mise run stack:k8s:delete       # Delete cluster and resources

# Port forwarding
mise run stack:k8s:port-forward:grafana      # Access Grafana at localhost:3000
mise run stack:k8s:port-forward:cdviz-db     # Access database at localhost:5432
mise run stack:k8s:port-forward:cdviz-collector # Access collector at localhost:8080

# Use cases and testing
mise run use_cases:run          # Run collector with sample events
```

## Development Workflow

1. **Prerequisites**: Install mise-en-place (see above)
2. **Component Development**: Each subdirectory has `.mise.toml` with specific tasks
3. **Database Changes**: Use `mise run plan` in cdviz-db/ to create migrations
4. **Dashboard Updates**: Modify TypeScript in `cdviz-grafana/dashboards_generator/src/`, then `mise run build`
5. **Documentation**: Update VitePress content in `cdviz-site/src/`, then `mise run build`
6. **Testing**: Use `mise run ci` in each component for full CI pipeline
7. **Local Stack**: Use `demos/` directory for full integration testing

## How to test

```bash
cd {{subfolder}}
mise run test
```

## Important File Locations

- `cdevents-spec/`: CDEvents specification and conformance tests
- `demos/use_cases/`: Sample event data and transformer configurations
- `cdviz-db/src/schema.sql`: Database schema definition
- `cdviz-db/migrations/`: Atlas migration files
- `cdviz-grafana/dashboards/`: Generated Grafana dashboard JSON
- `cdviz-grafana/dashboards_generator/src/`: TypeScript dashboard generation code
- `charts/`: Helm charts for all components
- `demos/stack-compose/docker-compose.yaml`: Local development stack
- `demos/stack-k8s/helmwave.yml`: Kubernetes deployment configuration

## Key Development Patterns

- **Direct Database Access**: Dashboards query PostgreSQL directly rather than through APIs
- **Event-Driven Architecture**: All data flows through CDEvents specification
- **Multi-Component Monorepo**: Each component maintains separate mise configuration
- **Schema-First Database**: Atlas manages all database changes through migrations
- **Generated Dashboards**: Grafana dashboards created programmatically from TypeScript
- **Container-First Development**: All components designed for containerized deployment

## How to release

???

[issue]: https://github.com/cdviz-dev/issues "CDviz issues"
