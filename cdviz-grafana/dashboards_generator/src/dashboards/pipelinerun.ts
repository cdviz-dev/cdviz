import {
  DataqueryBuilder,
  EditorMode,
} from "@grafana/grafana-foundation-sdk/bigquery";
import {
  ConstantVariableBuilder,
  type Dashboard,
  DashboardBuilder,
  RowBuilder,
} from "@grafana/grafana-foundation-sdk/dashboard";
import dedent from "dedent";
import { D3PanelBuilder, buildjsForD3Panel } from "../panels/d3_panel";
import { applyDefaults, newVariableOnDatasource } from "./utils";

export async function buildDashboard(): Promise<Dashboard> {
  const script = await buildjsForD3Panel([
    "./src/panels/browser_scripts/draw_barchart_double.ts",
  ]);
  const datasource = {
    type: "grafana-postgresql-datasource",
    uid: "${datasource}",
  };
  const builder = applyDefaults(
    new DashboardBuilder("Pipeline Run").uid("pipelinerun"),
  )
    .withVariable(newVariable4Pipeline())
    .withVariable(new ConstantVariableBuilder("limit").value("20"))
    .withRow(new RowBuilder("Latest $limit Pipeline Runs"))
    .withPanel(
      new D3PanelBuilder()
        .title("$pipeline_names")
        .repeat("pipeline_names")
        .repeatDirection("h")
        .maxPerRow(2)
        .datasource(datasource)
        .withTarget(
          new DataqueryBuilder()
            .datasource(datasource)
            .editorMode(EditorMode.Code)
            // @ts-ignore
            .format("table")
            .rawQuery(true)
            .rawSql(dedent`
            SELECT
              LEAST(queued_at, started_at, finished_at) AS at,
              subject_id AS subject_id,
              extract('epoch' from (started_at - queued_at)) AS queued_duration,
              extract('epoch' from (finished_at  - started_at)) AS run_duration,
              --
              last_payload -> 'subject' -> 'content' ->> 'url' AS url,
              outcome AS outcome
            FROM pipelinerun
            WHERE
              ($__timeFilter(queued_at) OR $__timeFilter(finished_at))
              AND last_payload -> 'subject' -> 'content' ->> 'pipelineName' = ANY(ARRAY[\${pipeline_names:sqlstring}]::text[])
              ORDER BY at DESC
              LIMIT $limit
          `),
        )
        .script(script),
    );
  return builder.build();
}

export function newVariable4Pipeline() {
  return newVariableOnDatasource(
    dedent`
    SELECT DISTINCT payload -> 'subject' -> 'content' ->> 'pipelineName' AS __value
    FROM cdevents_lake
    WHERE
    $__timeFilter(timestamp)
    AND subject = 'pipelinerun'
    ORDER BY __value
    `,
    "pipeline_names",
    "Pipelines",
  );
}
