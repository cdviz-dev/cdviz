import { expect, test } from "bun:test";
import { transformData } from "./data_stages";

const dataset01 = [
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

const dataset01_sorted = [
  {
    timestamp: 1743529079000,
    action: "published",
    stage: "published",
    artifact_id:
      "pkg:oci/cdviz-collector@sha256%3Abfef7dade27dcf6c513b932dbf1a6f38202692437e9a86b45df2d576dbe9ce1c?repository_url=ghcr.io/cdviz-dev&tag=0%2E6%2E1",
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
      "pkg:oci/cdviz-collector@sha256%3A7bb29c16bdd8bf3573352471bff2c3ca84ab5d29da80a5cecb4d3053752751de?repository_url=ghcr.io/cdviz-dev&tag=0%2E6%2E3",
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
    timestamp: 1745421832916,
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
    timestamp: 1745422463665,
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
    timestamp: 1745422657833,
    action: "upgraded",
    stage: "cluster/A-dev/cdviz-dev/cdviz-collector/cdviz-collector",
    artifact_id:
      "pkg:oci/cdviz-collector?repository_url=ghcr.io/cdviz-dev/cdviz-collector&tag=0.7.2",
  },
  {
    timestamp: 1745422718612,
    action: "upgraded",
    stage: "cluster/A-dev/cdviz-dev/cdviz-collector/cdviz-collector",
    artifact_id:
      "pkg:oci/cdviz-collector?repository_url=ghcr.io/cdviz-dev/cdviz-collector&tag=0.6.4",
  },
  {
    timestamp: 1745426288994,
    action: "upgraded",
    stage: "cluster/A-dev/cdviz-dev/cdviz-collector/cdviz-collector",
    artifact_id:
      "pkg:oci/cdviz-collector?repository_url=ghcr.io/cdviz-dev/cdviz-collector&tag=0.7.6",
  },
];

test("transformData on dataset01", () => {
  const data = transformData(dataset01);
  const domains = data.domains;
  //console.log(domains);
  expect(domains.timestampMax).toBeGreaterThanOrEqual(domains.timestampMax);
  expect(domains.stages).toEqual([
    "cluster/A-dev/cdviz-dev/cdviz-collector/cdviz-collector",
    "published",
  ]);
});

test("transformData on dataset01_sorted", () => {
  const data = transformData(dataset01_sorted);
  const domains = data.domains;
  //console.log(domains);
  expect(domains.timestampMax).toBeGreaterThanOrEqual(domains.timestampMax);
  expect(domains.stages).toEqual([
    "cluster/A-dev/cdviz-dev/cdviz-collector/cdviz-collector",
    "published",
  ]);
});

test("transformData on dataset02", () => {
  const dataset = require("./timeline_dataset_02.json");
  const data = transformData(dataset);
  const domains = data.domains;
  //console.log(domains);
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
