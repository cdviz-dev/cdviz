-- !! Hand written migration

-- Set comment to column: "subject" on table: "cdevents_lake"
COMMENT ON COLUMN "cdevents_lake"."subject" IS 'subject extracted from context.type in the json (in lower case)';
-- Set comment to column: "predicate" on table: "cdevents_lake"
COMMENT ON COLUMN "cdevents_lake"."predicate" IS 'predicate of the subject, extracted from context.type in the json (in lower case)';

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
