// TODO Add [brush](https://d3js.org/d3-brush#d3-brush) to select a region, like with grafana panel
// TODO Add configuration (from DB ?) to define: order of environment, collor & shape of environment / service / artifact /...

import type { HierarchyRectangularNode } from "d3";
import type { DrawContext } from "../d3_panel";
import { newSvgArea } from "./utils";

// based on https://observablehq.com/@d3/zoomable-sunburst
type Datum = {
  count: number;
  path: string;
};

type DatumNode = { name: string; children: DatumNode[]; value: number };

type HZone = { x0: number; y0: number; x1: number; y1: number };
interface HNode extends HierarchyRectangularNode<DatumNode> {
  current: HNode;
  target?: HZone;
}

export function draw(context: DrawContext<Datum>) {
  const data = context.data[0];

  const container = context.element;
  const { svg, width, height } = newSvgArea(container);

  // Transform data into a hierarchy
  const dataHierarchy: DatumNode = { name: "", children: [], value: 0 };

  let depthMax = 0;
  for (const { count, path } of data) {
    const fragments = path
      .split("/")
      // path can be a uri, so remove the scheme and empty part
      .filter((v) => !!v && !v.endsWith(":"));
    depthMax = Math.max(depthMax, fragments.length);
    let parent = dataHierarchy;
    let i = 0;
    for (; i < fragments.length - 1; i++) {
      let n = parent.children?.find((d) => d.name === fragments[i]);
      if (!n) {
        n = { name: fragments[i], children: [], value: 0 };
        parent.children?.push(n);
      }
      parent = n;
    }
    parent.children?.push({ name: fragments[i], children: [], value: count });
  }

  // Compute the layout.
  const hierarchy = d3
    .hierarchy(dataHierarchy)
    .sum((d) => d.value)
    .sort((a, b) => (b.value || 0) - (a.value || 0));
  //@ts-expect-error
  const root: HNode = d3
    .partition<DatumNode>()
    .size([2 * Math.PI, hierarchy.height + 1])(hierarchy);
  root.each((d) => {
    d.current = d;
  });

  const levelDisplayed = Math.min(3, depthMax) + 1; // +1 for the center
  const side = Math.min(width, height);
  svg
    .attr("font-size", side / 40)
    .attr("viewBox", [-width / 2, -height / 2, width, height]);

  // Create the color scale.
  const color = d3.scaleOrdinal(
    d3.quantize(d3.interpolateRainbow, dataHierarchy.children.length + 1),
  );

  // Create the arc generator.
  const radius = side / (levelDisplayed * 2);

  const arc = d3
    .arc<HierarchyRectangularNode<DatumNode>>()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius * 1.5)
    .innerRadius((d) => d.y0 * radius)
    .outerRadius((d) => Math.max(d.y0 * radius, d.y1 * radius - 1));

  // Append the arcs.
  const path = svg
    .append("g")
    .selectAll("path")
    .data(root.descendants().slice(1))
    .join("path")
    .attr("fill", (d) => {
      let node = d;
      while (node.depth > 1 && node.parent) node = node.parent;
      return color(node.data.name);
    })
    .attr("fill-opacity", (d) =>
      arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0,
    )
    .attr("pointer-events", (d) => (arcVisible(d.current) ? "auto" : "none"))
    .attr("d", (d) => arc(d.current));

  // Make them clickable if they have children.
  path
    .filter((d) => !!d.children)
    .style("cursor", "pointer")
    .on("click", clicked);

  const format = d3.format(",d");
  path.append("title").text(
    (d) =>
      `${d
        .ancestors()
        .map((d) => d.data.name)
        .reverse()
        .join("/")}\n${format(d.value || 0)}`,
  );

  const label = svg
    .append("g")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .style("user-select", "none")
    .selectAll("text")
    .data(root.descendants().slice(1))
    .join("text")
    .attr("dy", "0.35em")
    .attr("fill-opacity", (d) => +labelVisible(d.current))
    .attr("transform", (d) => labelTransform(d.current))
    .text((d) => d.data.name);

  const parent = svg
    .append("circle")
    .datum(root)
    .attr("r", radius)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("click", clicked);

  // Handle zoom on click.
  function clicked(event: MouseEvent, p: HNode) {
    parent.datum(p.parent || root);

    root.each((d) => {
      d.target = {
        x0:
          Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        x1:
          Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        y0: Math.max(0, d.y0 - p.depth),
        y1: Math.max(0, d.y1 - p.depth),
      };
    });

    const t = svg.transition().duration(event.altKey ? 7500 : 750);

    // Transition the data on all arcs, even the ones that aren’t visible,
    // so that if this transition is interrupted, entering arcs will start
    // the next transition from the desired position.
    path
      //@ts-expect-error
      .transition(t)
      .tween("data", (d) => {
        if (d.target) {
          const i = d3.interpolate(d.current as HZone, d.target);
          // return (t) => {
          //   const step = i(t);
          //   d.current.x0 = step.x0;
          //   d.current.y0 = step.y0;
          //   d.current.x1 = step.x1;
          //   d.current.y1 = step.y1;
          // };
          return (t) => {
            // @ts-expect-error
            d.current = i(t);
          };
        }
        return (_t) => {};
      })
      //@ts-expect-error
      .filter((d) => {
        //@ts-expect-error
        return +this?.getAttribute("fill-opacity") || arcVisible(d.target);
      })
      .attr("fill-opacity", (d) =>
        arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0,
      )
      .attr("pointer-events", (d) => (arcVisible(d.target) ? "auto" : "none"))

      //@ts-expect-error
      .attrTween("d", (d) => () => arc(d.current));

    label
      //@ts-expect-error
      .filter((d) => {
        //@ts-expect-error
        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
      })
      //@ts-expect-error
      .transition(t)
      .attr("fill-opacity", (d) => +labelVisible(d.target))
      .attrTween("transform", (d) => () => labelTransform(d.current));
  }

  function arcVisible(d: HZone | undefined) {
    return !!d && d.y1 <= levelDisplayed && d.y0 >= 1 && d.x1 > d.x0;
    //return true;
  }

  function labelVisible(d: HZone | undefined) {
    return (
      !!d &&
      d.y1 <= levelDisplayed &&
      d.y0 >= 1 &&
      (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03
    );
    // return true;
  }

  function labelTransform(d: HZone) {
    const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
    const y = ((d.y0 + d.y1) / 2) * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }
}
