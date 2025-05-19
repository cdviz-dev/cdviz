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
  const series = groupBySeries(data);
  const domains = extractDomains(series);
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
  }
  //console.log(res);
  return res.map((el) => el[1]);
}

// @return {timestampMin: DateTime, timestampMax: DateTime, stages: Set<string>}
function extractDomains(data: DatumExt[][]): Domains {
  let timestampMin = Number.MAX_SAFE_INTEGER;
  let timestampMax = Number.MIN_SAFE_INTEGER;
  const stagesSet = new Set<string>();
  for (const serie of data) {
    for (const d of serie) {
      if (timestampMin > d.timestamp) {
        timestampMin = d.timestamp;
      }
      if (timestampMax < d.timestamp) {
        timestampMax = d.timestamp;
      }
      stagesSet.add(d.stage);
    }
  }

  if (stagesSet.size < 1) {
    return {
      timestampMin: new Date().getTime(),
      timestampMax: new Date().getTime(),
      stages: [],
    };
  }

  const stages = sortStages(stagesSet, data);
  return {
    timestampMin,
    timestampMax,
    stages: stages,
  };
}

// sort stages based on what stage happends before / after in the lifecycle of artifact's version
// custom algorithm
// - series should often follow the same order but could stop at different progression
// - add more point for ealier stage
// => higher score == earler (more increment op + higher value)
// NOTE: we also try to implement an Elo rating but it was unstable
//
// @param {Set<string>} stages
// @param {Array<Array<{}>>} series
// @return {Array<string>}
function sortStages(stages: Set<string>, seriesValues: DatumExt[][]): string[] {
  const stagesAndScore = new Map();
  for (const stage of stages) {
    stagesAndScore.set(stage, 0);
  }
  const maxPoint = stages.size;
  for (const it of seriesValues) {
    it.sort((a, b) => a.timestamp - b.timestamp);
    let point = maxPoint;
    for (const item of it) {
      stagesAndScore.set(item.stage, stagesAndScore.get(item.stage) + point);
      point -= 1;
    }
  }
  //console.log(stagesAndScore);
  const stagesSorted = Array.from(stagesAndScore.keys()).sort(
    (a, b) => stagesAndScore.get(a) - stagesAndScore.get(b),
  );
  return stagesSorted;
}
