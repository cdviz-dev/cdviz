import { expect, test } from "bun:test";
import { ArtifactInfo } from "./artifact_info";
import {
  type Datum,
  REPO_SEPARATOR_PREFIX,
  STAGE_KEY_SEP,
  summarizeSortedStages,
  transformData,
} from "./data_stages";

// Helpers to build expected stage keys in tests
const sep = (repo: string) => `${REPO_SEPARATOR_PREFIX}${repo}`;
const key = (repo: string, stage: string) => `${repo}${STAGE_KEY_SEP}${stage}`;

const dataset_empty: Datum[] = [];

const dataset_1point = [
  {
    timestamp: 1743702509000,
    action: "published",
    stage: "published",
    artifact_id:
      "pkg:oci/cdviz-collector@sha256%3Ab77f901a2c84ebb3aa9c4558e6c5f27c3363ac4922696b89a979b58a0ef64de8?repository_url=ghcr.io/cdviz-dev&tag=latest",
  },
];

const dataset_2stages = [
  {
    timestamp: 1743529079000,
    action: "published",
    stage: "published",
    artifact_id:
      "pkg:oci/cdviz-collector@sha256%3Abfef7dade27dcf6c513b932dbf1a6f38202692437e9a86b45df2d576dbe9ce1c?repository_url=ghcr.io/cdviz-dev&tag=0%2E6%2E1",
  },
  {
    timestamp: 1743625641000,
    action: "published",
    stage: "published",
    artifact_id:
      "pkg:oci/cdviz-collector@sha256%3A7bb29c16bdd8bf3573352471bff2c3ca84ab5d29da80a5cecb4d3053752751de?repository_url=ghcr.io/cdviz-dev&tag=0%2E6%2E3",
  },
  {
    timestamp: 1743529079000,
    action: "published",
    stage: "published",
    artifact_id:
      "pkg:oci/cdviz-collector@sha256%3Abfef7dade27dcf6c513b932dbf1a6f38202692437e9a86b45df2d576dbe9ce1c?repository_url=ghcr.io/cdviz-dev&tag=latest",
  },
  {
    timestamp: 1743625641000,
    action: "published",
    stage: "published",
    artifact_id:
      "pkg:oci/cdviz-collector@sha256%3A7bb29c16bdd8bf3573352471bff2c3ca84ab5d29da80a5cecb4d3053752751de?repository_url=ghcr.io/cdviz-dev&tag=latest",
  },
  {
    timestamp: 1743702509000,
    action: "published",
    stage: "published",
    artifact_id:
      "pkg:oci/cdviz-collector@sha256%3Ab77f901a2c84ebb3aa9c4558e6c5f27c3363ac4922696b89a979b58a0ef64de8?repository_url=ghcr.io/cdviz-dev&tag=0%2E6%2E4",
  },
  {
    timestamp: 1743702509000,
    action: "published",
    stage: "published",
    artifact_id:
      "pkg:oci/cdviz-collector@sha256%3Ab77f901a2c84ebb3aa9c4558e6c5f27c3363ac4922696b89a979b58a0ef64de8?repository_url=ghcr.io/cdviz-dev&tag=latest",
  },
  {
    timestamp: 1745426288994,
    action: "upgraded",
    stage: "cluster/A-dev/cdviz-dev/cdviz-collector/cdviz-collector",
    artifact_id:
      "pkg:oci/cdviz-collector?repository_url=ghcr.io/cdviz-dev/cdviz-collector&tag=0.7.6",
  },
  {
    timestamp: 1745422718612,
    action: "upgraded",
    stage: "cluster/A-dev/cdviz-dev/cdviz-collector/cdviz-collector",
    artifact_id:
      "pkg:oci/cdviz-collector?repository_url=ghcr.io/cdviz-dev/cdviz-collector&tag=0.6.4",
  },
  {
    timestamp: 1745422657833,
    action: "upgraded",
    stage: "cluster/A-dev/cdviz-dev/cdviz-collector/cdviz-collector",
    artifact_id:
      "pkg:oci/cdviz-collector?repository_url=ghcr.io/cdviz-dev/cdviz-collector&tag=0.7.2",
  },
  {
    timestamp: 1745422524523,
    action: "upgraded",
    stage: "cluster/A-dev/cdviz-dev/cdviz-collector/cdviz-collector",
    artifact_id:
      "pkg:oci/cdviz-collector?repository_url=ghcr.io/cdviz-dev/cdviz-collector&tag=0.6.4",
  },
  {
    timestamp: 1745422463665,
    action: "upgraded",
    stage: "cluster/A-dev/cdviz-dev/cdviz-collector/cdviz-collector",
    artifact_id:
      "pkg:oci/cdviz-collector?repository_url=ghcr.io/cdviz-dev/cdviz-collector&tag=0.7.2",
  },
  {
    timestamp: 1745421893750,
    action: "upgraded",
    stage: "cluster/A-dev/cdviz-dev/cdviz-collector/cdviz-collector",
    artifact_id:
      "pkg:oci/cdviz-collector?repository_url=ghcr.io/cdviz-dev/cdviz-collector&tag=0.6.4",
  },
  {
    timestamp: 1745421832916,
    action: "upgraded",
    stage: "cluster/A-dev/cdviz-dev/cdviz-collector/cdviz-collector",
    artifact_id:
      "pkg:oci/cdviz-collector?repository_url=ghcr.io/cdviz-dev/cdviz-collector&tag=0.7.2",
  },
];

function lengthOf<T>(arr: T[][]): number {
  if (arr.length === 0) {
    return 0;
  }
  return arr.map((v) => v.length).reduce((p, c) => p + c);
}

test("On dataset empty", () => {
  const data = transformData(dataset_empty);
  expect(lengthOf(data.series)).toEqual(dataset_empty.length);

  const domains = data.domains;
  expect(domains.timestampMax).toBeGreaterThanOrEqual(domains.timestampMax);
  expect(domains.stages).toEqual([]);
  expect(domains.multiRepo).toBeFalse();
  const summaries = summarizeSortedStages(
    data.series,
    data.domains.stages,
    data.domains.multiRepo,
  );
  expect(summaries).toEqual([]);
});

test("On dataset single point", () => {
  const data = transformData(dataset_1point);
  expect(lengthOf(data.series)).toEqual(dataset_1point.length);

  const domains = data.domains;
  expect(domains.timestampMax).toBeGreaterThanOrEqual(domains.timestampMax);
  expect(domains.stages).toEqual(["published"]);
  expect(domains.multiRepo).toBeFalse();
  expect(data.series[0][0].stage).toEqual(dataset_1point[0].stage);
  expect(data.series[0][0].action).toEqual(dataset_1point[0].action);
  expect(data.series[0][0].timestamp).toEqual(dataset_1point[0].timestamp);
  expect(data.series[0][0].artifactInfo).toEqual(
    new ArtifactInfo(dataset_1point[0].artifact_id),
  );
  const summaries = summarizeSortedStages(
    data.series,
    data.domains.stages,
    data.domains.multiRepo,
  );
  expect(summaries[0].getSummary()).toEqual({
    stage: dataset_1point[0].stage,
    countTimestamp: 1,
    firstTimestamp: dataset_1point[0].timestamp,
    lastTimestamp: dataset_1point[0].timestamp,
    lastVersion:
      "sha256:b77f901a2c84ebb3aa9c4558e6c5f27c3363ac4922696b89a979b58a0ef64de8",
    intervalAverage: 0,
  });
});

test("On dataset with 2 stages (multi-repo)", () => {
  const data = transformData(dataset_2stages);
  expect(lengthOf(data.series)).toEqual(dataset_2stages.length);

  const domains = data.domains;
  expect(domains.timestampMax).toBeGreaterThanOrEqual(domains.timestampMax);
  // Two distinct repos → multi-repo mode with separator bands
  expect(domains.multiRepo).toBeTrue();
  const REPO_A = "ghcr.io/cdviz-dev";
  const REPO_B = "ghcr.io/cdviz-dev/cdviz-collector";
  expect(domains.stages).toEqual([
    key(REPO_A, "published"),
    sep(REPO_A),
    key(REPO_B, "cluster/A-dev/cdviz-dev/cdviz-collector/cdviz-collector"),
    sep(REPO_B),
  ]);
});

test("No-version events group into a single series", () => {
  const dataset: Datum[] = [
    {
      timestamp: 1000,
      action: "published",
      stage: "published",
      artifact_id: "pkg:oci/app-a",
    },
    {
      timestamp: 2000,
      action: "deployed",
      stage: "dev",
      artifact_id: "pkg:oci/app-a",
    },
    {
      timestamp: 3000,
      action: "deployed",
      stage: "prod",
      artifact_id: "pkg:oci/app-a",
    },
  ];
  const data = transformData(dataset);
  // All three events should be in one series (same bare artifact, no-version groups correctly)
  expect(data.series.length).toEqual(1);
  expect(data.series[0].length).toEqual(3);
  expect(data.domains.stages).toEqual(["prod", "dev", "published"]);
  expect(data.domains.multiRepo).toBeFalse();
});

test("On dataset02", () => {
  const dataset = require("./timeline_dataset_02.json");
  const data = transformData(dataset);
  expect(lengthOf(data.series)).toEqual(dataset.length);

  const domains = data.domains;
  expect(domains.timestampMax).toBeGreaterThanOrEqual(domains.timestampMax);
  expect(domains.stages).toEqual([
    "group1-prod/us-2/ns-a/deploy-a/container-a",
    "group1-prod/eu-2/ns-a/deploy-a/container-a",
    "group1-uat/eu-1/ns-a/deploy-a/container-a",
    "group1-dev/eu-1/ns-a/deploy-a/container-a",
    "signed",
    "published",
  ]);
});

test("On dataset03", () => {
  const dataset = require("./timeline_dataset_03.json");
  const data = transformData(dataset);
  expect(lengthOf(data.series)).toEqual(dataset.length);

  const domains = data.domains;
  expect(domains.timestampMax).toBeGreaterThanOrEqual(domains.timestampMax);
  expect(domains.stages).toEqual([
    "group1-prod/us-2/ns-a/deploy-a/container-b",
    "group1-prod/eu-2/ns-a/deploy-a/container-b",
    "group1-uat/eu-1/ns-a/deploy-a/container-b",
    "group1-dev/eu-1/ns-a/deploy-a/container-b",
    "signed",
    "published",
  ]);
});

// ── Run-type event tests ────────────────────────────────────────────────────
//
// Modelling the testsuiterun_app-d use-case after SQL deduplication
// (PARTITION BY artifact_id, entity_id ORDER BY timestamp DESC → rn=1):
//   - Unit Tests: 2 runs, both linked to the bare artifact (no tag)
//   - Integration Tests: 2 runs, each linked to a different tagged artifact
//
// The stage format for run-type events is "relation\nDefinitionName".

// Unit Tests: 2 runs → same bare artifact_id → merged into 1 series.
// The bare artifact has hasVersion=false, so no line should be drawn between points.
const dataset_run_bare: Datum[] = [
  {
    timestamp: 86400000,
    action: "testsuiterun.finished",
    stage: "triggeredBy\nUnit Tests",
    artifact_id: "pkg:oci/app-d?repository_url=my_repo.io/my_org",
    entity_type: "testsuiterun",
    entity_id: "ci-app-d-0.1.0",
  },
  {
    timestamp: 259200000, // +2 days
    action: "testsuiterun.finished",
    stage: "triggeredBy\nUnit Tests",
    artifact_id: "pkg:oci/app-d?repository_url=my_repo.io/my_org",
    entity_type: "testsuiterun",
    entity_id: "ci-app-d-0.2.0",
  },
];

// Integration Tests: 2 runs → different tagged artifact_ids → 2 separate series.
// Tagged artifacts have hasVersion=true, so lines are drawn.
const dataset_run_tagged: Datum[] = [
  {
    timestamp: 118800000,
    action: "testsuiterun.finished",
    stage: "triggeredBy\nIntegration Tests",
    artifact_id: "pkg:oci/app-d?repository_url=my_repo.io/my_org&tag=0.1.0",
    entity_type: "testsuiterun",
    entity_id: "dev-app-d-0.1.0",
  },
  {
    timestamp: 291600000, // +2 days
    action: "testsuiterun.finished",
    stage: "triggeredBy\nIntegration Tests",
    artifact_id: "pkg:oci/app-d?repository_url=my_repo.io/my_org&tag=0.2.0",
    entity_type: "testsuiterun",
    entity_id: "dev-app-d-0.2.0",
  },
];

test("Run-type events: bare artifact runs merge into one series (hasVersion=false → no line)", () => {
  const data = transformData(dataset_run_bare);

  // Both events preserved
  expect(lengthOf(data.series)).toEqual(2);
  // Same bare artifact_id → grouped into a single series
  expect(data.series.length).toEqual(1);
  expect(data.series[0].length).toEqual(2);

  // The stage key is the multi-part "relation\nDefinitionName" string
  expect(data.domains.stages).toEqual(["triggeredBy\nUnit Tests"]);
  expect(data.domains.multiRepo).toBeFalse();

  // hasVersion=false because the artifact has no @version and no non-latest tag.
  // This drives the "no line" rendering in draw_timeline_echarts.ts.
  expect(data.series[0][0].artifactInfo.hasVersion).toBeFalse();
});

test("Run-type events: tagged artifact runs remain separate series (hasVersion=true → line drawn)", () => {
  const data = transformData(dataset_run_tagged);

  // Both events preserved
  expect(lengthOf(data.series)).toEqual(2);
  // Different tag per run → different series (tags don't intersect)
  expect(data.series.length).toEqual(2);
  expect(data.series[0].length).toEqual(1);
  expect(data.series[1].length).toEqual(1);

  // Both share the same stage name → only one stage row on the Y-axis
  expect(data.domains.stages).toEqual(["triggeredBy\nIntegration Tests"]);
  expect(data.domains.multiRepo).toBeFalse();

  // hasVersion=true because each artifact has a non-latest tag
  expect(data.series[0][0].artifactInfo.hasVersion).toBeTrue();
  expect(data.series[1][0].artifactInfo.hasVersion).toBeTrue();
});

test("Run-type events: mixed bare and tagged runs produce correct stages and series", () => {
  const dataset = [...dataset_run_bare, ...dataset_run_tagged];
  const data = transformData(dataset);

  // 4 events total: 2 Unit Tests (merged) + 2 Integration Tests (separate)
  expect(lengthOf(data.series)).toEqual(4);
  expect(data.series.length).toEqual(3); // 1 bare series + 2 tagged series

  // Two distinct stage rows on the Y-axis
  expect(data.domains.stages).toContain("triggeredBy\nUnit Tests");
  expect(data.domains.stages).toContain("triggeredBy\nIntegration Tests");
  expect(data.domains.stages.length).toEqual(2);

  expect(data.domains.multiRepo).toBeFalse();
});
