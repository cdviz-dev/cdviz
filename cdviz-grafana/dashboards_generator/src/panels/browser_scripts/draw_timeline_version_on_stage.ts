// TODO Add [brush](https://d3js.org/d3-brush#d3-brush) to select a region, like with grafana panel
// TODO Add configuration (from DB ?) to define: order of stages, color of stage
/*
timestamp,action,stage,artifact_id
2025-01-01T10:00:00.926Z,published,repo,pkg:oci/app-a@0.0.1
2025-01-01T11:00:00.926Z,published,repo,pkg:oci/app-a@0.0.2
2025-01-02T11:00:00.926Z,published,repo,pkg:oci/app-a@0.0.3
2025-01-01T11:00:00.926Z,deployed,group1-dev/eu-1/ns-a,pkg:oci/app-a@0.0.1
2025-01-01T11:30:00.926Z,deployed,group1-uat/eu-1/ns-a,pkg:oci/app-a@0.0.1
2025-01-02T13:10:00.926Z,deployed,group1-prod/eu-2/ns-a,pkg:oci/app-a@0.0.1
2025-01-02T13:10:10.926Z,deployed,group1-prod/us-2/ns-a,pkg:oci/app-a@0.0.1
2025-01-02T13:00:00.926Z,published,repo,pkg:oci/app-a@0.0.4
2025-01-02T13:30:00.926Z,deployed,group1-dev/eu-1/ns-a,pkg:oci/app-a@0.0.4
*/
//import * as d3 from 'd3';
import type { DrawContext } from "../d3_panel";
import { type Datum, type DatumExt, transformData } from "./data_stages";
import { Tooltip } from "./tooltip";
import { newSvgArea } from "./utils";

export function draw(context: DrawContext<Datum>) {
  const data = context.data[0];
  const marginTop = 20;
  const marginRight = 100;
  const marginBottom = 30;
  // TODO use the width on label on Y axis
  const marginLeft = 100;
  const container = context.element;
  const { svg, width, height } = newSvgArea(container);
  const { series, domains } = transformData(data);

  // Declare the x (horizontal position) scale.
  // TODO display timeusing grafana format
  let domainMax = Math.max(domains.timestampMax, context.grafana.timeRange.to);
  let domainMin = Math.min(
    domains.timestampMin,
    context.grafana.timeRange.from,
  );
  const domainMargin = (domainMax - domainMin) * 0.05; // 5%
  domainMax += domainMargin;
  domainMin -= domainMargin;
  const x = d3
    .scaleUtc()
    .domain([domainMin, domainMax])
    .range([marginLeft, width - marginRight]);

  // Declare the y (vertical position) scale.
  // const y = d3.scaleLinear()
  //     .domain([0, 100])
  //     .range([height - marginBottom, marginTop]);
  const y = d3
    .scaleBand()
    .domain(domains.stages)
    .range([height - marginBottom, marginTop])
    .padding(0.1);
  //.round(false)

  // Create the categorical scales.
  // see https://observablehq.com/@d3/color-schemes
  // TODO adjust the number of colors to the number of ordinal
  // TODO allow to create group of same color (eg same color "amber" for every prod stage)
  const color = d3.scaleOrdinal<string>().domain(domains.stages).range(
    //d3.schemeCategory10
    //ref: tailwindcss.com/docs/colors
    [
      "#facc15", // amber-400 oklch(82.8% 0.189 84.429) #facc15
      "#c084fc", // purple-400 oklch(71.4% 0.203 305.504) #c084fc
      "#60a5fa", // blue-400 oklch(70.7% 0.165 254.624) #60a5fa
      "#a3e635", // lime-400 oklch(84.1% 0.238 128.85) #a3e635
      "#9ca3af", // gray-400 oklch(70.7% 0.022 261.325) #9ca3af
    ],
  );

  // Add the x-axis.
  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x));

  // Add the y-axis.
  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y))
    .call((g) => g.select(".domain").remove());

  // TODO add line per y unit
  // Add a axis every 1 minute
  // Define the interval for the horizontal axes
  const interval = 60;
  const axis = svg.append("g");
  const ticks = domains.stages;
  axis
    .append("g")
    .selectAll()
    .data(ticks)
    .join("line")
    .attr("stroke", (d, i) => d3.hsl(0, 0, 0.2).toString())
    .attr("x1", marginLeft)
    .attr("y1", (d, i) => (y(d) ?? 0) + y.bandwidth() / 2)
    .attr("x2", width - marginRight)
    .attr("y2", (d, i) => (y(d) ?? 0) + y.bandwidth() / 2);

  // Add tooltip on over
  const tooltip = new Tooltip<DatumExt>(container, (d) => {
    const artifactInfo = d.artifactInfo; //new ArtifactInfo(d.artifact_id);
    return `<b>${artifactInfo.base}</b>
        <br/>version: ${artifactInfo.version}
        <br/>tags: ${Array.from(artifactInfo.tags)}
        <br/>stage: ${d.stage}
        <br/>timestamp: ${d3.isoFormat(new Date(d.timestamp))}
        `;
  });

  // TODO Add label ?
  // Add datapoint into a group
  for (const value of series) {
    const latest = value.reduce((total, currentValue, currentIndex, arr) =>
      currentValue.timestamp > total.timestamp ? currentValue : total,
    );
    const latestColor = color(latest.stage);
    const latestColorStroke = (
      d3.color(latestColor)?.darker(2) ?? latestColor
    ).toString();
    const serieG = svg.append("g");
    const line = d3
      .line<DatumExt>()
      .x((d) => x(d.timestamp))
      .y((d) => (y(d.stage) ?? 0) + y.bandwidth() / 2);
    serieG
      .append("path")
      .attr("fill", "none")
      .attr("stroke", latestColorStroke)
      .attr("stroke-width", 1.5)
      .attr("d", line(value));
    serieG
      .selectAll("circle")
      .data(value)
      // .join(
      //     enter => enter.append("circle")
      //         .attr("cx", d => x(d.timestamp))
      //         .attr("cy", d => y(d.env))
      //         .attr("r", 3)
      //         .attr("fill", d => color(d.id))
      //         ,
      //     update => update,
      //     exit => exit.remove()
      // )
      .join("circle")
      .attr("cx", (d) => x(d.timestamp))
      .attr("cy", (d) => (y(d.stage) ?? 0) + y.bandwidth() / 2)
      .attr("r", 6)
      .attr("fill", latestColor)
      .attr("stroke", latestColorStroke)
      .attr("stroke-width", 1.5)
      //.on("mousemove", mousemove)
      .on("mouseleave", (e, d) => tooltip.hideOnMouseleave(e, d))
      .on("mouseover", (e, d) => tooltip.showOnMouseover(e, d));
  }
}
