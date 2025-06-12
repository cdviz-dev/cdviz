# cdviz-grafana

> [!IMPORTANT]
> CDviz is in **alpha / preview** stage.

Some dashboards and panels are provided for Grafana, but can be adapted to your favorite dashboards & analytics system.

## Overview

- Provides real-time visualization and monitoring of SDLC data through Grafana dashboards & alerts
- Serves as the primary visualization layer for events (CDEvents) stored in cdviz-db
- Allows creation of custom dashboards for specific monitoring needs
- Allows to enhance your runtime metrics with deployment information (by example version of components)

![list of dashboars](/screenshots/grafana_dashboards-20250606_2100.png)

## Installation

### Requirements
- Grafana version: 11+
- Grafana Plugins:
  - **marcusolsson-dynamictext-panel** (require to disable sanitize html in grafana)
  - **volkovlabs-form-panel**
  - **volkovlabs-table-panel**
- Credentials with read access to a cdviz-db

### Manual Installation

1. Configure grafana to follow the requirements above (plugins,...)
2. In Grafana, create a datasource to access cdviz-db
    - type: `grafana-postgresql-datasource`
    - name: `cdviz-...` (the cdviz prefix is used to filter datasource in dashboards)
    - timescaledb: `enabled`
3. In Grafana, import dashboards by copy/paste json from <https://github.com/cdviz-dev/cdviz/tree/main/cdviz-grafana/dashboards>

### Installation / Provisioning in Kubernetes via Helm

1. Configure grafana to follow the requirements above (plugins,...)
2. Configure grafana to accept provisionning of dashboard & datasources by sidecars

    ::: details toggle to see part of values.yaml for grafana helm chart
    ```yaml
    # https://grafana.com/docs/grafana/latest/setup-grafana/installation/helm/
    #

    # [Override configuration with environment variables](https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/#override-configuration-with-environment-variables)
    # To override an option, use a predefined pattern GF_<SectionName>_<KeyName>.
    env:
      GF_PANELS_DISABLE_SANITIZE_HTML: "true" # Allow html, svg, ... into dynamic/business text,...

    plugins:
        - marcusolsson-dynamictext-panel
        - volkovlabs-form-panel
        - volkovlabs-table-panel

    # configure Grafana to use sidecars
    # to load the dashboards and datasources, from the cdviz namespace.
    # you can login with default credentials: admin/admin, but you can enable
    # anonymous as admin with the following env configuration
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

3. Create the datasource manually OR create a values.yaml with configuration for the chart cdviz-grafana

    ```yaml
    datasources:
      enabled: true
      definitions:
        cdviz-db:
          enabled: true # enable/disable the datasource
          type: grafana-postgresql-datasource
          access: proxy
          # Use the syntax "$..." to inject the values from the grafana environment
          # Secrets could be used to define grafana environment
          url: "$CDVIZ_DASHBOARDS_POSTGRES_HOST"
          user: "$CDVIZ_DASHBOARDS_POSTGRES_USER"
          secureJsonData:
            password: "$CDVIZ_DASHBOARDS_POSTGRES_PASSWORD"
          jsonData:
            database: "$CDVIZ_DASHBOARDS_POSTGRES_DB"
            sslmode: "require" # disable/require/verify-ca/verify-full
            maxOpenConns: 100 # Grafana v5.4+
            maxIdleConns: 100 # Grafana v5.4+
            maxIdleConnsAuto: true # Grafana v9.5.1+
            connMaxLifetime: 14400 # Grafana v5.4+
            postgresVersion: 1500 # 903=9.3, 904=9.4, 905=9.5, 906=9.6, 1000=10
            timescaledb: true
    ```

4. Provision dashboards & datasource (if enabled) by installing the helm chart from <https://github.com/cdviz-dev/cdviz/pkgs/container/charts%2Fcdviz-grafana>

   ```bash
   helm upgrade cdviz-grafana \
        oci://ghcr.io/cdviz-dev/charts/cdviz-grafana \
        --install \
        --create-namespace \
        --namespace cdviz
   ```

## Contributing

We welcome contributions to the CDviz Grafana dashboards. If you have ideas for new dashboards, panels, or improvements, please open an issue or submit a pull request on our [GitHub repository](https://github.com/cdviz-dev/cdviz)

### Rules about dashboards

- Provide a variable to select the datasource (eg `cdviz-db`)
- Use the `cdviz-` prefix for the datasource name
- Prefer to predefine the time range as `Last 7 days` or `Last 30 days`.
- Prefer to generate dashboards from code, using the grafana foundation SDK + Typescript (see <https://github.com/cdviz-dev/cdviz/tree/main/cdviz-grafana/dashboards_generator>)
- Prefer to use grafana panels or the already listed plugins in the requirements section. **marcusolsson-dynamictext-panel** is very flexible and could avoid to create a new plugin (eg, we use it to render D3js chart), see [Business Text | Volkov Labs](https://volkovlabs.io/plugins/business-text/)

## License

Dashboards, panels, sql queries are under [Apache Sofware License 2.0](https://github.com/cdviz-dev/cdviz/blob/main/LICENSE).
