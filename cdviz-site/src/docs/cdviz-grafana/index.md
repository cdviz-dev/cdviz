# CDviz Grafana

CDviz Grafana provides pre-built dashboards that visualize CDEvents collected by the CDviz Collector. It surfaces DORA metrics, deployment timelines, artifact history, and incident tracking without any manual dashboard configuration.

> [!TIP] Online Demo
> Explore a live read-only instance of the CDviz Grafana dashboards at
> **[demo.cdviz.dev/grafana](https://demo.cdviz.dev/grafana)** — no installation required.

> [!NOTE]
> Dashboards, panels and SQL queries are provided for Grafana, but they can be adapted to your favorite dashboards & analytics system.

## Overview

CDviz Grafana provides a comprehensive visualization layer for continuous delivery metrics and events:

- Delivers real-time visualization and monitoring of SDLC data through customized Grafana dashboards and alerts
- Functions as the primary visualization interface for events (CDEvents) stored in CDviz Database
- Enables creation of tailored dashboards for specific monitoring requirements
- Enhances runtime metrics with deployment context (such as component versions)

![Dashboard overview](/screenshots/grafana_dashboards-20250606_2100.png)

## Installation

### Requirements

- Grafana version: 12+
- Required Grafana Plugins:
  - **volkovlabs-echarts-panel**
  - **volkovlabs-form-panel**
  - **volkovlabs-table-panel**
  - **cdviz-executiontable-panel** (custom unsigned plugin — install from [GitHub releases](https://github.com/cdviz-dev/cdviz-executiontable-panel/releases))
- Database credentials with read access to a CDviz Database instance

### Manual Installation

1. Install the required plugins and allow loading unsigned plugins (`cdviz-executiontable-panel`) via `GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=cdviz-executiontable-panel`
2. Create a PostgreSQL datasource in Grafana to connect to the CDviz Database:
   - Type: `grafana-postgresql-datasource`
   - Name: `cdviz-...` (the cdviz prefix is used for datasource identification in dashboards)
   - TimescaleDB: `enabled`
3. Import dashboards by copying JSON definitions from the [CDviz GitHub repository](https://github.com/cdviz-dev/cdviz/tree/main/cdviz-grafana/dashboards)

Available dashboards:

| Dashboard                                          | Description                                                           |
| -------------------------------------------------- | --------------------------------------------------------------------- |
| [Artifact Timeline](./artifact_timeline.md)        | Deployment and version tracking across environments                   |
| [Execution Performance](./execution_dashboards.md) | Pipeline runs, task executions, and test results                      |
| [DORA Metrics](./dora_metrics.md)                  | Deployment frequency, lead time, time to restore, change failure rate |
| [Incidents & Tickets](./incidents_tickets.md)      | Open incidents, MTTR, and change cycle time                           |
| [CDEvents Activity](./cdevents_activity.md)        | Raw CDEvent stream and activity overview                              |

### Kubernetes Deployment with Helm

1. Configure Grafana according to the requirements specified above
2. Enable dashboard and datasource provisioning via sidecars:

   ::: details Grafana Helm Chart Configuration

   ```yaml
   # https://grafana.com/docs/grafana/latest/setup-grafana/installation/helm/
   #

   # Configuration override with environment variables
   # https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#override-configuration-with-environment-variables
   env:
     # Allow loading unsigned plugins (required for cdviz-executiontable-panel)
     GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS: "cdviz-executiontable-panel"
     # Pre-install plugins (Grafana 12+). Format: <id>[@<version>[@<url>]]
     GF_PLUGINS_PREINSTALL_SYNC: "volkovlabs-echarts-panel,volkovlabs-form-panel,volkovlabs-table-panel,cdviz-executiontable-panel@1.2.2@https://github.com/cdviz-dev/cdviz-executiontable-panel/releases/download/v1.2.2/cdviz-executiontable-panel-1.2.2.zip"

   # Sidecar configuration for dashboard and datasource provisioning
   sidecar:
     dashboards:
       enabled: true
       searchNamespace: ALL
       label: grafana_dashboard
       labelValue: "1"
     datasources:
       enabled: true
       searchNamespace: ALL
       label: grafana_datasource
       labelValue: "1"
   ```

   :::

3. Configure the datasource either manually or by creating a values.yaml file for the CDviz Grafana chart:

   ```yaml
   datasources:
     enabled: true
     definitions:
       cdviz-db:
         enabled: true
         type: grafana-postgresql-datasource
         access: proxy
         # Environment variable injection syntax
         url: "$CDVIZ_RO_POSTGRES_HOST:$CDVIZ_RO_POSTGRES_PORT_NUMBER"
         user: "$CDVIZ_RO_POSTGRES_USER"
         secureJsonData:
           password: "$CDVIZ_RO_POSTGRES_PASSWORD"
         jsonData:
           database: "$CDVIZ_RO_POSTGRES_DB"
           sslmode: "require" # Options: disable/require/verify-ca/verify-full
           maxOpenConns: 100
           maxIdleConns: 100
           maxIdleConnsAuto: true
           connMaxLifetime: 14400
           postgresVersion: 1600 # 903=9.3, 1000=10, 1500=15, 1600=16
           timescaledb: true
   ```

4. Deploy using the Helm chart:

   ```bash
   helm upgrade cdviz-grafana \
        oci://ghcr.io/cdviz-dev/charts/cdviz-grafana \
        --install \
        --create-namespace \
        --namespace cdviz
   ```

## Contributing

Contributions to CDviz Grafana dashboards are welcomed. For new dashboard ideas, panel enhancements, or other improvements, please submit an issue or pull request to our [GitHub repository](https://github.com/cdviz-dev/cdviz).

### Dashboard Design Guidelines

- Include a datasource selection variable (default prefix: `cdviz-`)
- Maintain consistent naming conventions with the `cdviz-` prefix for datasource references
- Set appropriate default time ranges (e.g., `Last 7 days` or `Last 30 days`)
- Utilize the Grafana Foundation SDK with TypeScript for dashboard generation (see [dashboard generator code](https://github.com/cdviz-dev/cdviz/tree/main/cdviz-grafana/dashboards_generator))
- Prioritize standard Grafana panels and officially supported plugins listed in the requirements section

## License

All dashboards, panels, and SQL queries are licensed under the [Apache Software License 2.0](https://github.com/cdviz-dev/cdviz/blob/main/LICENSE).
