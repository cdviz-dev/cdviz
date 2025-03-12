// ```json
// {{{json @root}}}
// ```
// Display a horizontal bar chart:
// - with double y axis
// - with a tooltip
// - with a fixed number of bars
import("https://esm.sh/d3@7.9.0").then((d3) => {
  // config
  const withQueuedDuration = true;
  const visibleBars = 20; // try to align with LIMIT on the query

  // retreive & prepare data
  const data = context.data[0].reverse().slice(0, visibleBars);

  // Create the SVG container.
  // try to fit the container to the size of the panel
  const container = context.element;
  const rect = container.parentNode.getBoundingClientRect();
  //const rect = container.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 20;
  const marginLeft = 50;

  // Create the SVG container.
  const svg = d3
    .create("svg")
    //.attr("width", width)
    .attr("height", height * 0.90)
    //.attr("width", "100%")
    .attr("font-family", "sans-serif")
    //.attr("font-size", side / 40)
    .style("display", "block")
    .style("max-width", "100%")
    //.style("height", "auto")
    ;
  svg
    .attr("viewBox", [0, 0, width, height])
    .attr("preserveAspectRatio", "none");
  //.attr("preserveAspectRation", "xMaxYMax")
  //.append("g")
  //.attr("transform", "translate(" + marginLeft + "," + marginTop + ")")
  ;
  // Add tooltip on over

  const getTooltipContent = (d) => {
    const formatDuration = (t) => (
      t ? `${t / 60 | 0}m ${t % 60}s` : ""
    );
    let adds = ""
    if (withQueuedDuration) {
      adds += `<br/>queued: ${formatDuration(d.queued_duration)}`
    }
    return `<b>${d3.isoFormat(new Date(d.at))}</b>
        <br/>run id: ${d.subject_id || "-"}
        <br/>result: ${d.outcome || "-"}
        <br/>run: ${formatDuration(d.run_duration)}
        ${adds}
        <br/><br/><i>click for details</i>
        `;
  };

  const tooltip = d3
    .select(document.createElement("div"))
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("top", 0)
    //.style("left", "100px")
    .style("opacity", 0)
    .style("background", "white")
    .style("color", "black")
    .style("border-radius", "5px")
    .style("box-shadow", "0 0 10px rgba(0,0,0,.25)")
    .style("padding", "10px")
    .style("line-height", "1.3")
    .style("font", "11px sans-serif")
    //.style("z-index", "200")
    ;
  const mouseover = (event, d) => {
    //d3.select(this).select("circle").attr("fill", color(d.id).darker())
    tooltip.style("opacity", 1).html(getTooltipContent(d));
  };

  const mouseleave = (event, d) => {
    //d3.select(this).select("circle").attr("fill", color(d.id))
    tooltip.style("opacity", 0);
  };
  const mousemove = (event, d) => {
    const [x, y] = d3.pointer(event, container);
    const area = container.getBoundingClientRect();
    const tooltipRect = tooltip.node().getBoundingClientRect();
    let topicLeft = x + 10;
    if (topicLeft + tooltipRect.width > area.width) {
      topicLeft = x - (10 + tooltipRect.width + 30); // 60 for approx with of mouse
    }
    let topicTop = y;
    if (topicTop + tooltipRect.height > area.height) {
      topicTop = area.height - tooltipRect.height;
    }

    tooltip.style("left", topicLeft + "px").style("top", topicTop + "px");
  };

  // Declare the x (horizontal position) scale.
  const x = d3.scaleBand()
    .domain(d3.range(visibleBars))
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  // Declare the y (vertical position) scale.
  const defaultQueuedDisplayed = 2;
  const defaultRunDisplayed = 10;
  const y = d3.scaleLinear()
    .domain([
      -1 * Math.max(30, (d3.max(data, (d) => d.queued_duration) || defaultQueuedDisplayed)),
      Math.max(60, (d3.max(data, (d) => d.run_duration) || defaultRunDisplayed))
    ])
    .range([height - marginBottom, marginTop]);

  const colors = d3.scaleOrdinal()
    .domain(["success", "pass", "ok", "failure", "fail", "cancel", "cancelled", "skip", "skipped"])
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
    .unknown(d3.hsl(229, 1, 0.5)) // blue
    ;

  // Add a axis every 1 minute
  // Define the interval for the horizontal axes
  const interval = 60;
  const axis = svg.append("g");
  const ticks = d3.range(Math.round(y.domain()[0] / interval) * interval, Math.round(y.domain()[1] / interval) * interval + 1, interval);
  axis.append("g").selectAll()
    .data(ticks)
    .join("text")
    .attr("fill", d3.hsl(0, 0, 0.9))
    .attr("x", 0)
    .attr("y", d => y(d))
    .attr("dy", -3)
    .attr("text-anchor", "start")
    .text(d => `${Math.abs(d)}s`);
  axis.append("g").selectAll()
    .data(ticks)
    .join("line")
    .attr("stroke", (d, i) => d3.hsl(0, 0, d == 0 ? 0.9 : 0.6))
    .attr("x1", marginLeft)
    .attr("y1", (d, i) => y(d))
    .attr("x2", width - marginRight)
    .attr("y2", (d, i) => y(d))
    ;

  // Add a rect for each bar.
  svg.append("g")
    .selectAll()
    .data(data)
    .join("rect")
    .attr("fill", (d, i) => colors(d.outcome).copy({ opacity: 0.6 }))
    .attr("stroke", (d, i) => colors(d.outcome))
    .attr("x", (d, i) => x(i))
    .attr("y", (d, i) => y(d.run_duration || defaultRunDisplayed))
    .attr("height", (d, i) => y(0) - y(d.run_duration || defaultRunDisplayed))
    .attr("width", x.bandwidth())
    .on("click", (event, d) => {
      if (d.url) {
        window.open(d.url, '_blank');
      }
    })
    //.on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .on("mouseover", mouseover)
    ;

  if (withQueuedDuration) {
    svg.append("g")
      .selectAll()
      .data(data)
      .join("rect")
      .attr("fill", (d) => colors(d.outcome))
      .attr("stroke", (d, i) => colors(d.outcome))
      .attr("x", (d, i) => x(i))
      .attr("y", (d, i) => y(0))
      .attr("height", (d, i) => y(0) - y(d.queued_duration || defaultQueuedDisplayed))
      .attr("width", x.bandwidth())
      //.on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .on("mouseover", mouseover)
      ;
  }

  container.replaceChildren(svg.node());

  svg.on("mousemove", mousemove);
  container.appendChild(tooltip.node());
});
