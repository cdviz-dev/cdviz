import {
  DataqueryBuilder,
  EditorMode,
} from "@grafana/grafana-foundation-sdk/bigquery";
import {
  FieldColorModeId,
  PanelBuilder,
  ThresholdsMode,
} from "@grafana/grafana-foundation-sdk/dashboard";
import dedent from "dedent";

export type LifecycleType = "traditional" | "incident" | "ticket";

export interface LifecycleConfig {
  subject: string;
  label: string;
  payloadSelector: string;
  withQueuedAt: boolean;
  lifecycleType: LifecycleType;
  startCol: string;
  endCol: string;
  timeFilter: string;
  selectAt: string;
  idFallbackSelector?: string;
  resolvedSelector: string;
}

export const SELECTED_FIELD_NAME = "selected_value";

export const DATASOURCE = {
  type: "grafana-postgresql-datasource",
  // biome-ignore lint/suspicious/noTemplateCurlyInString: template for grafana
  uid: "${datasource}",
} as const;

// --- Shared helpers ---

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

function createStatPanel(
  title: string,
  query: string,
  gridX: number,
  unit: string,
  // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
  thresholdSteps: Array<{ value: any; color: string }>,
): PanelBuilder {
  return new PanelBuilder()
    .title(title)
    .type("stat")
    .datasource(DATASOURCE)
    .withTarget(newSqlTarget(query))
    .gridPos({ h: 4, w: 6, x: gridX, y: 0 })
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

// --- Stat panels ---

export function createTotalDurationStatPanel(
  lifecycle: LifecycleConfig,
): PanelBuilder {
  const {
    subject,
    lifecycleType,
    timeFilter,
    startCol,
    endCol,
    resolvedSelector,
  } = lifecycle;

  const title =
    lifecycleType === "incident"
      ? "Total Time to Resolve"
      : lifecycleType === "ticket"
        ? "Total Time to Close"
        : "Total Duration";

  const query = dedent`
    SELECT
      COALESCE(SUM(extract('epoch' from (${endCol} - ${startCol}))), 0) AS total_duration
    FROM cdviz.${subject}
    WHERE
      ${timeFilter}
      AND ${resolvedSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
      AND ${endCol} IS NOT NULL
  `;

  return createStatPanel(title, query, 0, "s", [
    // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
    { value: null as any, color: "green" },
  ]);
}

export function createAvgRuntimeStatPanel(
  lifecycle: LifecycleConfig,
): PanelBuilder {
  const {
    subject,
    lifecycleType,
    timeFilter,
    startCol,
    endCol,
    resolvedSelector,
  } = lifecycle;

  const title =
    lifecycleType === "incident"
      ? "Avg Resolution Time"
      : lifecycleType === "ticket"
        ? "Avg Time to Close"
        : "Avg Runtime";

  const query = dedent`
    SELECT
      COALESCE(AVG(extract('epoch' from (${endCol} - ${startCol}))), 0) AS avg_runtime
    FROM cdviz.${subject}
    WHERE
      ${timeFilter}
      AND ${resolvedSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
      AND ${endCol} IS NOT NULL
  `;

  return createStatPanel(title, query, 6, "s", [
    // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
    { value: null as any, color: "blue" },
  ]);
}

export function createAvgQueueTimeStatPanel(
  lifecycle: LifecycleConfig,
): PanelBuilder {
  const { subject, timeFilter, resolvedSelector } = lifecycle;

  const query = dedent`
    SELECT
      COALESCE(AVG(extract('epoch' from (started_at - queued_at))), 0) AS avg_queue_time
    FROM cdviz.${subject}
    WHERE
      ${timeFilter}
      AND ${resolvedSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
      AND finished_at IS NOT NULL
      AND queued_at IS NOT NULL
  `;

  return createStatPanel("Avg Queue Time", query, 12, "s", [
    // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
    { value: null as any, color: "purple" },
  ]);
}

export function createAvgTimeToReportStatPanel(
  lifecycle: LifecycleConfig,
): PanelBuilder {
  const { subject, timeFilter, resolvedSelector } = lifecycle;

  const query = dedent`
    SELECT
      COALESCE(AVG(extract('epoch' from (reported_at - detected_at))), 0) AS avg_time_to_report
    FROM cdviz.${subject}
    WHERE
      ${timeFilter}
      AND ${resolvedSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
      AND reported_at IS NOT NULL
      AND detected_at IS NOT NULL
  `;

  return createStatPanel("Avg Time to Report", query, 12, "s", [
    // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
    { value: null as any, color: "purple" },
  ]);
}

export function createAvgTimeToUpdateStatPanel(
  lifecycle: LifecycleConfig,
): PanelBuilder {
  const { subject, timeFilter, resolvedSelector } = lifecycle;

  const query = dedent`
    SELECT
      COALESCE(AVG(extract('epoch' from (updated_at - created_at))), 0) AS avg_time_to_update
    FROM cdviz.${subject}
    WHERE
      ${timeFilter}
      AND ${resolvedSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
      AND updated_at IS NOT NULL
      AND created_at IS NOT NULL
  `;

  return createStatPanel("Avg Time to Update", query, 12, "s", [
    // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
    { value: null as any, color: "purple" },
  ]);
}

export function createResolutionRateStatPanel(
  lifecycle: LifecycleConfig,
): PanelBuilder {
  const { subject, timeFilter, resolvedSelector } = lifecycle;

  const query = dedent`
    SELECT
      COALESCE(
        100.0 * COUNT(*) FILTER (WHERE resolved_at IS NOT NULL) / NULLIF(COUNT(*), 0),
        0
      ) AS resolution_rate
    FROM cdviz.${subject}
    WHERE
      ${timeFilter}
      AND ${resolvedSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
  `;

  return createStatPanel("Resolution Rate", query, 18, "percent", [
    // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
    { value: null as any, color: "red" },
    { value: 75, color: "yellow" },
    { value: 90, color: "green" },
  ]);
}

export function createCompletionRateStatPanel(
  lifecycle: LifecycleConfig,
): PanelBuilder {
  const { subject, timeFilter, resolvedSelector } = lifecycle;

  const query = dedent`
    SELECT
      COALESCE(
        100.0 * COUNT(*) FILTER (
          WHERE last_payload -> 'subject' -> 'content' ->> 'resolution' = 'completed'
        ) / NULLIF(COUNT(*) FILTER (WHERE closed_at IS NOT NULL), 0),
        0
      ) AS completion_rate
    FROM cdviz.${subject}
    WHERE
      ${timeFilter}
      AND ${resolvedSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
  `;

  return createStatPanel("Completion Rate", query, 18, "percent", [
    // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
    { value: null as any, color: "red" },
    { value: 75, color: "yellow" },
    { value: 90, color: "green" },
  ]);
}

export function createFailureRateStatPanel(
  lifecycle: LifecycleConfig,
): PanelBuilder {
  const { subject, withQueuedAt, timeFilter, resolvedSelector } = lifecycle;

  const outcomeField =
    subject === "testcaserun" || subject === "testsuiterun"
      ? "last_payload -> 'subject' -> 'content' ->> 'outcome'"
      : "outcome";

  const query = dedent`
    SELECT
      COALESCE(
        100.0 * COUNT(*) FILTER (WHERE ${outcomeField} IN ('fail', 'failure', 'error')) / NULLIF(COUNT(*), 0),
        0
      ) AS failure_rate
    FROM cdviz.${subject}
    WHERE
      ${timeFilter}
      AND ${resolvedSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
      AND finished_at IS NOT NULL
  `;

  return createStatPanel(
    "Failure Rate",
    query,
    withQueuedAt ? 18 : 12,
    "percent",
    [
      // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
      { value: null as any, color: "green" },
      { value: 10, color: "yellow" },
      { value: 25, color: "red" },
    ],
  );
}

// --- Time series panels ---

export function createDurationTimeSeriesPanel(
  lifecycle: LifecycleConfig,
): PanelBuilder {
  const { subject, label, timeFilter, endCol, startCol, resolvedSelector } =
    lifecycle;

  const query = dedent`
    SELECT
      time_bucket('1 day', ${endCol}) AS time,
      SUM(extract('epoch' from (${endCol} - ${startCol}))) AS total_duration
    FROM cdviz.${subject}
    WHERE
      ${timeFilter}
      AND ${resolvedSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
      AND ${endCol} IS NOT NULL
    GROUP BY time
    ORDER BY time
  `;

  const panel = new PanelBuilder()
    .title(`${label} Total Duration per Day`)
    .type("timeseries")
    .datasource(DATASOURCE)
    .withTarget(newSqlTarget(query, "time_series"))
    .gridPos({ h: 4, w: 24, x: 0, y: 4 })
    .fieldConfig({
      defaults: {
        unit: "s",
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
}

const COUNT_PER_DAY_OVERRIDES = [
  {
    matcher: { id: "byRegexp", options: ".*(fail|error).*" },
    properties: [{ id: "color", value: { mode: "fixed", fixedColor: "red" } }],
  },
  {
    matcher: { id: "byRegexp", options: ".*(cancel|skip).*" },
    properties: [
      { id: "color", value: { mode: "fixed", fixedColor: "semi-dark-orange" } },
    ],
  },
  {
    matcher: { id: "byRegexp", options: ".*(pass|success|complet|resolved).*" },
    properties: [
      { id: "color", value: { mode: "fixed", fixedColor: "green" } },
    ],
  },
  {
    matcher: { id: "byRegexp", options: ".*detected.*" },
    properties: [
      { id: "color", value: { mode: "fixed", fixedColor: "orange" } },
    ],
  },
  {
    matcher: { id: "byRegexp", options: ".*(reported|warn|withdrawn).*" },
    properties: [
      { id: "color", value: { mode: "fixed", fixedColor: "yellow" } },
    ],
  },
  {
    matcher: { id: "byRegexp", options: ".*(open|unknown|other).*" },
    properties: [{ id: "color", value: { mode: "fixed", fixedColor: "blue" } }],
  },
  {
    matcher: { id: "byRegexp", options: ".*duplicate.*" },
    properties: [{ id: "color", value: { mode: "fixed", fixedColor: "gray" } }],
  },
];

function buildCountPerDayQuery(lifecycle: LifecycleConfig): string {
  const { subject, lifecycleType, timeFilter, withQueuedAt, resolvedSelector } =
    lifecycle;

  if (lifecycleType === "incident") {
    return dedent`
      SELECT
        time_bucket('1 day', COALESCE(resolved_at, detected_at)) AS time,
        CASE
          WHEN resolved_at IS NOT NULL THEN 'resolved'
          WHEN reported_at IS NOT NULL THEN 'reported'
          WHEN detected_at IS NOT NULL THEN 'detected'
          ELSE 'unknown'
        END AS status,
        COUNT(*) AS count
      FROM cdviz.${subject}
      WHERE
        ${timeFilter}
        AND ${resolvedSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
      GROUP BY time, status
      ORDER BY time, status
    `;
  }

  if (lifecycleType === "ticket") {
    return dedent`
      SELECT
        time_bucket('1 day', COALESCE(closed_at, created_at)) AS time,
        CASE
          WHEN closed_at IS NULL THEN 'open'
          WHEN last_payload -> 'subject' -> 'content' ->> 'resolution' = 'completed' THEN 'completed'
          WHEN last_payload -> 'subject' -> 'content' ->> 'resolution' = 'withdrawn' THEN 'withdrawn'
          WHEN last_payload -> 'subject' -> 'content' ->> 'resolution' = 'duplicate' THEN 'duplicate'
          ELSE COALESCE(last_payload -> 'subject' -> 'content' ->> 'resolution', 'unknown')
        END AS status,
        COUNT(*) AS count
      FROM cdviz.${subject}
      WHERE
        ${timeFilter}
        AND ${resolvedSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
      GROUP BY time, status
      ORDER BY time, status
    `;
  }

  // Traditional execution lifecycle
  const outcomeField =
    subject === "testcaserun" || subject === "testsuiterun"
      ? "last_payload -> 'subject' -> 'content' ->> 'outcome'"
      : "outcome";
  const timeExpr = withQueuedAt
    ? "COALESCE(finished_at, started_at, queued_at)"
    : "COALESCE(finished_at, started_at)";
  const nullTimeFilter = withQueuedAt
    ? "AND (finished_at IS NOT NULL OR started_at IS NOT NULL OR queued_at IS NOT NULL)"
    : "AND (finished_at IS NOT NULL OR started_at IS NOT NULL)";

  return dedent`
    SELECT
      time_bucket('1 day', ${timeExpr}) AS time,
      CASE
        WHEN finished_at IS NULL THEN 'cancelled'
        WHEN ${outcomeField} = 'success' THEN 'success'
        WHEN ${outcomeField} = 'pass' THEN 'pass'
        WHEN ${outcomeField} = 'fail' THEN 'fail'
        WHEN ${outcomeField} = 'failure' THEN 'fail'
        WHEN ${outcomeField} = 'error' THEN 'error'
        WHEN ${outcomeField} = 'skip' THEN 'skip'
        WHEN ${outcomeField} = 'skipped' THEN 'skip'
        ELSE COALESCE(${outcomeField}, 'unknown')
      END AS status,
      COUNT(*) AS count
    FROM cdviz.${subject}
    WHERE
      ${timeFilter}
      ${nullTimeFilter}
      AND ${resolvedSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
    GROUP BY time, status
    ORDER BY time, status
  `;
}

export function createCountPerDayPanel(
  lifecycle: LifecycleConfig,
): PanelBuilder {
  const { label } = lifecycle;

  const panel = new PanelBuilder()
    .title(`${label} Total Number of Run per Day`)
    .type("timeseries")
    .datasource(DATASOURCE)
    .withTarget(newSqlTarget(buildCountPerDayQuery(lifecycle), "time_series"))
    .gridPos({ h: 4, w: 24, x: 0, y: 8 })
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
      overrides: COUNT_PER_DAY_OVERRIDES,
    });

  applyTimeSeriesOptions(panel);
  return panel;
}

// --- Execution table panel ---

function buildOperationalTableQuery(lifecycle: LifecycleConfig): string {
  const { subject, lifecycleType, timeFilter, resolvedSelector } = lifecycle;
  const startCol = lifecycleType === "incident" ? "detected_at" : "created_at";
  const endCol = lifecycleType === "incident" ? "resolved_at" : "closed_at";
  const firstColLabel = lifecycleType === "incident" ? "Environment" : "Type";
  const statusField =
    lifecycleType === "ticket"
      ? "last_payload -> 'subject' -> 'content' ->> 'resolution'"
      : "CASE WHEN resolved_at IS NOT NULL THEN 'resolved' ELSE 'open' END";

  return dedent`
    SELECT
      ${resolvedSelector} AS "${firstColLabel}",
      subject_id AS "ID",
      ${startCol} AS "Started",
      ${endCol} AS "Completed",
      extract('epoch' from (${endCol} - ${startCol})) AS "Duration",
      ${statusField} AS "Status",
      COALESCE(last_payload -> 'subject' -> 'content' ->> 'uri', last_payload -> 'subject' -> 'content' ->> 'url') AS "URL"
    FROM cdviz.${subject}
    WHERE
      ${timeFilter}
      AND ${resolvedSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
    ORDER BY ${endCol} DESC NULLS FIRST
    LIMIT \${limit}
  `;
}

function buildTraditionalTableQuery(lifecycle: LifecycleConfig): string {
  const { subject, withQueuedAt, timeFilter, resolvedSelector } = lifecycle;
  const needsOutcomeFromPayload =
    subject === "testcaserun" || subject === "testsuiterun";

  return dedent`
    WITH
      -- Get last N executions per name with all details
      execution_history AS (
        SELECT
          ${resolvedSelector} AS name,
          subject_id,
          ${needsOutcomeFromPayload ? "last_payload -> 'subject' -> 'content' ->> 'outcome' AS outcome," : "outcome,"}
          extract('epoch' from (finished_at - started_at)) AS run_duration,
          ${withQueuedAt ? "extract('epoch' from (started_at - queued_at)) AS queue_duration," : ""}
          COALESCE(last_payload -> 'subject' -> 'content' ->> 'uri', last_payload -> 'subject' -> 'content' ->> 'url') AS url,
          started_at,
          finished_at,
          ${withQueuedAt ? "queued_at," : ""}
          row_number() OVER (PARTITION BY ${resolvedSelector} ORDER BY finished_at DESC) AS rn
        FROM cdviz.${subject}
        WHERE
          ${timeFilter}
          AND ${resolvedSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
          AND finished_at IS NOT NULL
      ),

      -- Aggregate statistics per name
      aggregated_stats AS (
        SELECT
          name,
          COALESCE(PERCENTILE_CONT(0.80) WITHIN GROUP (ORDER BY run_duration), 0) AS p80_duration,
          COUNT(*) AS total_runs
        FROM execution_history
        GROUP BY name
      ),

      -- Create arrays of historical data for visualization
      history_arrays AS (
        SELECT
          name,
          COALESCE(array_agg(run_duration ORDER BY finished_at ASC) FILTER (WHERE rn <= 20), ARRAY[]::numeric[]) AS run_duration_history,
          ${withQueuedAt ? "COALESCE(array_agg(queue_duration ORDER BY finished_at ASC) FILTER (WHERE rn <= 20), ARRAY[]::numeric[]) AS queue_duration_history," : ""}
          COALESCE(array_agg(outcome ORDER BY finished_at ASC) FILTER (WHERE rn <= 20), ARRAY[]::text[]) AS outcome_history,
          COALESCE(array_agg(subject_id ORDER BY finished_at ASC) FILTER (WHERE rn <= 20), ARRAY[]::text[]) AS subject_id_history,
          COALESCE(array_agg(url ORDER BY finished_at ASC) FILTER (WHERE rn <= 20), ARRAY[]::text[]) AS url_history,
          COALESCE(array_agg(started_at ORDER BY finished_at ASC) FILTER (WHERE rn <= 20), ARRAY[]::timestamptz[]) AS started_times,
          COALESCE(array_agg(finished_at ORDER BY finished_at ASC) FILTER (WHERE rn <= 20), ARRAY[]::timestamptz[]) AS completion_times${withQueuedAt ? "," : ""}
          ${withQueuedAt ? "COALESCE(array_agg(queued_at ORDER BY finished_at ASC) FILTER (WHERE rn <= 20), ARRAY[]::timestamptz[]) AS queued_times" : ""}
        FROM execution_history
        WHERE rn <= 20
        GROUP BY name
      ),

      -- Aggregate outcome counts across all runs per name
      outcome_summary AS (
        SELECT
          name,
          COUNT(*) FILTER (WHERE outcome IN ('pass', 'success')) AS passed,
          COUNT(*) FILTER (WHERE outcome IN ('fail', 'failure', 'error')) AS failed,
          COUNT(*) FILTER (WHERE outcome IN ('skip', 'skipped')) AS skipped
        FROM execution_history
        GROUP BY name
      )

    -- Main query: 1 row per name
    SELECT
      s.name AS "Name",
      h.run_duration_history AS "Run History (s)",
      h.outcome_history AS "Outcome History",
      h.subject_id_history AS "Run IDs",
      h.url_history AS "URLs",
      h.started_times AS "Started Times",
      h.completion_times AS "Completion Times",
      ${withQueuedAt ? 'h.queue_duration_history AS "Queue History (s)",' : ""}
      s.p80_duration AS "P80 Duration (s)",
      s.total_runs AS "Total Runs",
      COALESCE(o.passed, 0) AS "Passed",
      COALESCE(o.failed, 0) AS "Failed",
      COALESCE(o.skipped, 0) AS "Skipped"
    FROM aggregated_stats s
    LEFT JOIN history_arrays h ON s.name = h.name
    LEFT JOIN outcome_summary o ON s.name = o.name
    ORDER BY s.name
  `;
}

export function createExecutionTablePanel(
  lifecycle: LifecycleConfig,
): PanelBuilder {
  const { withQueuedAt, lifecycleType } = lifecycle;
  const isOperational =
    lifecycleType === "incident" || lifecycleType === "ticket";

  const panel = new PanelBuilder()
    .title(`$${SELECTED_FIELD_NAME} - Summary`)
    .type(isOperational ? "table" : "cdviz-executiontable-panel")
    .datasource(DATASOURCE)
    .withTarget(
      newSqlTarget(
        isOperational
          ? buildOperationalTableQuery(lifecycle)
          : buildTraditionalTableQuery(lifecycle),
      ),
    )
    .gridPos({ h: 16, w: 24, x: 0, y: 12 })
    .fieldConfig({
      defaults: {},
      overrides: isOperational
        ? [
            {
              matcher: { id: "byName", options: "Duration" },
              properties: [{ id: "unit", value: "dtdurations" }],
            },
          ]
        : [],
    });

  if (!isOperational) {
    // @ts-expect-error - accessing internal property for custom plugin configuration
    panel.internal.options = {
      maxHistoryItems: 20,
      showQueueHistory: withQueuedAt,
      barHeight: 20,
      barGap: 2,
      sortBy: [{ displayName: "Run History (s)", desc: true }],
    };
  }

  return panel;
}
