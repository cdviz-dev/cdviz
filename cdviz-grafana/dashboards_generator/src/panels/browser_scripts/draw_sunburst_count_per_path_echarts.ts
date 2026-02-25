// ECharts-based sunburst visualization for event counts by path.
// Replaces draw_sunburst_count_per_path.ts (D3 + marcusolsson-dynamictext-panel) to avoid:
//   - External CDN dependency (https://esm.sh/d3@7.9.0 loaded at render time)
//   - GF_PANELS_DISABLE_SANITIZE_HTML=true requirement
//
// ECharts has a native `sunburst` chart type — no custom renderItem needed.
// Drill-down on click is handled by `nodeClick: 'rootToNode'` (built-in).
import type { EChartsContext } from "../echarts_panel";

type InputDatum = { count: number; path: string };
type SunburstNode = {
  name: string;
  value?: number;
  children?: SunburstNode[];
};
type TooltipParams = {
  name: string;
  value: number;
  treePathInfo: Array<{ name: string; value: number }>;
};

function dataFramesToDatums(
  series: EChartsContext["panel"]["data"]["series"],
): InputDatum[] {
  if (!series?.length) return [];
  const frame = series[0];
  const getField = (name: string) => frame.fields.find((f) => f.name === name);

  const countField = getField("count");
  const pathField = getField("path");
  if (!countField || !pathField) return [];

  return (pathField.values as string[]).map((path, i) => ({
    count: Number(countField.values[i]),
    path: path ?? "",
  }));
}

function buildHierarchy(data: InputDatum[]): SunburstNode[] {
  const root: SunburstNode = { name: "", children: [] };

  for (const { count, path } of data) {
    // Split on "/" and remove empty parts and URI scheme fragments (e.g. "https:")
    const fragments = path.split("/").filter((v) => !!v && !v.endsWith(":"));
    if (fragments.length === 0) continue;

    let parent = root;
    for (let i = 0; i < fragments.length - 1; i++) {
      let node = parent.children?.find((d) => d.name === fragments[i]);
      if (!node) {
        node = { name: fragments[i], children: [] };
        parent.children?.push(node);
      } else if (!node.children) {
        // Promote leaf to internal node if a longer path needs to pass through it
        node.children = [];
      }
      parent = node;
    }

    const lastName = fragments[fragments.length - 1];
    const existing = parent.children?.find((d) => d.name === lastName);
    if (existing) {
      existing.value = (existing.value ?? 0) + count;
    } else {
      parent.children?.push({ name: lastName, value: count });
    }
  }

  return root.children ?? [];
}

export function getOption(context: EChartsContext) {
  const datums = dataFramesToDatums(context.panel.data.series);
  if (datums.length === 0) {
    return {
      title: {
        text: "No data",
        left: "center",
        top: "center",
        textStyle: { color: "#aaaaaa", fontSize: 16 },
      },
    };
  }

  const data = buildHierarchy(datums);

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      formatter: (params: TooltipParams) => {
        // Build path string from root to current node, skipping the invisible root
        const path = params.treePathInfo
          .map((n) => n.name)
          .filter((n) => n)
          .join(" / ");
        return `${path}<br/><b>${params.value}</b>`;
      },
    },
    series: [
      {
        type: "sunburst",
        data,
        radius: ["15%", "90%"],
        sort: "desc",
        // Click a segment to zoom in (equivalent to D3's zoomable sunburst click handler)
        nodeClick: "rootToNode",
        emphasis: {
          focus: "ancestor",
        },
        label: {
          show: true,
          rotate: "radial",
          fontSize: 11,
          overflow: "truncate",
          width: 70,
        },
        levels: [
          // Level 0: invisible root (center circle — click to zoom out)
          {},
          // Level 1: top-level arcs — larger label, tangential rotation
          {
            label: {
              rotate: "tangential",
              fontSize: 12,
              fontWeight: "bold",
            },
            itemStyle: { borderWidth: 2 },
          },
          // Level 2+: inner default label style
          {
            label: { rotate: "radial", fontSize: 10 },
          },
        ],
      },
    ],
  };
}
