// TODO Add [brush](https://d3js.org/d3-brush#d3-brush) to select a region, like with grafana panel
// TODO Add configuration (from DB ?) to define: order of environment, collor & shape of environment / service / artifact /...
// based on https://observablehq.com/@d3/zoomable-sunburst
import("https://esm.sh/d3@7.9.0").then((d3) => {
  const data = context.data[0];
  // const marginTop = 20;
  // const marginRight = 20;
  // const marginBottom = 30;
  // // TODO use the width on label on Y axis
  // const marginLeft = 100;

  // Create the SVG container.
  // try to fit the container to the size of the panel
  const container = context.element;
  const rect = container.parentNode.getBoundingClientRect();
  //const rect = container.getBoundingClientRect();
  const width = rect.width; //640;
  const height = rect.height; //400;
  const side = Math.min(width, height);

  // Create the SVG container.
  const svg = d3
    .create("svg")
    //.attr("width", width)
    //.attr("height", height)
    //.attr("width", "100%")
    .attr("font-family", "sans-serif")
    .attr("font-size", side / 40)
    .style("display", "block");
  //.style("max-width", "100%")
  //.style("height", "auto")
  svg
    //.attr("viewBox", [0, 0, width, height])
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("preserveAspectRatio", "none");
  //.attr("preserveAspectRation", "xMaxYMax")
  //.append("g")
  //.attr("transform", "translate(" + marginLeft + "," + marginTop + ")")

  // Transform data into a hierarchy
  const dataHierarchy = { name: "", children: [] };

  data.forEach(({ count, subject, predicate }) => {
    let l1 = dataHierarchy.children.find((d) => d.name === subject);
    if (!l1) {
      l1 = { name: subject, children: [] };
      dataHierarchy.children.push(l1);
    }
    l1.children.push({ name: predicate, value: count });
  });

  // Compute the layout.
  const hierarchy = d3
    .hierarchy(dataHierarchy)
    .sum((d) => d.value)
    .sort((a, b) => b.value - a.value);
  const root = d3.partition().size([2 * Math.PI, hierarchy.height + 1])(
    hierarchy
  );
  root.each((d) => (d.current = d));

  // Create the color scale.
  const color = d3.scaleOrdinal(
    d3.quantize(d3.interpolateRainbow, dataHierarchy.children.length + 1)
  );

  // Create the arc generator.
  const radius = side / 6;
  const arc = d3
    .arc()
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
      while (d.depth > 1) d = d.parent;
      return color(d.data.name);
    })
    .attr("fill-opacity", (d) =>
      arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0
    )
    .attr("pointer-events", (d) => (arcVisible(d.current) ? "auto" : "none"))
    .attr("d", (d) => arc(d.current));

  // Make them clickable if they have children.
  path
    .filter((d) => d.children)
    .style("cursor", "pointer")
    .on("click", clicked);

  const format = d3.format(",d");
  path.append("title").text(
    (d) =>
      `${d
        .ancestors()
        .map((d) => d.data.name)
        .reverse()
        .join("/")}\n${format(d.value)}`
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
  function clicked(event, p) {
    parent.datum(p.parent || root);

    root.each(
      (d) =>
        (d.target = {
          x0:
            Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          x1:
            Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth),
        })
    );

    const t = svg.transition().duration(event.altKey ? 7500 : 750);

    // Transition the data on all arcs, even the ones that aren’t visible,
    // so that if this transition is interrupted, entering arcs will start
    // the next transition from the desired position.
    path
      .transition(t)
      .tween("data", (d) => {
        const i = d3.interpolate(d.current, d.target);
        return (t) => (d.current = i(t));
      })
      .filter(function (d) {
        return +this.getAttribute("fill-opacity") || arcVisible(d.target);
      })
      .attr("fill-opacity", (d) =>
        arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0
      )
      .attr("pointer-events", (d) => (arcVisible(d.target) ? "auto" : "none"))

      .attrTween("d", (d) => () => arc(d.current));

    label
      .filter(function (d) {
        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
      })
      .transition(t)
      .attr("fill-opacity", (d) => +labelVisible(d.target))
      .attrTween("transform", (d) => () => labelTransform(d.current));
  }

  function arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }

  function labelVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  function labelTransform(d) {
    const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
    const y = ((d.y0 + d.y1) / 2) * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }

  //svg.on("mousemove", mousemove);
  container.replaceChildren(svg.node());
  //container.appendChild(tooltip.node());
});
