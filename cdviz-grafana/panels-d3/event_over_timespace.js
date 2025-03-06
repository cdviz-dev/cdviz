// TODO Add [brush](https://d3js.org/d3-brush#d3-brush) to select a region, like with grafana panel
// TODO Add configuration (from DB ?) to define: order of environment, collor & shape of environment / service / artifact /...
import("https://esm.sh/d3@7.9.0").then((d3) => {
  const data = context.data[0];
  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 30;
  // TODO use the width on label on Y axis
  const marginLeft = 100;

  // Create the SVG container.
  // try to fit the container to the size of the panel
  const container = context.element;
  const rect = container.parentNode.getBoundingClientRect();
  const width = rect.width; //640;
  const height = rect.height; //400;
  const svg = d3
    .create("svg")
    //.attr("width", width)
    //.attr("height", height)
    .attr("width", "93%")
    //.attr("font-family", "sans-serif")
    //.attr("font-size", 10)
    .style("display", "block");
  //.style("max-width", "100%")
  //.style("height", "auto")
  svg
    .attr("viewBox", [0, 0, width, height])
    .attr("preserveAspectRatio", "none");
  //.append("g")
  //.attr("transform", "translate(" + marginLeft + "," + marginTop + ")")

  const environments = [...new Set(data.map((d) => d.env))];
  environments.sort();
  //const timewindow = context.data.map((d) => d.timestamp);

  // Declare the x (horizontal position) scale.
  // TODO display timeusing grafana format
  const x = d3
    .scaleUtc()
    .domain([context.grafana.timeRange.from, context.grafana.timeRange.to])
    .range([marginLeft, width - marginRight]);

  // Declare the y (vertical position) scale.
  // const y = d3.scaleLinear()
  //     .domain([0, 100])
  //     .range([height - marginBottom, marginTop]);
  const y = d3
    .scaleBand()
    .domain(environments)
    .range([marginTop, height - marginBottom])
    .padding(0.1);
  //.round(false)
  // Create the categorical scales.
  // see https://observablehq.com/@d3/color-schemes
  const color = d3.scaleOrdinal(
    data.map((d) => d.id),
    d3.schemeCategory10
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

  // Add tooltip on over
  const getTooltipContent = (d) => {
    return `<b>${d.id}</b>
        <br/>env: ${d.env}
        <br/>artifact: ${d.artifact_id}
        <br/>timestamp: ${d3.isoFormat(new Date(d.timestamp))}
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

  // TODO Add label ?
  // Add datapoint into a group
  svg
    .append("g")
    .selectAll("circle")
    .data(data)
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
    .attr("cy", (d) => y(d.env) + y.bandwidth() / 2)
    .attr("r", 3)
    .attr("fill", (d) => color(d.id))
    //.on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .on("mouseover", mouseover);

  svg.on("mousemove", mousemove);
  container.replaceChildren(svg.node());
  container.appendChild(tooltip.node());
});
