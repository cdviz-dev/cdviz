# Demos

This folder contains demos for CDviz.

All commands are run from this folder via `mise` (look at `./.mise.toml` for more details).

```bash
❯ mise tasks
Name                                    Description
ci                                      Run all the ci tasks
clean                                   Clean / Delete every stacks
example_01:run                          Launch cdviz-collector cli with content (data & configuration) of the example_01 folder
stack:compose:delete                    Stop & remove the docker compose demo (and local data)
stack:compose:down                      Stop the docker compose demo
stack:compose:up                        Launch the docker compose demo (in foreground)
stack:db-admin:view                     Open the db-admin UI, adminer (compose demo)
stack:grafana:view                      Open the Grafana dashboard (compose demo, k8s demo (after port-forward))
stack:k8s:check                         check the helwave config to deploy the stack
stack:k8s:create                        Create a k8s cluster (kind)
stack:k8s:delete                        Delete a k8s cluster (kind) and its resources
stack:k8s:delete:cdviz                  Delete cdviz stack (cdviz-collector, cdviz-db) on a k8s cluster
stack:k8s:delete:integration            Delete the integrations app (kubewatch,...) on a k8s cluster
stack:k8s:delete:pre-req                Delete the pre-requirement for cdviz (postgresql, grafana, ...) on a k8s cluster
stack:k8s:deploy                        Deploy all the resources (pre-req, cdviz, integrations,...) on a k8s cluster
stack:k8s:deploy:cdviz                  Deploy cdviz stack (cdviz-collector, cdviz-db) on a k8s cluster
stack:k8s:deploy:integration            Deploy the integrations app (kubewatch,...) on a k8s cluster
stack:k8s:deploy:pre-req                Deploy the pre-requirement for cdviz (postgresql, grafana, ...) on a k8s cluster
stack:k8s:port-forward:cdviz-collector  Port-forward the cdviz-collector to localhost:8080
stack:k8s:port-forward:cdviz-db         Port-forward the PostgreSQL database to localhost:5432
stack:k8s:port-forward:grafana          Port-forward the Grafana dashboard to localhost:3000
stask:k8s:show:grafana:admin-password   Show the Grafana admin password
```

## Stack Compose

This demo is launched via a Docker Compose demo environment:

- PostgreSQL database + CDviz schema database (migrations)
- Adminer: to manage the PostgreSQL database
- Grafana: to visualize the data

Currently, the [`cdviz-collector`] is not launched as part of the docker compose, but it should be launched manually from the host (e.g. via `mise run example_01:run`).
The [`cdviz-collector`] executable is downloaded from the [release page](https://github.com/cdviz-dev/cdviz-collector/releases) by `mise`.

```bash
mise run stack:compose:up
mise run example_01:run
#...
mise run stack:grafana:view
#...
mise run stack:compose:delete
```

## Stack K8s

This demo is launched via a local Kubernetes environment, that should reproduce a more realistic setup:

- Pre-requisites for the cdviz full stack
  - PostgreSQL database (via [CloudNativePG](https://cloudnative-pg.io/))
  - Grafana
- CDviz full stack
  - `cdviz-collector`: to collect the data and send them the `cdviz-db`
  - `cdviz-db`: to store the data (PostgreSQL)
  - `cdviz-grafana`: a set of dashboards to visualize the data (Grafana)
- Integrations (to test the integrations with 3rd party services)
  - [Kubewatch](https://github.com/robusta-dev/kubewatch): to watch the k8s cluster'events

```bash
mise run stack:k8s:create
mise run stack:k8s:deploy:pre-req
mise run stack:k8s:deploy:cdviz
mise run stack:k8s:deploy:integration
#...
mise run stack:k8s:port-forward:grafana
mise run stack:grafana:view
#...
mise run stack:k8s:delete
```

  [`cdviz-collector`] <https://github.com/cdviz-dev/cdviz-collector>
