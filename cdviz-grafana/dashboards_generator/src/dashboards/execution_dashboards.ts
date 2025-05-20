import {
  DataqueryBuilder,
  EditorMode,
} from "@grafana/grafana-foundation-sdk/bigquery";
import {
  ConstantVariableBuilder,
  type Dashboard,
  DashboardBuilder,
  type QueryVariableBuilder,
  RowBuilder,
} from "@grafana/grafana-foundation-sdk/dashboard";
import dedent from "dedent";
import { D3PanelBuilder, buildjsForD3Panel } from "../panels/d3_panel";
import { DEFAULT_TAGS, applyDefaults, newVariableOnDatasource } from "./utils";

const SELECTED_FIELD_NAME = "selected_value";

export async function buildDashboards() {
  return Promise.all(
    [
      // {
      //   subject: "build",
      //   label: "Build",
      //   payloadSelector: "payload -> 'subject' ->> 'id'",
      //   withQueuedAt: true,
      // },
      {
        subject: "pipelinerun",
        label: "Pipeline",
        payloadSelector: "payload -> 'subject' -> 'content' ->> 'pipelineName'",
        withQueuedAt: true,
      },
      {
        subject: "taskrun",
        label: "Task",
        payloadSelector: "payload -> 'subject' -> 'content' ->> 'taskName'",
        withQueuedAt: false,
      },
      {
        subject: "testcaserun",
        label: "Test",
        payloadSelector:
          "payload -> 'subject' -> 'content' -> 'testCase' ->> 'name'",
        withQueuedAt: true,
      },
      {
        subject: "testcasesuite",
        label: "Test Suite",
        payloadSelector:
          "payload -> 'subject' -> 'content' -> 'testSuite' ->> 'name'",
        withQueuedAt: true,
      },
    ].map((d) => buildDashboard(d.subject, d.label, d.payloadSelector)),
  );
}

async function buildDashboard(
  subject: string,
  label: string,
  payloadSelector: string,
  withQueuedAt?: boolean,
): Promise<Dashboard> {
  const script = await buildjsForD3Panel([
    "./src/panels/browser_scripts/draw_barchart_double.ts",
  ]);
  const datasource = {
    type: "grafana-postgresql-datasource",
    uid: "${datasource}",
  };

  let selectAt = "started_at, finished_at";
  let selectAdds = "";
  let timeFilter = "$__timeFilter(finished_at)";

  if (withQueuedAt) {
    selectAt = `queued_at, ${selectAt}`;
    selectAdds =
      "extract('epoch' from (started_at - queued_at)) AS queued_duration,";
    timeFilter = "($__timeFilter(queued_at) OR $__timeFilter(finished_at))";
  }

  const builder = applyDefaults(
    new DashboardBuilder(`${label}: Latest Executions`).uid(
      `${subject}_executions`,
    ),
  )
    .tags([subject].concat(DEFAULT_TAGS))
    .withVariable(newVariable4Selected(subject, label, payloadSelector))
    .withVariable(new ConstantVariableBuilder("limit").value("20"))
    .withRow(new RowBuilder(`${label}: Latest $limit Executions`))
    .withPanel(
      new D3PanelBuilder()
        .title(`$${SELECTED_FIELD_NAME}`)
        .repeat(SELECTED_FIELD_NAME)
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
              LEAST(${selectAt}) AS at,
              subject_id AS subject_id,
              ${selectAdds}
              extract('epoch' from (finished_at - started_at)) AS run_duration,
              --
              last_payload -> 'subject' -> 'content' ->> 'url' AS url,
              outcome AS outcome
            FROM pipelinerun
            WHERE
              ${timeFilter}
              AND last_${payloadSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
              ORDER BY at DESC
              LIMIT $limit
          `),
        )
        .script(script),
    );
  return builder.build();
}

function newVariable4Selected(
  subject: string,
  label: string,
  payloadSelector: string,
): QueryVariableBuilder {
  return newVariableOnDatasource(
    dedent`
      SELECT DISTINCT ${payloadSelector} AS __value
      FROM cdevents_lake
      WHERE $__timeFilter(timestamp)
      AND subject = '${subject}'
      ORDER BY __value
    `,
    SELECTED_FIELD_NAME,
    label,
  );
}
