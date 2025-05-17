// the d3 panel does not exist (yet)
// So we used the [marcusolsson-dynamictext-panel](https://volkovlabs.io/plugins/business-text/) from volkovlabs
import * as dashboard from "@grafana/grafana-foundation-sdk/dashboard";

// TODO improve type constraint with enums,...
export interface D3PanelOptions {
  afterRender?: string;
  content: string;
  contentPartials: string[];
  defaultContent: string;
  editor: { format: string; language: string }; // TODO improve type constraint with enums,...
  editors: string[]; // TODO improve type constraint with enums,...
  externalStyles: string[];
  helpers: string;
  renderMode: string; // TODO improve type constraint with enums,...
  style: string;
  wrap: boolean;
}

export const defaultD3PanelOptions = (): D3PanelOptions => ({
  afterRender: "",
  content: "",
  contentPartials: [],
  defaultContent: "The query didn't return any results.",
  editor: { format: "auto", language: "html" },
  editors: ["afterRender"], // TODO improve type constraint with enums,...
  externalStyles: [],
  helpers: "",
  renderMode: "data", // TODO improve type constraint with enums,...
  style: "",
  wrap: false,
});

export class D3PanelBuilder extends dashboard.PanelBuilder {
  constructor() {
    super();
    this.internal.type = "marcusolsson-dynamictext-panel"; // panel plugin ID
  }

  script(script: string): this {
    if (!this.internal.options) {
      this.internal.options = defaultD3PanelOptions();
    }
    this.internal.options.afterRender = script;
    return this;
  }
}

// example: `console.log(await buildjsForD3Panel(['./panels/timeline_version_on_stage.ts']));`
// TODO display an error message on error/exception on call of `draw()`;
// TODO display "No Data" when context.data[0] is empty on context.data is undefined
export async function buildjsForD3Panel(
  entrypoints: string[],
): Promise<string> {
  const assemble = await Bun.build({
    target: "browser",
    entrypoints,
    banner: 'import("https://esm.sh/d3@7.9.0").then((d3) => {',
    footer: "draw(context);});",
    external: ["d3"], // useless as allowUmdGlobalAccess is enabled
    minify: false,
    //outdir: './build',
  });
  //TODO raise error when assemble failed
  let txt = await assemble.outputs[0].text();
  txt = txt.replaceAll(/export {\n {2}draw\n};\n/g, "");
  return txt;
}

export type DrawContext<T> = {
  data: T[][];
  element: Element;
  grafana: { timeRange: { from: number; to: number } };
};
