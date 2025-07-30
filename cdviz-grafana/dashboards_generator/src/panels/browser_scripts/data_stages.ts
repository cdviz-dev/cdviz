import { ArtifactInfo } from "./artifact_info";

export type Datum = {
  timestamp: number;
  action: string;
  stage: string;
  artifact_id: string;
};
export type DatumExt = {
  timestamp: number;
  action: string;
  stage: string;
  artifactInfo: ArtifactInfo;
};
export type Domains = {
  timestampMin: number;
  timestampMax: number;
  stages: string[];
};
export type DataOutput = { series: DatumExt[][]; domains: Domains };

export function transformData(data: Datum[]): DataOutput {
  // performance.mark("groupBySeries");
  const series = groupBySeries(data);
  // console.log(performance.measure("groupBySeries-duration", "groupBySeries"));
  // performance.mark("extractDomains");
  const domains = extractDomains(series);
  // console.log(performance.measure("extractDomains-duration", "extractDomains"));
  return {
    series,
    domains,
  };
}

// Group by serie : artifact name + version (if no version, fallback to tag)
//
// TODO merge entry that have the same timestamp (eg published with several tags).
export function groupBySeries(data: Datum[]): DatumExt[][] {
  //return Map.groupBy(data, ({ artifact_id }) => artifact_id);
  const res: Array<[ArtifactInfo, Array<DatumExt>]> = [];
  for (const it of data) {
    try {
      const artifactInfo = new ArtifactInfo(it.artifact_id);
      let dest = res.find((el) => artifactInfo.isSimilarTo(el[0]));
      if (!dest) {
        dest = [artifactInfo, []];
        res.push(dest);
      }
      dest[0].mergeVersionAndTags(artifactInfo);
      const datum: DatumExt = {
        timestamp: it.timestamp,
        action: it.action,
        stage: it.stage,
        artifactInfo: dest[0],
      };
      dest[1].push(datum);
    } catch (e) {
      console.error("Error parsing artifact_id:", it, e);
      throw e; // Re-throw the error to stop processing
    }
  }
  //console.log(res);
  return res.map((el) => {
    const sequence = el[1];
    sequence.sort((a, b) => {
      let r = a.timestamp - b.timestamp;
      if (r === 0) {
        // if timestamps are equal, sort by action
        r = a.stage.localeCompare(b.stage);
      }
      return r;
    });
    return sequence;
  });
}

// @return {timestampMin: DateTime, timestampMax: DateTime, stages: Set<string>}
function extractDomains(data: DatumExt[][]): Domains {
  let timestampMin = Number.MAX_SAFE_INTEGER;
  let timestampMax = Number.MIN_SAFE_INTEGER;
  let hasItem = false;
  for (const serie of data) {
    for (const d of serie) {
      if (timestampMin > d.timestamp) {
        timestampMin = d.timestamp;
      }
      if (timestampMax < d.timestamp) {
        timestampMax = d.timestamp;
      }
      hasItem = true;
    }
  }

  if (!hasItem) {
    return {
      timestampMin: Date.now(),
      timestampMax: Date.now(),
      stages: [],
    };
  }

  const stages = sortStages(data);
  return {
    timestampMin,
    timestampMax,
    stages: stages,
  };
}

// interface TransitionCounts {
//   [key: string]: { [key: string]: number };
// }

// sort stages based on what stage happends before / after in the lifecycle of artifact's version
// custom algorithm
// - series should often follow the same order but could stop at different progression or skip some stages
// - add more point for earlier stage
// NOTE: we also try to implement
// - an Elo rating but it was unstable
// - a TransitionMatrix count but it failed, when some stages are skipped, or recently added
//
// @param {Set<string>} stages
// @param {Array<Array<{}>>} series
// @return {Array<string>}
function sortStages(seriesValues: DatumExt[][]): string[] {
  // performance.mark("buildTransitionGraph");
  const graph = buildTransitionGraph(seriesValues);
  // console.log(performance.measure("buildTransitionGraph-duration", "buildTransitionGraph"));
  // performance.mark("topologicalSort");
  let stagesSorted: string[] = [];
  try {
    stagesSorted = topologicalSort(graph);
  } catch (e) {
    //console.debug("Topological sort failed:", seriesValues);
    console.debug("Topological sort failed:", graph);
    console.error("Error during topological sort:", e);
    console.warn("fallback to alphabetical sort");
    stagesSorted = graph.keys().toArray().sort();
  }
  // console.log(performance.measure("topologicalSort-duration", "topologicalSort"));
  stagesSorted.reverse(); // Reverse to have the earliest stage last
  return stagesSorted;
}

type Graph = Map<string, Set<string>>;

/// Try to build a DAG (Directed Acyclic Graph) of transitions between stages
/// from series values
/// requirement: series / sequence should be sorted by transition order (eg by timestamp)
function buildTransitionGraph(seriesValues: DatumExt[][]): Graph {
  // Initialize transition counts
  const graph = new Map<string, Set<string>>();

  // Count transitions
  for (const sequence of seriesValues) {
    const stagesSeen = new Set<string>();
    for (let i = 0; i < sequence.length - 1; i++) {
      const currentStage = sequence[i].stage;
      const nextStage = sequence[i + 1].stage;

      // to avoid duplicated stages in the same sequence and to reduce probability of cycles in graph
      if (stagesSeen.has(nextStage)) {
        continue;
      }
      stagesSeen.add(currentStage);

      if (!graph.has(currentStage)) {
        graph.set(currentStage, new Set<string>());
      }
      if (currentStage !== nextStage) {
        // when duplicated stages, we do not add a transition
        graph.get(currentStage)?.add(nextStage);
      }
      if (!graph.has(nextStage)) {
        graph.set(nextStage, new Set<string>());
      }
    }
    if (sequence.length > 0) {
      // Ensure the last stage is also included in the graph
      const lastStage = sequence[sequence.length - 1].stage;
      if (!graph.has(lastStage)) {
        graph.set(lastStage, new Set<string>());
      }
    }
  }
  return graph;
}

// TODO try to resolve local cycles, by selecting an arbitrary order
function topologicalSort(graph: Graph): string[] {
  const inDegree: Map<string, number> = new Map();
  const queue: string[] = [];
  const topoOrder: string[] = [];

  // Initialize in-degree count for each node
  graph.forEach((neighbors, node) => {
    inDegree.set(node, inDegree.get(node) || 0);
    for (const neighbor of neighbors) {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 0) + 1);
    }
  });

  // Enqueue nodes with no incoming edges
  inDegree.forEach((degree, node) => {
    if (degree === 0) {
      queue.push(node);
    }
  });

  // Process nodes in the queue
  while (queue.length > 0) {
    const node = queue.shift();
    if (!node) {
      continue; // Skip if node is undefined
    }
    topoOrder.push(node);

    // Decrease in-degree for each neighbor and enqueue if in-degree becomes zero
    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      const updatedDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, updatedDegree);
      if (updatedDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  // Check if topological sort is possible (i.e., no cycles)
  if (topoOrder.length !== graph.size) {
    // console.log(topoOrder.length, graph.size);
    throw new Error(
      "Graph has at least one cycle, topological sort not possible.",
    );
  }

  return topoOrder;
}

class StageSummary {
  private stage: string;
  private countTimestamp: number; // how many times this stage was seen,
  private lastTimestamp: number | null; // last time this stage was seen,
  private lastVersion: string | null; // last version seen for this stage
  private countInterval: number;
  private totalInterval: number; // in milliseconds

  constructor(stage: string) {
    this.stage = stage;
    this.countTimestamp = 0;
    this.lastTimestamp = null;
    this.lastVersion = null;
    this.countInterval = 0;
    this.totalInterval = 0;
  }

  registerEvent(
    timestamp: number,
    version: string,
    fromTimestamp: number | null,
  ) {
    this.countTimestamp += 1;
    if (this.lastTimestamp === null || timestamp > this.lastTimestamp) {
      this.lastTimestamp = timestamp;
      this.lastVersion = version;
    }
    if (fromTimestamp !== null) {
      this.countInterval += 1;
      this.totalInterval += Math.abs(timestamp - fromTimestamp);
    }
  }

  getIntervalAverage(): number {
    return this.countInterval > 0 ? this.totalInterval / this.countInterval : 0;
  }

  getSummary(): {
    stage: string;
    countTimestamp: number;
    lastTimestamp: number | null;
    lastVersion: string | null;
    intervalAverage: number;
  } {
    return {
      stage: this.stage,
      countTimestamp: this.countTimestamp,
      lastTimestamp: this.lastTimestamp,
      lastVersion: this.lastVersion,
      intervalAverage: this.getIntervalAverage(),
    };
  }
}

function summarizeStages(
  seriesValues: DatumExt[][],
): Map<string, StageSummary> {
  const summaries: Map<string, StageSummary> = new Map();

  for (const sequence of seriesValues) {
    let previousTimestamp: number | null = null;

    for (const datum of sequence) {
      const stage = datum.stage;
      const timestamp = datum.timestamp;
      const version =
        datum.artifactInfo.version ||
        datum.artifactInfo.tags.values().next().value ||
        "unknown";

      if (!summaries.has(stage)) {
        summaries.set(stage, new StageSummary(stage));
      }
      const summary = summaries.get(stage);
      if (summary) {
        summary.registerEvent(timestamp, version, previousTimestamp);
      }

      previousTimestamp = timestamp;
    }
  }
  return summaries;
}

export function summarizeSortedStages(
  seriesValues: DatumExt[][],
  stages: string[],
): StageSummary[] {
  const summaries = summarizeStages(seriesValues);
  return stages.map((stage) => summaries.get(stage) || new StageSummary(stage));
}
