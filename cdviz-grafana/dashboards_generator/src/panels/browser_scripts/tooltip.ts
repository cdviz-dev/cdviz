//import * as d3 from 'd3';

export type GetTooltipContent<T> = (datum: T) => string;

export class Tooltip<T> {
  getTooltipContent: GetTooltipContent<T>;
  el: d3.Selection<HTMLDivElement, unknown, null, undefined>;

  constructor(container: Element, getTooltipContent: GetTooltipContent<T>) {
    this.getTooltipContent = getTooltipContent;
    this.el = d3
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

    container.appendChild(this.el.node() as Node);
  }
  showOnMouseover(event: Event, d: T) {
    const content = this.getTooltipContent(d);
    this.el.style("opacity", 1).html(content);
    this.move(event, d);
  }
  hideOnMouseleave(event: Event, d: T) {
    this.el.style("opacity", 0);
  }
  move(event: Event, d: T) {
    const element = this.el.node();
    if (!element) return;
    const container = element.parentNode as Element;
    const [x, y] = d3.pointer(event, container);
    const area = container.getBoundingClientRect();
    const tooltipRect = element.getBoundingClientRect();
    let topicLeft = x + 10;
    if (topicLeft + tooltipRect.width > area.width) {
      topicLeft = Math.max(0, x - (10 + tooltipRect.width + 30)); // 30 for approx with of mouse
    }
    let topicTop = y;
    if (topicTop + tooltipRect.height > area.height) {
      topicTop = Math.max(0, area.height - tooltipRect.height);
    }
    this.el.style("left", `${topicLeft}px`).style("top", `${topicTop}px`);
  }
}
