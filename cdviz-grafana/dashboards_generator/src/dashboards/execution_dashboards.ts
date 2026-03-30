import {
  ConstantVariableBuilder,
  type Dashboard,
  DashboardBuilder,
  type QueryVariableBuilder,
  RowBuilder,
} from "@grafana/grafana-foundation-sdk/dashboard";
import dedent from "dedent";
import {
  createAvgQueueTimeStatPanel,
  createAvgRuntimeStatPanel,
  createAvgTimeToReportStatPanel,
  createAvgTimeToUpdateStatPanel,
  createCompletionRateStatPanel,
  createCountPerDayPanel,
  createDurationTimeSeriesPanel,
  createExecutionTablePanel,
  createFailureRateStatPanel,
  createResolutionRateStatPanel,
  createTotalDurationStatPanel,
  type LifecycleConfig,
  SELECTED_FIELD_NAME,
} from "./execution_panels";
import { applyDefaults, DEFAULT_TAGS, newVariableOnDatasource } from "./utils";

type DashboardSpec = Pick<
  LifecycleConfig,
  | "subject"
  | "label"
  | "payloadSelector"
  | "idFallbackSelector"
  | "withQueuedAt"
  | "lifecycleType"
>;

const DASHBOARD_CONFIGS: DashboardSpec[] = [
  // {
  //   subject: "build",
  //   label: "Build",
  //   payloadSelector: "payload -> 'subject' ->> 'id'",
  //   withQueuedAt: true,
  //   lifecycleType: "traditional",
  // },
  {
    subject: "pipelinerun",
    label: "Pipeline",
    payloadSelector: "payload -> 'subject' -> 'content' ->> 'pipelineName'",
    withQueuedAt: true,
    lifecycleType: "traditional",
  },
  {
    subject: "taskrun",
    label: "Task",
    payloadSelector: "payload -> 'subject' -> 'content' ->> 'taskName'",
    withQueuedAt: false,
    lifecycleType: "traditional",
  },
  {
    subject: "testcaserun",
    label: "Test",
    payloadSelector:
      "payload -> 'subject' -> 'content' -> 'testCase' ->> 'name'",
    idFallbackSelector:
      "payload -> 'subject' -> 'content' -> 'testCase' ->> 'id'",
    withQueuedAt: true,
    lifecycleType: "traditional",
  },
  {
    subject: "testsuiterun",
    label: "Test Suite",
    payloadSelector:
      "payload -> 'subject' -> 'content' -> 'testSuite' ->> 'name'",
    idFallbackSelector:
      "payload -> 'subject' -> 'content' -> 'testSuite' ->> 'id'",
    withQueuedAt: true,
    lifecycleType: "traditional",
  },
  {
    subject: "incident",
    label: "Incident",
    payloadSelector:
      "payload -> 'subject' -> 'content' -> 'environment' ->> 'id'",
    withQueuedAt: false,
    lifecycleType: "incident",
  },
  {
    subject: "ticket",
    label: "Ticket",
    payloadSelector: "payload -> 'subject' -> 'content' ->> 'ticketType'",
    withQueuedAt: false,
    lifecycleType: "ticket",
  },
];

export async function buildDashboards() {
  return Promise.all(DASHBOARD_CONFIGS.map(buildDashboard));
}

async function buildDashboard(spec: DashboardSpec): Promise<Dashboard> {
  const lifecycle = resolveLifecycle(spec);
  const { subject, label } = lifecycle;

  const overviewRow = new RowBuilder(`${label}: Overview`).collapsed(false);
  const overviewPanels = buildOverviewPanels(lifecycle);

  const builder = applyDefaults(
    new DashboardBuilder(`${label}: Executions`).uid(`${subject}_executions`),
  )
    .tags([subject].concat(DEFAULT_TAGS))
    .withVariable(newVariable4Selected(lifecycle))
    .withVariable(new ConstantVariableBuilder("limit").value("20"))
    .withRow(overviewRow);

  for (const panel of overviewPanels) {
    builder.withPanel(panel);
  }

  builder.withRow(
    new RowBuilder(`${label}: Latest $limit Executions`)
      .collapsed(true)
      .withPanel(createExecutionTablePanel(lifecycle)),
  );

  return builder.build();
}

function buildResolvedSelector(
  payloadSelector: string,
  idFallbackSelector: string | undefined,
  prefix: "payload" | "last_payload",
): string {
  const applyPrefix = (expr: string) =>
    prefix === "last_payload" ? expr.replace(/^payload/, "last_payload") : expr;
  const fallback =
    idFallbackSelector !== undefined
      ? `${applyPrefix(idFallbackSelector)}, `
      : "";
  return `COALESCE(NULLIF(${applyPrefix(payloadSelector)}, ''), ${fallback}'unknown')`;
}

function resolveLifecycle(spec: DashboardSpec): LifecycleConfig {
  const {
    subject,
    label,
    payloadSelector,
    idFallbackSelector,
    withQueuedAt,
    lifecycleType,
  } = spec;
  const resolvedSelector = buildResolvedSelector(
    payloadSelector,
    idFallbackSelector,
    "last_payload",
  );

  switch (lifecycleType) {
    case "incident":
      return {
        subject,
        label,
        payloadSelector,
        idFallbackSelector,
        withQueuedAt,
        lifecycleType,
        selectAt: "detected_at, reported_at, resolved_at",
        timeFilter:
          "($__timeFilter(detected_at) OR $__timeFilter(resolved_at))",
        startCol: "detected_at",
        endCol: "resolved_at",
        resolvedSelector,
      };
    case "ticket":
      return {
        subject,
        label,
        payloadSelector,
        idFallbackSelector,
        withQueuedAt,
        lifecycleType,
        selectAt: "created_at, updated_at, closed_at",
        timeFilter: "($__timeFilter(created_at) OR $__timeFilter(closed_at))",
        startCol: "created_at",
        endCol: "closed_at",
        resolvedSelector,
      };
    default:
      return {
        subject,
        label,
        payloadSelector,
        idFallbackSelector,
        withQueuedAt,
        lifecycleType,
        selectAt: withQueuedAt
          ? "queued_at, started_at, finished_at"
          : "started_at, finished_at",
        timeFilter: withQueuedAt
          ? "($__timeFilter(queued_at) OR $__timeFilter(finished_at))"
          : "$__timeFilter(finished_at)",
        startCol: "started_at",
        endCol: "finished_at",
        resolvedSelector,
      };
  }
}

function buildOverviewPanels(lifecycle: LifecycleConfig) {
  const { lifecycleType, withQueuedAt } = lifecycle;

  const panels = [
    createTotalDurationStatPanel(lifecycle),
    createAvgRuntimeStatPanel(lifecycle),
  ];

  if (lifecycleType === "traditional" && withQueuedAt) {
    panels.push(createAvgQueueTimeStatPanel(lifecycle));
  } else if (lifecycleType === "incident") {
    panels.push(createAvgTimeToReportStatPanel(lifecycle));
  } else if (lifecycleType === "ticket") {
    panels.push(createAvgTimeToUpdateStatPanel(lifecycle));
  }

  if (lifecycleType === "incident") {
    panels.push(createResolutionRateStatPanel(lifecycle));
  } else if (lifecycleType === "ticket") {
    panels.push(createCompletionRateStatPanel(lifecycle));
  } else {
    panels.push(createFailureRateStatPanel(lifecycle));
  }

  panels.push(
    createDurationTimeSeriesPanel(lifecycle),
    createCountPerDayPanel(lifecycle),
  );

  return panels;
}

function newVariable4Selected(
  lifecycle: LifecycleConfig,
): QueryVariableBuilder {
  const { subject, label, payloadSelector, idFallbackSelector } = lifecycle;
  const valueExpr = buildResolvedSelector(
    payloadSelector,
    idFallbackSelector,
    "payload",
  );
  return newVariableOnDatasource(
    dedent`
      SELECT DISTINCT ${valueExpr} AS __value
      FROM cdviz.cdevents_lake
      WHERE $__timeFilter(timestamp)
      AND subject = '${subject}'
      ORDER BY __value
    `,
    SELECTED_FIELD_NAME,
    label,
  );
}
