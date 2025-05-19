import { expect, test } from "bun:test";
import { ArtifactInfo } from "./artifact_info";

test("parse pkg:oci/app-a@0.0.1", () => {
  const app = new ArtifactInfo("pkg:oci/app-a@0.0.1");
  expect(app.base).toBe("oci/app-a");
  expect(app.version).toBe("0.0.1");
  expect(app.tags).toBeEmpty();
});

test("isSimilarTo", () => {
  const app_a = new ArtifactInfo("pkg:oci/app-a");
  expect(app_a.isSimilarTo(app_a)).toBeTrue();

  const app_a_v001 = new ArtifactInfo("pkg:oci/app-a@0.0.1");
  expect(app_a_v001.isSimilarTo(app_a_v001)).toBeTrue();

  const app_a_v002 = new ArtifactInfo("pkg:oci/app-a@0.0.2");
  expect(app_a_v002.isSimilarTo(app_a_v002)).toBeTrue();
  expect(app_a_v001.isSimilarTo(app_a_v002)).toBeFalse();
  expect(app_a_v002.isSimilarTo(app_a_v001)).toBeFalse();

  const app_b_v001 = new ArtifactInfo("pkg:oci/app-b@0.0.1");
  expect(app_b_v001.isSimilarTo(app_b_v001)).toBeTrue();
  expect(app_b_v001.isSimilarTo(app_a_v001)).toBeFalse();
  expect(app_a_v001.isSimilarTo(app_b_v001)).toBeFalse();

  const app_a_v001_latest = new ArtifactInfo("pkg:oci/app-a@0.0.1?tag=latest");
  expect(app_a_v001_latest.isSimilarTo(app_a_v001_latest)).toBeTrue();
  expect(app_a_v001_latest.isSimilarTo(app_a_v001)).toBeTrue();
  expect(app_a_v001.isSimilarTo(app_a_v001_latest)).toBeTrue();

  const app_a_foo = new ArtifactInfo("pkg:oci/app-a?tag=foo");
  expect(app_a_foo.isSimilarTo(app_a_foo)).toBeTrue();
  expect(app_a_foo.isSimilarTo(app_a_v001)).toBeFalse();
  expect(app_a_v001.isSimilarTo(app_a_foo)).toBeFalse();

  const app_a_v001_foo = new ArtifactInfo("pkg:oci/app-a@0.0.1?tag=foo");
  expect(app_a_v001_foo.isSimilarTo(app_a_v001)).toBeTrue();
  expect(app_a_v001.isSimilarTo(app_a_v001_foo)).toBeTrue();
  expect(app_a_v001_foo.isSimilarTo(app_a_v001)).toBeTrue();
  expect(app_a_v001_foo.isSimilarTo(app_a_foo)).toBeTrue();
  expect(app_a_foo.isSimilarTo(app_a_v001_foo)).toBeTrue();

  const app_a_v002_latest = new ArtifactInfo("pkg:oci/app-a@0.0.2?tag=latest");
  expect(app_a_v001_latest.isSimilarTo(app_a_v002_latest)).toBeFalse();
});

test("mergeVersionAndTags", () => {
  const app_a = new ArtifactInfo("pkg:oci/app-a");
  const app_a_v001 = new ArtifactInfo("pkg:oci/app-a@0.0.1");
  const app_a_v001_latest = new ArtifactInfo("pkg:oci/app-a@0.0.1?tag=latest");
  const app_a_v001_foo = new ArtifactInfo("pkg:oci/app-a@0.0.1?tag=foo");
  const app_a_foo = new ArtifactInfo("pkg:oci/app-a?tag=foo");

  const m1 = Object.create(app_a_v001);
  m1.mergeVersionAndTags(app_a_foo);
  expect(m1.isSimilarTo(app_a_v001)).toBeTrue();
  expect(m1.isSimilarTo(app_a_foo)).toBeTrue();
});
