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
