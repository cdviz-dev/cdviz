/**
 * Create the SVG container.
 * try to fit the container to the size of the panel
 */
export function newSvgArea(container: Element) {
  const rect = (container.parentNode as Element).getBoundingClientRect();
  const width = rect.width; //640;
  const height = rect.height; //400;
  const svg = d3
    .create("svg")
    //.attr("width", width)
    //.attr("height", height)
    .attr("width", "93%")
    .attr("font-family", "sans-serif")
    //.attr("font-size", 10)
    .style("display", "block");
  //.style("max-width", "100%")
  //.style("height", "auto")
  svg
    .attr("viewBox", [0, 0, width, height])
    .attr("preserveAspectRatio", "none");
  //.append("g")
  //.attr("transform", "translate(" + marginLeft + "," + marginTop + ")")
  container.replaceChildren(svg.node() as Node);

  return { svg, width, height } /*.node() as Element*/;
}
