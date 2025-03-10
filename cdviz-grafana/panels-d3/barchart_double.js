// ```json
// {{{json @root}}}
// ```
// Display a horizontal bar chart:
// - with double y axis
// - with a tooltip
// - with a fixed number of bars
import("https://esm.sh/d3@7.9.0").then((d3) => {
  const data = context.data[0];

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
  const marginLeft = 20;

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
    return `<b>${d3.isoFormat(new Date(d.at))}</b>
        <br/>run id: ${d.subject_id || "-"}
        <br/>result: ${d.outcome || "-"}
        <br/>queue: ${formatDuration(d.queued_duration)}
        <br/>run: ${formatDuration(d.run_duration)}
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
    .style("font", "11px sans-serif");
  const mouseover = (event, d) => {
    //d3.select(this).select("circle").attr("fill", color(d.id).darker())
    tooltip.style("opacity", 1).html(getTooltipContent(d));
  };

  const mouseleave = (event, d) => {
    //d3.select(this).select("circle").attr("fill", color(d.id))
    tooltip.style("opacity", 0);
  };
  const mousemove = (event, d) => {
    const [x, y] = d3.pointer(event);
    tooltip.style("left", x + "px").style("top", y + "px");
  };

  // Declare the x (horizontal position) scale.
  const visibleBars = 20;
  const x = d3.scaleBand()
    .domain(Array(visibleBars).fill(1).map((v, i) => i))
    .range([marginLeft, width - marginRight])
    .padding(0.1);

  // Declare the y (vertical position) scale.
  const defaultQueuedDisplayed = 2;
  const defaultRunDisplayed = 10;
  const y = d3.scaleLinear()
    .domain([
      -1 * (d3.max(data, (d) => d.queued_duration) || (defaultQueuedDisplayed * 2)),
      (d3.max(data, (d) => d.run_duration) || (defaultRunDisplayed * 2))
    ])
    .range([height - marginBottom, marginTop]);

  const colors = d3.scaleOrdinal()
    .domain(["success", "failure", "skip"])
    .range(["oklch(86.64% 0.294827 142.4953)", "oklch(62.8% 0.2577 29.23)", "oklch(70.0% 0 0)", "oklch(45.2% 0.313214 264.052)"]) // one more for unknown domain's value
    ;

  // Add a rect for each bar.
  svg.append("g")
    .selectAll()
    .data(data)
    .join("rect")
    .attr("fill", (d, i) => colors(d.outcome))
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
  svg.append("g")
    .selectAll()
    .data(data)
    .join("rect")
    .attr("fill", (d) => colors(d.outcome).replace(")", "/ .8")) // less opaque
    .attr("x", (d, i) => x(i))
    .attr("y", (d, i) => y(0))
    .attr("height", (d, i) => y(0) - y(d.queued_duration || defaultQueuedDisplayed))
    .attr("width", x.bandwidth())
    //.on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .on("mouseover", mouseover)
    ;

  container.replaceChildren(svg.node());

  svg.on("mousemove", mousemove);
  container.appendChild(tooltip.node());
});
