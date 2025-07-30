import type { HSLColor } from "d3";
import type { DrawContext } from "../d3_panel";
import { Tooltip } from "./tooltip";
import { newSvgArea } from "./utils";

// ```json
// {{{json @root}}}
// ```
// Display a horizontal bar chart:
// - with double y axis
// - with a tooltip
// - with a fixed number of bars
type Datum = {
  url: string;
  outcome: string;
  queued_duration: number;
  run_duration: number;
  at: number;
  subject_id: string;
};

export function draw(context: DrawContext<Datum>) {
  // config
  const withQueuedDuration = true;
  const visibleBars = 20; // try to align with LIMIT on the query

  // retreive & prepare data
  const data: Datum[] = (context.data[0] || []).reverse().slice(0, visibleBars);

  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 20;
  const marginLeft = 50;

  const container = context.element;
  const { svg, width, height } = newSvgArea(container);

  // Add tooltip on over
  const tooltip = new Tooltip<Datum>(container, (d) => {
    const formatDuration = (t: number) =>
      t ? `${(t / 60) | 0}m ${t % 60}s` : "";
    let adds = "";
    if (withQueuedDuration) {
      adds += `<br/>queued: ${formatDuration(d.queued_duration)}`;
    }
    return `<b>${d3.isoFormat(new Date(d.at))}</b>
        <br/>run id: ${d.subject_id || "-"}
        <br/>result: ${d.outcome || "-"}
        <br/>run: ${formatDuration(d.run_duration)}
        ${adds}
        <br/><br/><i>click for details</i>
        `;
  });

  // Declare the x (horizontal position) scale.
  const x = d3
    .scaleBand<number>()
    .domain(d3.range(visibleBars))
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  // Declare the y (vertical position) scale.
  const defaultQueuedDisplayed = 2;
  const defaultRunDisplayed = 10;
  const y = d3
    .scaleLinear()
    .domain([
      -1 *
        Math.max(
          30,
          d3.max(data, (d) => d.queued_duration) || defaultQueuedDisplayed,
        ),
      Math.max(60, d3.max(data, (d) => d.run_duration) || defaultRunDisplayed),
    ])
    .range([height - marginBottom, marginTop]);

  const colors = d3
    .scaleOrdinal<string, HSLColor>()
    .domain([
      "success",
      "pass",
      "ok",
      "failure",
      "fail",
      "cancel",
      "cancelled",
      "skip",
      "skipped",
    ])
    .range([
      d3.hsl(120, 1, 0.5), // success
      d3.hsl(120, 1, 0.5), // pass
      d3.hsl(120, 1, 0.5), // ok
      d3.hsl(0, 1, 0.5), // failure
      d3.hsl(0, 1, 0.5), // fail
      d3.hsl(0, 0, 0.8), // cancel
      d3.hsl(0, 0, 0.8), // cancelled
      d3.hsl(0, 0, 0.5), // skip
      d3.hsl(0, 0, 0.5), // skipped
    ])
    .unknown(d3.hsl(229, 1, 0.5)); // blue

  // Add a axis every 1 minute
  // Define the interval for the horizontal axes
  const interval = 60;
  const axis = svg.append("g");
  const ticks = d3.range(
    Math.round(y.domain()[0] / interval) * interval,
    Math.round(y.domain()[1] / interval) * interval + 1,
    interval,
  );
  axis
    .append("g")
    .selectAll()
    .data(ticks)
    .join("text")
    .attr("fill", d3.hsl(0, 0, 0.9).toString())
    .attr("x", 0)
    .attr("y", (d) => y(d))
    .attr("dy", -3)
    .attr("text-anchor", "start")
    .text((d) => `${Math.abs(d)}s`);
  axis
    .append("g")
    .selectAll()
    .data(ticks)
    .join("line")
    .attr("stroke", (d) => d3.hsl(0, 0, d === 0 ? 0.9 : 0.6).toString())
    .attr("x1", marginLeft)
    .attr("y1", (d) => y(d))
    .attr("x2", width - marginRight)
    .attr("y2", (d) => y(d));

  // Add a rect for each bar.
  svg
    .append("g")
    .selectAll()
    .data(data)
    .join("rect")
    .attr("fill", (d) => colors(d.outcome).copy({ opacity: 0.6 }).toString())
    .attr("stroke", (d) => colors(d.outcome).toString())
    .attr("x", (_d, i) => x(i) || 0)
    .attr("y", (d) => y(d.run_duration || defaultRunDisplayed))
    .attr("height", (d) => y(0) - y(d.run_duration || defaultRunDisplayed))
    .attr("width", x.bandwidth())
    .on("click", (_event, d) => {
      if (d.url) {
        window.open(d.url, "_blank");
      }
    })
    .on("mouseleave", (e, d) => tooltip.hideOnMouseleave(e, d))
    .on("mouseover", (e, d) => tooltip.showOnMouseover(e, d));

  if (withQueuedDuration) {
    svg
      .append("g")
      .selectAll()
      .data(data)
      .join("rect")
      .attr("fill", (d) => colors(d.outcome).toString())
      .attr("stroke", (d) => colors(d.outcome).toString())
      .attr("x", (_d, i) => x(i) || 0)
      .attr("y", (_d, _i) => y(0))
      .attr(
        "height",
        (d) => y(0) - y(d.queued_duration || defaultQueuedDisplayed),
      )
      .attr("width", x.bandwidth())
      //.on("mousemove", mousemove)
      .on("mouseleave", (e, d) => tooltip.hideOnMouseleave(e, d))
      .on("mouseover", (e, d) => tooltip.showOnMouseover(e, d));
  }
}
