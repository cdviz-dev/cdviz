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
  RowBuilder,
  VariableHide,
} from "@grafana/grafana-foundation-sdk/dashboard";
import dedent from "dedent";
import { buildjsForD3Panel, D3PanelBuilder } from "../panels/d3_panel";
import { VolkovlabsTablePanelBuilder } from "../panels/volkovlabs_table_panel";
import { applyDefaults, DEFAULT_TAGS, newVariableOnDatasource } from "./utils";

export async function buildDashboard(): Promise<Dashboard> {
  const script_sunburst = await buildjsForD3Panel([
    "./src/panels/browser_scripts/draw_sunburst_count_per_path.ts",
  ]);
  const datasource = {
    type: "grafana-postgresql-datasource",
    // biome-ignore lint/suspicious/noTemplateCurlyInString: template for grafana
    uid: "${datasource}",
  };
  const builder = applyDefaults(
    new DashboardBuilder("CDEvents Activity").uid("cdevents_activity"),
  )
    .tags(["cdevents"].concat(DEFAULT_TAGS))
    .withVariable(newVariable4Subject())
    .withVariable(newVariable4Predicate())
    .withVariable(
      new CustomVariableBuilder("pageSize")
        .description("Page order number. Specify as a dashboard variable name.")
        .hide(VariableHide.HideVariable)
        .current({
          text: "10",
          value: "10",
        }),
    )
    .withVariable(
      new CustomVariableBuilder("offset")
        .description(
          "How many rows to skip starting from the first. Specify as a dashboard variable name.",
        )
        .hide(VariableHide.HideVariable)
        .current({
          text: "0",
          value: "0",
        }),
    )
    .withPanel(
      new D3PanelBuilder()
        .title("How many events?")
        .description("Count by Subject & Predicate over the time window")
        .gridPos({
          h: 8,
          w: 6,
          x: 0,
          y: 0,
        })
        .datasource(datasource)
        .withTarget(
          new DataqueryBuilder()
            .datasource(datasource)
            .editorMode(EditorMode.Code)
            // @ts-expect-error
            .format("table")
            .rawQuery(true)
            .rawSql(dedent`
              SELECT
                COUNT(*) as count,
                subject || '/' || predicate as path
              FROM cdviz.cdevents_lake
              WHERE $__timeFilter(timestamp)
                AND subject = ANY(ARRAY[\${subjects:sqlstring}]::text[])
                AND predicate = ANY(ARRAY[\${predicates:sqlstring}]::text[])
              GROUP BY subject, predicate
              ORDER BY subject, predicate
          `),
        )
        .script(script_sunburst),
    )
    .withPanel(
      new PanelBuilder()
        .title("Events By Hours")
        .gridPos({
          h: 8,
          w: 12,
          x: 6,
          y: 0,
        })
        .type("timeseries")
        .unit("bps")
        .min(0)
        .withTarget(
          new DataqueryBuilder()
            .datasource(datasource)
            .editorMode(EditorMode.Code)
            // @ts-expect-error
            .format("table")
            .rawQuery(true)
            .rawSql(dedent`
              SELECT
                time_bucket('1 hour', timestamp) AS time,
                (subject || '/' || predicate) AS kind,
                COUNT(*)
              FROM cdviz.cdevents_lake
              WHERE $__timeFilter(timestamp)
                AND subject = ANY(ARRAY[\${subjects:sqlstring}]::text[])
                AND predicate = ANY(ARRAY[\${predicates:sqlstring}]::text[])
              GROUP BY time, kind
              ORDER BY time, kind
            `),
        )
        .transformations([
          {
            id: "partitionByValues",
            options: {
              fields: ["kind"],
              keepFields: false,
              naming: {
                asLabels: true,
              },
            },
          },
        ])
        .options({
          legend: {
            calcs: ["sum"],
            displayMode: "table",
            placement: "right",
            showLegend: true,
          },
          tooltip: {
            hideZeros: false,
            mode: "single",
            sort: "none",
          },
        })
        .defaults({
          color: {
            mode: FieldColorModeId.PaletteClassic,
          },
          custom: {
            // "axisBorderShow": false,
            // "axisCenteredZero": false,
            // "axisColorMode": "text",
            // "axisLabel": "",
            // "axisPlacement": "auto",
            // "barAlignment": 0,
            barWidthFactor: 0.5,
            drawStyle: "bars",
            fillOpacity: 49,
            // "gradientMode": "none",
            // "hideFrom": {
            //   "legend": false,
            //   "tooltip": false,
            //   "viz": false
            // },
            // "insertNulls": false,
            // "lineInterpolation": "linear",
            // "lineWidth": 1,
            // "pointSize": 5,
            // "scaleDistribution": {
            //   "type": "linear"
            // },
            // "showPoints": "auto",
            // "spanNulls": false,
            // "stacking": {
            //   "group": "A",
            //   "mode": "normal"
            // },
            // "thresholdsStyle": {
            //   "mode": "off"
            // }
          },
          // "fieldMinMax": true,
          // "mappings": [],
          // "thresholds": {
          //   "mode": "absolute",
          //   "steps": [
          //     {
          //       "color": "green"
          //     },
          //     {
          //       "color": "red",
          //       "value": 80
          //     }
          //   ]
          // }
        }),
    )
    .withPanel(
      new D3PanelBuilder()
        .title("How many sources?")
        .description("Count by Context'source over the time window")
        .gridPos({
          h: 8,
          w: 6,
          x: 18,
          y: 0,
        })
        .datasource(datasource)
        .withTarget(
          new DataqueryBuilder()
            .datasource(datasource)
            .editorMode(EditorMode.Code)
            // @ts-expect-error
            .format("table")
            .rawQuery(true)
            .rawSql(dedent`
              SELECT
                COUNT(*) as count,
                "payload" -> 'context' ->> 'source' as "path"
              FROM cdviz.cdevents_lake
              WHERE $__timeFilter(timestamp)
                AND subject = ANY(ARRAY[\${subjects:sqlstring}]::text[])
                AND predicate = ANY(ARRAY[\${predicates:sqlstring}]::text[])
              GROUP BY path
              ORDER BY path
            `),
        )
        .script(script_sunburst),
    )
    .withRow(new RowBuilder("Details") /*.collapsed(true)*/)
    .withPanel(
      new VolkovlabsTablePanelBuilder()
        .title("Events Logs")
        .gridPos({
          h: 20,
          w: 24,
          x: 0,
          y: 8,
        })
        .datasource(datasource)
        .withTarget(
          new DataqueryBuilder()
            .datasource(datasource)
            .editorMode(EditorMode.Code)
            // @ts-expect-error
            .format("table")
            .rawQuery(true)
            .rawSql(dedent`
          SELECT
            "timestamp",
            "subject",
            "predicate",
            "payload" -> 'subject' as "payload_subject",
            "payload" -> 'context' as "payload_context",
            "payload" -> 'customData' as "payload_custom",
            "imported_at"
          FROM
            cdviz.cdevents_lake
          WHERE
            $__timeFilter(timestamp)
            AND subject = ANY(ARRAY[\${subjects:sqlstring}]::text[])
            AND predicate = ANY(ARRAY[\${predicates:sqlstring}]::text[])
          ORDER BY
            imported_at DESC
          LIMIT
            \${pageSize}
          OFFSET
            \${offset}
        `),
        ),
    );
  return builder.build();
}

export function newVariable4Subject() {
  return newVariableOnDatasource(
    dedent`
      SELECT DISTINCT "subject"
      FROM cdviz."cdevents_lake"
      WHERE $__timeFilter(imported_at)
        AND "subject" LIKE '$__searchFilter'
    `,
    "subjects",
    "Subjects",
  );
}

export function newVariable4Predicate() {
  return newVariableOnDatasource(
    dedent`
      SELECT DISTINCT "predicate"
      FROM cdviz."cdevents_lake"
      WHERE $__timeFilter(imported_at)
        AND "predicate" LIKE '$__searchFilter'
        AND "subject" = ANY(ARRAY[\${subjects:sqlstring}]::text[])
    `,
    "predicates",
    "Predicates",
  );
}
