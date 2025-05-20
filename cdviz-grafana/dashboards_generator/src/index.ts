import { parseArgs } from "node:util";
// import { buildDashboard as basicDashboard } from './src/dashboards/basic';
import { buildDashboard as artifactTimelineDashboard } from "./dashboards/artifact_timeline";
import { buildDashboard as cdeventsActivityDashboard } from "./dashboards/cdevents_activity";
import { buildDashboards as executionDashboards } from "./dashboards/execution_dashboards";
import { saveDashboard } from "./tools";

//console.log(JSON.stringify(basicDashboard(), null, 2));
const { values } = parseArgs({
  args: Bun.argv,
  options: {
    output: {
      type: "string",
      default: "./build/dashboards",
    },
  },
  strict: true,
  // positionals not used, but without failed with ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL
  // when called like `bun run index.ts --output x/y`
  allowPositionals: true,
});
// console.log(values);
// saveDashboard(basicDashboard(), values.output);
(await executionDashboards()).map((d) => saveDashboard(d, values.output));
saveDashboard(await artifactTimelineDashboard(), values.output);
saveDashboard(await cdeventsActivityDashboard(), values.output);
