-- Graph layer for CDviz provenance and relationship tracking
--
-- Why this exists:
--   The artifact_timeline dashboard queries provenance via hardcoded UNION ALL branches
--   (one per CDEvents subject type). Every new subject type requires a new SQL branch.
--   More critically, multi-hop questions ("which services run a flagged artifact?",
--   "what pipeline built this deployment?") cannot be answered without recursive traversal.
--
--   This migration adds an adjacency-list graph extracted from cdevents_lake, enabling:
--   - Automatic indexing of all entity relationships as events arrive (trigger)
--   - Multi-hop traversal via recursive CTEs, usable from Grafana (plain SQL, no new extensions)
--   - A stable query surface for external tools (IDPs, MCP agents, dashboards)
--
-- Design choices documented inline below.

-- ── graph_nodes ─────────────────────────────────────────────────────────────
-- One row per unique entity ever seen in CDEvents.
-- Intentionally NOT a hypertable: nodes are entities (artifacts, services, environments),
-- not time-series measurements. The full event payload stays in cdevents_lake; this table
-- stores only what is needed to traverse the graph without joining back.
CREATE TABLE IF NOT EXISTS "cdviz"."graph_nodes" (
    "node_id" TEXT NOT NULL,
    "node_type" TEXT NOT NULL,
    "first_seen_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- properties holds the latest subject.content from CDEvents.
    -- Enriched every time a new event for this subject arrives, so consumers can read
    -- current entity state (e.g. environment ID, artifact tags) without joining cdevents_lake.
    "properties" JSONB NOT NULL DEFAULT '{}',
    CONSTRAINT "graph_nodes_pkey" PRIMARY KEY ("node_id")
);

COMMENT ON TABLE "cdviz"."graph_nodes" IS 'Unique SDLC entities (artifacts, services, environments, test runs, …) derived from CDEvents';
COMMENT ON COLUMN "cdviz"."graph_nodes"."node_id" IS 'Canonical entity identifier — CDEvents subject.id, e.g. pkg:oci/app@1.0 or svc://my-svc/prod';
COMMENT ON COLUMN "cdviz"."graph_nodes"."node_type" IS 'CDEvents subject type in lowercase: artifact, service, testsuiterun, environment, …';
COMMENT ON COLUMN "cdviz"."graph_nodes"."first_seen_at" IS 'Timestamp of the CDEvent that first introduced this node (event time, not import time)';
COMMENT ON COLUMN "cdviz"."graph_nodes"."properties" IS 'Latest subject.content JSONB from CDEvents; updated on every new event for this entity';


-- ── graph_edges ─────────────────────────────────────────────────────────────
-- Directed edges between nodes, each labelled with a canonical relation.
--
-- Edge direction convention:
--   from_node_id = consumer / downstream instance  (e.g. service, testsuiterun)
--   to_node_id   = dependency / upstream definition (e.g. artifact, environment)
--   So graph_descendants(artifact) returns all services and test runs that reference it.
--
-- Uniqueness on (from, to, relation) — NOT including source_event_id:
--   The same semantic relationship is often re-asserted by multiple events for the same
--   subject (service.deployed + service.upgraded + service.finished all carry the same
--   content.artifactId). We want exactly one edge per directed relationship type, keeping
--   the timestamp of the first observation.  source_event_id is retained as an audit
--   column (which event first created this edge) but is not part of the constraint.
CREATE TABLE IF NOT EXISTS "cdviz"."graph_edges" (
    "id" BIGSERIAL NOT NULL,
    "from_node_id" TEXT NOT NULL,
    "to_node_id" TEXT NOT NULL,
    -- Canonical relation labels (see full list in comment below).
    -- Source: subject.content fields + customData.links[*].linkkind (normalised).
    "relation" TEXT NOT NULL,
    -- Timestamp of the first CDEvent that established this edge.
    "event_timestamp" TIMESTAMPTZ NOT NULL,
    -- context_id of that event — join to cdevents_lake for full payload details.
    "source_event_id" TEXT NOT NULL,
    CONSTRAINT "graph_edges_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "graph_edges_unique" UNIQUE ("from_node_id", "to_node_id", "relation"),
    CONSTRAINT "graph_edges_from_fk" FOREIGN KEY ("from_node_id") REFERENCES "cdviz"."graph_nodes" ("node_id"),
    CONSTRAINT "graph_edges_to_fk" FOREIGN KEY ("to_node_id") REFERENCES "cdviz"."graph_nodes" ("node_id")
);

-- Indexes on both FK columns are essential: graph traversal filters on either direction.
-- The timestamp index supports queries like "show the graph state at time T".
CREATE INDEX IF NOT EXISTS "idx_graph_edges_from" ON "cdviz"."graph_edges" ("from_node_id");
CREATE INDEX IF NOT EXISTS "idx_graph_edges_to" ON "cdviz"."graph_edges" ("to_node_id");
CREATE INDEX IF NOT EXISTS "idx_graph_edges_ts" ON "cdviz"."graph_edges" ("event_timestamp" DESC);

COMMENT ON TABLE "cdviz"."graph_edges" IS 'Directed relationships between SDLC entities, sourced from CDEvents subject.content and customData.links';
COMMENT ON COLUMN "cdviz"."graph_edges"."relation" IS
'Canonical edge label. Vocabulary:
     derivedFrom  — artifact variant → base pURL (pkg:app?tag=1.0 → pkg:app)
     deployedWith — service → artifact it runs
     deployedTo   — service or incident → environment
     runsIn       — testsuiterun or testcaserun → environment
     partOf       — taskrun / testcaserun / testsuiterun → parent run
     instanceOf   — testsuiterun → testsuite, testcaserun → testcase
     triggeredBy  — any → entity that triggered it (normalised from linkkind=trigger)
     causedBy     — any → entity that caused it (normalised from linkkind=cause/effect)
     produced     — build → artifact
     affects      — incident → service or artifact
     includes     — composite artifact → component artifact (helm chart → containers)
     storedAt     — testsuiterun → artifact or URI holding the test output
     dependsOn    — generic fallback for unknown or future linkkind values';
COMMENT ON COLUMN "cdviz"."graph_edges"."source_event_id" IS 'context_id of the CDEvent that first created this edge; JOIN to cdevents_lake for full details';


-- ── Trigger function: populate graph on every cdevents_lake INSERT ───────────
-- Relationships are extracted from two sources in the CDEvents payload:
--   1. subject.content fields — typed references defined in the CDEvents spec
--      (e.g. service.content.artifactId, taskrun.content.pipelineRun.id)
--   2. customData.links[] — arbitrary cross-entity links added by emitters
--      using the {linkkind, subject:{id,type}} structure
--
-- The function is intentionally NOT gated on subject type for content fields:
-- any future event type that carries content.artifactId will be indexed automatically.
--
-- Artifact base identity:
--   pURL qualifiers make each tag/version a distinct identifier (pkg:app?tag=0.1.0).
--   We also create a stripped base node (pkg:app) and a derivedFrom edge so consumers
--   can ask "all versions of artifact X" via graph_descendants(base_id).
--
-- Node conflict resolution:
--   - node_type: keep the first "real" type; only upgrade from 'unknown'
--     (a node created as a link target before its own event arrives gets type 'unknown';
--     it is corrected when the proper artifact/service/… event arrives)
--   - properties: always update to latest subject.content so readers see current state
--
-- customData.links linkkind normalisation:
--   Legacy emitters use 'trigger'/'cause'/'effect'; canonical labels are 'triggeredBy'/'causedBy'.
--   The CASE normalises old values transparently; update VRL transformers to emit canonical
--   labels directly so this becomes a no-op safety net.
CREATE OR REPLACE FUNCTION "cdviz"."fn_cdevents_lake_graph_upsert"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_src_id          TEXT ;
    v_base_id         TEXT ;
    v_link            JSONB ;
    v_artifact_id     TEXT ;
    v_env_id          TEXT ;
    v_pipelinerun_id  TEXT ;
    v_testsuiterun_id TEXT ;
    v_testcase_id     TEXT ;
    v_testsuite_id    TEXT ;
    v_service_id      TEXT ;
BEGIN
    v_src_id := NEW.payload -> 'subject' ->> 'id' ;

    -- Skip events with no subject id (malformed or non-standard)
    IF v_src_id IS NULL THEN
        RETURN NEW ;
    END IF ;

    -- Upsert the source node. Store the event's subject.content as properties so
    -- downstream consumers can read entity state without joining cdevents_lake.
    INSERT INTO "cdviz"."graph_nodes" ("node_id", "node_type", "first_seen_at", "properties")
    VALUES (
        v_src_id,
        NEW.subject,
        NEW.timestamp,
        COALESCE(NEW.payload -> 'subject' -> 'content', '{}')
    )
    ON CONFLICT ("node_id") DO UPDATE SET
        node_type  = CASE
            WHEN "cdviz"."graph_nodes".node_type = 'unknown' THEN EXCLUDED.node_type
            ELSE "cdviz"."graph_nodes".node_type
        END,
        properties = EXCLUDED.properties ;

    -- For artifact events: also create a base node and derivedFrom edge.
    -- This lets consumers traverse from base → all tagged/versioned variants.
    IF NEW.subject = 'artifact' AND (v_src_id LIKE 'pkg:%@%' OR v_src_id LIKE 'pkg:%?%') THEN
        v_base_id := regexp_replace(v_src_id, '[@?].*$', '') ;

        INSERT INTO "cdviz"."graph_nodes" ("node_id", "node_type", "first_seen_at", "properties")
        VALUES (v_base_id, 'artifact', NEW.timestamp, '{}')
        ON CONFLICT ("node_id") DO NOTHING ;

        INSERT INTO "cdviz"."graph_edges"
            ("from_node_id", "to_node_id", "relation", "event_timestamp", "source_event_id")
        VALUES (v_src_id, v_base_id, 'derivedFrom', NEW.timestamp, NEW.context_id)
        ON CONFLICT ("from_node_id", "to_node_id", "relation") DO NOTHING ;
    END IF ;

    -- Extract all known content references.
    -- Intentionally checks all fields on every event: a future subject type that
    -- happens to carry content.artifactId will be indexed without any code change.
    v_artifact_id     := NEW.payload -> 'subject' -> 'content' ->> 'artifactId' ;
    v_env_id          := NEW.payload -> 'subject' -> 'content' -> 'environment' ->> 'id' ;
    v_pipelinerun_id  := NEW.payload -> 'subject' -> 'content' -> 'pipelineRun' ->> 'id' ;
    v_testsuiterun_id := NEW.payload -> 'subject' -> 'content' -> 'testSuiteRun' ->> 'id' ;
    v_testcase_id     := NEW.payload -> 'subject' -> 'content' -> 'testCase' ->> 'id' ;
    v_testsuite_id    := NEW.payload -> 'subject' -> 'content' -> 'testSuite' ->> 'id' ;
    v_service_id      := NEW.payload -> 'subject' -> 'content' -> 'service' ->> 'id' ;

    IF v_artifact_id IS NOT NULL THEN
        -- build events *produce* an artifact; all others (service, incident) *deployedWith* it
        DECLARE
            v_art_rel TEXT := CASE NEW.subject WHEN 'build' THEN 'produced' ELSE 'deployedWith' END ;
        BEGIN
            INSERT INTO "cdviz"."graph_nodes" ("node_id", "node_type", "first_seen_at", "properties")
            VALUES (v_artifact_id, 'artifact', NEW.timestamp, '{}')
            ON CONFLICT ("node_id") DO NOTHING ;

            INSERT INTO "cdviz"."graph_edges"
                ("from_node_id", "to_node_id", "relation", "event_timestamp", "source_event_id")
            VALUES (v_src_id, v_artifact_id, v_art_rel, NEW.timestamp, NEW.context_id)
            ON CONFLICT ("from_node_id", "to_node_id", "relation") DO NOTHING ;

            -- If the referenced artifact itself is versioned/tagged, also link it to its base
            IF v_artifact_id LIKE 'pkg:%@%' OR v_artifact_id LIKE 'pkg:%?%' THEN
                v_base_id := regexp_replace(v_artifact_id, '[@?].*$', '') ;

                INSERT INTO "cdviz"."graph_nodes" ("node_id", "node_type", "first_seen_at", "properties")
                VALUES (v_base_id, 'artifact', NEW.timestamp, '{}')
                ON CONFLICT ("node_id") DO NOTHING ;

                INSERT INTO "cdviz"."graph_edges"
                    ("from_node_id", "to_node_id", "relation", "event_timestamp", "source_event_id")
                VALUES (v_artifact_id, v_base_id, 'derivedFrom', NEW.timestamp, NEW.context_id)
                ON CONFLICT ("from_node_id", "to_node_id", "relation") DO NOTHING ;
            END IF ;
        END ;
    END IF ;

    IF v_env_id IS NOT NULL THEN
        -- Test runs *runsIn* an environment; deployments and incidents use *deployedTo*
        DECLARE
            v_env_rel TEXT := CASE
                WHEN NEW.subject IN ('testsuiterun', 'testcaserun') THEN 'runsIn'
                ELSE 'deployedTo'
            END ;
        BEGIN
            INSERT INTO "cdviz"."graph_nodes" ("node_id", "node_type", "first_seen_at", "properties")
            VALUES (v_env_id, 'environment', NEW.timestamp, '{}')
            ON CONFLICT ("node_id") DO NOTHING ;

            INSERT INTO "cdviz"."graph_edges"
                ("from_node_id", "to_node_id", "relation", "event_timestamp", "source_event_id")
            VALUES (v_src_id, v_env_id, v_env_rel, NEW.timestamp, NEW.context_id)
            ON CONFLICT ("from_node_id", "to_node_id", "relation") DO NOTHING ;
        END ;
    END IF ;

    IF v_pipelinerun_id IS NOT NULL THEN
        -- taskrun is partOf a pipelinerun
        INSERT INTO "cdviz"."graph_nodes" ("node_id", "node_type", "first_seen_at", "properties")
        VALUES (v_pipelinerun_id, 'pipelinerun', NEW.timestamp, '{}')
        ON CONFLICT ("node_id") DO UPDATE SET
            node_type = CASE
                WHEN "cdviz"."graph_nodes".node_type = 'unknown' THEN EXCLUDED.node_type
                ELSE "cdviz"."graph_nodes".node_type
            END ;

        INSERT INTO "cdviz"."graph_edges"
            ("from_node_id", "to_node_id", "relation", "event_timestamp", "source_event_id")
        VALUES (v_src_id, v_pipelinerun_id, 'partOf', NEW.timestamp, NEW.context_id)
        ON CONFLICT ("from_node_id", "to_node_id", "relation") DO NOTHING ;
    END IF ;

    IF v_testsuiterun_id IS NOT NULL THEN
        -- testcaserun is partOf a testsuiterun
        INSERT INTO "cdviz"."graph_nodes" ("node_id", "node_type", "first_seen_at", "properties")
        VALUES (v_testsuiterun_id, 'testsuiterun', NEW.timestamp, '{}')
        ON CONFLICT ("node_id") DO UPDATE SET
            node_type = CASE
                WHEN "cdviz"."graph_nodes".node_type = 'unknown' THEN EXCLUDED.node_type
                ELSE "cdviz"."graph_nodes".node_type
            END ;

        INSERT INTO "cdviz"."graph_edges"
            ("from_node_id", "to_node_id", "relation", "event_timestamp", "source_event_id")
        VALUES (v_src_id, v_testsuiterun_id, 'partOf', NEW.timestamp, NEW.context_id)
        ON CONFLICT ("from_node_id", "to_node_id", "relation") DO NOTHING ;
    END IF ;

    IF v_testcase_id IS NOT NULL THEN
        -- testcaserun is instanceOf a testcase definition
        INSERT INTO "cdviz"."graph_nodes" ("node_id", "node_type", "first_seen_at", "properties")
        VALUES (v_testcase_id, 'testcase', NEW.timestamp, '{}')
        ON CONFLICT ("node_id") DO NOTHING ;

        INSERT INTO "cdviz"."graph_edges"
            ("from_node_id", "to_node_id", "relation", "event_timestamp", "source_event_id")
        VALUES (v_src_id, v_testcase_id, 'instanceOf', NEW.timestamp, NEW.context_id)
        ON CONFLICT ("from_node_id", "to_node_id", "relation") DO NOTHING ;
    END IF ;

    IF v_testsuite_id IS NOT NULL THEN
        -- testsuiterun is instanceOf a testsuite definition
        INSERT INTO "cdviz"."graph_nodes" ("node_id", "node_type", "first_seen_at", "properties")
        VALUES (v_testsuite_id, 'testsuite', NEW.timestamp, '{}')
        ON CONFLICT ("node_id") DO NOTHING ;

        INSERT INTO "cdviz"."graph_edges"
            ("from_node_id", "to_node_id", "relation", "event_timestamp", "source_event_id")
        VALUES (v_src_id, v_testsuite_id, 'instanceOf', NEW.timestamp, NEW.context_id)
        ON CONFLICT ("from_node_id", "to_node_id", "relation") DO NOTHING ;
    END IF ;

    IF v_service_id IS NOT NULL THEN
        -- incident affects a service
        INSERT INTO "cdviz"."graph_nodes" ("node_id", "node_type", "first_seen_at", "properties")
        VALUES (v_service_id, 'service', NEW.timestamp, '{}')
        ON CONFLICT ("node_id") DO UPDATE SET
            node_type = CASE
                WHEN "cdviz"."graph_nodes".node_type = 'unknown' THEN EXCLUDED.node_type
                ELSE "cdviz"."graph_nodes".node_type
            END ;

        INSERT INTO "cdviz"."graph_edges"
            ("from_node_id", "to_node_id", "relation", "event_timestamp", "source_event_id")
        VALUES (v_src_id, v_service_id, 'affects', NEW.timestamp, NEW.context_id)
        ON CONFLICT ("from_node_id", "to_node_id", "relation") DO NOTHING ;
    END IF ;

    -- customData.links: arbitrary cross-entity links added by emitters.
    -- Normalise legacy linkkind values to the canonical vocabulary.
    IF jsonb_typeof(NEW.payload -> 'customData' -> 'links') = 'array' THEN
        FOR v_link IN
            SELECT value FROM jsonb_array_elements(NEW.payload -> 'customData' -> 'links')
        LOOP
            DECLARE
                v_tgt_id   TEXT := v_link -> 'subject' ->> 'id' ;
                v_tgt_type TEXT := COALESCE(v_link -> 'subject' ->> 'type', 'unknown') ;
                -- Normalise legacy values: 'trigger' → 'triggeredBy', 'cause'/'effect' → 'causedBy'.
                -- VRL transformers should emit canonical labels directly; this is a safety net.
                v_lk TEXT := COALESCE(
                    CASE v_link ->> 'linkkind'
                        WHEN 'trigger' THEN 'triggeredBy'
                        WHEN 'cause'   THEN 'causedBy'
                        WHEN 'effect'  THEN 'causedBy'
                        ELSE v_link ->> 'linkkind'
                    END,
                    'dependsOn'
                ) ;
            BEGIN
                CONTINUE WHEN v_tgt_id IS NULL ;

                INSERT INTO "cdviz"."graph_nodes" ("node_id", "node_type", "first_seen_at", "properties")
                VALUES (v_tgt_id, v_tgt_type, NEW.timestamp, '{}')
                ON CONFLICT ("node_id") DO UPDATE SET
                    node_type = CASE
                        WHEN "cdviz"."graph_nodes".node_type = 'unknown' THEN EXCLUDED.node_type
                        ELSE "cdviz"."graph_nodes".node_type
                    END ;

                INSERT INTO "cdviz"."graph_edges"
                    ("from_node_id", "to_node_id", "relation", "event_timestamp", "source_event_id")
                VALUES (v_src_id, v_tgt_id, v_lk, NEW.timestamp, NEW.context_id)
                ON CONFLICT ("from_node_id", "to_node_id", "relation") DO NOTHING ;
            END ;
        END LOOP ;
    END IF ;

    RETURN NEW ;
END ;
$$;

-- Attach the trigger to cdevents_lake.
-- AFTER INSERT: runs once the row is durably written; using AFTER avoids any risk of
-- accidentally mutating NEW. TimescaleDB fully supports AFTER INSERT row triggers on hypertables.
CREATE TRIGGER "trg_cdevents_lake_graph"
AFTER INSERT ON "cdviz"."cdevents_lake"
FOR EACH ROW
EXECUTE FUNCTION "cdviz"."fn_cdevents_lake_graph_upsert"();


-- ── Backfill: populate graph from existing cdevents_lake rows ────────────────
-- The trigger only fires on new INSERTs, so we replay existing data here.
-- Uses INSERT … SELECT (set-based) rather than a row cursor for performance.
-- All statements use ON CONFLICT … DO NOTHING so re-running is safe.
-- Order matters: nodes must exist before edges due to FK constraints.

-- Step 1: source nodes — earliest timestamp per entity + latest subject.content as properties.
-- Two CTEs avoid the PostgreSQL restriction on correlated subqueries referencing
-- ungrouped columns inside a GROUP BY query.
WITH
    first_seen AS (
        SELECT
            subject AS node_type,
            payload -> 'subject' ->> 'id' AS node_id,
            MIN("timestamp") AS first_seen_at
        FROM "cdviz"."cdevents_lake"
        WHERE payload -> 'subject' ->> 'id' IS NOT NULL
        GROUP BY payload -> 'subject' ->> 'id', subject
    ),

    latest_content AS (
        SELECT DISTINCT ON (payload -> 'subject' ->> 'id')
            payload -> 'subject' ->> 'id' AS node_id,
            COALESCE(payload -> 'subject' -> 'content', '{}'::JSONB) AS properties
        FROM "cdviz"."cdevents_lake"
        WHERE payload -> 'subject' ->> 'id' IS NOT NULL
        ORDER BY payload -> 'subject' ->> 'id', "timestamp" DESC
    )

INSERT INTO "cdviz"."graph_nodes" ("node_id", "node_type", "first_seen_at", "properties")
SELECT
    fs.node_id,
    fs.node_type,
    fs.first_seen_at,
    lc.properties
FROM first_seen AS fs
    INNER JOIN latest_content AS lc ON fs.node_id = lc.node_id
ON CONFLICT ("node_id") DO UPDATE SET
node_type = CASE
    WHEN "cdviz"."graph_nodes".node_type = 'unknown' THEN excluded.node_type
    ELSE "cdviz"."graph_nodes".node_type
END,
properties = excluded.properties;

-- Step 2: artifact base nodes (stripped pURLs that may not have their own events)
INSERT INTO "cdviz"."graph_nodes" ("node_id", "node_type", "first_seen_at", "properties")
SELECT
    DISTINCT
    regexp_replace (payload -> 'subject' ->> 'id', '[@?].*$', ''),
    'artifact',
    MIN (timestamp) OVER (PARTITION BY regexp_replace (payload -> 'subject' ->> 'id', '[@?].*$', '')),
    '{}'::JSONB
FROM "cdviz"."cdevents_lake"
WHERE
    subject = 'artifact'
    AND (
        payload -> 'subject' ->> 'id' LIKE 'pkg:%@%'
        OR payload -> 'subject' ->> 'id' LIKE 'pkg:%?%'
    )
ON CONFLICT ("node_id") DO NOTHING;

-- Step 3: environment nodes referenced in content (no dedicated CDEvents subject type)
INSERT INTO "cdviz"."graph_nodes" ("node_id", "node_type", "first_seen_at", "properties")
SELECT DISTINCT ON (payload -> 'subject' -> 'content' -> 'environment' ->> 'id')
    payload -> 'subject' -> 'content' -> 'environment' ->> 'id' AS node_id,
    'environment' AS node_type,
    timestamp,
    '{}'::JSONB AS properties
FROM "cdviz"."cdevents_lake"
WHERE payload -> 'subject' -> 'content' -> 'environment' ->> 'id' IS NOT NULL
ORDER BY payload -> 'subject' -> 'content' -> 'environment' ->> 'id', timestamp
ON CONFLICT ("node_id") DO NOTHING;

-- Step 4: artifact nodes referenced via content.artifactId (may not have own events yet)
INSERT INTO "cdviz"."graph_nodes" ("node_id", "node_type", "first_seen_at", "properties")
SELECT DISTINCT ON (payload -> 'subject' -> 'content' ->> 'artifactId')
    payload -> 'subject' -> 'content' ->> 'artifactId' AS node_id,
    'artifact' AS node_type,
    timestamp,
    '{}'::JSONB AS properties
FROM "cdviz"."cdevents_lake"
WHERE payload -> 'subject' -> 'content' ->> 'artifactId' IS NOT NULL
ON CONFLICT ("node_id") DO NOTHING;

-- Step 5: base nodes for referenced artifacts that carry qualifiers
INSERT INTO "cdviz"."graph_nodes" ("node_id", "node_type", "first_seen_at", "properties")
SELECT
    DISTINCT
    regexp_replace (payload -> 'subject' -> 'content' ->> 'artifactId', '[@?].*$', ''),
    'artifact',
    MIN (timestamp) OVER (PARTITION BY regexp_replace (payload -> 'subject' -> 'content' ->> 'artifactId', '[@?].*$', '')),
    '{}'::JSONB
FROM "cdviz"."cdevents_lake"
WHERE
    payload -> 'subject' -> 'content' ->> 'artifactId' LIKE 'pkg:%@%'
    OR payload -> 'subject' -> 'content' ->> 'artifactId' LIKE 'pkg:%?%'
ON CONFLICT ("node_id") DO NOTHING;

-- Step 6: pipelinerun nodes referenced by taskrun events
INSERT INTO "cdviz"."graph_nodes" ("node_id", "node_type", "first_seen_at", "properties")
SELECT DISTINCT ON (payload -> 'subject' -> 'content' -> 'pipelineRun' ->> 'id')
    payload -> 'subject' -> 'content' -> 'pipelineRun' ->> 'id' AS node_id,
    'pipelinerun' AS node_type,
    timestamp,
    '{}'::JSONB AS properties
FROM "cdviz"."cdevents_lake"
WHERE payload -> 'subject' -> 'content' -> 'pipelineRun' ->> 'id' IS NOT NULL
ON CONFLICT ("node_id") DO UPDATE SET
node_type = CASE
    WHEN "cdviz"."graph_nodes".node_type = 'unknown' THEN excluded.node_type
    ELSE "cdviz"."graph_nodes".node_type
END;

-- Step 7: testsuite/testsuiterun/testcase nodes referenced in content
INSERT INTO "cdviz"."graph_nodes" ("node_id", "node_type", "first_seen_at", "properties")
SELECT DISTINCT ON (id)
    id,
    node_type,
    ts,
    '{}'::JSONB AS properties
FROM (
    SELECT
        payload -> 'subject' -> 'content' -> 'testSuite' ->> 'id' AS id,
        'testsuite' AS node_type,
        timestamp AS ts
    FROM "cdviz"."cdevents_lake"
    WHERE payload -> 'subject' -> 'content' -> 'testSuite' ->> 'id' IS NOT NULL
    UNION ALL
    SELECT
        payload -> 'subject' -> 'content' -> 'testSuiteRun' ->> 'id' AS id,
        'testsuiterun' AS node_type,
        timestamp
    FROM "cdviz"."cdevents_lake"
    WHERE payload -> 'subject' -> 'content' -> 'testSuiteRun' ->> 'id' IS NOT NULL
    UNION ALL
    SELECT
        payload -> 'subject' -> 'content' -> 'testCase' ->> 'id' AS id,
        'testcase' AS node_type,
        timestamp
    FROM "cdviz"."cdevents_lake"
    WHERE payload -> 'subject' -> 'content' -> 'testCase' ->> 'id' IS NOT NULL
) AS refs
ORDER BY id, ts
ON CONFLICT ("node_id") DO UPDATE SET
node_type = CASE
    WHEN "cdviz"."graph_nodes".node_type = 'unknown' THEN excluded.node_type
    ELSE "cdviz"."graph_nodes".node_type
END;

-- Step 8: service nodes referenced by incident content
INSERT INTO "cdviz"."graph_nodes" ("node_id", "node_type", "first_seen_at", "properties")
SELECT DISTINCT ON (payload -> 'subject' -> 'content' -> 'service' ->> 'id')
    payload -> 'subject' -> 'content' -> 'service' ->> 'id' AS node_id,
    'service' AS node_type,
    timestamp,
    '{}'::JSONB AS properties
FROM "cdviz"."cdevents_lake"
WHERE payload -> 'subject' -> 'content' -> 'service' ->> 'id' IS NOT NULL
ON CONFLICT ("node_id") DO UPDATE SET
node_type = CASE
    WHEN "cdviz"."graph_nodes".node_type = 'unknown' THEN excluded.node_type
    ELSE "cdviz"."graph_nodes".node_type
END;

-- Step 9: nodes from customData.links targets
INSERT INTO "cdviz"."graph_nodes" ("node_id", "node_type", "first_seen_at", "properties")
SELECT DISTINCT ON (lnk.elem -> 'subject' ->> 'id')
    lnk.elem -> 'subject' ->> 'id' AS node_id,
    COALESCE(lnk.elem -> 'subject' ->> 'type', 'unknown') AS node_type,
    e.timestamp AS first_seen_at,
    '{}'::JSONB AS properties
FROM "cdviz"."cdevents_lake" AS e
    CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS(e.payload -> 'customData' -> 'links') AS lnk (elem)
WHERE
    JSONB_TYPEOF(e.payload -> 'customData' -> 'links') = 'array'
    AND lnk.elem -> 'subject' ->> 'id' IS NOT NULL
ORDER BY lnk.elem -> 'subject' ->> 'id', e.timestamp
ON CONFLICT ("node_id") DO UPDATE SET
node_type = CASE
    WHEN "cdviz"."graph_nodes".node_type = 'unknown' THEN excluded.node_type
    ELSE "cdviz"."graph_nodes".node_type
END;

-- Edges — all after nodes to satisfy FK constraints ---

-- Step 10: artifact derivedFrom base
INSERT INTO "cdviz"."graph_edges"
("from_node_id", "to_node_id", "relation", "event_timestamp", "source_event_id")
SELECT DISTINCT ON (payload -> 'subject' ->> 'id', REGEXP_REPLACE(payload -> 'subject' ->> 'id', '[@?].*$', ''))
    payload -> 'subject' ->> 'id' AS from_node_id,
    REGEXP_REPLACE(payload -> 'subject' ->> 'id', '[@?].*$', '') AS to_node_id,
    'derivedFrom' AS relation,
    timestamp,
    context_id
FROM "cdviz"."cdevents_lake"
WHERE
    subject = 'artifact'
    AND (
        payload -> 'subject' ->> 'id' LIKE 'pkg:%@%'
        OR payload -> 'subject' ->> 'id' LIKE 'pkg:%?%'
    )
ORDER BY payload -> 'subject' ->> 'id', REGEXP_REPLACE(payload -> 'subject' ->> 'id', '[@?].*$', ''), timestamp
ON CONFLICT ("from_node_id", "to_node_id", "relation") DO NOTHING;

-- Step 11: deployedWith / produced edges from content.artifactId
INSERT INTO "cdviz"."graph_edges"
("from_node_id", "to_node_id", "relation", "event_timestamp", "source_event_id")
SELECT DISTINCT ON (payload -> 'subject' ->> 'id', payload -> 'subject' -> 'content' ->> 'artifactId')
    payload -> 'subject' ->> 'id' AS from_node_id,
    payload -> 'subject' -> 'content' ->> 'artifactId' AS to_node_id,
    CASE subject WHEN 'build' THEN 'produced' ELSE 'deployedWith' END AS relation,
    timestamp,
    context_id
FROM "cdviz"."cdevents_lake"
WHERE
    payload -> 'subject' ->> 'id' IS NOT NULL
    AND payload -> 'subject' -> 'content' ->> 'artifactId' IS NOT NULL
ORDER BY payload -> 'subject' ->> 'id', payload -> 'subject' -> 'content' ->> 'artifactId', timestamp
ON CONFLICT ("from_node_id", "to_node_id", "relation") DO NOTHING;

-- Step 12: derivedFrom for referenced artifacts with qualifiers
INSERT INTO "cdviz"."graph_edges"
("from_node_id", "to_node_id", "relation", "event_timestamp", "source_event_id")
SELECT DISTINCT ON (payload -> 'subject' -> 'content' ->> 'artifactId', REGEXP_REPLACE(payload -> 'subject' -> 'content' ->> 'artifactId', '[@?].*$', ''))
    payload -> 'subject' -> 'content' ->> 'artifactId' AS from_node_id,
    REGEXP_REPLACE(payload -> 'subject' -> 'content' ->> 'artifactId', '[@?].*$', '') AS to_node_id,
    'derivedFrom' AS relation,
    timestamp,
    context_id
FROM "cdviz"."cdevents_lake"
WHERE
    payload -> 'subject' -> 'content' ->> 'artifactId' LIKE 'pkg:%@%'
    OR payload -> 'subject' -> 'content' ->> 'artifactId' LIKE 'pkg:%?%'
ORDER BY payload -> 'subject' -> 'content' ->> 'artifactId', REGEXP_REPLACE(payload -> 'subject' -> 'content' ->> 'artifactId', '[@?].*$', ''), timestamp
ON CONFLICT ("from_node_id", "to_node_id", "relation") DO NOTHING;

-- Step 13: environment edges (deployedTo or runsIn)
INSERT INTO "cdviz"."graph_edges"
("from_node_id", "to_node_id", "relation", "event_timestamp", "source_event_id")
SELECT DISTINCT ON (payload -> 'subject' ->> 'id', payload -> 'subject' -> 'content' -> 'environment' ->> 'id')
    payload -> 'subject' ->> 'id' AS from_node_id,
    payload -> 'subject' -> 'content' -> 'environment' ->> 'id' AS to_node_id,
    CASE WHEN subject IN ('testsuiterun', 'testcaserun') THEN 'runsIn' ELSE 'deployedTo' END AS relation,
    timestamp,
    context_id
FROM "cdviz"."cdevents_lake"
WHERE
    payload -> 'subject' ->> 'id' IS NOT NULL
    AND payload -> 'subject' -> 'content' -> 'environment' ->> 'id' IS NOT NULL
ORDER BY payload -> 'subject' ->> 'id', payload -> 'subject' -> 'content' -> 'environment' ->> 'id', timestamp
ON CONFLICT ("from_node_id", "to_node_id", "relation") DO NOTHING;

-- Step 14: partOf edges (taskrun→pipelinerun, testcaserun→testsuiterun)
INSERT INTO "cdviz"."graph_edges"
("from_node_id", "to_node_id", "relation", "event_timestamp", "source_event_id")
SELECT DISTINCT ON (from_id, to_id)
    from_id,
    to_id,
    'partOf' AS relation,
    ts,
    ctx
FROM (
    SELECT
        payload -> 'subject' ->> 'id' AS from_id,
        payload -> 'subject' -> 'content' -> 'pipelineRun' ->> 'id' AS to_id,
        timestamp AS ts,
        context_id AS ctx
    FROM "cdviz"."cdevents_lake"
    WHERE
        payload -> 'subject' ->> 'id' IS NOT NULL
        AND payload -> 'subject' -> 'content' -> 'pipelineRun' ->> 'id' IS NOT NULL
    UNION ALL
    SELECT
        payload -> 'subject' ->> 'id' AS from_id,
        payload -> 'subject' -> 'content' -> 'testSuiteRun' ->> 'id' AS to_id,
        timestamp,
        context_id
    FROM "cdviz"."cdevents_lake"
    WHERE
        payload -> 'subject' ->> 'id' IS NOT NULL
        AND payload -> 'subject' -> 'content' -> 'testSuiteRun' ->> 'id' IS NOT NULL
) AS runs
ORDER BY from_id, to_id, ts
ON CONFLICT ("from_node_id", "to_node_id", "relation") DO NOTHING;

-- Step 15: instanceOf edges (testcaserun→testcase, testsuiterun→testsuite)
INSERT INTO "cdviz"."graph_edges"
("from_node_id", "to_node_id", "relation", "event_timestamp", "source_event_id")
SELECT DISTINCT ON (from_id, to_id)
    from_id,
    to_id,
    'instanceOf' AS relation,
    ts,
    ctx
FROM (
    SELECT
        payload -> 'subject' ->> 'id' AS from_id,
        payload -> 'subject' -> 'content' -> 'testCase' ->> 'id' AS to_id,
        timestamp AS ts,
        context_id AS ctx
    FROM "cdviz"."cdevents_lake"
    WHERE
        payload -> 'subject' ->> 'id' IS NOT NULL
        AND payload -> 'subject' -> 'content' -> 'testCase' ->> 'id' IS NOT NULL
    UNION ALL
    SELECT
        payload -> 'subject' ->> 'id' AS from_id,
        payload -> 'subject' -> 'content' -> 'testSuite' ->> 'id' AS to_id,
        timestamp,
        context_id
    FROM "cdviz"."cdevents_lake"
    WHERE
        payload -> 'subject' ->> 'id' IS NOT NULL
        AND payload -> 'subject' -> 'content' -> 'testSuite' ->> 'id' IS NOT NULL
) AS defs
ORDER BY from_id, to_id, ts
ON CONFLICT ("from_node_id", "to_node_id", "relation") DO NOTHING;

-- Step 16: affects edges (incident→service)
INSERT INTO "cdviz"."graph_edges"
("from_node_id", "to_node_id", "relation", "event_timestamp", "source_event_id")
SELECT DISTINCT ON (payload -> 'subject' ->> 'id', payload -> 'subject' -> 'content' -> 'service' ->> 'id')
    payload -> 'subject' ->> 'id' AS from_node_id,
    payload -> 'subject' -> 'content' -> 'service' ->> 'id' AS to_node_id,
    'affects' AS relation,
    timestamp,
    context_id
FROM "cdviz"."cdevents_lake"
WHERE
    payload -> 'subject' ->> 'id' IS NOT NULL
    AND payload -> 'subject' -> 'content' -> 'service' ->> 'id' IS NOT NULL
ORDER BY payload -> 'subject' ->> 'id', payload -> 'subject' -> 'content' -> 'service' ->> 'id', timestamp
ON CONFLICT ("from_node_id", "to_node_id", "relation") DO NOTHING;

-- Step 17: customData.links edges with linkkind normalisation
-- CTE expands the links array and normalises legacy linkkind values in one pass;
-- the outer INSERT uses DISTINCT ON to keep only the first occurrence per edge.
WITH
    link_edges AS (
        SELECT
            e."timestamp" AS event_ts,
            e.context_id AS src_event_id,
            e.payload -> 'subject' ->> 'id' AS from_id,
            lnk.elem -> 'subject' ->> 'id' AS to_id,
            COALESCE(
                CASE lnk.elem ->> 'linkkind'
                    WHEN 'trigger' THEN 'triggeredBy'
                    WHEN 'cause' THEN 'causedBy'
                    WHEN 'effect' THEN 'causedBy'
                    ELSE lnk.elem ->> 'linkkind'
                END,
                'dependsOn'
            ) AS canonical_lk
        FROM "cdviz"."cdevents_lake" AS e
            CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS(e.payload -> 'customData' -> 'links') AS lnk (elem)
        WHERE
            JSONB_TYPEOF(e.payload -> 'customData' -> 'links') = 'array'
            AND e.payload -> 'subject' ->> 'id' IS NOT NULL
            AND lnk.elem -> 'subject' ->> 'id' IS NOT NULL
    )

INSERT INTO "cdviz"."graph_edges"
("from_node_id", "to_node_id", "relation", "event_timestamp", "source_event_id")
SELECT DISTINCT ON (from_id, to_id, canonical_lk)
    from_id,
    to_id,
    canonical_lk,
    event_ts,
    src_event_id
FROM link_edges
ORDER BY from_id, to_id, canonical_lk, event_ts
ON CONFLICT ("from_node_id", "to_node_id", "relation") DO NOTHING;


-- ── Traversal helper functions ───────────────────────────────────────────────
-- These wrap recursive CTEs so Grafana panels can call them directly with simple SQL.
-- Both functions return the starting node too (depth=0) for easy self-identification.
-- The path column enables cycle detection and makes the traversal route visible to callers.
--
-- graph_ancestors: walks edges forward (from→to), answering "what does this node depend on?"
--   e.g. graph_ancestors('svc://my-svc/prod') → artifact, environment, testsuite, …
--
-- graph_descendants: walks edges backward (to→from), answering "what depends on this node?"
--   e.g. graph_descendants('pkg:oci/app-d') → all tagged variants, all services running them

CREATE OR REPLACE FUNCTION "cdviz"."graph_ancestors"(
    p_node_id TEXT,
    p_max_depth INT DEFAULT 10
)
RETURNS TABLE (
    node_id TEXT,
    node_type TEXT,
    depth INT,
    path TEXT []
)
LANGUAGE sql
STABLE
AS $$
    WITH RECURSIVE ancestors AS (
        -- Base case: start at the requested node
        SELECT
            n.node_id,
            n.node_type,
            0                AS depth,
            ARRAY[n.node_id] AS path
        FROM "cdviz"."graph_nodes" AS n
        WHERE n.node_id = p_node_id

        UNION ALL

        -- Walk edges forward: from (consumer) → to (upstream dependency)
        SELECT
            n.node_id,
            n.node_type,
            a.depth + 1,
            a.path || n.node_id
        FROM ancestors AS a
        JOIN "cdviz"."graph_edges" AS e ON e.from_node_id = a.node_id
        JOIN "cdviz"."graph_nodes" AS n ON n.node_id = e.to_node_id
        WHERE
            a.depth < p_max_depth
            -- Cycle guard: stop if this node is already in the current path
            AND NOT (n.node_id = ANY(a.path))
    )
    SELECT node_id, node_type, depth, path
    FROM ancestors
    ORDER BY depth, node_id ;
$$;

COMMENT ON FUNCTION "cdviz"."graph_ancestors"(TEXT, INT) IS
'Walk edges forward (from→to) from p_node_id up to p_max_depth hops.
     Returns what this node depends on — artifact → environment, service → artifact, etc.
     Use: SELECT * FROM cdviz.graph_ancestors(''svc://my-svc/prod'', 5)';


CREATE OR REPLACE FUNCTION "cdviz"."graph_descendants"(
    p_node_id TEXT,
    p_max_depth INT DEFAULT 10
)
RETURNS TABLE (
    node_id TEXT,
    node_type TEXT,
    depth INT,
    path TEXT []
)
LANGUAGE sql
STABLE
AS $$
    WITH RECURSIVE descendants AS (
        -- Base case: start at the requested node
        SELECT
            n.node_id,
            n.node_type,
            0                AS depth,
            ARRAY[n.node_id] AS path
        FROM "cdviz"."graph_nodes" AS n
        WHERE n.node_id = p_node_id

        UNION ALL

        -- Walk edges backward: to (upstream) → from (downstream consumer)
        SELECT
            n.node_id,
            n.node_type,
            d.depth + 1,
            d.path || n.node_id
        FROM descendants AS d
        JOIN "cdviz"."graph_edges" AS e ON e.to_node_id = d.node_id
        JOIN "cdviz"."graph_nodes" AS n ON n.node_id = e.from_node_id
        WHERE
            d.depth < p_max_depth
            AND NOT (n.node_id = ANY(d.path))
    )
    SELECT node_id, node_type, depth, path
    FROM descendants
    ORDER BY depth, node_id ;
$$;

COMMENT ON FUNCTION "cdviz"."graph_descendants"(TEXT, INT) IS
'Walk edges backward (to→from) from p_node_id up to p_max_depth hops.
     Returns what depends on this node — base artifact → all tagged variants → all services running them.
     Use: SELECT * FROM cdviz.graph_descendants(''pkg:oci/app-d'', 3) WHERE node_type = ''service''';
