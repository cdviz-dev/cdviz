# CDViz Grafana

> [!IMPORTANT]
> CDViz is currently in **alpha / preview** stage.

> [!NOTE]
> Dashboards, panels and SQL queries are provided for Grafana, but they can be adapted to your favorite dashboards & analytics system.

## Overview

CDViz Grafana provides a comprehensive visualization layer for continuous delivery metrics and events:

- Delivers real-time visualization and monitoring of SDLC data through customized Grafana dashboards and alerts
- Functions as the primary visualization interface for events (CDEvents) stored in CDViz Database
- Enables creation of tailored dashboards for specific monitoring requirements
- Enhances runtime metrics with deployment context (such as component versions)

![Dashboard overview](/screenshots/grafana_dashboards-20250606_2100.png)

## Installation

### Requirements

- Grafana version: 11+
- Required Grafana Plugins:
  - **marcusolsson-dynamictext-panel** (requires HTML sanitization to be disabled in Grafana)
  - **volkovlabs-form-panel**
  - **volkovlabs-table-panel**
- Database credentials with read access to a CDViz Database instance

### Manual Installation

1. Configure Grafana according to the requirements above (plugins and settings)
2. Create a PostgreSQL datasource in Grafana to connect to the CDViz Database:
    - Type: `grafana-postgresql-datasource`
    - Name: `cdviz-...` (the cdviz prefix is used for datasource identification in dashboards)
    - TimescaleDB: `enabled`
3. Import dashboards by copying JSON definitions from the [CDViz GitHub repository](https://github.com/cdviz-dev/cdviz/tree/main/cdviz-grafana/dashboards)

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
      GF_PANELS_DISABLE_SANITIZE_HTML: "true" # Required for dynamic/business text rendering

    plugins:
        - marcusolsson-dynamictext-panel
        - volkovlabs-form-panel
        - volkovlabs-table-panel

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

3. Configure the datasource either manually or by creating a values.yaml file for the CDViz Grafana chart:

    ```yaml
    datasources:
      enabled: true
      definitions:
        cdviz-db:
          enabled: true
          type: grafana-postgresql-datasource
          access: proxy
          # Environment variable injection syntax
          url: "$CDVIZ_DASHBOARDS_POSTGRES_HOST"
          user: "$CDVIZ_DASHBOARDS_POSTGRES_USER"
          secureJsonData:
            password: "$CDVIZ_DASHBOARDS_POSTGRES_PASSWORD"
          jsonData:
            database: "$CDVIZ_DASHBOARDS_POSTGRES_DB"
            sslmode: "require" # Options: disable/require/verify-ca/verify-full
            maxOpenConns: 100
            maxIdleConns: 100
            maxIdleConnsAuto: true
            connMaxLifetime: 14400
            postgresVersion: 1500 # 903=9.3, 904=9.4, 905=9.5, 906=9.6, 1000=10
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

Contributions to CDViz Grafana dashboards are welcomed. For new dashboard ideas, panel enhancements, or other improvements, please submit an issue or pull request to our [GitHub repository](https://github.com/cdviz-dev/cdviz).

### Dashboard Design Guidelines

- Include a datasource selection variable (default prefix: `cdviz-`)
- Maintain consistent naming conventions with the `cdviz-` prefix for datasource references
- Set appropriate default time ranges (e.g., `Last 7 days` or `Last 30 days`)
- Utilize the Grafana Foundation SDK with TypeScript for dashboard generation (see [dashboard generator code](https://github.com/cdviz-dev/cdviz/tree/main/cdviz-grafana/dashboards_generator))
- Prioritize standard Grafana panels and officially supported plugins listed in the requirements section
  - Note: The **marcusolsson-dynamictext-panel** plugin offers significant flexibility for custom visualizations (e.g., D3.js charts) without requiring additional plugins. See [Business Text documentation](https://volkovlabs.io/plugins/business-text/)

## License

All dashboards, panels, and SQL queries are licensed under the [Apache Software License 2.0](https://github.com/cdviz-dev/cdviz/blob/main/LICENSE).
