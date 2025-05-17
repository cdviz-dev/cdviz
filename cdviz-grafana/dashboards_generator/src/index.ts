import { parseArgs } from "node:util";
// import { buildDashboard as basicDashboard } from './src/dashboards/basic';
import { buildDashboard as cdeventsActivityDashboard } from "./dashboards/cdevents_activity";
import { buildDashboard as pipelinerunDashboard } from "./dashboards/pipelinerun";
import { buildDashboard as taskrunDashboard } from "./dashboards/taskrun";
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
saveDashboard(await cdeventsActivityDashboard(), values.output);
saveDashboard(await pipelinerunDashboard(), values.output);
saveDashboard(await taskrunDashboard(), values.output);
