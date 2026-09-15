// - https://bun.com/docs/test
// - https://bun.com/docs/runtime/sql
import { sql } from "bun";
import { afterAll, expect, test } from "bun:test";

const PREFIX = "test-unit-";

// Bun SQL template literals mis-handle ::jsonb casts in CALL statements
// (the JSONB parameter arrives with NULL fields). Embed the JSON as a
// SQL literal via sql.unsafe — test payloads contain no single quotes.
const storeEvent = (payload: object) =>
  sql.unsafe(`CALL cdviz.store_cdevent('${JSON.stringify(payload)}'::jsonb)`);

afterAll(async () => {
  await sql`DELETE FROM cdviz.graph_edges WHERE source_event_id LIKE ${PREFIX + "%"}`;
  await sql`DELETE FROM cdviz.graph_nodes WHERE node_id LIKE ${PREFIX + "%"} OR node_id LIKE ${"pkg:oci/" + PREFIX + "%"}`;
  await sql`DELETE FROM cdviz.cdevents_lake WHERE context_id LIKE ${PREFIX + "%"}`;
});

test("store_cdevent parses subject, predicate and version from context.type", async () => {
  const payload = {
    context: {
      id: "test-unit-meta-01",
      type: "dev.cdevents.pipelinerun.started.0.3.0",
      timestamp: "2024-01-01T10:00:00Z",
    },
    subject: { id: `${PREFIX}pipelinerun-meta-01`, content: {} },
  };
  await storeEvent(payload);
  // version is INTEGER[3] with 0-based subscripts (as stored by the procedure).
  // Bun SQL cannot deserialize PostgreSQL array wire format, so select elements individually.
  const rows = await sql`
    SELECT subject, predicate, context_id,
           version[0] AS v0, version[1] AS v1, version[2] AS v2
    FROM cdviz.cdevents_lake WHERE context_id = 'test-unit-meta-01'
  `;
  expect(rows.length).toBe(1);
  expect(rows[0].subject).toBe("pipelinerun");
  expect(rows[0].predicate).toBe("started");
  expect(rows[0].v0).toBe(0);
  expect(rows[0].v1).toBe(3);
  expect(rows[0].v2).toBe(0);
  expect(rows[0].context_id).toBe("test-unit-meta-01");
});

test("store_cdevent inserts only 1 row when called twice with the same context_id", async () => {
  const payload = {
    context: {
      id: "test-unit-dedup-01",
      type: "dev.cdevents.pipelinerun.finished.0.3.0",
      timestamp: "2024-01-02T10:00:00Z",
    },
    subject: { id: `${PREFIX}pipelinerun-dedup-01`, content: {} },
  };
  await storeEvent(payload);
  try {
    await storeEvent(payload);
    expect(true).toBe(false); // must not reach here
  } catch {
    // expected: unique constraint violation
  }
  const rows = await sql`
    SELECT count(*)::int AS cnt FROM cdviz.cdevents_lake
    WHERE context_id = 'test-unit-dedup-01'
  `;
  expect(rows[0].cnt).toBe(1);
});

test("graph trigger upserts source node into graph_nodes after store_cdevent", async () => {
  const subjectId = `${PREFIX}taskrun-node-01`;
  const payload = {
    context: {
      id: "test-unit-node-01",
      type: "dev.cdevents.taskrun.started.0.2.0",
      timestamp: "2024-01-03T10:00:00Z",
    },
    subject: { id: subjectId, content: { taskName: "build-step" } },
  };
  await storeEvent(payload);
  const rows = await sql`
    SELECT node_id, node_type FROM cdviz.graph_nodes WHERE node_id = ${subjectId}
  `;
  expect(rows.length).toBe(1);
  expect(rows[0].node_type).toBe("taskrun");
});

test("graph trigger creates derivedFrom edge and base node for versioned artifact pURL", async () => {
  const versionedId = `pkg:oci/${PREFIX}app@1.2.3`;
  const baseId = `pkg:oci/${PREFIX}app`;
  const payload = {
    context: {
      id: "test-unit-derivedfrom-01",
      type: "dev.cdevents.artifact.published.0.2.0",
      timestamp: "2024-01-04T10:00:00Z",
    },
    subject: { id: versionedId, content: {} },
  };
  await storeEvent(payload);
  const nodes = await sql`
    SELECT node_id FROM cdviz.graph_nodes
    WHERE node_id IN (${versionedId}, ${baseId}) ORDER BY node_id
  `;
  expect(nodes.length).toBe(2);
  const edges = await sql`
    SELECT relation FROM cdviz.graph_edges
    WHERE from_node_id = ${versionedId} AND to_node_id = ${baseId}
  `;
  expect(edges.length).toBe(1);
  expect(edges[0].relation).toBe("derivedFrom");
});

test("graph trigger creates deployedWith edge when service event carries content.artifactId", async () => {
  const serviceId = `${PREFIX}svc-deploy-01`;
  const artifactId = `pkg:oci/${PREFIX}app@2.0.0`;
  const payload = {
    context: {
      id: "test-unit-deployedwith-01",
      type: "dev.cdevents.service.deployed.0.4.0",
      timestamp: "2024-01-05T10:00:00Z",
    },
    subject: {
      id: serviceId,
      content: { artifactId, environment: { id: `${PREFIX}env-01` } },
    },
  };
  await storeEvent(payload);
  const edges = await sql`
    SELECT relation FROM cdviz.graph_edges
    WHERE from_node_id = ${serviceId} AND to_node_id = ${artifactId}
  `;
  expect(edges.length).toBe(1);
  expect(edges[0].relation).toBe("deployedWith");
});

test("graph trigger normalises linkkind 'trigger' to 'triggeredBy' in customData.links", async () => {
  const subjectId = `${PREFIX}pipeline-link-01`;
  const triggerId = `${PREFIX}trigger-src-01`;
  const payload = {
    context: {
      id: "test-unit-linknorm-01",
      type: "dev.cdevents.pipelinerun.started.0.3.0",
      timestamp: "2024-01-06T10:00:00Z",
    },
    subject: { id: subjectId, content: {} },
    customData: {
      links: [{ linkkind: "trigger", subject: { id: triggerId, type: "pipelinerun" } }],
    },
  };
  await storeEvent(payload);
  const edges = await sql`
    SELECT relation FROM cdviz.graph_edges
    WHERE from_node_id = ${subjectId} AND to_node_id = ${triggerId}
  `;
  expect(edges.length).toBe(1);
  expect(edges[0].relation).toBe("triggeredBy");
});

// ── views: lifecycle-start timestamps are the FIRST occurrence ────────────────
// Regression for upstreams that re-deliver a start event (GitHub sends
// `workflow_run.in_progress` once per job pick-up; a REST backfill re-emits
// `change.created`/`ticket.created` on every pass). See migration
// 202609152300_fix_view_first_timestamp.

const event = (id: string, type: string, timestamp: string, subjectId: string, content = {}) => ({
  context: { id, type, timestamp },
  subject: { id: subjectId, content },
});

test("pipelinerun view reports the FIRST started event, not the last", async () => {
  const subjectId = `${PREFIX}pipelinerun-dupstart-01`;
  // Shape taken from a real incident: one `queued`, three `in_progress`, one `completed`.
  await storeEvent(event("test-unit-dupstart-q", "dev.cdevents.pipelinerun.queued.0.3.0", "2026-09-15T19:36:49Z", subjectId));
  await storeEvent(event("test-unit-dupstart-s1", "dev.cdevents.pipelinerun.started.0.3.0", "2026-09-15T19:36:53Z", subjectId));
  await storeEvent(event("test-unit-dupstart-s2", "dev.cdevents.pipelinerun.started.0.3.0", "2026-09-15T19:38:16Z", subjectId));
  await storeEvent(event("test-unit-dupstart-s3", "dev.cdevents.pipelinerun.started.0.3.0", "2026-09-15T19:50:01Z", subjectId));
  await storeEvent(event("test-unit-dupstart-f", "dev.cdevents.pipelinerun.finished.0.3.0", "2026-09-15T19:50:32Z", subjectId, { outcome: "success" }));

  const rows = await sql`
    SELECT EXTRACT(epoch FROM (started_at - queued_at))::int AS queue_secs,
           EXTRACT(epoch FROM (finished_at - started_at))::int AS run_secs,
           outcome
    FROM cdviz.pipelinerun WHERE subject_id = ${subjectId}
  `;
  expect(rows.length).toBe(1);
  expect(rows[0].queue_secs).toBe(4); // 19:36:49 -> 19:36:53, NOT 19:50:01
  expect(rows[0].run_secs).toBe(819); // 13m39s, NOT 31s
  expect(rows[0].outcome).toBe("success");
});

test("taskrun view reports the FIRST started event", async () => {
  const subjectId = `${PREFIX}taskrun-dupstart-01`;
  await storeEvent(event("test-unit-tr-dup-s1", "dev.cdevents.taskrun.started.0.3.0", "2026-09-15T10:00:00Z", subjectId));
  await storeEvent(event("test-unit-tr-dup-s2", "dev.cdevents.taskrun.started.0.3.0", "2026-09-15T10:05:00Z", subjectId));
  await storeEvent(event("test-unit-tr-dup-f", "dev.cdevents.taskrun.finished.0.3.0", "2026-09-15T10:10:00Z", subjectId));

  const rows = await sql`
    SELECT EXTRACT(epoch FROM (finished_at - started_at))::int AS run_secs
    FROM cdviz.taskrun WHERE subject_id = ${subjectId}
  `;
  expect(rows[0].run_secs).toBe(600);
});

test("ticket view reports the FIRST created event (backfill re-emits it every pass)", async () => {
  const subjectId = `${PREFIX}ticket-dupcreate-01`;
  await storeEvent(event("test-unit-tk-dup-c1", "dev.cdevents.ticket.created.0.2.0", "2026-09-01T10:00:00Z", subjectId));
  await storeEvent(event("test-unit-tk-dup-c2", "dev.cdevents.ticket.created.0.2.0", "2026-09-10T10:00:00Z", subjectId));
  await storeEvent(event("test-unit-tk-dup-cl", "dev.cdevents.ticket.closed.0.2.0", "2026-09-12T10:00:00Z", subjectId));

  const rows = await sql`
    SELECT EXTRACT(epoch FROM (closed_at - created_at))::int AS lifetime_secs
    FROM cdviz.ticket WHERE subject_id = ${subjectId}
  `;
  expect(rows[0].lifetime_secs).toBe(11 * 24 * 3600); // 09-01 -> 09-12, not 09-10 -> 09-12
});

test("service view keeps the LATEST deployed event (long-lived entity, current state)", async () => {
  const subjectId = `${PREFIX}service-redeploy-01`;
  await storeEvent(event("test-unit-svc-d1", "dev.cdevents.service.deployed.0.4.0", "2026-09-01T10:00:00Z", subjectId, { environment: { id: `${PREFIX}env-02` } }));
  await storeEvent(event("test-unit-svc-d2", "dev.cdevents.service.deployed.0.4.0", "2026-09-10T10:00:00Z", subjectId, { environment: { id: `${PREFIX}env-02` } }));

  const rows = await sql`
    SELECT deployed_at::text AS deployed_at FROM cdviz.service WHERE subject_id = ${subjectId}
  `;
  expect(rows[0].deployed_at).toStartWith("2026-09-10");
});

// ── normalize_run_name ────────────────────────────────────────────────────────

test("normalize_run_name collapses per-run tokens and leaves meaningful suffixes alone", async () => {
  const cases: [string, string][] = [
    // collapsed: per-run noise
    ["org/repo/CI #1234", "org/repo/CI #..."],
    ["org/repo/CI #...", "org/repo/CI #..."], // idempotent with the VRL transformer output
    ["org/repo/Bump dep #42 / build", "org/repo/Bump dep #... / build"],
    ["deploy @3f2a1b9", "deploy @..."],
    ["deploy @...", "deploy @..."],
    ["org/repo/deploy@3f2a1b9c4d5e6f7", "org/repo/deploy@..."],
    ["build a1b2c3", "build ..."],
    ["build 3f2a1b9c", "build ..."],
    ["build 8473625", "build ..."],
    // kept: meaningful matrix axes / version suffixes
    ["org/repo/CI/test 3.11", "org/repo/CI/test 3.11"],
    ["org/repo/CI (ubuntu-22.04)", "org/repo/CI (ubuntu-22.04)"],
    ["release v1.2.3", "release v1.2.3"],
    ["org/repo/CI 2026", "org/repo/CI 2026"],
    ["org/repo/test python3", "org/repo/test python3"],
    ["org/repo/build node18", "org/repo/build node18"],
    ["org/repo/build ubuntu24", "org/repo/build ubuntu24"],
    ["org/repo/build win2019", "org/repo/build win2019"],
    ["org/repo/build x86_64", "org/repo/build x86_64"],
    ["org/repo/build deadbeef", "org/repo/build deadbeef"],
    ["org/repo/integration tests", "org/repo/integration tests"],
    ["org/repo/CI", "org/repo/CI"],
  ];
  for (const [input, expected] of cases) {
    const rows = await sql`SELECT cdviz.normalize_run_name(${input}) AS out`;
    expect(`${input} => ${rows[0].out}`).toBe(`${input} => ${expected}`);
  }
  const nullRows = await sql`SELECT cdviz.normalize_run_name(NULL) AS out`;
  expect(nullRows[0].out).toBeNull();
});
