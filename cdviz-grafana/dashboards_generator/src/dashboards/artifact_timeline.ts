import {
  DataqueryBuilder,
  EditorMode,
} from "@grafana/grafana-foundation-sdk/bigquery";
import {
  type Dashboard,
  DashboardBuilder,
} from "@grafana/grafana-foundation-sdk/dashboard";
import dedent from "dedent";
import { buildjsForD3Panel, D3PanelBuilder } from "../panels/d3_panel";
import { applyDefaults, DEFAULT_TAGS, newVariableOnDatasource } from "./utils";

export async function buildDashboard(): Promise<Dashboard> {
  const script = await buildjsForD3Panel([
    "./src/panels/browser_scripts/draw_timeline_version_on_stage.ts",
  ]);

  const datasource = {
    type: "grafana-postgresql-datasource",
    // biome-ignore lint/suspicious/noTemplateCurlyInString: template for grafana
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
        .maxPerRow(1)
        .datasource(datasource)
        .withTarget(
          new DataqueryBuilder()
            .datasource(datasource)
            .editorMode(EditorMode.Code)
            // @ts-expect-error
            .format("table")
            .rawQuery(true)
            .rawSql(dedent`
              WITH artifact_filter AS (
                SELECT
                  SPLIT_PART('\${artifact_fnames:raw}', '\n', 1) as base_name,
                  NULLIF(SPLIT_PART('\${artifact_fnames:raw}', '\n', 2), '') as repository_url
              )
              SELECT timestamp,
                predicate as action,
                predicate as stage,
                payload -> 'subject' ->> 'id' as artifact_id
              FROM cdviz.cdevents_lake, artifact_filter
              WHERE $__timeFilter(timestamp)
                AND payload -> 'subject' ->> 'id' SIMILAR TO 'pkg:' || artifact_filter.base_name || '(@|\\?)%'
                AND (artifact_filter.repository_url IS NULL OR payload -> 'subject' ->> 'id' SIMILAR TO '%repository_url=' || artifact_filter.repository_url || '(&%)?')
                AND subject = 'artifact'
                AND predicate = ANY(ARRAY['published', 'signed'])

              UNION ALL

              SELECT timestamp,
                predicate as action,
                (payload -> 'subject' -> 'content' -> 'environment' ->> 'id') || '\n' || (payload -> 'subject' ->> 'id') as stage,
                payload -> 'subject' -> 'content' ->> 'artifactId' as artifact_id
              FROM cdviz.cdevents_lake, artifact_filter
              WHERE $__timeFilter(timestamp)
                AND payload -> 'subject' -> 'content' ->> 'artifactId' SIMILAR TO 'pkg:' || artifact_filter.base_name || '(@|\\?)%'
                AND (artifact_filter.repository_url IS NULL OR payload -> 'subject' -> 'content' ->> 'artifactId' SIMILAR TO '%repository_url=' || artifact_filter.repository_url || '(&%)?')
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
      SELECT DISTINCT
        SUBSTRING(payload -> 'subject' ->> 'id' FROM 'pkg:([^@\\?]+)') ||
        '\n' ||
        COALESCE((regexp_match(payload -> 'subject' ->> 'id', 'repository_url=([^&]+)'))[1], '') as __value
      FROM cdviz.cdevents_lake
      WHERE $__timeFilter(timestamp)
        AND subject = 'artifact'
        AND predicate = ANY(ARRAY['published', 'signed'])
        AND SUBSTRING(payload -> 'subject' ->> 'id' FROM 'pkg:([^@\\?]+)') <> ''

      UNION

      SELECT DISTINCT
        SUBSTRING(payload -> 'subject' -> 'content' ->> 'artifactId' FROM 'pkg:([^@\\?]+)') ||
        '\n' ||
        COALESCE((regexp_match(payload -> 'subject' -> 'content' ->> 'artifactId', 'repository_url=([^&]+)'))[1], '') as __value
      FROM cdviz.cdevents_lake
      WHERE $__timeFilter(timestamp)
        AND subject = 'service'
        AND predicate = ANY(ARRAY['deployed', 'upgraded', 'rolledback'])
        AND SUBSTRING(payload -> 'subject' -> 'content' ->> 'artifactId' FROM 'pkg:([^@\\?]+)') <> ''
    `,
    "artifact_fnames",
    "Artifacts",
  ).description("Artifact type + namespace + name + repository");
}
