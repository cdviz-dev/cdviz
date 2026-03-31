import { ArtifactInfo } from "./artifact_info";

// Sentinel prefix used in the stages array to mark repo separator rows.
// This string cannot appear as a real stage name (starts with NUL byte).
export const REPO_SEPARATOR_PREFIX = "\x00repo:";
// Separator between repo and stage name in a prefixed stage key.
export const STAGE_KEY_SEP = "\x01";

/** Build a Y-axis key combining repo and stage, used when multiRepo=true. */
export function makeStageKey(stage: string, repo: string | null): string {
  return repo !== null ? `${repo}${STAGE_KEY_SEP}${stage}` : stage;
}

/** Parse a stage key back into {repo, stage}. repo is null when no prefix. */
export function parseStageKey(key: string): {
  repo: string | null;
  stage: string;
} {
  const sep = key.indexOf(STAGE_KEY_SEP);
  if (sep === -1) return { repo: null, stage: key };
  return { repo: key.slice(0, sep), stage: key.slice(sep + 1) };
}

/** Returns true if this stages[] entry is a repo separator row, not a real stage. */
export function isSeparator(key: string): boolean {
  return key.startsWith(REPO_SEPARATOR_PREFIX);
}

/** Extract the repo label from a separator key. */
export function separatorRepo(key: string): string {
  return key.slice(REPO_SEPARATOR_PREFIX.length);
}

export type Datum = {
  timestamp: number;
  action: string;
  stage: string;
  artifact_id: string;
  entity_type?: string;
  entity_id?: string;
  environment_id?: string;
};
export type DatumExt = {
  timestamp: number;
  action: string;
  stage: string;
  artifactInfo: ArtifactInfo;
  /** Canonical key for connecting events with a line: first non-latest tag, or version, or "" for bare. */
  lineKey: string;
  entity_type?: string;
  entity_id?: string;
  environment_id?: string;
};
export type Domains = {
  timestampMin: number;
  timestampMax: number;
  /** Y-axis keys. In multi-repo mode includes REPO_SEPARATOR_PREFIX rows and STAGE_KEY_SEP-prefixed stage keys. */
  stages: string[];
  /** True when data contains more than one distinct repositoryUrl — enables separator-band layout. */
  multiRepo: boolean;
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
      // Compute line key from the per-event ArtifactInfo (before merging into series).
      // Lines are drawn only between events sharing the same tag (fallback: version).
      const nonLatestTags = [...artifactInfo.tags]
        .filter((t) => t !== "latest")
        .sort();
      const lineKey =
        nonLatestTags.length > 0
          ? nonLatestTags[0]
          : (artifactInfo.version ?? "");

      dest[0].mergeVersionAndTags(artifactInfo);

      const datum: DatumExt = {
        timestamp: it.timestamp,
        action: it.action,
        stage: it.stage,
        artifactInfo: dest[0],
        lineKey,
        entity_type: it.entity_type,
        entity_id: it.entity_id,
        environment_id: it.environment_id,
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
      multiRepo: false,
    };
  }

  // Collect distinct repos in order of first appearance
  const reposSeen = new Set<string | null>();
  for (const serie of data) {
    for (const d of serie) {
      reposSeen.add(d.artifactInfo.repositoryUrl);
    }
  }
  const repos = [...reposSeen];
  const multiRepo = repos.length > 1;

  let stages: string[];
  if (!multiRepo) {
    stages = sortStages(data);
  } else {
    // Build per-repo stage lists with separators.
    // Stages array layout (bottom → top in ECharts Y-axis):
    //   [repo_A_latest, ..., repo_A_earliest, sep:A,
    //    repo_B_latest, ..., repo_B_earliest, sep:B]
    // This makes sep:B the topmost row (header) of its band when read top→bottom.
    stages = [];
    for (const repo of repos) {
      const repoSeries = data
        .map((serie) =>
          serie.filter((d) => d.artifactInfo.repositoryUrl === repo),
        )
        .filter((s) => s.length > 0);
      const repoStages = sortStages(repoSeries); // [latest, ..., earliest] after reverse
      stages.push(...repoStages.map((s) => makeStageKey(s, repo)));
      stages.push(REPO_SEPARATOR_PREFIX + (repo ?? ""));
    }
  }

  return {
    timestampMin,
    timestampMax,
    stages,
    multiRepo,
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

  // Identify isolated stages: no outgoing AND no incoming transitions.
  // These are stages that have no lifecycle connection to others (e.g. CI testsuiterun
  // events that use bare artifact IDs kept in a separate series after the isSimilarTo fix).
  // They are placed at the TOP of the chart (end of the sorted array) so that connected
  // stages form a coherent chain below, with isolated stages as a "preamble" above.
  const hasIncoming = new Set<string>();
  for (const neighbors of graph.values()) {
    for (const n of neighbors) hasIncoming.add(n);
  }
  const isolated = new Set<string>();
  for (const [node, neighbors] of graph) {
    if (neighbors.size === 0 && !hasIncoming.has(node)) isolated.add(node);
  }

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
  stagesSorted.reverse(); // Reverse to have the earliest stage last (= end of array = top of chart)

  // Move isolated stages to the end so they appear at the top of the chart,
  // above the connected lifecycle chain.
  if (isolated.size > 0) {
    const connected = stagesSorted.filter((s) => !isolated.has(s));
    const isolatedArr = stagesSorted.filter((s) => isolated.has(s));
    stagesSorted = [...connected, ...isolatedArr];
  }

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
  private firstTimestamp: number | null; // oldest time this stage was seen
  private lastTimestamp: number | null; // last time this stage was seen,
  private lastVersion: string | null; // last version seen for this stage
  private countInterval: number;
  private totalInterval: number; // in milliseconds

  constructor(stage: string) {
    this.stage = stage;
    this.countTimestamp = 0;
    this.firstTimestamp = null;
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
    if (this.firstTimestamp === null || timestamp < this.firstTimestamp) {
      this.firstTimestamp = timestamp;
    }
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
    firstTimestamp: number | null;
    lastTimestamp: number | null;
    lastVersion: string | null;
    intervalAverage: number;
  } {
    return {
      stage: this.stage,
      countTimestamp: this.countTimestamp,
      firstTimestamp: this.firstTimestamp,
      lastTimestamp: this.lastTimestamp,
      lastVersion: this.lastVersion,
      intervalAverage: this.getIntervalAverage(),
    };
  }
}

function summarizeStages(
  seriesValues: DatumExt[][],
  multiRepo = false,
): Map<string, StageSummary> {
  const summaries: Map<string, StageSummary> = new Map();

  for (const sequence of seriesValues) {
    let previousTimestamp: number | null = null;

    for (const datum of sequence) {
      const key = multiRepo
        ? makeStageKey(datum.stage, datum.artifactInfo.repositoryUrl)
        : datum.stage;
      const timestamp = datum.timestamp;
      const version =
        datum.artifactInfo.version ||
        datum.artifactInfo.tags.values().next().value ||
        "unknown";

      if (!summaries.has(key)) {
        summaries.set(key, new StageSummary(key));
      }
      const summary = summaries.get(key);
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
  multiRepo = false,
): StageSummary[] {
  const summaries = summarizeStages(seriesValues, multiRepo);
  return stages.map((stage) => summaries.get(stage) || new StageSummary(stage));
}
