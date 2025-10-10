# Contributing

Every contribution is welcome!

By contributing to this project, you agree to the [Contributor License Agreement (CLA)](https://cla-assistant.io/cdviz-dev/cdviz).

## How to contribute

### Reporting bugs

If you found a bug, please open an [issue].

### Suggesting enhancements

If you have an idea for an enhancement, please open an [issue].

### Contributing documentation

If you want to contribute documentation, please open a pull request, and start a discussion on the PR.

### Contributing code

If you want to contribute code, please open an [issue] first to discuss what you want to do. Do not open a new [issue] to work on an existing [issue]. Then fork the repository, create a branch, and open a pull request.

1. Fork the repository.
2. Create a branch for your changes.
3. Commit with `git commit -s` to sign off your work.
4. Submit a pull request.

All contributions must include a `Signed-off-by` line.

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
mise tasks --all

# to run a task
mise run {{task}}

# to run the CI tasks
mise run '//...:ci'
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
mise run :test
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
