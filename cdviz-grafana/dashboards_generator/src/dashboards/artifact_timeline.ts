import {
  DataqueryBuilder,
  EditorMode,
} from "@grafana/grafana-foundation-sdk/bigquery";
import {
  type Dashboard,
  DashboardBuilder,
} from "@grafana/grafana-foundation-sdk/dashboard";
import dedent from "dedent";
import {
  buildjsForEChartsPanel,
  EChartsPanelBuilder,
} from "../panels/echarts_panel";
import { applyDefaults, DEFAULT_TAGS, newVariableOnDatasource } from "./utils";

export async function buildDashboard(): Promise<Dashboard> {
  const script = await buildjsForEChartsPanel([
    "./src/panels/browser_scripts/draw_timeline_echarts.ts",
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
      new EChartsPanelBuilder()
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
                  SPLIT_PART('\${artifact_fnames:raw}', '\n', 1) AS base_name,
                  NULLIF(SPLIT_PART('\${artifact_fnames:raw}', '\n', 2), '') AS repository_url
              ),
              artifact_nodes AS (
                SELECT n.node_id
                FROM cdviz.graph_nodes n, artifact_filter
                WHERE n.node_type = 'artifact'
                  AND (
                    n.node_id SIMILAR TO 'pkg:' || artifact_filter.base_name || '(@|\\?)%'
                    OR n.node_id = 'pkg:' || artifact_filter.base_name
                  )
                  AND (
                    artifact_filter.repository_url IS NULL
                    OR n.node_id SIMILAR TO '%repository_url=' || artifact_filter.repository_url || '(&%)?'
                  )
              ),
              -- Run-type events raw: extract definition name for stage grouping.
              -- pipelinerun/taskrun/testcaserun/testsuiterun each have a "definition" field
              -- (pipelineName, taskName, testCase.name|id, testSuite.name|id) that is stable
              -- across multiple runs, unlike subject.id which is unique per run instance.
              run_events_raw AS (
                SELECT
                  cl.timestamp,
                  cl.subject || '.' || cl.predicate      AS action,
                  ge.relation                            AS relation,
                  CASE cl.subject
                    WHEN 'pipelinerun'  THEN COALESCE(cl.payload -> 'subject' -> 'content' ->> 'pipelineName', cl.payload -> 'subject' ->> 'id')
                    WHEN 'taskrun'      THEN COALESCE(cl.payload -> 'subject' -> 'content' ->> 'taskName', cl.payload -> 'subject' ->> 'id')
                    WHEN 'testcaserun'  THEN COALESCE(cl.payload -> 'subject' -> 'content' -> 'testCase' ->> 'name', cl.payload -> 'subject' -> 'content' -> 'testCase' ->> 'id', cl.payload -> 'subject' ->> 'id')
                    WHEN 'testsuiterun' THEN COALESCE(cl.payload -> 'subject' -> 'content' -> 'testSuite' ->> 'name', cl.payload -> 'subject' -> 'content' -> 'testSuite' ->> 'id', cl.payload -> 'subject' ->> 'id')
                  END                                    AS run_def_name,
                  an.node_id                             AS artifact_id,
                  gn.node_type                           AS entity_type,
                  cl.payload -> 'subject' ->> 'id'       AS entity_id,
                  cl.payload -> 'subject' -> 'content' -> 'environment' ->> 'id' AS environment_id
                FROM artifact_nodes an
                JOIN cdviz.graph_edges ge
                  ON ge.to_node_id = an.node_id
                  AND ge.relation != 'derivedFrom'
                JOIN cdviz.graph_nodes gn ON gn.node_id = ge.from_node_id
                JOIN cdviz.cdevents_lake cl
                  ON cl.subject = gn.node_type
                  AND cl.payload -> 'subject' ->> 'id' = ge.from_node_id
                  AND cl.subject IN ('pipelinerun', 'taskrun', 'testcaserun', 'testsuiterun')
                  AND (
                    cl.payload -> 'subject' -> 'content' ->> 'artifactId' = an.node_id
                    OR EXISTS (
                      SELECT 1
                      FROM jsonb_array_elements(
                        COALESCE(cl.payload -> 'customData' -> 'links', '[]'::jsonb)
                      ) AS lnk(v)
                      WHERE lnk.v -> 'subject' ->> 'id' = an.node_id
                    )
                  )
                WHERE $__timeFilter(cl.timestamp)
              )
              -- Part 1: direct artifact events (published, signed, packaged, …)
              SELECT
                cl.timestamp,
                cl.predicate                             AS action,
                cl.predicate                             AS stage,
                cl.payload -> 'subject' ->> 'id'         AS artifact_id,
                'artifact'::text                         AS entity_type,
                cl.payload -> 'subject' ->> 'id'         AS entity_id,
                NULL::text                               AS environment_id
              FROM artifact_nodes an
              JOIN cdviz.cdevents_lake cl
                ON cl.subject = 'artifact'
                AND cl.payload -> 'subject' ->> 'id' = an.node_id
              WHERE $__timeFilter(cl.timestamp)

              UNION ALL

              -- Part 2: non-run related-entity events (service deployments, …)
              -- Joined through graph_edges with an artifact-match constraint so each event
              -- appears exactly once — for the specific artifact version it references in its
              -- own payload (content.artifactId or customData.links), never fanning out to
              -- all versions the entity was historically linked to.
              SELECT
                cl.timestamp,
                cl.subject || '.' || cl.predicate        AS action,
                CASE
                  WHEN cl.payload -> 'subject' -> 'content' -> 'environment' ->> 'id' IS NOT NULL
                    THEN ge.relation
                      || E'\\n' || (cl.payload -> 'subject' ->> 'id')
                      || E'\\n' || (cl.payload -> 'subject' -> 'content' -> 'environment' ->> 'id')
                  ELSE cl.predicate
                      || E'\\n' || (cl.payload -> 'subject' ->> 'id')
                END                                      AS stage,
                an.node_id                               AS artifact_id,
                gn.node_type                             AS entity_type,
                cl.payload -> 'subject' ->> 'id'         AS entity_id,
                cl.payload -> 'subject' -> 'content' -> 'environment' ->> 'id' AS environment_id
              FROM artifact_nodes an
              JOIN cdviz.graph_edges ge
                ON ge.to_node_id = an.node_id
                AND ge.relation != 'derivedFrom'
              JOIN cdviz.graph_nodes gn ON gn.node_id = ge.from_node_id
              JOIN cdviz.cdevents_lake cl
                ON cl.subject = gn.node_type
                AND cl.payload -> 'subject' ->> 'id' = ge.from_node_id
                AND cl.subject NOT IN ('pipelinerun', 'taskrun', 'testcaserun', 'testsuiterun')
                AND (
                  cl.payload -> 'subject' -> 'content' ->> 'artifactId' = an.node_id
                  OR EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements(
                      COALESCE(cl.payload -> 'customData' -> 'links', '[]'::jsonb)
                    ) AS lnk(v)
                    WHERE lnk.v -> 'subject' ->> 'id' = an.node_id
                  )
                )
              WHERE $__timeFilter(cl.timestamp)

              UNION ALL

              -- Part 3: run-type events (pipelinerun, taskrun, testcaserun, testsuiterun)
              -- Stage uses the definition name so all runs of the same pipeline/task/test share
              -- one Y-axis row. Only the last event per definition per artifact is shown.
              SELECT
                timestamp,
                action,
                relation || E'\\n' || run_def_name       AS stage,
                artifact_id,
                entity_type,
                entity_id,
                environment_id
              FROM (
                SELECT
                  *,
                  ROW_NUMBER() OVER (
                    PARTITION BY artifact_id, entity_id
                    ORDER BY timestamp DESC
                  )                                      AS rn
                FROM run_events_raw
              ) ranked
              WHERE rn = 1
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
        COALESCE(
          SUBSTRING(node_id FROM 'pkg:([^@\\?]+)'),
          SUBSTRING(node_id FROM 'pkg:(.+)')
        ) || E'\\n' ||
        COALESCE((regexp_match(node_id, 'repository_url=([^&]+)'))[1], '') AS __value
      FROM cdviz.graph_nodes
      WHERE node_type = 'artifact'
        AND node_id LIKE 'pkg:%'
        AND (node_id LIKE 'pkg:%@%' OR node_id LIKE 'pkg:%?%')
      ORDER BY 1
    `,
    "artifact_fnames",
    "Artifacts",
  ).description("Artifact type + namespace + name + repository");
}
