-- Rollback: remove the executions rollup added in 202610031200_add_executions_table.up.sql
-- Views first: they depend on executions. Restored as defined in 202609152300_fix_view_first_timestamp.
-- Then trigger: PostgreSQL refuses to drop a function still referenced by a trigger.

CREATE OR REPLACE VIEW "cdviz".pipelinerun AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MIN(CASE WHEN "predicate" = 'queued' THEN timestamp END) AS queued_at,
    MIN(CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
    LAST(payload, timestamp) AS last_payload,
    LAST(payload -> 'subject' -> 'content' ->> 'outcome', timestamp) FILTER (WHERE "predicate" = 'finished') AS outcome
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'pipelinerun'
GROUP BY
    subject_id;

CREATE OR REPLACE VIEW "cdviz".taskrun AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MIN(CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
    LAST(payload, timestamp) AS last_payload,
    LAST(payload -> 'subject' -> 'content' ->> 'outcome', timestamp) FILTER (WHERE "predicate" = 'finished') AS outcome
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'taskrun'
GROUP BY
    subject_id;

CREATE OR REPLACE VIEW "cdviz".testcaserun AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MIN(CASE WHEN "predicate" = 'queued' THEN timestamp END) AS queued_at,
    MIN(CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
    MAX(CASE WHEN "predicate" = 'skipped' THEN timestamp END) AS skipped_at,
    LAST(payload, timestamp) AS last_payload
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'testcaserun'
GROUP BY
    subject_id;

CREATE OR REPLACE VIEW "cdviz".testsuiterun AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    MIN(CASE WHEN "predicate" = 'queued' THEN timestamp END) AS queued_at,
    MIN(CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
    LAST(payload, timestamp) AS last_payload
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'testsuiterun'
GROUP BY
    subject_id;

DROP TRIGGER IF EXISTS "trg_cdevents_lake_executions" ON "cdviz"."cdevents_lake";

DROP FUNCTION IF EXISTS "cdviz"."fn_cdevents_lake_executions_upsert"();

DROP FUNCTION IF EXISTS "cdviz"."execution_name"(TEXT, JSONB);

DROP TABLE IF EXISTS "cdviz"."executions";
