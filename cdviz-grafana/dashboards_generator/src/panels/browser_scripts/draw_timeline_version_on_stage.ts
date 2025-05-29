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
import {
  type Datum,
  type DatumExt,
  summarizeSortedStages,
  transformData,
} from "./data_stages";
import { Tooltip } from "./tooltip";
import { newSvgArea } from "./utils";

// Add the x-axis with RFC 3339 timestamp formatting and a 45-degree rotation.
// TODO manage grafana time format & timezone preferences: browser/locale or UTC
const dtFormatMillisecond = d3.utcFormat(".%L");
const dtFormatSecond = d3.utcFormat(":%S");
const dtFormatMinute = d3.utcFormat("%H:%M");
const dtFormatHour = d3.utcFormat("%H:%M");
const dtFormatDay = d3.utcFormat("%Y-%m-%d");
const dtFormatWeek = d3.utcFormat("%Y-%m-%d");
const dtFormatMonth = d3.utcFormat("%B");
const dtFormatYear = d3.utcFormat("%Y");

// used for the table on the left side
const dtFormatMultiline = d3.utcFormat("%Y-%m-%d\n%H:%M:%S");

// used for x-axis
function dtFormatAuto(date: Date) {
  return (
    d3.utcSecond(date) < date
      ? dtFormatMillisecond
      : d3.utcMinute(date) < date
        ? dtFormatSecond
        : d3.utcHour(date) < date
          ? dtFormatMinute
          : d3.utcDay(date) < date
            ? dtFormatHour
            : d3.utcMonth(date) < date
              ? d3.utcWeek(date) < date
                ? dtFormatDay
                : dtFormatWeek
              : d3.utcYear(date) < date
                ? dtFormatMonth
                : dtFormatYear
  )(date);
}

function durationFormat(duration: number | null): string {
  if (duration === null || duration < 0) {
    return "";
  }
  const seconds = Math.floor(duration / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ${seconds % 60}s`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ${minutes % 60}m`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

export function draw(context: DrawContext<Datum>) {
  const data = context.data[0];
  const columnsX = [0, 180, 240, 340, 440];
  const marginTop = 20;
  const marginX = 10;
  const marginRight = columnsX[columnsX.length - 1] + 120 + marginX;
  const marginLeft = marginX;
  const marginBottom = 80;
  // TODO use the width on label on Y axis
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
  const domainTimeWindow = domainMax - domainMin;
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
  // TODO allow to configure the color of each stage (read configuration from DB/context.data ?)
  let range =
    //d3.schemeCategory10
    //ref: tailwindcss.com/docs/colors
    [
      "#facc15", // amber-400 oklch(82.8% 0.189 84.429) #facc15
      "#c084fc", // purple-400 oklch(71.4% 0.203 305.504) #c084fc
      "#60a5fa", // blue-400 oklch(70.7% 0.165 254.624) #60a5fa
      "#a3e635", // lime-400 oklch(84.1% 0.238 128.85) #a3e635
      "#9ca3af", // gray-400 oklch(70.7% 0.022 261.325) #9ca3af
    ];
  switch (domains.stages.length) {
    case 2:
      range = ["#facc15", "#9ca3af"];
      break;
    case 3:
      range = ["#facc15", "#a3e635", "#9ca3af"];
      break;
    case 4:
      range = ["#facc15", "#60a5fa", "#a3e635", "#9ca3af"];
      break;
  }
  if (domains.stages.length > range.length) {
    //If there are more stages than colors, then fill with the last color.
    range = range.concat(
      new Array(domains.stages.length - range.length).fill(
        range[range.length - 1],
      ),
    );
  }
  const color = d3.scaleOrdinal<string>().domain(domains.stages).range(range);

  const axisX = d3.axisBottom<Date>(x).tickFormat(dtFormatAuto);
  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(axisX)
    .selectAll("text")
    .style("text-anchor", "start")
    .attr("dx", "-.8em")
    .attr("dy", ".6em")
    .attr("transform", "rotate(25)");

  // Add the y-axis.
  // svg
  //   .append("g")
  //   .attr("transform", `translate(${width - marginRight},0)`)
  //   .call(d3.axisRight(y))
  //   .call((g) => g.select(".domain").remove());

  // Add a table on left side using SVG and D3
  // Add a table on left side
  // column are :
  // - stages (also used as y-axis label)
  // - frequency (number of datapoint per week) per stage
  // - latest timestamp per stage
  // - latest version per stage
  // - average elasped time between stage and the first stage
  //

  // TODO compute the data for the table
  const weeks = domainTimeWindow / (7 * 24 * 60 * 60 * 1000); // weeks
  const tableData = summarizeSortedStages(series, domains.stages).map((d) => {
    const summary = d.getSummary();
    const frequency = summary.countTimestamp / weeks;
    const lastTime = summary.lastTimestamp
      ? dtFormatMultiline(new Date(summary.lastTimestamp))
      : "N/A";
    return [
      //TODO format the data for each column
      summary.stage,
      `${frequency.toFixed(2)} /w`, // format frequency to two decimal places
      durationFormat(summary.intervalAverage), // format elapsed time
      lastTime,
      summary.lastVersion,
    ];
  });

  const table = svg
    .append("g")
    .attr("transform", `translate(${width - marginRight}, 0)`);

  const headers = [
    "Stage",
    "Freq",
    "Transition", //"Avg Elapsed",
    "Latest",
    "Latest Version/Tag",
  ];
  const headerRow = table.append("g");
  headerRow
    .selectAll("text")
    .data(headers)
    .join("text")
    .attr("x", (d, i) => columnsX[i])
    .attr("y", marginTop)
    .attr("fill", "gray")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .attr("text-anchor", "start")
    .text((d) => d);

  const rows = table.append("g");
  rows
    .selectAll("g")
    .data(tableData) // assuming you have a dataset named 'tableData' containing the required data
    .join("g")
    .attr("transform", (d, i) => {
      const dy = (y(d[0] || "") ?? 0) + y.bandwidth() / 2;
      return `translate(0, ${dy})`;
    })
    .selectAll("text")
    .data((d) => d) // assuming each row has an array of values
    .join("text")
    //.each((d, i) => { rowX.set(this, columnsX[i]); })
    //.attr("x", (d, i) => columnsX[i])
    //.attr("y", (d, i) => (y(d[0]) ?? 0) + y.bandwidth() / 2)
    .attr("transform", (d, i) => `translate(${columnsX[i]}, 0)`)
    .attr("fill", "white")
    .attr("font-size", "12px")
    .attr("text-anchor", "start")
    .selectAll("tspan")
    .data((d, i) => {
      return d?.split("\n") || []; // Split the text into lines if needed
    })
    .join("tspan")
    .attr("x", 0)
    .attr("dy", (_, i) => `${i * 1.2}em`)
    .text((d) => d);

  // svg
  //   .append("g")
  //   .append("text")
  //   .attr("x", width - marginRight + 10)
  //   .attr("y", marginTop + 10)
  //   .attr("font-size", "14px")
  //   .attr("font-weight", "bold")
  //   .attr("fill", "crimson")
  //   .append("tspan")
  //   .attr("dx", "0")
  //   .attr("dy", "0em")
  //   .text("cell 1")
  //   .append("tspan")
  //   .attr("dx", "0")
  //   .attr("dy", "1.5em")
  //   .text("cell 2");

  // <g id='columnGroup'>
  //    <rect x='65' y='10' width='75' height='110' fill='gainsboro'/>
  //    <rect x='265' y='10' width='75' height='110' fill='gainsboro'/>

  //    <text x='30' y='30' font-size='18px' font-weight='bold' fill='crimson'>
  //       <tspan x='30' dy='1.5em'>Q1</tspan>
  //       <tspan x='30' dy='1em'>Q2</tspan>
  //       <tspan x='30' dy='1em'>Q3</tspan>
  //       <tspan x='30' dy='1em'>Q4</tspan>
  //    </text>

  //    <text x='100' y='30' font-size='18px' text-anchor='middle'>
  //       <tspan x='100' font-weight='bold' fill='crimson'>Sales</tspan>
  //       <tspan x='100' dy='1.5em'>$ 223</tspan>
  //       <tspan x='100' dy='1em'>$ 183</tspan>
  //       <tspan x='100' dy='1em'>$ 277</tspan>
  //       <tspan x='100' dy='1em'>$ 402</tspan>
  //    </text>

  //    <text x='200' y='30' font-size='18px' text-anchor='middle'>
  //       <tspan x='200' font-weight='bold' fill='crimson'>Expenses</tspan>
  //       <tspan x='200' dy='1.5em'>$ 195</tspan>
  //       <tspan x='200' dy='1em'>$ 70</tspan>
  //       <tspan x='200' dy='1em'>$ 88</tspan>
  //       <tspan x='200' dy='1em'>$ 133</tspan>
  //    </text>

  //    <text x='300' y='30' font-size='18px' text-anchor='middle'>
  //       <tspan x='300' font-weight='bold' fill='crimson'>Net</tspan>
  //       <tspan x='300' dy='1.5em'>$ 28</tspan>
  //       <tspan x='300' dy='1em'>$ 113</tspan>
  //       <tspan x='300' dy='1em'>$ 189</tspan>
  //       <tspan x='300' dy='1em'>$ 269</tspan>
  //    </text>
  // </g>

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
