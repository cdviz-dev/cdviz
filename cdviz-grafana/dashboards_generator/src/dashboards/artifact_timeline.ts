import {
  DataqueryBuilder,
  EditorMode,
} from "@grafana/grafana-foundation-sdk/bigquery";
import {
  type Dashboard,
  DashboardBuilder,
} from "@grafana/grafana-foundation-sdk/dashboard";
import dedent from "dedent";
import { D3PanelBuilder, buildjsForD3Panel } from "../panels/d3_panel";
import { DEFAULT_TAGS, applyDefaults, newVariableOnDatasource } from "./utils";

export async function buildDashboard(): Promise<Dashboard> {
  const script = await buildjsForD3Panel([
    "./src/panels/browser_scripts/draw_timeline_version_on_stage.ts",
  ]);
  const datasource = {
    type: "grafana-postgresql-datasource",
    uid: "${datasource}",
  };
  const builder = applyDefaults(
    new DashboardBuilder("Artifact: Timeline").uid("artifact_timeline"),
  )
    .tags(["cd", "artifact", "service"].concat(DEFAULT_TAGS))
    .withVariable(newVariable4ArtifactFname())
    .withPanel(
      new D3PanelBuilder()
        .title("$artifact_fnames")
        .repeat("artifact_fnames")
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
              SELECT timestamp,
                predicate as action,
                predicate as stage,
                payload -> 'subject' ->> 'id' as artifact_id
              FROM cdevents_lake
              WHERE $__timeFilter(timestamp)
                AND payload -> 'subject' ->> 'id' LIKE 'pkg:\${artifact_fnames:raw}@%'
                AND subject = 'artifact'
                AND predicate = ANY(ARRAY['published', 'signed'])

              UNION ALL

              SELECT timestamp,
                predicate as action,
                (payload -> 'subject' -> 'content' -> 'environment' ->> 'id') || '/' || (payload -> 'subject' ->> 'id') as stage,
                payload -> 'subject' -> 'content' ->> 'artifactId' as artifact_id
              FROM cdevents_lake
              WHERE $__timeFilter(timestamp)
                AND payload -> 'subject' -> 'content' ->> 'artifactId' LIKE 'pkg:\${artifact_fnames:raw}%'
                AND subject = 'service'
                AND predicate = ANY(ARRAY['deployed', 'upgraded', 'rolledback'])
            `),
        )
        .script(script),
    );
  return builder.build();
}

export function newVariable4ArtifactFname() {
  return newVariableOnDatasource(
    dedent`
      SELECT DISTINCT SUBSTRING(payload -> 'subject' ->> 'id' FROM 'pkg:([^@\\?]+)') as __value
      FROM cdevents_lake
      WHERE $__timeFilter(timestamp)
        AND subject = 'artifact'
        AND predicate = ANY(ARRAY['published', 'signed'])

      UNION

      SELECT DISTINCT SUBSTRING(payload -> 'subject' -> 'content' ->> 'artifactId' FROM 'pkg:([^@\\?]+)') as __value
      FROM cdevents_lake
      WHERE $__timeFilter(timestamp)
        AND subject = 'service'
        AND predicate = ANY(ARRAY['deployed', 'upgraded', 'rolledback'])
    `,
    "artifact_fnames",
    "Artifacts",
  ).description("Artifact type + namespace + name");
}
