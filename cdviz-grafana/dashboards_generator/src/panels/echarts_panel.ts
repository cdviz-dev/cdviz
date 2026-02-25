// The ECharts panel uses [volkovlabs-echarts-panel](https://volkovlabs.io/plugins/business-charts/)
// (Business Charts) maintained by Grafana Labs.
// Advantages over marcusolsson-dynamictext-panel + D3:
// - No GF_PANELS_DISABLE_SANITIZE_HTML required
// - Apache ECharts is bundled — zero external CDN calls
import * as dashboard from "@grafana/grafana-foundation-sdk/dashboard";

export interface EChartsPanelOptions {
  getOption: string;
  renderer: string;
  editor: { format: string };
}

export const defaultEChartsPanelOptions = (): EChartsPanelOptions => ({
  getOption: "",
  renderer: "canvas",
  editor: { format: "javascript" },
});

export class EChartsPanelBuilder extends dashboard.PanelBuilder {
  constructor() {
    super();
    this.internal.type = "volkovlabs-echarts-panel"; // panel plugin ID
    if (!this.internal.options) {
      this.internal.options = defaultEChartsPanelOptions();
    }
  }

  script(script: string): this {
    this.internal.options.getOption = script;
    return this;
  }
}

// example: `console.log(await buildjsForEChartsPanel(['./panels/browser_scripts/draw_timeline_echarts.ts']));`
export async function buildjsForEChartsPanel(
  entrypoints: string[],
): Promise<string> {
  const assemble = await Bun.build({
    target: "browser",
    entrypoints,
    // The script body must return the ECharts option object.
    // volkovlabs-echarts-panel v7+ calls this script with `context` in scope.
    footer: "return getOption(context);",
    minify: false,
  });
  // TODO raise error when assemble failed
  let txt = await assemble.outputs[0].text();
  // Strip ES module export statement — the bundle runs as a script body, not an ES module
  txt = txt.replaceAll(/export\s*\{[^}]*\};\s*\n?/g, "");
  return txt;
}

// Minimal types for ECharts custom series renderItem callback.
// ECharts is bundled inside the plugin and not available as an npm package,
// so we define only the subset of the API we actually use.
export type EChartsRenderItemParams = { dataIndex: number };
export type EChartsRenderItemApi = {
  coord(data: (number | string)[]): [number, number];
  getWidth(): number;
  getHeight(): number;
};

// Time range shape shared across context locations
export type EChartsTimeRange = {
  from: { valueOf(): number } | number;
  to: { valueOf(): number } | number;
};

// Context shape for ECharts panel (volkovlabs-echarts-panel v7+).
// The time range is on context.panel.data.timeRange (standard Grafana PanelData).
// context.grafana.timeRange is absent in v7.2.2 and should not be relied upon.
export type EChartsContext = {
  panel: {
    data: {
      series: Array<{
        fields: Array<{ name: string; values: unknown[] }>;
      }>;
      timeRange?: EChartsTimeRange;
    };
  };
  grafana?: {
    timeRange?: EChartsTimeRange;
  };
};
