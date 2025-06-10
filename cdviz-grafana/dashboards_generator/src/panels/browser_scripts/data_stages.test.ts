import { expect, test } from "bun:test";
import { ArtifactInfo } from "./artifact_info";
import {
  type Datum,
  summarizeSortedStages,
  transformData,
} from "./data_stages";

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
  const summaries = summarizeSortedStages(data.series, data.domains.stages);
  expect(summaries).toEqual([]);
});

test("On dataset single point", () => {
  const data = transformData(dataset_1point);
  expect(lengthOf(data.series)).toEqual(dataset_1point.length);

  const domains = data.domains;
  expect(domains.timestampMax).toBeGreaterThanOrEqual(domains.timestampMax);
  expect(domains.stages).toEqual(["published"]);
  expect(data.series[0][0].stage).toEqual(dataset_1point[0].stage);
  expect(data.series[0][0].action).toEqual(dataset_1point[0].action);
  expect(data.series[0][0].timestamp).toEqual(dataset_1point[0].timestamp);
  expect(data.series[0][0].artifactInfo).toEqual(
    new ArtifactInfo(dataset_1point[0].artifact_id),
  );
  const summaries = summarizeSortedStages(data.series, data.domains.stages);
  expect(summaries[0].getSummary()).toEqual({
    stage: dataset_1point[0].stage,
    countTimestamp: 1,
    lastTimestamp: dataset_1point[0].timestamp,
    lastVersion:
      "sha256:b77f901a2c84ebb3aa9c4558e6c5f27c3363ac4922696b89a979b58a0ef64de8",
    intervalAverage: 0,
  });
});

test("On dataset with 2 stages", () => {
  const data = transformData(dataset_2stages);
  expect(lengthOf(data.series)).toEqual(dataset_2stages.length);

  const domains = data.domains;
  expect(domains.timestampMax).toBeGreaterThanOrEqual(domains.timestampMax);
  expect(domains.stages).toEqual([
    "cluster/A-dev/cdviz-dev/cdviz-collector/cdviz-collector",
    "published",
  ]);
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
