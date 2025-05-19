import {
  type DashboardBuilder,
  DatasourceVariableBuilder,
  QueryVariableBuilder,
  VariableRefresh,
  VariableSort,
} from "@grafana/grafana-foundation-sdk/dashboard";

export const DEFAULT_TAGS = []; //["cdviz"];
export const DEFAULT_TIMEWINDOW = { from: "now-7d", to: "now" };
export const DEFAULT_TIMEZONE = "browser";

export function applyDefaults(
  dashboardBuilder: DashboardBuilder,
): DashboardBuilder {
  return (
    dashboardBuilder
      .tags(DEFAULT_TAGS)
      //.refresh('1m')
      .time(DEFAULT_TIMEWINDOW)
      .timezone(DEFAULT_TIMEZONE)
      .withVariable(newVariable4datasource())
  );
}

export function newVariable4datasource() {
  return new DatasourceVariableBuilder("datasource")
    .type("grafana-postgresql-datasource")
    .regex("cdviz.*")
    .multi(false)
    .includeAll(false);
}

export function newVariableOnDatasource(
  querySql: string,
  name: string,
  label: string | undefined,
) {
  return (
    new QueryVariableBuilder(name)
      .label(label || name)
      .datasource({
        type: "grafana-postgresql-datasource",
        uid: "${datasource}",
      })
      .query(querySql.trim())
      .sort(VariableSort.Disabled)
      //.refresh(VariableRefresh.OnDashboardLoad)
      .refresh(VariableRefresh.OnTimeRangeChanged)
      .multi(true)
      .includeAll(true)
      .current({ text: "All", value: "$__all" })
  );
  //FIXE uncomment after update of lib
  //.allowCustomValue(true)
}
