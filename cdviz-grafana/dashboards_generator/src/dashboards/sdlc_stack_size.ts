import {
  DataqueryBuilder,
  EditorMode,
} from "@grafana/grafana-foundation-sdk/bigquery";
import {
  type Dashboard,
  DashboardBuilder,
  FieldColorModeId,
  PanelBuilder,
  ThresholdsMode,
} from "@grafana/grafana-foundation-sdk/dashboard";
import dedent from "dedent";
import { DATASOURCE } from "./execution_panels";
import { applyDefaults, DEFAULT_TAGS } from "./utils";

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
  gridY: number,
): PanelBuilder {
  return new PanelBuilder()
    .title(title)
    .description(description)
    .type("stat")
    .datasource(DATASOURCE)
    .withTarget(newSqlTarget(query))
    .gridPos({ h: 4, w: 6, x: gridX, y: gridY })
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

export async function buildDashboard(): Promise<Dashboard> {
  const builder = applyDefaults(
    new DashboardBuilder("SDLC Stack: Size").uid("sdlc_stack_size"),
  )
    .tags(["sdlc-stack"].concat(DEFAULT_TAGS))
    // Row 1: Environments | Services | Artifacts | Repositories
    .withPanel(
      createCounterPanel(
        "Environments",
        "Distinct environments observed in the selected time window (from environment and service events).",
        dedent`
          SELECT COUNT(DISTINCT env_id) AS count
          FROM (
            SELECT payload -> 'subject' ->> 'id' AS env_id
            FROM cdviz.cdevents_lake
            WHERE subject = 'environment' AND $__timeFilter(timestamp)
            UNION
            SELECT payload -> 'subject' -> 'content' -> 'environment' ->> 'id' AS env_id
            FROM cdviz.cdevents_lake
            WHERE subject = 'service' AND $__timeFilter(timestamp)
              AND payload -> 'subject' -> 'content' -> 'environment' ->> 'id' IS NOT NULL
          ) AS envs
        `,
        0,
        0,
      ),
    )
    .withPanel(
      createCounterPanel(
        "Services",
        "Distinct service IDs observed in the selected time window (from service events).",
        dedent`
          SELECT COUNT(DISTINCT payload -> 'subject' ->> 'id') AS count
          FROM cdviz.cdevents_lake
          WHERE subject = 'service' AND $__timeFilter(timestamp)
        `,
        6,
        0,
      ),
    )
    .withPanel(
      createCounterPanel(
        "Artifacts",
        "Distinct artifact base names (PURL before version/qualifier) observed in the selected time window (from artifact and service events).",
        dedent`
          SELECT COUNT(DISTINCT
            SUBSTRING(purl FROM 'pkg:([^@\\?]+)') ||
            COALESCE('?repository_url=' || (regexp_match(purl, 'repository_url=([^&]+)'))[1], '')
          ) AS count
          FROM (
            SELECT payload -> 'subject' ->> 'id' AS purl
            FROM cdviz.cdevents_lake
            WHERE subject = 'artifact' AND $__timeFilter(timestamp)
              AND payload -> 'subject' ->> 'id' LIKE 'pkg:%'
            UNION
            SELECT payload -> 'subject' -> 'content' ->> 'artifactId' AS purl
            FROM cdviz.cdevents_lake
            WHERE subject = 'service' AND $__timeFilter(timestamp)
              AND payload -> 'subject' -> 'content' ->> 'artifactId' LIKE 'pkg:%'
          ) AS purls
          WHERE SUBSTRING(purl FROM 'pkg:([^@\\?]+)') IS NOT NULL
        `,
        12,
        0,
      ),
    )
    .withPanel(
      createCounterPanel(
        "Repositories",
        "Distinct repositories observed in the selected time window (from repository and change events).",
        dedent`
          SELECT COUNT(DISTINCT repo_id) AS count
          FROM (
            SELECT payload -> 'subject' ->> 'id' AS repo_id
            FROM cdviz.cdevents_lake
            WHERE subject = 'repository' AND $__timeFilter(timestamp)
            UNION
            SELECT payload -> 'subject' -> 'content' -> 'repository' ->> 'id' AS repo_id
            FROM cdviz.cdevents_lake
            WHERE subject = 'change' AND $__timeFilter(timestamp)
              AND payload -> 'subject' -> 'content' -> 'repository' ->> 'id' IS NOT NULL
          ) AS repos
        `,
        18,
        0,
      ),
    )
    // Row 2: Pipelines | Tasks | Test Suites | Tests
    .withPanel(
      createCounterPanel(
        "Pipelines",
        "Distinct pipeline names observed in the selected time window (from pipelinerun events).",
        dedent`
          SELECT COUNT(DISTINCT payload -> 'subject' -> 'content' ->> 'pipelineName') AS count
          FROM cdviz.cdevents_lake
          WHERE subject = 'pipelinerun'
            AND payload -> 'subject' -> 'content' ->> 'pipelineName' IS NOT NULL
            AND $__timeFilter(timestamp)
        `,
        0,
        4,
      ),
    )
    .withPanel(
      createCounterPanel(
        "Tasks",
        "Distinct task names observed in the selected time window (from taskrun events).",
        dedent`
          SELECT COUNT(DISTINCT payload -> 'subject' -> 'content' ->> 'taskName') AS count
          FROM cdviz.cdevents_lake
          WHERE subject = 'taskrun'
            AND payload -> 'subject' -> 'content' ->> 'taskName' IS NOT NULL
            AND $__timeFilter(timestamp)
        `,
        6,
        4,
      ),
    )
    .withPanel(
      createCounterPanel(
        "Test Suites",
        "Distinct test suite names observed in the selected time window (from testsuiterun events).",
        dedent`
          SELECT COUNT(DISTINCT payload -> 'subject' -> 'content' -> 'testSuite' ->> 'name') AS count
          FROM cdviz.cdevents_lake
          WHERE subject = 'testsuiterun'
            AND payload -> 'subject' -> 'content' -> 'testSuite' ->> 'name' IS NOT NULL
            AND $__timeFilter(timestamp)
        `,
        12,
        4,
      ),
    )
    .withPanel(
      createCounterPanel(
        "Tests",
        "Distinct test case names observed in the selected time window (from testcaserun events).",
        dedent`
          SELECT COUNT(DISTINCT payload -> 'subject' -> 'content' -> 'testCase' ->> 'name') AS count
          FROM cdviz.cdevents_lake
          WHERE subject = 'testcaserun'
            AND payload -> 'subject' -> 'content' -> 'testCase' ->> 'name' IS NOT NULL
            AND $__timeFilter(timestamp)
        `,
        18,
        4,
      ),
    );

  return builder.build();
}
