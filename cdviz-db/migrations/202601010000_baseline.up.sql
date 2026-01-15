-- CDviz Database Schema Baseline Migration
-- This migration creates the complete initial schema for CDviz event storage

-- Enable TimescaleDB extension for time-series optimization
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE ;

-- Create CDviz schema
CREATE SCHEMA IF NOT EXISTS "cdviz" ;

-- Main CDEvents storage table
CREATE TABLE IF NOT EXISTS "cdviz"."cdevents_lake" (
"imported_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
"timestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
"payload" JSONB NOT NULL,
"subject" TEXT NOT NULL,
"predicate" TEXT NOT NULL,
"version" INTEGER [3],
"context_id" TEXT NOT NULL
) ;

-- Table and column comments for documentation
COMMENT ON TABLE "cdviz"."cdevents_lake" IS 'table of stored cdevents without transformation' ;
COMMENT ON COLUMN "cdviz"."cdevents_lake"."imported_at" IS 'the timestamp when the cdevent was stored into the table' ;
COMMENT ON COLUMN "cdviz"."cdevents_lake"."timestamp" IS 'timestamp of cdevents extracted from context.timestamp in the json' ;
COMMENT ON COLUMN "cdviz"."cdevents_lake"."payload" IS 'the full cdevent in json format' ;
COMMENT ON COLUMN "cdviz"."cdevents_lake"."subject" IS 'subject extracted from context.type in the json (in lower case)' ;
COMMENT ON COLUMN "cdviz"."cdevents_lake"."predicate" IS 'predicate of the subject, extracted from context.type in the json (in lower case)' ;
COMMENT ON COLUMN "cdviz"."cdevents_lake"."version" IS 'the version of the suject s type, extracted from context.type. The version number are split in 0 for major, 1 for minor, 2 for patch' ;
COMMENT ON COLUMN "cdviz"."cdevents_lake"."context_id" IS 'the id of the event, extracted from context.id' ;

-- Convert table to TimescaleDB hypertable for time-series optimization
SELECT create_hypertable ('cdviz.cdevents_lake', by_range ('timestamp', INTERVAL '7 day'), if_not_exists => TRUE, migrate_data => TRUE) ;
SELECT add_dimension ('cdviz.cdevents_lake', by_hash ('subject', 2), if_not_exists => TRUE) ;

-- Create indexes for efficient querying
CREATE UNIQUE INDEX IF NOT EXISTS "idx_context_id" ON "cdviz"."cdevents_lake" ("context_id", "subject", "timestamp" DESC) ;
CREATE INDEX IF NOT EXISTS "idx_cdevents" ON "cdviz"."cdevents_lake" USING GIN ("payload") ;

-- Stored procedure to insert CDEvents with metadata extraction
CREATE OR REPLACE PROCEDURE "cdviz".store_cdevent (
cdevent jsonb
)
AS $$
DECLARE
    ts timestamp with time zone;
    tpe varchar(255);
    context_id varchar(100);
    tpe_subject varchar(100);
    tpe_predicate varchar(100);
    tpe_version INTEGER[3];
BEGIN
    context_id := (cdevent -> 'context' ->> 'id');
    tpe := (cdevent -> 'context' ->> 'type');
    tpe_subject := LOWER(SPLIT_PART(tpe, '.', 3));
    tpe_predicate := LOWER(SPLIT_PART(tpe, '.', 4));
    tpe_version[0]:= SPLIT_PART(tpe, '.', 5)::INTEGER;
    tpe_version[1]:= SPLIT_PART(tpe, '.', 6)::INTEGER;
    tpe_version[2]:= SPLIT_PART(SPLIT_PART(tpe, '.', 7), '-', 1)::INTEGER;
    ts := (cdevent -> 'context' ->> 'timestamp')::timestamp with time zone;
    INSERT INTO "cdviz"."cdevents_lake"("payload", "timestamp", "subject", "predicate", "version", "context_id")
    VALUES(cdevent, ts, tpe_subject, tpe_predicate, tpe_version, context_id);
END;
$$ LANGUAGE plpgsql ;

-- Views for aggregating events by subject type

-- pipelineRun: An instance of a pipeline queued, started, finished
CREATE OR REPLACE VIEW "cdviz".pipelinerun AS
SELECT
payload -> 'subject' ->> 'id' AS subject_id,
MAX (CASE WHEN "predicate" = 'queued' THEN timestamp END) AS queued_at,
MAX (CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
MAX (CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
LAST (payload, timestamp) AS last_payload,
LAST (payload -> 'subject' -> 'content' ->> 'outcome', timestamp) FILTER (WHERE "predicate" = 'finished') AS outcome
FROM
"cdviz".cdevents_lake
WHERE
subject = 'pipelinerun'
GROUP BY
subject_id ;

-- taskRun: An instance of a task started, finished
CREATE OR REPLACE VIEW "cdviz".taskrun AS
SELECT
payload -> 'subject' ->> 'id' AS subject_id,
MAX (CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
MAX (CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
LAST (payload, timestamp) AS last_payload,
LAST (payload -> 'subject' -> 'content' ->> 'outcome', timestamp) FILTER (WHERE "predicate" = 'finished') AS outcome
FROM
"cdviz".cdevents_lake
WHERE
subject = 'taskrun'
GROUP BY
subject_id ;

-- build: A software build queued, started, finished
CREATE OR REPLACE VIEW "cdviz".build AS
SELECT
payload -> 'subject' ->> 'id' AS subject_id,
MAX (CASE WHEN "predicate" = 'queued' THEN timestamp END) AS queued_at,
MAX (CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
MAX (CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
LAST (payload, timestamp) AS last_payload
FROM
"cdviz".cdevents_lake
WHERE
subject = 'build'
GROUP BY
subject_id ;

-- artifact: An artifact produced by a build packaged, signed, published, downloaded, deleted
CREATE OR REPLACE VIEW "cdviz".artifact AS
SELECT
payload -> 'subject' ->> 'id' AS subject_id,
MAX (CASE WHEN "predicate" = 'packaged' THEN timestamp END) AS packaged_at,
MAX (CASE WHEN "predicate" = 'signed' THEN timestamp END) AS signed_at,
MAX (CASE WHEN "predicate" = 'published' THEN timestamp END) AS published_at,
MAX (CASE WHEN "predicate" = 'downloaded' THEN timestamp END) AS downloaded_at,
MAX (CASE WHEN "predicate" = 'deleted' THEN timestamp END) AS deleted_at,
LAST (payload, timestamp) AS last_payload
FROM
"cdviz".cdevents_lake
WHERE
subject = 'artifact'
GROUP BY
subject_id ;

-- service: A service deployed, upgraded, rolledback, removed, published
CREATE OR REPLACE VIEW "cdviz".service AS
SELECT
payload -> 'subject' ->> 'id' AS subject_id,
MAX (CASE WHEN "predicate" = 'deployed' THEN timestamp END) AS deployed_at,
MAX (CASE WHEN "predicate" = 'upgraded' THEN timestamp END) AS upgraded_at,
MAX (CASE WHEN "predicate" = 'rolledback' THEN timestamp END) AS rolledback_at,
MAX (CASE WHEN "predicate" = 'removed' THEN timestamp END) AS removed_at,
MAX (CASE WHEN "predicate" = 'published' THEN timestamp END) AS published_at,
LAST (payload, timestamp) AS last_payload
FROM
"cdviz".cdevents_lake
WHERE
subject = 'service'
GROUP BY
subject_id ;

-- incident: A problem in a production environment detected, reported, resolved
CREATE OR REPLACE VIEW "cdviz".incident AS
SELECT
payload -> 'subject' ->> 'id' AS subject_id,
MAX (CASE WHEN "predicate" = 'detected' THEN timestamp END) AS detected_at,
MAX (CASE WHEN "predicate" = 'reported' THEN timestamp END) AS reported_at,
MAX (CASE WHEN "predicate" = 'resolved' THEN timestamp END) AS resolved_at,
LAST (payload, timestamp) AS last_payload
FROM
"cdviz".cdevents_lake
WHERE
subject = 'incident'
GROUP BY
subject_id ;

-- testCaseRun: The execution of a software testCase queued, started, finished, skipped
CREATE OR REPLACE VIEW "cdviz".testcaserun AS
SELECT
payload -> 'subject' ->> 'id' AS subject_id,
MAX (CASE WHEN "predicate" = 'queued' THEN timestamp END) AS queued_at,
MAX (CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
MAX (CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
MAX (CASE WHEN "predicate" = 'skipped' THEN timestamp END) AS skipped_at,
LAST (payload, timestamp) AS last_payload
FROM
"cdviz".cdevents_lake
WHERE
subject = 'testcaserun'
GROUP BY
subject_id ;

-- testSuiteRun: The execution of a software testSuite queued, started, finished
CREATE OR REPLACE VIEW "cdviz".testcasesuite AS
SELECT
payload -> 'subject' ->> 'id' AS subject_id,
MAX (CASE WHEN "predicate" = 'queued' THEN timestamp END) AS queued_at,
MAX (CASE WHEN "predicate" = 'started' THEN timestamp END) AS started_at,
MAX (CASE WHEN "predicate" = 'finished' THEN timestamp END) AS finished_at,
LAST (payload, timestamp) AS last_payload
FROM
"cdviz".cdevents_lake
WHERE
subject = 'testcasesuite'
GROUP BY
subject_id ;
