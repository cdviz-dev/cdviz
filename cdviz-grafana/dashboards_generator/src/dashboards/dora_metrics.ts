import {
  DataqueryBuilder,
  EditorMode,
} from "@grafana/grafana-foundation-sdk/bigquery";
import {
  type Dashboard,
  DashboardBuilder,
  FieldColorModeId,
  PanelBuilder,
  RowBuilder,
  ThresholdsMode,
} from "@grafana/grafana-foundation-sdk/dashboard";
import dedent from "dedent";
import { applyDefaults, DEFAULT_TAGS, newVariableOnDatasource } from "./utils";

const DATASOURCE = {
  type: "grafana-postgresql-datasource",
  // biome-ignore lint/suspicious/noTemplateCurlyInString: template for grafana
  uid: "${datasource}",
} as const;

function newSqlTarget(
  query: string,
  format: "table" | "time_series" = "table",
) {
  return (
    new DataqueryBuilder()
      .datasource(DATASOURCE)
      .editorMode(EditorMode.Code)
      // @ts-expect-error
      .format(format)
      .rawQuery(true)
      .rawSql(query)
  );
}

function applyTimeSeriesOptions(panel: PanelBuilder): void {
  // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires internal access for options config
  (panel as any).internal.options = {
    // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires internal access for options config
    ...(panel as any).internal.options,
    tooltip: { mode: "multi", sort: "none" },
    legend: {
      displayMode: "table",
      placement: "right",
      showLegend: true,
      calcs: ["sum", "max"],
      width: 300,
    },
  };
}

function barChartCustomConfig(stacking: "none" | "normal") {
  return {
    axisBorderShow: false,
    axisCenteredZero: false,
    axisColorMode: "text",
    axisLabel: "",
    axisPlacement: "left",
    axisWidth: 1,
    barAlignment: 0,
    barWidthFactor: 1,
    drawStyle: "bars",
    fillOpacity: 50,
    gradientMode: "opacity",
    hideFrom: { legend: false, tooltip: false, viz: false },
    insertNulls: false,
    lineInterpolation: "linear",
    lineWidth: 0,
    pointSize: 5,
    scaleDistribution: { type: "linear" },
    showPoints: "never",
    showValues: false,
    spanNulls: false,
    stacking: { group: "A", mode: stacking },
  };
}

function createStatPanel(
  title: string,
  query: string,
  gridX: number,
  gridY: number,
  unit: string,
  // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
  thresholdSteps: Array<{ value: any; color: string }>,
  description?: string,
): PanelBuilder {
  const panel = new PanelBuilder()
    .title(title)
    .type("stat")
    .datasource(DATASOURCE)
    .withTarget(newSqlTarget(query))
    .gridPos({ h: 4, w: 6, x: gridX, y: gridY })
    .fieldConfig({
      defaults: {
        unit,
        thresholds: {
          mode: ThresholdsMode.Absolute,
          steps: thresholdSteps,
        },
      },
      overrides: [],
    });
  if (description) {
    panel.description(description);
  }
  return panel;
}

function newMarkdownPanel(
  content: string,
  gridX: number,
  gridY: number,
  w = 24,
  h = 4,
): PanelBuilder {
  const panel = new PanelBuilder()
    .title("")
    .type("text")
    .gridPos({ h, w, x: gridX, y: gridY });
  // biome-ignore lint/suspicious/noExplicitAny: SDK has no type-safe text panel options API
  (panel as any).internal.options = {
    mode: "markdown",
    content,
  };
  return panel;
}

export async function buildDashboard(): Promise<Dashboard> {
  const builder = applyDefaults(
    new DashboardBuilder("DORA Metrics").uid("dora_metrics"),
  )
    .tags(["dora"].concat(DEFAULT_TAGS))
    .withVariable(
      newVariableOnDatasource(
        dedent`
          SELECT DISTINCT
            payload -> 'subject' -> 'content' -> 'environment' ->> 'id' AS __value
          FROM cdviz.cdevents_lake
          WHERE subject = 'service' AND predicate IN ('deployed', 'upgraded')
            AND $__timeFilter(timestamp)
            AND payload -> 'subject' -> 'content' -> 'environment' ->> 'id' IS NOT NULL
          ORDER BY __value
        `,
        "environment",
        "Environment",
      ),
    )
    .withVariable(
      newVariableOnDatasource(
        dedent`
          SELECT DISTINCT
            payload -> 'subject' ->> 'id' AS __value
          FROM cdviz.cdevents_lake
          WHERE subject = 'service' AND predicate IN ('deployed', 'upgraded')
            AND $__timeFilter(timestamp)
            AND payload -> 'subject' -> 'content' -> 'environment' ->> 'id'
                = ANY(ARRAY[\${environment:sqlstring}]::text[])
          ORDER BY __value
        `,
        "service",
        "Service",
      ),
    )
    // Row 1 — DORA Summary
    .withPanel(
      new RowBuilder("DORA Summary").gridPos({ h: 1, w: 24, x: 0, y: 0 }),
    )
    .withPanel(
      newMarkdownPanel(
        dedent`
          ## What are DORA Metrics?

          DORA (DevOps Research and Assessment) metrics are 4 evidence-based indicators of software delivery performance,
          derived from years of industry research.

          | Metric | Elite | High | Medium | Low |
          |---|---|---|---|---|
          | **Deployment Frequency** | ≥ 1/day | ≥ 1/week | ≥ 1/month | < 1/month |
          | **Lead Time (Artifact→Deploy)** | < 1 hour | < 1 day | < 1 week | > 1 week |
          | **Time to Restore** | < 1 hour | < 1 day | < 1 week | > 1 week |
          | **Change Failure Rate** | ≤ 5% | ≤ 10% | ≤ 15% | > 15% |

          > ℹ️ **Note**: All metrics are powered by [CDEvents](https://cdevents.dev) and require the corresponding lifecycle events to be emitted. Missing event types result in empty panels, not zero values.
          > DORA 2023 renamed "MTTR" to **Failed Deployment Recovery Time** (scoped to deployment-induced failures). This dashboard shows all incidents as a proxy.
          >
          > ⚠️ **Approximation notice**: Precise DORA measurement requires an unbroken event chain
          > from commit → CI pipeline → artifact → deployment → environment. CDviz derives values from
          > whatever CDEvents are emitted; missing links fall back to proxies or show no data.
          > Precise cross-tool tracing is an open problem — [CDEvents](https://cdevents.dev) is the
          > community standard to make these links explicit. These formulas will be refined as
          > CDEvents adoption grows.
        `,
        0,
        1,
        24,
        6,
      ),
    )
    .withPanel(
      createStatPanel(
        "Deployment Frequency",
        dedent`
          SELECT
            CASE
              WHEN COUNT(*) <= 1 THEN NULL
              ELSE ROUND(
                COUNT(*)::numeric / NULLIF(
                  EXTRACT('epoch' FROM (MAX(timestamp) - MIN(timestamp))) / 86400.0,
                  0
                ),
                2
              )
            END AS "Deploys/Day"
          FROM cdviz.cdevents_lake
          WHERE subject = 'service' AND predicate IN ('deployed', 'upgraded')
            AND $__timeFilter(timestamp)
            AND payload -> 'subject' -> 'content' -> 'environment' ->> 'id'
                = ANY(ARRAY[\${environment:sqlstring}]::text[])
        `,
        0,
        7,
        "short",
        [
          // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
          { value: null as any, color: "red" },
          { value: 0.033, color: "orange" },
          { value: 0.14, color: "yellow" },
          { value: 1, color: "green" },
        ],
        "Deployments per day computed over the observed span (first→last event). Returns no data when ≤1 event. DORA: Elite ≥1/day, High ≥1/week, Medium ≥1/month.",
      ),
    )
    .withPanel(
      createStatPanel(
        "Lead Time: Artifact→Deploy",
        dedent`
          SELECT
            COALESCE(
              PERCENTILE_CONT(0.5) WITHIN GROUP (
                ORDER BY EXTRACT('epoch' FROM (svc.timestamp - art.timestamp))
              ),
              0
            ) AS "P50 Lead Time (s)"
          FROM cdviz.cdevents_lake AS svc
          JOIN LATERAL (
            SELECT timestamp
            FROM cdviz.cdevents_lake
            WHERE subject = 'artifact' AND predicate = 'published'
              AND payload -> 'subject' ->> 'id'
                  = svc.payload -> 'subject' -> 'content' ->> 'artifactId'
              AND timestamp <= svc.timestamp
            ORDER BY timestamp DESC
            LIMIT 1
          ) AS art ON true
          WHERE svc.subject = 'service'
            AND svc.predicate IN ('deployed', 'upgraded')
            AND $__timeFilter(svc.timestamp)
            AND svc.payload -> 'subject' -> 'content' -> 'environment' ->> 'id'
                = ANY(ARRAY[\${environment:sqlstring}]::text[])
            AND svc.payload -> 'subject' -> 'content' ->> 'artifactId' IS NOT NULL
        `,
        6,
        7,
        "dtdurations",
        [
          // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
          { value: null as any, color: "green" },
          { value: 3600, color: "yellow" },
          { value: 86400, color: "orange" },
          { value: 604800, color: "red" },
        ],
        "Median (P50) time from artifact.published to service.deployed. Proxy for DORA Lead Time (commit→production). DORA: Elite <1h, High <1 day, Medium <1 week.",
      ),
    )
    .withPanel(
      createStatPanel(
        "Time to Restore (All Incidents)",
        dedent`
          SELECT
            COALESCE(
              PERCENTILE_CONT(0.5) WITHIN GROUP (
                ORDER BY EXTRACT('epoch' FROM (resolved_at - detected_at))
              ),
              0
            ) AS "P50 Time to Restore (s)"
          FROM cdviz.incident
          WHERE $__timeFilter(detected_at)
            AND resolved_at IS NOT NULL
        `,
        12,
        7,
        "dtdurations",
        [
          // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
          { value: null as any, color: "green" },
          { value: 3600, color: "yellow" },
          { value: 86400, color: "red" },
        ],
        "Median (P50) time from incident.detected to incident.resolved. Covers all incidents (not just deployment-induced). DORA: Elite <1h, High <1 day.",
      ),
    )
    .withPanel(
      createStatPanel(
        "Change Failure Rate",
        dedent`
          SELECT
            COALESCE(
              100.0 * COUNT(*) FILTER (WHERE predicate = 'rolledback')
                / NULLIF(COUNT(*) FILTER (WHERE predicate IN ('deployed', 'upgraded')), 0),
              0
            ) AS "Change Failure Rate (%)"
          FROM cdviz.cdevents_lake
          WHERE subject = 'service'
            AND predicate IN ('deployed', 'upgraded', 'rolledback')
            AND $__timeFilter(timestamp)
            AND payload -> 'subject' -> 'content' -> 'environment' ->> 'id'
                = ANY(ARRAY[\${environment:sqlstring}]::text[])
        `,
        18,
        7,
        "percent",
        [
          // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
          { value: null as any, color: "green" },
          { value: 5, color: "yellow" },
          { value: 10, color: "orange" },
          { value: 15, color: "red" },
        ],
        "Rollback events / deployed events × 100. DORA: Elite ≤5%, High ≤10%, Medium ≤15%, Low >15%. Only explicit rollback CDEvents count as failures.",
      ),
    )
    // Row 2 — Deployment Frequency Time Series
    .withPanel(
      new RowBuilder("Deployment Frequency").gridPos({
        h: 1,
        w: 24,
        x: 0,
        y: 11,
      }),
    )
    .withPanel(
      newMarkdownPanel(
        dedent`
          **Formula**: \`COUNT(service.deployed | service.upgraded) / observed_span_days\`
          **Data source**: \`cdviz.cdevents_lake\` WHERE subject='service' AND predicate IN ('deployed','upgraded')
          **Time window**: span between the first and last deployment event (not the dashboard selection range).
          Returns no data when ≤1 event exists — a single data point cannot establish a rate.
          **Limitations**: Counts all deployments in selected environments. Does not distinguish
          feature deployments from hotfixes.
        `,
        0,
        12,
        24,
        3,
      ),
    )
    .withPanel(
      (() => {
        const panel = new PanelBuilder()
          .title("Deployment Frequency")
          .type("timeseries")
          .datasource(DATASOURCE)
          .withTarget(
            newSqlTarget(
              dedent`
                SELECT
                  time_bucket('1 day', timestamp) AS time,
                  COALESCE(
                    payload -> 'subject' -> 'content' -> 'environment' ->> 'id',
                    'unknown'
                  ) AS environment,
                  COUNT(*) AS deployments
                FROM cdviz.cdevents_lake
                WHERE subject = 'service' AND predicate IN ('deployed', 'upgraded')
                  AND $__timeFilter(timestamp)
                  AND payload -> 'subject' -> 'content' -> 'environment' ->> 'id'
                      = ANY(ARRAY[\${environment:sqlstring}]::text[])
                GROUP BY time, environment
                ORDER BY time, environment
              `,
              "time_series",
            ),
          )
          .gridPos({ h: 6, w: 24, x: 0, y: 15 })
          .fieldConfig({
            defaults: {
              unit: "short",
              color: { mode: FieldColorModeId.PaletteClassic },
              custom: barChartCustomConfig("normal"),
              thresholds: {
                mode: ThresholdsMode.Absolute,
                // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
                steps: [{ value: null as any, color: "green" }],
              },
            },
            overrides: [],
          });
        applyTimeSeriesOptions(panel);
        return panel;
      })(),
    )
    // Row 3 — Lead Time: Artifact → Deployment
    .withPanel(
      new RowBuilder("Lead Time: Artifact → Deployment").gridPos({
        h: 1,
        w: 24,
        x: 0,
        y: 21,
      }),
    )
    .withPanel(
      newMarkdownPanel(
        dedent`
          **Formula**: \`P50(service.deployed.timestamp − artifact.published.timestamp)\`
          **Data source**: JOIN of \`service.deployed\` and \`artifact.published\` events via \`artifactId\`
          **DORA definition**: Commit → Production (this is a proxy: Artifact Publish → Deploy)
          **Limitations**: Excludes deployments without an \`artifactId\` in the payload. If the same
          artifact is published multiple times, only the most recent publication before the deployment is used.
        `,
        0,
        22,
        24,
        3,
      ),
    )
    .withPanel(
      (() => {
        const panel = new PanelBuilder()
          .title("Lead Time: Artifact → Deployment")
          .type("timeseries")
          .datasource(DATASOURCE)
          .withTarget(
            newSqlTarget(
              dedent`
                SELECT
                  time_bucket('1 day', svc.timestamp) AS time,
                  PERCENTILE_CONT(0.5) WITHIN GROUP (
                    ORDER BY EXTRACT('epoch' FROM (svc.timestamp - art.timestamp))
                  ) AS "P50 Lead Time (s)"
                FROM cdviz.cdevents_lake AS svc
                JOIN LATERAL (
                  SELECT timestamp
                  FROM cdviz.cdevents_lake
                  WHERE subject = 'artifact' AND predicate = 'published'
                    AND payload -> 'subject' ->> 'id'
                        = svc.payload -> 'subject' -> 'content' ->> 'artifactId'
                    AND timestamp <= svc.timestamp
                  ORDER BY timestamp DESC
                  LIMIT 1
                ) AS art ON true
                WHERE svc.subject = 'service'
                  AND svc.predicate IN ('deployed', 'upgraded')
                  AND $__timeFilter(svc.timestamp)
                  AND svc.payload -> 'subject' -> 'content' -> 'environment' ->> 'id'
                      = ANY(ARRAY[\${environment:sqlstring}]::text[])
                  AND svc.payload -> 'subject' -> 'content' ->> 'artifactId' IS NOT NULL
                GROUP BY time
                ORDER BY time
              `,
              "time_series",
            ),
          )
          .gridPos({ h: 6, w: 24, x: 0, y: 25 })
          .fieldConfig({
            defaults: {
              unit: "dtdurations",
              color: { mode: FieldColorModeId.PaletteClassic },
              custom: barChartCustomConfig("none"),
              thresholds: {
                mode: ThresholdsMode.Absolute,
                // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
                steps: [{ value: null as any, color: "green" }],
              },
            },
            overrides: [],
          });
        applyTimeSeriesOptions(panel);
        return panel;
      })(),
    )
    // Row 4 — Lead Time: Pipeline Duration
    .withPanel(
      new RowBuilder("Lead Time: Pipeline Duration").gridPos({
        h: 1,
        w: 24,
        x: 0,
        y: 31,
      }),
    )
    .withPanel(
      newMarkdownPanel(
        dedent`
          **Formula**: \`P50(pipelinerun.finished_at − pipelinerun.queued_at)\`
          **Data source**: \`cdviz.pipelinerun\` view
          **Note**: Not a standard DORA metric; a proxy for build time (the "commit → artifact" leg of lead time).
          **Limitations**: Requires \`pipelinerun.queued\` and \`pipelinerun.finished\` CDEvents.
        `,
        0,
        32,
        24,
        3,
      ),
    )
    .withPanel(
      createStatPanel(
        "Pipeline Duration",
        dedent`
          SELECT
            COALESCE(
              PERCENTILE_CONT(0.5) WITHIN GROUP (
                ORDER BY EXTRACT('epoch' FROM (finished_at - queued_at))
              ),
              0
            ) AS "P50 Pipeline Duration (s)"
          FROM cdviz.pipelinerun
          WHERE $__timeFilter(finished_at)
            AND queued_at IS NOT NULL
            AND finished_at IS NOT NULL
        `,
        0,
        35,
        "dtdurations",
        [
          // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
          { value: null as any, color: "green" },
          { value: 3600, color: "yellow" },
          { value: 86400, color: "red" },
        ],
        "Median (P50) pipeline run duration from queued to finished. Not a standard DORA metric; proxy for build time.",
      ),
    )
    .withPanel(
      (() => {
        const panel = new PanelBuilder()
          .title("Lead Time: Pipeline Duration")
          .type("timeseries")
          .datasource(DATASOURCE)
          .withTarget(
            newSqlTarget(
              dedent`
                SELECT
                  time_bucket('1 day', finished_at) AS time,
                  PERCENTILE_CONT(0.5) WITHIN GROUP (
                    ORDER BY EXTRACT('epoch' FROM (finished_at - queued_at))
                  ) AS "P50 Pipeline Duration (s)"
                FROM cdviz.pipelinerun
                WHERE $__timeFilter(finished_at)
                  AND queued_at IS NOT NULL
                  AND finished_at IS NOT NULL
                GROUP BY time
                ORDER BY time
              `,
              "time_series",
            ),
          )
          .gridPos({ h: 6, w: 24, x: 0, y: 39 })
          .fieldConfig({
            defaults: {
              unit: "dtdurations",
              color: { mode: FieldColorModeId.PaletteClassic },
              custom: barChartCustomConfig("none"),
              thresholds: {
                mode: ThresholdsMode.Absolute,
                // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
                steps: [{ value: null as any, color: "green" }],
              },
            },
            overrides: [],
          });
        applyTimeSeriesOptions(panel);
        return panel;
      })(),
    )
    // Row 5 — Time to Restore (All Incidents)
    .withPanel(
      new RowBuilder("Time to Restore (All Incidents)").gridPos({
        h: 1,
        w: 24,
        x: 0,
        y: 45,
      }),
    )
    .withPanel(
      newMarkdownPanel(
        dedent`
          **Formula**: \`P50(incident.resolved_at − incident.detected_at)\` for resolved incidents
          **Data source**: \`cdviz.incident\` view
          **DORA 2023**: "Failed Deployment Recovery Time" (FDRT) covers only deployment-induced failures.
          This panel covers **all incidents** (not linked to specific deployments) — values may differ from strict DORA FDRT.
          **Limitations**: Unresolved incidents are excluded. Requires \`incident.detected\` and \`incident.resolved\` CDEvents.
        `,
        0,
        46,
        24,
        3,
      ),
    )
    .withPanel(
      (() => {
        const panel = new PanelBuilder()
          .title("Time to Restore (All Incidents)")
          .type("timeseries")
          .datasource(DATASOURCE)
          .withTarget(
            newSqlTarget(
              dedent`
                SELECT
                  time_bucket('1 day', detected_at) AS time,
                  PERCENTILE_CONT(0.5) WITHIN GROUP (
                    ORDER BY EXTRACT('epoch' FROM (resolved_at - detected_at))
                  ) AS "P50 Time to Restore (s)"
                FROM cdviz.incident
                WHERE $__timeFilter(detected_at)
                  AND resolved_at IS NOT NULL
                GROUP BY time
                ORDER BY time
              `,
              "time_series",
            ),
          )
          .gridPos({ h: 6, w: 24, x: 0, y: 49 })
          .fieldConfig({
            defaults: {
              unit: "dtdurations",
              color: { mode: FieldColorModeId.PaletteClassic },
              custom: barChartCustomConfig("none"),
              thresholds: {
                mode: ThresholdsMode.Absolute,
                // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
                steps: [{ value: null as any, color: "green" }],
              },
            },
            overrides: [],
          });
        applyTimeSeriesOptions(panel);
        return panel;
      })(),
    )
    // Row 6 — Change Failure Rate
    .withPanel(
      new RowBuilder("Change Failure Rate").gridPos({
        h: 1,
        w: 24,
        x: 0,
        y: 55,
      }),
    )
    .withPanel(
      newMarkdownPanel(
        dedent`
          **Formula**: \`COUNT(service.rolledback) / COUNT(service.deployed | service.upgraded) × 100\`
          **Data source**: \`cdviz.cdevents_lake\` WHERE subject='service' AND predicate IN ('deployed','upgraded','rolledback')
          **Limitations**: Uses rollback events as a failure proxy. Hotfixes deployed forward (without an
          explicit \`service.rolledback\` event) are not counted as failures. Requires both deployment and rollback CDEvents.
        `,
        0,
        56,
        24,
        3,
      ),
    )
    .withPanel(
      (() => {
        const panel = new PanelBuilder()
          .title("Change Failure Rate")
          .type("timeseries")
          .datasource(DATASOURCE)
          .withTarget(
            newSqlTarget(
              dedent`
                SELECT
                  time_bucket('1 week', timestamp) AS time,
                  COALESCE(
                    100.0 * COUNT(*) FILTER (WHERE predicate = 'rolledback')
                      / NULLIF(COUNT(*) FILTER (WHERE predicate IN ('deployed', 'upgraded')), 0),
                    0
                  ) AS "Change Failure Rate (%)"
                FROM cdviz.cdevents_lake
                WHERE subject = 'service'
                  AND predicate IN ('deployed', 'upgraded', 'rolledback')
                  AND $__timeFilter(timestamp)
                  AND payload -> 'subject' -> 'content' -> 'environment' ->> 'id'
                      = ANY(ARRAY[\${environment:sqlstring}]::text[])
                GROUP BY time
                ORDER BY time
              `,
              "time_series",
            ),
          )
          .gridPos({ h: 6, w: 24, x: 0, y: 59 })
          .fieldConfig({
            defaults: {
              unit: "percent",
              color: { mode: FieldColorModeId.PaletteClassic },
              custom: barChartCustomConfig("none"),
              thresholds: {
                mode: ThresholdsMode.Absolute,
                // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
                steps: [{ value: null as any, color: "green" }],
              },
            },
            overrides: [],
          });
        applyTimeSeriesOptions(panel);
        return panel;
      })(),
    );

  return builder.build();
}
