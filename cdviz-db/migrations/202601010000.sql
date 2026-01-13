-- ALTER EXTENSION timescaledb UPDATE;
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
-- ALTER EXTENSION timescaledb_toolkit UPDATE;
-- CREATE EXTENSION IF NOT EXISTS timescaledb_toolkit CASCADE;

CREATE SCHEMA IF NOT EXISTS "cdviz";
-- SET search_path = "cdviz", "pg_catalog";

-- cdevents_lake
CREATE TABLE IF NOT EXISTS "cdviz"."cdevents_lake" (
  -- "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "imported_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
  "payload" JSONB NOT NULL,
  "subject" VARCHAR(100) NOT NULL,
  "predicate" VARCHAR(100) NOT NULL,
  "version" INTEGER[3],
  "context_id" VARCHAR(100) NOT NULL
);

COMMENT ON TABLE "cdviz"."cdevents_lake" IS 'table of stored cdevents without transformation';
COMMENT ON COLUMN "cdviz"."cdevents_lake"."imported_at" IS 'the timestamp when the cdevent was stored into the table';
COMMENT ON COLUMN "cdviz"."cdevents_lake"."timestamp" IS 'timestamp of cdevents extracted from context.timestamp in the json';
COMMENT ON COLUMN "cdviz"."cdevents_lake"."payload" IS 'the full cdevent in json format';
COMMENT ON COLUMN "cdviz"."cdevents_lake"."subject" IS 'subject extracted from context.type in the json (in lower case)';
COMMENT ON COLUMN "cdviz"."cdevents_lake"."predicate" IS 'predicate of the subject, extracted from context.type in the json (in lower case)';
COMMENT ON COLUMN "cdviz"."cdevents_lake"."version" IS 'the version of the suject s type, extracted from context.type. The version number are split in 0 for major, 1 for minor, 2 for patch';
COMMENT ON COLUMN "cdviz"."cdevents_lake"."context_id" IS 'the id of the event, extracted from context.id';

-- Use TimescaleDB to "boost" the performance of the queries instead of using indexes
-- CREATE INDEX IF NOT EXISTS "idx_timestamp" ON "cdevents_lake" USING BRIN("timestamp");
SELECT create_hypertable('cdviz.cdevents_lake', by_range('timestamp', INTERVAL '7 day'), if_not_exists => TRUE, migrate_data => TRUE);
SELECT add_dimension('cdviz.cdevents_lake', by_hash('subject', 2), if_not_exists => TRUE);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_context_id" ON "cdviz"."cdevents_lake"("context_id", "subject", "timestamp" DESC);

-- see [Timescale Documentation | JSONB support for semi-structured data](https://docs.timescale.com/use-timescale/latest/schema-management/json/)
CREATE INDEX IF NOT EXISTS "idx_cdevents" ON "cdviz"."cdevents_lake" USING GIN("payload");

-- Deprecated / Old api: since TimescaleDB 2.18 Replaced by hypercore.
-- compress cdevents (after 15 days)
-- [Timescale Documentation | Compression](https://docs.timescale.com/use-timescale/latest/compression/)
-- ALTER TABLE "cdviz"."cdevents_lake" SET (
--   timescaledb.compress,
--   timescaledb.compress_segmentby = 'subject'
-- );
-- SELECT add_compression_policy('cdviz.cdevents_lake', INTERVAL '15 days');

-- remove cdevents older than 13 months
-- Only available with timescale pro
-- SELECT add_retention_policy('cdviz.cdevents_lake', INTERVAL '13 months', if_not_exists => TRUE);

-- store_cdevent
create or replace procedure "cdviz".store_cdevent(
    cdevent jsonb
)
as $$
declare
    ts timestamp with time zone;
    tpe varchar(255);
    context_id varchar(100);
    tpe_subject varchar(100);
    tpe_predicate varchar(100);
    tpe_version INTEGER[3];
begin
    context_id := (cdevent -> 'context' ->> 'id');
    tpe := (cdevent -> 'context' ->> 'type');
    tpe_subject := LOWER(SPLIT_PART(tpe, '.', 3));
    tpe_predicate := LOWER(SPLIT_PART(tpe, '.', 4));
    tpe_version[0]:= SPLIT_PART(tpe, '.', 5)::INTEGER;
    tpe_version[1]:= SPLIT_PART(tpe, '.', 6)::INTEGER;
    tpe_version[2]:= SPLIT_PART(SPLIT_PART(tpe, '.', 7), '-', 1)::INTEGER;
    -- if (jsonb_typeof(cdevent -> 'context' ->> 'timestamp') = 'timestampz') then
        ts := (cdevent -> 'context' ->> 'timestamp')::timestamp with time zone;
    -- else
    --    raise exception 'Input Jsonb doesn not contain a valid timestamp';
    -- end if;
    insert into "cdviz"."cdevents_lake"("payload", "timestamp", "subject", "predicate", "version", "context_id") values(cdevent, ts, tpe_subject, tpe_predicate, tpe_version, context_id);
end;
$$ language plpgsql;

-- create a view based on fields in the json payload
-- source: [Postgresql json column to view - Database Administrators Stack Exchange](https://dba.stackexchange.com/questions/151838/postgresql-json-column-to-view?newreg=ed0a9389843a45699bfb02559dd32038)
-- DO $$
-- DECLARE l_keys text;
-- BEGIN
--   drop view if exists YOUR_VIEW_NAME cascade;

--   select string_agg(distinct format('jerrayel ->> %L as %I',jkey, jkey), ', ')
--       into l_keys
--   from cdevents_lake, jsonb_array_elements(payload) as t(jerrayel), jsonb_object_keys(t.jerrayel) as a(jkey);

--   execute 'create view cdevents_flatten as select '||l_keys||' from cdevents_lake, jsonb_array_elements(payload) as t(jerrayel)';
-- END$$;

-- pipelineRun An instance of a pipeline queued, started, finished
CREATE OR REPLACE VIEW "cdviz".pipelinerun AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    -- the last timestamp per predicate (usefull to compute current status/predicate, duration, etc.)
    MAX(CASE WHEN "predicate" = 'queued' THEN timestamp END) AS queued_at,
    MAX(CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
    -- the last payload, that could be used to extract complementary information
    LAST(payload, timestamp) AS last_payload,
    -- pre-extracted colums (often used)
    LAST(payload -> 'subject' -> 'content' ->> 'outcome', timestamp) FILTER(WHERE "predicate" = 'finished') AS outcome
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'pipelinerun'
GROUP BY
    subject_id
;

-- taskRun An instance of a task started, finished
CREATE OR REPLACE VIEW "cdviz".taskrun AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    -- the last timestamp per predicate (usefull to compute current status/predicate, duration, etc.)
    MAX(CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
    -- the last payload, that could be used to extract complementary information
    LAST(payload, timestamp) AS last_payload,
    -- pre-extracted colums (often used)
    LAST(payload -> 'subject' -> 'content' ->> 'outcome', timestamp) FILTER(WHERE "predicate" = 'finished') AS outcome
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'taskrun'
GROUP BY
    subject_id
;

-- build A software build queued, started, finished
CREATE OR REPLACE VIEW "cdviz".build AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    -- the last timestamp per predicate (usefull to compute current status/predicate, duration, etc.)
    MAX(CASE WHEN "predicate" = 'queued' THEN timestamp END) AS queued_at,
    MAX(CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
    -- the last payload, that could be used to extract complementary information
    LAST(payload, timestamp) AS last_payload
    -- pre-extracted colums (often used)
    -- ...
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'build'
GROUP BY
    subject_id
;

-- artifact An artifact produced by a build packaged, signed, published, downloaded, deleted
CREATE OR REPLACE VIEW "cdviz".artifact AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    -- the last timestamp per predicate (usefull to compute current status/predicate, duration, etc.)
    MAX(CASE WHEN "predicate" = 'packaged' THEN timestamp END) AS packaged_at,
    MAX(CASE WHEN "predicate" = 'signed' THEN timestamp END) AS signed_at,
    MAX(CASE WHEN "predicate" = 'published' THEN timestamp END) AS published_at,
    MAX(CASE WHEN "predicate" = 'downloaded' THEN timestamp END) AS downloaded_at,
    MAX(CASE WHEN "predicate" = 'deleted' THEN timestamp END) AS deleted_at,
    -- the last payload, that could be used to extract complementary information
    LAST(payload, timestamp) AS last_payload
    -- pre-extracted colums (often used)
    -- ...
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'artifact'
GROUP BY
    subject_id
;

-- service A service deployed, upgraded, rolledback, removed, published
CREATE OR REPLACE VIEW "cdviz".service AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    -- the last timestamp per predicate (usefull to compute current status/predicate, duration, etc.)
    MAX(CASE WHEN "predicate" = 'deployed' THEN timestamp END) AS deployed_at,
    MAX(CASE WHEN "predicate" = 'upgraded' THEN timestamp END) AS upgraded_at,
    MAX(CASE WHEN "predicate" = 'rolledback' THEN timestamp END) AS rolledback_at,
    MAX(CASE WHEN "predicate" = 'removed' THEN timestamp END) AS removed_at,
    MAX(CASE WHEN "predicate" = 'published' THEN timestamp END) AS published_at,
    -- the last payload, that could be used to extract complementary information
    LAST(payload, timestamp) AS last_payload
    -- pre-extracted colums (often used)
    -- ...
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'service'
GROUP BY
    subject_id
;

-- incident A problem in a production environment detected, reported, resolved
CREATE OR REPLACE VIEW "cdviz".incident AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    -- the last timestamp per predicate (usefull to compute current status/predicate, duration, etc.)
    MAX(CASE WHEN "predicate" = 'detected' THEN timestamp END) AS detected_at,
    MAX(CASE WHEN "predicate" = 'reported' THEN timestamp END) AS reported_at,
    MAX(CASE WHEN "predicate" = 'resolved' THEN timestamp END) AS resolved_at,
    -- the last payload, that could be used to extract complementary information
    LAST(payload, timestamp) AS last_payload
    -- pre-extracted colums (often used)
    -- ...
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'incident'
GROUP BY
    subject_id
;
-- testCaseRun The execution of a software testCase queued, started, finished, skipped
CREATE OR REPLACE VIEW "cdviz".testcaserun AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    -- the last timestamp per predicate (usefull to compute current status/predicate, duration, etc.)
    MAX(CASE WHEN "predicate" = 'queued' THEN timestamp END) AS queued_at,
    MAX(CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
    MAX(CASE WHEN "predicate" = 'skipped' THEN timestamp END) AS skipped_at,
    -- the last payload, that could be used to extract complementary information
    LAST(payload, timestamp) AS last_payload
    -- pre-extracted colums (often used)
    -- ...
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'testcaserun'
GROUP BY
    subject_id
;

-- testSuiteRun The execution of a software testSuite queued, started, finished
CREATE OR REPLACE VIEW "cdviz".testcasesuite AS
SELECT
    payload -> 'subject' ->> 'id' AS subject_id,
    -- the last timestamp per predicate (usefull to compute current status/predicate, duration, etc.)
    MAX(CASE WHEN "predicate" = 'queued' THEN timestamp END) AS queued_at,
    MAX(CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
    MAX(CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
    -- the last payload, that could be used to extract complementary information
    LAST(payload, timestamp) AS last_payload
    -- pre-extracted colums (often used)
    -- ...
FROM
    "cdviz".cdevents_lake
WHERE
    subject = 'testcasesuite'
GROUP BY
    subject_id
;
-- TODO view for testOutput An output artifact produced by a testCaseRun published when more than 1 predicate is defined
-- TODO view for ticket A ticket in a ticketing system created, updated, closed
-- TODO view for environment An environment where to run services created, modified, deleted
-- TODO view for repository A software configuration management (SCM)repository created, modified, deleted
-- TODO view for branch A branch in a software configuration management (SCM)repository created, deleted
-- TODO view for change A change proposed to the content of a repository created, reviewed, merged, abandoned, updated
