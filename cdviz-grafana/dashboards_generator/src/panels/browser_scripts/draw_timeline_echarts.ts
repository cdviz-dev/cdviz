// ECharts-based artifact timeline visualization.
// Replaces draw_timeline_version_on_stage.ts (D3 + marcusolsson-dynamictext-panel) to avoid:
//   - External CDN dependency (https://esm.sh/d3@7.9.0 loaded at render time)
//   - GF_PANELS_DISABLE_SANITIZE_HTML=true requirement
//
// Runs inside volkovlabs-echarts-panel (Business Charts) which bundles Apache ECharts natively.
// The `getOption(context)` function is called by the panel and must return an ECharts option object.
//
// Layout: timeline (left ~63%) + summary table (right ~37%) in a single panel,
// keeping pixel-perfect Y-axis row alignment between timeline rows and table rows.
/*
Sample data:
timestamp,action,stage,artifact_id
2025-01-01T10:00:00.926Z,published,repo,pkg:oci/app-a@0.0.1
2025-01-01T11:00:00.926Z,published,repo,pkg:oci/app-a@0.0.2
2025-01-01T11:00:00.926Z,deployed,group1-dev/eu-1/ns-a,pkg:oci/app-a@0.0.1
2025-01-01T11:30:00.926Z,deployed,group1-uat/eu-1/ns-a,pkg:oci/app-a@0.0.1
2025-01-02T13:10:00.926Z,deployed,group1-prod/eu-2/ns-a,pkg:oci/app-a@0.0.1
*/
import type {
  EChartsContext,
  EChartsRenderItemApi,
  EChartsRenderItemParams,
} from "../echarts_panel";

import {
  type Datum,
  type DatumExt,
  summarizeSortedStages,
  transformData,
} from "./data_stages";

function dataFramesToDatums(
  series: EChartsContext["panel"]["data"]["series"],
): Datum[] {
  if (!series?.length) return [];
  const frame = series[0];
  const getField = (name: string) => frame.fields.find((f) => f.name === name);

  const timestampField = getField("timestamp");
  const actionField = getField("action");
  const stageField = getField("stage");
  const artifactIdField = getField("artifact_id");
  if (!timestampField) return [];

  return (timestampField.values as (string | number | Date)[]).map((ts, i) => ({
    timestamp: typeof ts === "number" ? ts : new Date(ts as string).getTime(),
    action: (actionField?.values[i] as string) ?? "",
    stage: (stageField?.values[i] as string) ?? "",
    artifact_id: (artifactIdField?.values[i] as string) ?? "",
  }));
}

function durationFormat(duration: number): string {
  if (duration <= 0) return "";
  const seconds = Math.floor(duration / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

function formatDatetime(ts: number): string {
  return new Date(ts).toISOString().replace("T", "\n").slice(0, 19);
}

function stageColorPalette(stageCount: number): string[] {
  // ref: tailwindcss.com/docs/colors
  const palettes: Record<number, string[]> = {
    2: ["#facc15", "#9ca3af"],
    3: ["#facc15", "#a3e635", "#9ca3af"],
    4: ["#facc15", "#60a5fa", "#a3e635", "#9ca3af"],
  };
  const base = palettes[stageCount] ?? [
    "#facc15", // amber-400
    "#c084fc", // purple-400
    "#60a5fa", // blue-400
    "#a3e635", // lime-400
    "#9ca3af", // gray-400
  ];
  if (stageCount <= base.length) return base.slice(0, stageCount);
  // If more stages than colors, fill with the last color
  return base.concat(
    new Array(stageCount - base.length).fill(base[base.length - 1]),
  );
}

export function getOption(context: EChartsContext) {
  const rawDatums = dataFramesToDatums(context.panel.data.series);
  if (rawDatums.length === 0) {
    return {
      title: {
        text: "No data",
        left: "center",
        top: "center",
        textStyle: { color: "#aaaaaa", fontSize: 16 },
      },
    };
  }

  const { series, domains } = transformData(rawDatums);
  const stages = domains.stages;
  const colors = stageColorPalette(stages.length);
  const colorMap = new Map(stages.map((s, i) => [s, colors[i]]));

  // Time range: prefer context.panel.data.timeRange (standard Grafana PanelData).
  // context.grafana.timeRange is absent in volkovlabs-echarts-panel v7.2.2.
  // Fall back to data domain bounds if neither is available.
  const timeRange = context.panel.data.timeRange ?? context.grafana?.timeRange;
  const toNum = (v: { valueOf(): number } | number | undefined) =>
    v === undefined ? undefined : typeof v === "number" ? v : v.valueOf();
  const trFrom = toNum(timeRange?.from) ?? domains.timestampMin;
  const trTo = toNum(timeRange?.to) ?? domains.timestampMax;

  const timeWindow =
    Math.max(trTo, domains.timestampMax) -
    Math.min(trFrom, domains.timestampMin);
  const weeks = timeWindow / (7 * 24 * 60 * 60 * 1000);

  let domainMax = Math.max(domains.timestampMax, trTo);
  let domainMin = Math.min(domains.timestampMin, trFrom);
  const domainMargin = (domainMax - domainMin) * 0.05;
  domainMax += domainMargin;
  domainMin -= domainMargin;
  // Mid-point used to get Y coordinates via api.coord() without side effects on axis
  const xMid = (domainMin + domainMax) / 2;

  const summaries = summarizeSortedStages(series, stages);
  const tableRows = summaries.map((s) => {
    const sum = s.getSummary();
    const frequency = weeks > 0 ? sum.countTimestamp / weeks : 0;
    return {
      stage: sum.stage,
      freq: `${frequency.toFixed(2)}/w`,
      transition: durationFormat(sum.intervalAverage),
      latest: sum.lastTimestamp ? formatDatetime(sum.lastTimestamp) : "N/A",
      latestVersion: sum.lastVersion ?? "",
    };
  });

  // Table column X offsets (pixels from table start)
  const COL_X = [0, 115, 175, 265, 375];
  const HEADERS = ["Stage", "Freq", "Transition", "Latest", "Latest Version"];

  const option = {
    backgroundColor: "transparent",
    animation: false,
    grid: {
      left: "2%",
      right: "37%",
      bottom: "15%",
      top: "5%",
      containLabel: true,
    },
    xAxis: {
      type: "time",
      min: domainMin,
      max: domainMax,
      axisLabel: {
        formatter: (val: number) => {
          const d = new Date(val);
          const range = domainMax - domainMin;
          if (range < 2 * 60 * 60 * 1000) {
            // < 2 hours: show HH:MM:SS
            return d.toISOString().slice(11, 19);
          }
          if (range < 2 * 24 * 60 * 60 * 1000) {
            // < 2 days: show HH:MM
            return d.toISOString().slice(11, 16);
          }
          // default: YYYY-MM-DD
          return d.toISOString().slice(0, 10);
        },
        rotate: 25,
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: "category",
      data: stages,
      axisLine: { show: false },
      axisTick: { show: false },
      // Stage labels are rendered in the table column instead of the axis
      axisLabel: { show: false },
      splitLine: {
        show: true,
        lineStyle: { color: "rgba(255,255,255,0.1)" },
      },
    },
    series: [
      // === Timeline lines: one polyline per artifact version group (silent, no tooltip) ===
      {
        type: "custom",
        name: "timeline-lines",
        coordinateSystem: "cartesian2d",
        clip: true,
        silent: true,
        tooltip: { show: false },
        renderItem: (
          params: EChartsRenderItemParams,
          api: EChartsRenderItemApi,
        ) => {
          const group: DatumExt[] = series[params.dataIndex];
          if (!group || group.length < 2)
            return { type: "group", children: [] };

          const latest = group.reduce((a, b) =>
            b.timestamp > a.timestamp ? b : a,
          );
          const lineColor = colorMap.get(latest.stage) ?? "#9ca3af";
          const points = group.map((d) => api.coord([d.timestamp, d.stage]));
          return {
            type: "polyline",
            shape: { points },
            style: {
              stroke: lineColor,
              lineWidth: 1.5,
              fill: "none",
              opacity: 0.6,
            },
          };
        },
        data: series.map((_, i) => i),
      },
      // === Timeline dots: one item per event point — each circle has its own tooltip ===
      {
        type: "scatter",
        name: "timeline-dots",
        coordinateSystem: "cartesian2d",
        clip: true,
        symbolSize: 12,
        data: series.flatMap((group) => {
          const latest = group.reduce((a, b) =>
            b.timestamp > a.timestamp ? b : a,
          );
          const dotColor = colorMap.get(latest.stage) ?? "#9ca3af";
          return group.map((d) => ({
            value: [d.timestamp, d.stage],
            itemStyle: { color: dotColor, borderColor: dotColor, opacity: 0.9 },
            tooltipText:
              `<b>${d.artifactInfo.base}</b>` +
              `<br/>version: ${d.artifactInfo.version}` +
              `<br/>tags: ${Array.from(d.artifactInfo.tags)}` +
              `<br/>stage: ${d.stage.replaceAll("\n", "<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;")}` +
              `<br/>timestamp: ${new Date(d.timestamp).toISOString()}`,
          }));
        }),
        tooltip: { show: true },
      },
      // === Table header (positioned once at top of table area) ===
      {
        type: "custom",
        name: "table-header",
        coordinateSystem: "none",
        silent: true,
        tooltip: { show: false },
        renderItem: (
          _params: EChartsRenderItemParams,
          api: EChartsRenderItemApi,
        ) => {
          const canvasW = api.getWidth();
          const canvasH = api.getHeight();
          // Table starts where grid.right (37%) begins — ~63% from left
          const tableX = canvasW * 0.645;
          const topY = canvasH * 0.04;
          return {
            type: "group",
            children: HEADERS.map((h, i) => ({
              type: "text" as const,
              style: {
                text: h,
                x: tableX + COL_X[i],
                y: topY,
                fill: "#888888",
                fontSize: 11,
                fontWeight: "bold",
                textAlign: "left",
              },
            })),
          };
        },
        data: [0],
      },
      // === Table rows: one per stage, Y-aligned with the Y axis via api.coord() ===
      {
        type: "custom",
        name: "table-rows",
        coordinateSystem: "cartesian2d",
        // clip: false allows rendering outside the grid (into the right margin)
        clip: false,
        silent: true,
        tooltip: { show: false },
        renderItem: (
          params: EChartsRenderItemParams,
          api: EChartsRenderItemApi,
        ) => {
          const i = params.dataIndex;
          const row = tableRows[i];
          const stage = stages[i];

          // Use api.coord() to get pixel Y perfectly aligned with the Y axis bands.
          // xMid is within the axis domain; we only use the resulting Y coordinate.
          const [_x, cy] = api.coord([xMid, stage]);

          const canvasW = api.getWidth();
          const tableX = canvasW * 0.645;
          const stageColor = colorMap.get(stage) ?? "#9ca3af";

          const cellValues = [
            row.stage,
            row.freq,
            row.transition,
            row.latest,
            row.latestVersion,
          ];
          const textColors = [
            stageColor, // stage name: stage color
            "#cccccc", // frequency
            "#cccccc", // transition duration
            "#aaaaaa", // latest timestamp
            "#60a5fa", // latest version: blue
          ];

          return {
            type: "group" as const,
            children: cellValues.flatMap((text, ci) => {
              // Support multi-line text (e.g. date + time on separate lines)
              const lines = (text ?? "").split("\n");
              return lines.map((line, li) => ({
                type: "text" as const,
                style: {
                  text: line,
                  x: tableX + COL_X[ci],
                  // Center multi-line text vertically around cy
                  y: cy - (lines.length - 1) * 6 + li * 12,
                  fill: textColors[ci],
                  fontSize: 11,
                  textAlign: "left",
                },
              }));
            }),
          };
        },
        // Each item encodes the stage (by name on Y axis) so api.coord() returns the correct Y
        data: stages.map((stage) => [xMid, stage]),
        encode: { x: 0, y: 1 },
      },
    ],
    tooltip: {
      trigger: "item",
      confine: true,
      enterable: false,
      formatter: (params: {
        seriesName: string;
        data?: { tooltipText?: string };
      }) => {
        if (params.seriesName !== "timeline-dots") return "";
        return params.data?.tooltipText ?? "";
      },
    },
    // Brush component for drag-select time range.
    // toolbox: [] hides the brush's built-in icon row (rect/lineX/keep/clear buttons).
    brush: {
      xAxisIndex: 0,
      brushType: "lineX",
      brushMode: "single",
      toolbox: [],
    },
    toolbox: {
      show: false,
    },
  };

  // Register brushEnd → update Grafana time range.
  // Use context.panel.chart (volkovlabs-echarts-panel v7+ API).
  // .off() before .on() prevents duplicate handlers across re-renders.
  const instance = context.panel.chart;
  if (instance && context.grafana?.locationService) {
    const locationService = context.grafana.locationService;
    instance.off("brushEnd");
    instance.on("brushEnd", (params) => {
      const p = params as {
        areas?: Array<{ coordRange?: [number, number] }>;
      };
      const coordRange = p.areas?.[0]?.coordRange;
      if (!coordRange || coordRange[1] <= coordRange[0]) {
        // No valid selection — clear and re-arm brush
        instance.dispatchAction({ type: "brush", areas: [] });
        return;
      }
      const [from, to] = coordRange;
      locationService.partial(
        { from: String(Math.round(from)), to: String(Math.round(to)) },
        true,
      );
      // Clear the brush selection after applying
      instance.dispatchAction({ type: "brush", areas: [] });
    });
    // Pre-activate lineX brush so drag works immediately (like Grafana time series panel),
    // without requiring the user to click a toolbox icon first.
    // Deferred so the panel can call setOption() before we dispatch.
    setTimeout(() => {
      instance.dispatchAction({
        type: "takeGlobalCursor",
        key: "brush",
        brushOption: { brushType: "lineX", brushMode: "single" },
      });
    }, 0);
  }

  return option;
}
