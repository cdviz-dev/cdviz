CREATE EXTENSION IF NOT EXISTS timescaledb;
-- CREATE EXTENSION IF NOT EXISTS timescaledb_toolkit;

-- cdevents_lake
CREATE TABLE IF NOT EXISTS "cdevents_lake" (
  -- "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "imported_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
  "payload" JSONB NOT NULL,
  "subject" VARCHAR(100) NOT NULL,
  "predicate" VARCHAR(100) NOT NULL,
  "version" INTEGER[3],
  "context_id" VARCHAR(100) NOT NULL
);

COMMENT ON TABLE "cdevents_lake" IS 'table of stored cdevents without transformation';
COMMENT ON COLUMN "cdevents_lake"."imported_at" IS 'the timestamp when the cdevent was stored into the table';
COMMENT ON COLUMN "cdevents_lake"."timestamp" IS 'timestamp of cdevents extracted from context.timestamp in the json';
COMMENT ON COLUMN "cdevents_lake"."payload" IS 'the full cdevent in json format';
COMMENT ON COLUMN "cdevents_lake"."subject" IS 'subject extracted from context.type in the json (in lower case)';
COMMENT ON COLUMN "cdevents_lake"."predicate" IS 'predicate of the subject, extracted from context.type in the json (in lower case)';
COMMENT ON COLUMN "cdevents_lake"."version" IS 'the version of the suject s type, extracted from context.type. The version number are split in 0 for major, 1 for minor, 2 for patch';
COMMENT ON COLUMN "cdevents_lake"."context_id" IS 'the id of the event, extracted from context.id';

-- Use TimescaleDB to "boost" the performance of the queries instead of using indexes
-- CREATE INDEX IF NOT EXISTS "idx_timestamp" ON "cdevents_lake" USING BRIN("timestamp");
SELECT create_hypertable('cdevents_lake', by_range('timestamp', INTERVAL '7 day'), if_not_exists => TRUE, migrate_data => TRUE);
SELECT add_dimension('cdevents_lake', by_hash('subject', 2));
CREATE UNIQUE INDEX IF NOT EXISTS "idx_context_id" ON "cdevents_lake"("context_id", "subject", "timestamp" DESC);

-- see [Timescale Documentation | JSONB support for semi-structured data](https://docs.timescale.com/use-timescale/latest/schema-management/json/)
CREATE INDEX IF NOT EXISTS "idx_cdevents" ON "cdevents_lake" USING GIN("payload");

-- compress cdevents (after 15 days)
-- [Timescale Documentation | Compression](https://docs.timescale.com/use-timescale/latest/compression/)
ALTER TABLE "cdevents_lake" SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'subject'
);
SELECT add_compression_policy('cdevents_lake', INTERVAL '15 days');

-- remove cdevents older than 13 months
SELECT add_retention_policy('cdevents_lake', INTERVAL '13 months');

-- store_cdevent
create or replace procedure store_cdevent(
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
    insert into "cdevents_lake"("payload", "timestamp", "subject", "predicate", "version", "context_id") values(cdevent, ts, tpe_subject, tpe_predicate, tpe_version, context_id);
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
