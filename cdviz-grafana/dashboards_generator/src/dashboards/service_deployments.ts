import {
  DataqueryBuilder,
  EditorMode,
} from "@grafana/grafana-foundation-sdk/bigquery";
import {
  CustomVariableBuilder,
  type Dashboard,
  DashboardBuilder,
  FieldColorModeId,
  PanelBuilder,
  ThresholdsMode,
  VariableHide,
} from "@grafana/grafana-foundation-sdk/dashboard";
import dedent from "dedent";
import { VolkovlabsTablePanelBuilder } from "../panels/volkovlabs_table_panel";
import { applyDefaults, DEFAULT_TAGS, newVariableOnDatasource } from "./utils";

const DATASOURCE = {
  type: "grafana-postgresql-datasource",
  // biome-ignore lint/suspicious/noTemplateCurlyInString: template for grafana
  uid: "${datasource}",
} as const;

function newSqlTarget(query: string) {
  return (
    new DataqueryBuilder()
      .datasource(DATASOURCE)
      .editorMode(EditorMode.Code)
      // @ts-expect-error
      .format("table")
      .rawQuery(true)
      .rawSql(query)
  );
}

function createCounterPanel(
  title: string,
  description: string,
  query: string,
  gridX: number,
): PanelBuilder {
  return new PanelBuilder()
    .title(title)
    .description(description)
    .type("stat")
    .datasource(DATASOURCE)
    .withTarget(newSqlTarget(query))
    .gridPos({ h: 4, w: 6, x: gridX, y: 0 })
    .fieldConfig({
      defaults: {
        unit: "short",
        color: { mode: FieldColorModeId.Fixed, fixedColor: "blue" },
        thresholds: {
          mode: ThresholdsMode.Absolute,
          // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
          steps: [{ value: null as any, color: "blue" }],
        },
      },
      overrides: [],
    });
}

function makeColumnItem(overrides: Record<string, unknown>) {
  return {
    aggregation: "none",
    appearance: {
      alignment: "start",
      background: { applyToRow: false },
      colors: {},
      header: { fontSize: "md" },
      width: { auto: true, min: 20 },
      wrap: false,
    },
    columnTooltip: "",
    edit: {
      editor: { type: "string" },
      enabled: false,
      permission: { mode: "", userRole: [] },
    },
    enabled: true,
    fileCell: { size: "md", text: "", variant: "primary" },
    filter: { enabled: false, mode: "client", variable: "" },
    footer: [],
    gauge: { mode: "basic", valueDisplayMode: "text", valueSize: 14 },
    group: false,
    label: "",
    newRowEdit: { editor: { type: "string" }, enabled: false },
    objectId: "",
    pin: "",
    preformattedStyle: false,
    scale: "auto",
    showingRows: 20,
    sort: { descFirst: false, enabled: false },
    type: "auto",
    ...overrides,
  };
}

function serviceDeploymentTableOptions() {
  return {
    isColumnManagerAvailable: false,
    nestedObjects: [],
    saveUserPreference: false,
    showFiltersInColumnManager: false,
    tables: [
      {
        actionsColumnConfig: {
          alignment: "start",
          fontSize: "md",
          label: "",
          width: { auto: false, value: 100 },
        },
        addRow: {
          enabled: false,
          permission: { mode: "", userRole: [] },
          request: { datasource: "", payload: {} },
        },
        deleteRow: {
          enabled: false,
          permission: { mode: "", userRole: [] },
          request: { datasource: "", payload: {} },
        },
        expanded: true,
        items: [
          makeColumnItem({
            field: { name: "timestamp", source: "A" },
            pin: "left",
            sort: { descFirst: true, enabled: false },
            appearance: {
              alignment: "start",
              background: { applyToRow: false },
              colors: {},
              header: { fontSize: "md" },
              width: { auto: true, min: 20, max: 200 },
              wrap: false,
            },
          }),
          makeColumnItem({
            field: { name: "service_id", source: "A" },
            label: "Service",
            filter: { enabled: true, mode: "client", variable: "" },
            appearance: {
              alignment: "start",
              background: { applyToRow: false },
              colors: {},
              header: { fontSize: "md" },
              width: { auto: true, min: 40 },
              wrap: true,
            },
          }),
          makeColumnItem({
            field: { name: "artifact_id", source: "A" },
            label: "Artifact",
            filter: { enabled: true, mode: "client", variable: "" },
            appearance: {
              alignment: "start",
              background: { applyToRow: false },
              colors: {},
              header: { fontSize: "md" },
              width: { auto: true, min: 40 },
              wrap: true,
            },
          }),
          makeColumnItem({
            field: { name: "environment_id", source: "A" },
            label: "Environment",
            filter: { enabled: true, mode: "client", variable: "" },
            appearance: {
              alignment: "start",
              background: { applyToRow: false },
              colors: {},
              header: { fontSize: "md" },
              width: { auto: true, min: 40 },
              wrap: false,
            },
          }),
          makeColumnItem({
            field: { name: "predicate", source: "A" },
            label: "Action",
            filter: { enabled: true, mode: "client", variable: "" },
            type: "coloredBackground",
            appearance: {
              alignment: "center",
              background: { applyToRow: false },
              colors: {},
              header: { fontSize: "md" },
              width: { auto: true, min: 80, max: 150 },
              wrap: false,
            },
          }),
        ],
        name: "Services",
        pagination: {
          defaultPageSize: 20,
          enabled: true,
          mode: "query",
          query: {
            offsetVariable: "offset",
            pageIndexVariable: "pageIndex",
            pageSizeVariable: "pageSize",
            totalCountField: {
              name: "count",
              source: "B",
            },
          },
        },
        rowHighlight: {
          backgroundColor: "transparent",
          columnId: "",
          enabled: false,
          scrollTo: "",
          smooth: false,
          variable: "",
        },
        showHeader: true,
        update: { datasource: "", payload: {} },
      },
    ],
    tabsSorting: false,
    toolbar: {
      alignment: "left",
      export: true,
      exportFormats: ["xlsx", "csv"],
    },
  };
}

export async function buildDashboard(): Promise<Dashboard> {
  const builder = applyDefaults(
    new DashboardBuilder("Service: Deployments").uid("service_deployments"),
  )
    .tags(["service"].concat(DEFAULT_TAGS))
    .withVariable(
      newVariableOnDatasource(
        dedent`
          SELECT DISTINCT payload -> 'subject' -> 'content' -> 'environment' ->> 'id'
          FROM cdviz.cdevents_lake
          WHERE subject = 'service'
            AND $__timeFilter(timestamp)
          ORDER BY 1
        `,
        "environments",
        "Environments",
      ),
    )
    .withVariable(
      newVariableOnDatasource(
        dedent`
          SELECT DISTINCT predicate
          FROM cdviz.cdevents_lake
          WHERE subject = 'service'
            AND $__timeFilter(timestamp)
          ORDER BY 1
        `,
        "predicates",
        "Actions",
      ),
    )
    .withVariable(
      new CustomVariableBuilder("pageSize")
        .description("Number of rows per page.")
        .hide(VariableHide.HideVariable)
        .current({ text: "20", value: "20" }),
    )
    .withVariable(
      new CustomVariableBuilder("pageIndex")
        .description(
          "Current page index (0-based), updated by the table panel.",
        )
        .hide(VariableHide.HideVariable)
        .current({ text: "0", value: "0" }),
    )
    .withVariable(
      new CustomVariableBuilder("offset")
        .description(
          "Row offset for pagination, derived from pageIndex * pageSize.",
        )
        .hide(VariableHide.HideVariable)
        .current({ text: "0", value: "0" }),
    );

  const commonWhereClause = dedent`
    WHERE $__timeFilter(timestamp)
      AND subject = 'service'
      AND predicate = ANY(ARRAY[\${predicates:sqlstring}]::text[])
      AND payload -> 'subject' -> 'content' -> 'environment' ->> 'id' = ANY(ARRAY[\${environments:sqlstring}]::text[])
  `;

  builder
    .withPanel(
      createCounterPanel(
        "Environments",
        "Distinct environments with service events in the selected time window and filters.",
        dedent`
          SELECT COUNT(DISTINCT payload -> 'subject' -> 'content' -> 'environment' ->> 'id') AS count
          FROM cdviz.cdevents_lake
          ${commonWhereClause}
        `,
        0,
      ),
    )
    .withPanel(
      createCounterPanel(
        "Services",
        "Distinct service IDs with events in the selected time window and filters.",
        dedent`
          SELECT COUNT(DISTINCT payload -> 'subject' ->> 'id') AS count
          FROM cdviz.cdevents_lake
          ${commonWhereClause}
        `,
        6,
      ),
    )
    .withPanel(
      createCounterPanel(
        "Artifacts",
        "Distinct artifact IDs deployed to services in the selected time window and filters.",
        dedent`
          SELECT COUNT(DISTINCT payload -> 'subject' -> 'content' ->> 'artifactId') AS count
          FROM cdviz.cdevents_lake
          ${commonWhereClause}
        `,
        12,
      ),
    )
    .withPanel(
      createCounterPanel(
        "Total Events",
        "Total number of service deployment events matching the selected time window and filters.",
        dedent`
          SELECT COUNT(*) AS count
          FROM cdviz.cdevents_lake
          ${commonWhereClause}
        `,
        18,
      ),
    );

  const tablePanel = new VolkovlabsTablePanelBuilder()
    .title("Service Deployments")
    .gridPos({ h: 24, w: 24, x: 0, y: 4 })
    .datasource(DATASOURCE)
    .withTarget(
      // Query A: paginated data
      new DataqueryBuilder()
        .datasource(DATASOURCE)
        .editorMode(EditorMode.Code)
        // @ts-expect-error
        .format("table")
        .rawQuery(true)
        .rawSql(dedent`
          SELECT
            timestamp,
            payload -> 'subject' ->> 'id' AS service_id,
            payload -> 'subject' -> 'content' ->> 'artifactId' AS artifact_id,
            payload -> 'subject' -> 'content' -> 'environment' ->> 'id' AS environment_id,
            predicate
          FROM cdviz.cdevents_lake
          ${commonWhereClause}
          ORDER BY timestamp DESC
          LIMIT \${pageSize}
          OFFSET \${offset}
        `),
    )
    .withTarget(
      // Query B: total count for pagination
      new DataqueryBuilder()
        .datasource(DATASOURCE)
        .editorMode(EditorMode.Code)
        // @ts-expect-error
        .format("table")
        .rawQuery(true)
        .rawSql(dedent`
          SELECT COUNT(*) AS count
          FROM cdviz.cdevents_lake
          ${commonWhereClause}
        `),
    );

  // Override options with service-specific column layout
  // biome-ignore lint/suspicious/noExplicitAny: VolkovlabsTablePanelBuilder options type is too narrow for custom config
  (tablePanel as any).options(serviceDeploymentTableOptions());

  // Value mappings for predicate badge colors
  tablePanel.fieldConfig({
    defaults: {},
    overrides: [
      {
        matcher: { id: "byName", options: "predicate" },
        properties: [
          {
            id: "mappings",
            value: [
              {
                type: "value",
                options: {
                  published: { color: "#5794f2", index: 0, text: "published" },
                  deployed: { color: "#73bf69", index: 1, text: "deployed" },
                  upgraded: { color: "#73bf69", index: 2, text: "upgraded" },
                  rollback: { color: "#fade2a", index: 3, text: "rollback" },
                  rolledback: {
                    color: "#fade2a",
                    index: 4,
                    text: "rolledback",
                  },
                  removed: { color: "#f2495c", index: 5, text: "removed" },
                },
              },
            ],
          },
        ],
      },
    ],
  });

  builder.withPanel(tablePanel);
  return builder.build();
}
