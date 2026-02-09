import {
  DataqueryBuilder,
  EditorMode,
} from "@grafana/grafana-foundation-sdk/bigquery";
import {
  ConstantVariableBuilder,
  type Dashboard,
  DashboardBuilder,
  FieldColorModeId,
  PanelBuilder,
  type QueryVariableBuilder,
  RowBuilder,
  ThresholdsMode,
} from "@grafana/grafana-foundation-sdk/dashboard";
import dedent from "dedent";
import { applyDefaults, DEFAULT_TAGS, newVariableOnDatasource } from "./utils";

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
        subject: "testsuiterun",
        label: "Test Suite",
        payloadSelector:
          "payload -> 'subject' -> 'content' -> 'testSuite' ->> 'name'",
        withQueuedAt: true,
      },
    ].map((d) =>
      buildDashboard(d.subject, d.label, d.payloadSelector, d.withQueuedAt),
    ),
  );
}

async function buildDashboard(
  subject: string,
  label: string,
  payloadSelector: string,
  withQueuedAt: boolean,
): Promise<Dashboard> {
  const datasource = {
    type: "grafana-postgresql-datasource",
    // biome-ignore lint/suspicious/noTemplateCurlyInString: template for grafana
    uid: "${datasource}",
  };

  let selectAt = "started_at, finished_at";
  let timeFilter = "$__timeFilter(finished_at)";

  if (withQueuedAt) {
    selectAt = `queued_at, ${selectAt}`;
    timeFilter = "($__timeFilter(queued_at) OR $__timeFilter(finished_at))";
  }

  // Top row: Stat panels
  // For expanded rows, create the row without panels, then add panels to dashboard
  const overviewRow = new RowBuilder(`${label}: Overview`).collapsed(false);

  // Create overview panels
  const overviewPanels = [
    createTotalDurationStatPanel(
      subject,
      datasource,
      timeFilter,
      payloadSelector,
    ),
    createAvgRuntimeStatPanel(subject, datasource, timeFilter, payloadSelector),
  ];

  if (withQueuedAt) {
    overviewPanels.push(
      createAvgQueueTimeStatPanel(
        subject,
        datasource,
        timeFilter,
        payloadSelector,
      ),
    );
  }

  overviewPanels.push(
    createFailureRateStatPanel(
      subject,
      datasource,
      timeFilter,
      payloadSelector,
    ),
  );

  // Time series panel
  overviewPanels.push(
    createDurationTimeSeriesPanel(
      subject,
      label,
      datasource,
      timeFilter,
      payloadSelector,
    ),
  );

  // Count per day panel
  overviewPanels.push(
    createCountPerDayPanel(
      subject,
      label,
      datasource,
      timeFilter,
      payloadSelector,
    ),
  );

  const builder = applyDefaults(
    new DashboardBuilder(`${label}: Executions`).uid(`${subject}_executions`),
  )
    .tags([subject].concat(DEFAULT_TAGS))
    .withVariable(newVariable4Selected(subject, label, payloadSelector))
    .withVariable(new ConstantVariableBuilder("limit").value("20"))
    .withRow(overviewRow);

  // Add overview panels directly to dashboard (for expanded row)
  for (const panel of overviewPanels) {
    builder.withPanel(panel);
  }

  builder.withRow(
    new RowBuilder(`${label}: Latest $limit Executions`)
      .collapsed(true)
      .withPanel(
        createExecutionTablePanel(
          subject,
          label,
          payloadSelector,
          withQueuedAt,
          datasource,
          selectAt,
          timeFilter,
        ),
      ),
  );
  return builder.build();
}

function createTotalDurationStatPanel(
  subject: string,
  datasource: { type: string; uid: string },
  timeFilter: string,
  payloadSelector: string,
): PanelBuilder {
  const query = dedent`
    SELECT
      COALESCE(SUM(extract('epoch' from (finished_at - started_at))), 0) AS total_duration
    FROM cdviz.${subject}
    WHERE
      ${timeFilter}
      AND last_${payloadSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
      AND finished_at IS NOT NULL
  `;

  return new PanelBuilder()
    .title("Total Duration")
    .type("stat")
    .datasource(datasource)
    .withTarget(
      new DataqueryBuilder()
        .datasource(datasource)
        .editorMode(EditorMode.Code)
        // @ts-expect-error
        .format("table")
        .rawQuery(true)
        .rawSql(query),
    )
    .gridPos({
      h: 4,
      w: 6,
      x: 0,
      y: 0,
    })
    .fieldConfig({
      defaults: {
        unit: "s",
        thresholds: {
          mode: ThresholdsMode.Absolute,
          // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
          steps: [{ value: null as any, color: "green" }],
        },
      },
      overrides: [],
    });
}

function createAvgRuntimeStatPanel(
  subject: string,
  datasource: { type: string; uid: string },
  timeFilter: string,
  payloadSelector: string,
): PanelBuilder {
  const query = dedent`
    SELECT
      COALESCE(AVG(extract('epoch' from (finished_at - started_at))), 0) AS avg_runtime
    FROM cdviz.${subject}
    WHERE
      ${timeFilter}
      AND last_${payloadSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
      AND finished_at IS NOT NULL
  `;

  return new PanelBuilder()
    .title("Avg Runtime")
    .type("stat")
    .datasource(datasource)
    .withTarget(
      new DataqueryBuilder()
        .datasource(datasource)
        .editorMode(EditorMode.Code)
        // @ts-expect-error
        .format("table")
        .rawQuery(true)
        .rawSql(query),
    )
    .gridPos({
      h: 4,
      w: 6,
      x: 6,
      y: 0,
    })
    .fieldConfig({
      defaults: {
        unit: "s",
        thresholds: {
          mode: ThresholdsMode.Absolute,
          // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
          steps: [{ value: null as any, color: "blue" }],
        },
      },
      overrides: [],
    });
}

function createAvgQueueTimeStatPanel(
  subject: string,
  datasource: { type: string; uid: string },
  timeFilter: string,
  payloadSelector: string,
): PanelBuilder {
  const query = dedent`
    SELECT
      COALESCE(AVG(extract('epoch' from (started_at - queued_at))), 0) AS avg_queue_time
    FROM cdviz.${subject}
    WHERE
      ${timeFilter}
      AND last_${payloadSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
      AND finished_at IS NOT NULL
      AND queued_at IS NOT NULL
  `;

  return new PanelBuilder()
    .title("Avg Queue Time")
    .type("stat")
    .datasource(datasource)
    .withTarget(
      new DataqueryBuilder()
        .datasource(datasource)
        .editorMode(EditorMode.Code)
        // @ts-expect-error
        .format("table")
        .rawQuery(true)
        .rawSql(query),
    )
    .gridPos({
      h: 4,
      w: 6,
      x: 12,
      y: 0,
    })
    .fieldConfig({
      defaults: {
        unit: "s",
        thresholds: {
          mode: ThresholdsMode.Absolute,
          // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
          steps: [{ value: null as any, color: "purple" }],
        },
      },
      overrides: [],
    });
}

function createFailureRateStatPanel(
  subject: string,
  datasource: { type: string; uid: string },
  timeFilter: string,
  payloadSelector: string,
): PanelBuilder {
  const needsOutcomeFromPayload =
    subject === "testcaserun" || subject === "testsuiterun";

  const outcomeField = needsOutcomeFromPayload
    ? "last_payload -> 'subject' -> 'content' ->> 'outcome'"
    : "outcome";

  const query = dedent`
    SELECT
      COALESCE(
        100.0 * COUNT(*) FILTER (WHERE ${outcomeField} = 'fail') / NULLIF(COUNT(*), 0),
        0
      ) AS failure_rate
    FROM cdviz.${subject}
    WHERE
      ${timeFilter}
      AND last_${payloadSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
      AND finished_at IS NOT NULL
  `;

  const xPos =
    subject === "pipelinerun" ||
    subject === "testcaserun" ||
    subject === "testsuiterun"
      ? 18
      : 12;

  return new PanelBuilder()
    .title("Failure Rate")
    .type("stat")
    .datasource(datasource)
    .withTarget(
      new DataqueryBuilder()
        .datasource(datasource)
        .editorMode(EditorMode.Code)
        // @ts-expect-error
        .format("table")
        .rawQuery(true)
        .rawSql(query),
    )
    .gridPos({
      h: 4,
      w: 6,
      x: xPos,
      y: 0,
    })
    .fieldConfig({
      defaults: {
        unit: "percent",
        thresholds: {
          mode: ThresholdsMode.Absolute,
          steps: [
            // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
            { value: null as any, color: "green" },
            { value: 10, color: "yellow" },
            { value: 25, color: "red" },
          ],
        },
      },
      overrides: [],
    });
}

function createDurationTimeSeriesPanel(
  subject: string,
  label: string,
  datasource: { type: string; uid: string },
  timeFilter: string,
  payloadSelector: string,
): PanelBuilder {
  const query = dedent`
    SELECT
      time_bucket('1 day', finished_at) AS time,
      SUM(extract('epoch' from (finished_at - started_at))) AS total_duration
    FROM cdviz.${subject}
    WHERE
      ${timeFilter}
      AND last_${payloadSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
      AND finished_at IS NOT NULL
    GROUP BY time
    ORDER BY time
  `;

  const panel = new PanelBuilder()
    .title(`${label} Total Duration per Day`)
    .type("timeseries")
    .datasource(datasource)
    .withTarget(
      new DataqueryBuilder()
        .datasource(datasource)
        .editorMode(EditorMode.Code)
        // @ts-expect-error
        .format("time_series")
        .rawQuery(true)
        .rawSql(query),
    )
    .gridPos({
      h: 4,
      w: 24,
      x: 0,
      y: 4,
    })
    .fieldConfig({
      defaults: {
        unit: "s",
        color: {
          mode: FieldColorModeId.PaletteClassic,
        },
        custom: {
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
          hideFrom: {
            legend: false,
            tooltip: false,
            viz: false,
          },
          insertNulls: false,
          lineInterpolation: "linear",
          lineWidth: 0,
          pointSize: 5,
          scaleDistribution: {
            type: "linear",
          },
          showPoints: "never",
          showValues: false,
          spanNulls: false,
          stacking: {
            group: "A",
            mode: "none",
          },
        },
        thresholds: {
          mode: ThresholdsMode.Absolute,
          // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
          steps: [{ value: null as any, color: "green" }],
        },
      },
      overrides: [],
    });

  // Configure tooltip and legend (accessing internal property)
  // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires internal access for options config
  (panel as any).internal.options = {
    // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires internal access for options config
    ...(panel as any).internal.options,
    tooltip: {
      mode: "multi",
      sort: "none",
    },
    legend: {
      displayMode: "table",
      placement: "right",
      showLegend: true,
      calcs: ["sum"],
      width: 300,
    },
  };

  return panel;
}

function createCountPerDayPanel(
  subject: string,
  label: string,
  datasource: { type: string; uid: string },
  timeFilter: string,
  payloadSelector: string,
): PanelBuilder {
  const needsOutcomeFromPayload =
    subject === "testcaserun" || subject === "testsuiterun";

  const outcomeField = needsOutcomeFromPayload
    ? "last_payload -> 'subject' -> 'content' ->> 'outcome'"
    : "outcome";

  // All execution types have outcomes, just in different locations
  // testcaserun/testsuiterun: in payload, pipelinerun/taskrun: in outcome column
  const query = dedent`
    SELECT
      time_bucket('1 day', COALESCE(finished_at, started_at)) AS time,
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
      AND last_${payloadSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
    GROUP BY time, status
    ORDER BY time, status
  `;

  const panel = new PanelBuilder()
    .title(`${label} Total Number of Run per Day`)
    .type("timeseries")
    .datasource(datasource)
    .withTarget(
      new DataqueryBuilder()
        .datasource(datasource)
        .editorMode(EditorMode.Code)
        // @ts-expect-error
        .format("time_series")
        .rawQuery(true)
        .rawSql(query),
    )
    .gridPos({
      h: 4,
      w: 24,
      x: 0,
      y: 8,
    })
    .fieldConfig({
      defaults: {
        unit: "short",
        color: {
          mode: FieldColorModeId.PaletteClassic,
        },
        custom: {
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
          hideFrom: {
            legend: false,
            tooltip: false,
            viz: false,
          },
          insertNulls: false,
          lineInterpolation: "linear",
          lineWidth: 0,
          pointSize: 5,
          scaleDistribution: {
            type: "linear",
          },
          showPoints: "never",
          showValues: false,
          spanNulls: false,
          stacking: {
            group: "A",
            mode: "normal",
          },
        },
        thresholds: {
          mode: ThresholdsMode.Absolute,
          // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires null for default threshold
          steps: [{ value: null as any, color: "green" }],
        },
      },
      overrides: [
        // Red for failures and errors
        {
          matcher: { id: "byRegexp", options: ".*(fail|error).*" },
          properties: [
            {
              id: "color",
              value: { mode: "fixed", fixedColor: "red" },
            },
          ],
        },
        // Light gray for cancelled and skipped (visible in dark mode)
        {
          matcher: { id: "byRegexp", options: ".*(cancel|skip).*" },
          properties: [
            {
              id: "color",
              value: { mode: "fixed", fixedColor: "semi-dark-orange" },
            },
          ],
        },
        // Green for pass, success, and completed
        {
          matcher: { id: "byRegexp", options: ".*(pass|success|complet).*" },
          properties: [
            {
              id: "color",
              value: { mode: "fixed", fixedColor: "green" },
            },
          ],
        },
        // Yellow for warning
        {
          matcher: { id: "byRegexp", options: ".*warn.*" },
          properties: [
            {
              id: "color",
              value: { mode: "fixed", fixedColor: "yellow" },
            },
          ],
        },
        // Blue for unknown/other
        {
          matcher: { id: "byRegexp", options: ".*(unknown|other).*" },
          properties: [
            {
              id: "color",
              value: { mode: "fixed", fixedColor: "blue" },
            },
          ],
        },
      ],
    });

  // Configure tooltip and legend (accessing internal property)
  // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires internal access for options config
  (panel as any).internal.options = {
    // biome-ignore lint/suspicious/noExplicitAny: Grafana SDK requires internal access for options config
    ...(panel as any).internal.options,
    tooltip: {
      mode: "multi",
      sort: "none",
    },
    legend: {
      displayMode: "table",
      placement: "right",
      showLegend: true,
      calcs: ["sum"],
      width: 300,
    },
  };

  return panel;
}

function createExecutionTablePanel(
  subject: string,
  _label: string,
  payloadSelector: string,
  withQueuedAt: boolean,
  datasource: { type: string; uid: string },
  _selectAt: string,
  timeFilter: string,
): PanelBuilder {
  const isTestSuite = subject === "testsuiterun";
  // testcaserun and testsuiterun views don't have outcome column, need to extract from payload
  const needsOutcomeFromPayload =
    subject === "testcaserun" || subject === "testsuiterun";

  // Build SQL query: 1 row per name with aggregated history
  const tableQuery = dedent`
    WITH
      -- Get last N executions per name with all details
      execution_history AS (
        SELECT
          last_${payloadSelector} AS name,
          subject_id,
          ${needsOutcomeFromPayload ? "last_payload -> 'subject' -> 'content' ->> 'outcome' AS outcome," : "outcome,"}
          extract('epoch' from (finished_at - started_at)) AS run_duration,
          ${withQueuedAt ? "extract('epoch' from (started_at - queued_at)) AS queue_duration," : ""}
          last_payload -> 'subject' -> 'content' ->> 'url' AS url,
          started_at,
          finished_at,
          ${withQueuedAt ? "queued_at," : ""}
          row_number() OVER (PARTITION BY last_${payloadSelector} ORDER BY finished_at DESC) AS rn
        FROM cdviz.${subject}
        WHERE
          ${timeFilter}
          AND last_${payloadSelector} = ANY(ARRAY[\${${SELECTED_FIELD_NAME}:sqlstring}]::text[])
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
      )${
        isTestSuite
          ? `,

      -- For test suites: count passed/failed/skipped from last execution
      last_suite_breakdown AS (
        SELECT
          e.name,
          COUNT(*) FILTER (WHERE tc.last_payload -> 'subject' -> 'content' ->> 'outcome' = 'pass') AS passed,
          COUNT(*) FILTER (WHERE tc.last_payload -> 'subject' -> 'content' ->> 'outcome' = 'fail') AS failed,
          COUNT(*) FILTER (WHERE tc.last_payload -> 'subject' -> 'content' ->> 'outcome' = 'skip') AS skipped
        FROM (
          SELECT DISTINCT ON (name) name, subject_id
          FROM execution_history
          WHERE rn = 1
        ) e
        LEFT JOIN cdviz.testcaserun tc
          ON tc.last_payload -> 'subject' -> 'content' -> 'testSuiteRun' ->> 'id' = e.subject_id
        GROUP BY e.name
      )`
          : ""
      }

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
      s.total_runs AS "Total Runs"${
        isTestSuite
          ? `,
      COALESCE(t.passed, 0) AS "Passed",
      COALESCE(t.failed, 0) AS "Failed",
      COALESCE(t.skipped, 0) AS "Skipped"`
          : ""
      }
    FROM aggregated_stats s
    LEFT JOIN history_arrays h ON s.name = h.name${
      isTestSuite
        ? `
    LEFT JOIN last_suite_breakdown t ON s.name = t.name`
        : ""
    }
    ORDER BY s.name
  `;

  const panel = new PanelBuilder()
    .title(`$${SELECTED_FIELD_NAME} - Summary`)
    .type("cdviz-executiontable-panel")
    .datasource(datasource)
    .withTarget(
      new DataqueryBuilder()
        .datasource(datasource)
        .editorMode(EditorMode.Code)
        // @ts-expect-error
        .format("table")
        .rawQuery(true)
        .rawSql(tableQuery),
    )
    .gridPos({
      h: 8,
      w: 24,
      x: 0,
      y: 0,
    });

  // Update grid position to account for panels above
  panel.gridPos({
    h: 16,
    w: 24,
    x: 0,
    y: 12,
  });

  // Configure custom plugin options
  // @ts-expect-error - accessing internal property for custom plugin configuration
  panel.internal.options = {
    maxHistoryItems: 20,
    showQueueHistory: withQueuedAt,
    barHeight: 20,
    barGap: 2,
  };

  return panel;
}

function newVariable4Selected(
  subject: string,
  label: string,
  payloadSelector: string,
): QueryVariableBuilder {
  return newVariableOnDatasource(
    dedent`
      SELECT DISTINCT ${payloadSelector} AS __value
      FROM cdviz.cdevents_lake
      WHERE $__timeFilter(timestamp)
      AND subject = '${subject}'
      ORDER BY __value
    `,
    SELECTED_FIELD_NAME,
    label,
  );
}
