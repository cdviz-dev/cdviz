-- Narrow per-execution rollup of pipelinerun / taskrun / testcaserun / testsuiterun.
--
-- Why this exists:
--   The run views (cdviz.pipelinerun, cdviz.taskrun, …) GROUP BY subject_id over the whole
--   cdevents_lake, so a time filter on finished_at cannot be pushed down: every dashboard
--   query aggregates the full history and detoasts every payload (GitHub events embed the
--   whole webhook in customData, ~14KB each) just to read subject.id. Cost grows with the
--   tenant's age, not with the selected window.
--
--   This table holds one small row per execution, maintained incrementally by a trigger
--   (the payload is already in memory at insert time, so no detoast). Dashboards read it
--   through the (subject, finished_at) index.
--
--   Not a MATERIALIZED VIEW: REFRESH recomputes everything (same full scan) and needs a
--   scheduler that keeps the compute awake. Not a continuous aggregate: those bucket by
--   time, an execution spans buckets, and they're unavailable on Apache-licensed TimescaleDB.
--
-- Semantics mirror the views (202609152300_fix_view_first_timestamp):
--   queued_at / started_at = FIRST occurrence, finished_at = LAST occurrence,
--   outcome = from the latest `finished` event, name / url = from the latest event.
-- `name` is stored normalized (cdviz.normalize_run_name) so runs of the same definition share
-- one value; the raw name stays in cdevents_lake. If normalization rules change, a migration
-- must recompute it: UPDATE executions SET name = normalize_run_name(execution_name(l.subject, l.payload -> 'subject'))
-- FROM cdevents_lake l WHERE l.context_id = last_event_id AND …
-- The run views keep their columns but are rebuilt on top of this table (see the end of
-- this file); last_payload comes from a join on last_event_id (= context_id).
--
-- Rows are not removed by the cdevents_lake retention policy (rows are small).

CREATE TABLE IF NOT EXISTS "cdviz"."executions" (
    "subject" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "name" TEXT,
    "parent_id" TEXT,
    "queued_at" TIMESTAMP WITH TIME ZONE,
    "started_at" TIMESTAMP WITH TIME ZONE,
    "finished_at" TIMESTAMP WITH TIME ZONE,
    "skipped_at" TIMESTAMP WITH TIME ZONE,
    "outcome" TEXT,
    "url" TEXT,
    "last_event_id" TEXT NOT NULL,
    "last_event_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY ("subject", "subject_id")
);

CREATE INDEX IF NOT EXISTS "idx_executions_finished_at" ON "cdviz"."executions" ("subject", "finished_at" DESC);

COMMENT ON TABLE "cdviz"."executions" IS 'one row per pipelinerun/taskrun/testcaserun/testsuiterun, maintained from cdevents_lake by trigger trg_cdevents_lake_executions';
COMMENT ON COLUMN "cdviz"."executions"."subject" IS 'pipelinerun, taskrun, testcaserun or testsuiterun';
COMMENT ON COLUMN "cdviz"."executions"."name" IS 'normalized display name (cdviz.normalize_run_name of pipelineName, taskName, testCase.name, testSuite.name) from the latest event';
COMMENT ON COLUMN "cdviz"."executions"."parent_id" IS 'subject_id of the parent run: content.pipelineRun.id (taskrun) or content.testSuiteRun.id (testcaserun), same rule as the graph partOf edge';
COMMENT ON COLUMN "cdviz"."executions"."outcome" IS 'subject.content.outcome of the latest finished event';
COMMENT ON COLUMN "cdviz"."executions"."url" IS 'subject.content.uri (or url) of the latest event';
COMMENT ON COLUMN "cdviz"."executions"."last_event_id" IS 'context_id of the latest event (join cdevents_lake for the full payload)';

-- Raw display name of an execution, per subject. Shared by the trigger and the backfill, which
-- both store cdviz.normalize_run_name(execution_name(...)).
-- Takes payload -> 'subject' (not the whole payload) so the backfill can detoast each payload once.
CREATE OR REPLACE FUNCTION "cdviz"."execution_name"(subject_type TEXT, subject JSONB) RETURNS TEXT
LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
    SELECT CASE subject_type
        WHEN 'pipelinerun' THEN subject -> 'content' ->> 'pipelineName'
        WHEN 'taskrun' THEN subject -> 'content' ->> 'taskName'
        WHEN 'testcaserun' THEN COALESCE(subject -> 'content' -> 'testCase' ->> 'name', subject ->> 'id')
        WHEN 'testsuiterun' THEN COALESCE(subject -> 'content' -> 'testSuite' ->> 'name', subject ->> 'id')
    END
$$;

CREATE OR REPLACE FUNCTION "cdviz"."fn_cdevents_lake_executions_upsert"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.payload -> 'subject' ->> 'id' IS NULL THEN
        RETURN NEW;
    END IF;

    INSERT INTO "cdviz"."executions" AS e (
        "subject", "subject_id", "name", "parent_id", "queued_at", "started_at", "finished_at",
        "skipped_at", "outcome", "url", "last_event_id", "last_event_at"
    ) VALUES (
        NEW.subject,
        NEW.payload -> 'subject' ->> 'id',
        "cdviz".normalize_run_name("cdviz".execution_name(NEW.subject, NEW.payload -> 'subject')),
        COALESCE(
            NEW.payload -> 'subject' -> 'content' -> 'pipelineRun' ->> 'id',
            NEW.payload -> 'subject' -> 'content' -> 'testSuiteRun' ->> 'id'
        ),
        CASE WHEN NEW.predicate = 'queued' THEN NEW.timestamp END,
        CASE WHEN NEW.predicate = 'started' THEN NEW.timestamp END,
        CASE WHEN NEW.predicate = 'finished' THEN NEW.timestamp END,
        CASE WHEN NEW.predicate = 'skipped' THEN NEW.timestamp END,
        CASE WHEN NEW.predicate = 'finished' THEN NEW.payload -> 'subject' -> 'content' ->> 'outcome' END,
        COALESCE(NEW.payload -> 'subject' -> 'content' ->> 'uri', NEW.payload -> 'subject' -> 'content' ->> 'url'),
        NEW.context_id,
        NEW.timestamp
    )
    ON CONFLICT ("subject", "subject_id") DO UPDATE SET
        -- LEAST/GREATEST ignore NULLs: first start, last finish, whatever the arrival order.
        "queued_at" = LEAST(e.queued_at, EXCLUDED.queued_at),
        "started_at" = LEAST(e.started_at, EXCLUDED.started_at),
        "finished_at" = GREATEST(e.finished_at, EXCLUDED.finished_at),
        "skipped_at" = GREATEST(e.skipped_at, EXCLUDED.skipped_at),
        "outcome" = CASE
            WHEN EXCLUDED.finished_at >= COALESCE(e.finished_at, '-infinity') THEN EXCLUDED.outcome
            ELSE e.outcome
        END,
        "parent_id" = COALESCE(EXCLUDED.parent_id, e.parent_id),
        -- latest event wins, but never erase a known value with an event that lacks it
        "name" = CASE
            WHEN EXCLUDED.last_event_at >= e.last_event_at THEN COALESCE(EXCLUDED.name, e.name)
            ELSE COALESCE(e.name, EXCLUDED.name)
        END,
        "url" = CASE
            WHEN EXCLUDED.last_event_at >= e.last_event_at THEN COALESCE(EXCLUDED.url, e.url)
            ELSE COALESCE(e.url, EXCLUDED.url)
        END,
        "last_event_id" = CASE
            WHEN EXCLUDED.last_event_at >= e.last_event_at THEN EXCLUDED.last_event_id
            ELSE e.last_event_id
        END,
        "last_event_at" = GREATEST(e.last_event_at, EXCLUDED.last_event_at);

    RETURN NEW;
END;
$$;

-- Block concurrent inserts until commit: events stored between the backfill snapshot and
-- the trigger becoming visible would otherwise be missed by both.
LOCK TABLE "cdviz"."cdevents_lake" IN SHARE MODE;

CREATE OR REPLACE TRIGGER "trg_cdevents_lake_executions"
AFTER INSERT ON "cdviz"."cdevents_lake"
FOR EACH ROW
WHEN (new.subject IN ('pipelinerun', 'taskrun', 'testcaserun', 'testsuiterun'))
EXECUTE FUNCTION "cdviz"."fn_cdevents_lake_executions_upsert"();

-- ── Backfill from existing events (set-based, same semantics as the trigger) ──
-- The MATERIALIZED CTE detoasts each (large) payload once and keeps only the small subject
-- object; without it every `payload -> ...` below would decompress the payload again.
SET work_mem = '64MB'; -- keep the per-execution aggregate in memory (session-scoped)

INSERT INTO "cdviz"."executions" (
    "subject", "subject_id", "name", "parent_id", "queued_at", "started_at", "finished_at",
    "skipped_at", "outcome", "url", "last_event_id", "last_event_at"
)
WITH
    ev AS MATERIALIZED (
        SELECT
            subject,
            predicate,
            "timestamp" AS ts,
            context_id,
            payload -> 'subject' AS subj
        FROM "cdviz"."cdevents_lake"
        WHERE subject IN ('pipelinerun', 'taskrun', 'testcaserun', 'testsuiterun')
    )

SELECT
    subject,
    subj ->> 'id' AS subject_id,
    -- normalize once per execution, not per event
    "cdviz".normalize_run_name(LAST("cdviz".execution_name(subject, subj), ts)) AS "name",
    MAX(COALESCE(
        subj -> 'content' -> 'pipelineRun' ->> 'id',
        subj -> 'content' -> 'testSuiteRun' ->> 'id'
    )) AS parent_id,
    MIN(CASE WHEN predicate = 'queued' THEN ts END) AS queued_at,
    MIN(CASE WHEN predicate = 'started' THEN ts END) AS started_at,
    MAX(CASE WHEN predicate = 'finished' THEN ts END) AS finished_at,
    MAX(CASE WHEN predicate = 'skipped' THEN ts END) AS skipped_at,
    LAST(subj -> 'content' ->> 'outcome', ts) FILTER (WHERE predicate = 'finished') AS outcome,
    LAST(COALESCE(subj -> 'content' ->> 'uri', subj -> 'content' ->> 'url'), ts) AS url,
    LAST(context_id, ts) AS last_event_id,
    MAX(ts) AS last_event_at
FROM ev
WHERE subj ->> 'id' IS NOT NULL
GROUP BY subject, subj ->> 'id'
ON CONFLICT ("subject", "subject_id") DO NOTHING;

RESET work_mem;

-- ── Rebuild the run views on top of executions ───────────────────────────────
-- Same columns, order and semantics as 202609152300_fix_view_first_timestamp, but a time
-- filter now hits idx_executions_finished_at, and only the latest event's payload is read.
-- LEFT JOIN on the unique idx_context_id key lets the planner drop the join entirely when
-- last_payload is not selected. If retention deletes a run's latest event, the run stays
-- listed with a NULL last_payload.

CREATE OR REPLACE VIEW "cdviz".pipelinerun AS
SELECT
    e.subject_id,
    e.queued_at,
    e.started_at,
    e.finished_at,
    l.payload AS last_payload,
    e.outcome
FROM "cdviz".executions AS e
    LEFT JOIN "cdviz".cdevents_lake AS l
        ON e.last_event_id = l.context_id AND e.subject = l.subject AND e.last_event_at = l.timestamp
WHERE e.subject = 'pipelinerun';

CREATE OR REPLACE VIEW "cdviz".taskrun AS
SELECT
    e.subject_id,
    e.started_at,
    e.finished_at,
    l.payload AS last_payload,
    e.outcome
FROM "cdviz".executions AS e
    LEFT JOIN "cdviz".cdevents_lake AS l
        ON e.last_event_id = l.context_id AND e.subject = l.subject AND e.last_event_at = l.timestamp
WHERE e.subject = 'taskrun';

CREATE OR REPLACE VIEW "cdviz".testcaserun AS
SELECT
    e.subject_id,
    e.queued_at,
    e.started_at,
    e.finished_at,
    e.skipped_at,
    l.payload AS last_payload
FROM "cdviz".executions AS e
    LEFT JOIN "cdviz".cdevents_lake AS l
        ON e.last_event_id = l.context_id AND e.subject = l.subject AND e.last_event_at = l.timestamp
WHERE e.subject = 'testcaserun';

CREATE OR REPLACE VIEW "cdviz".testsuiterun AS
SELECT
    e.subject_id,
    e.queued_at,
    e.started_at,
    e.finished_at,
    l.payload AS last_payload
FROM "cdviz".executions AS e
    LEFT JOIN "cdviz".cdevents_lake AS l
        ON e.last_event_id = l.context_id AND e.subject = l.subject AND e.last_event_at = l.timestamp
WHERE e.subject = 'testsuiterun';
