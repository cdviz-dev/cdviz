-- Retention for cdevents_lake and its derived executions table.
--
-- TimescaleDB retention *policies* (add_retention_policy) need the Community license, which
-- Apache-only deployments (e.g. Neon) lack; drop_chunks itself is Apache. So retention is a
-- plain procedure, scheduled externally (the SaaS operator runs it from a per-tenant CronJob):
--   CALL cdviz.apply_retention(INTERVAL '93 days');
--
-- drop_chunks only drops whole chunks (7-day interval), so events are kept between `keep` and
-- `keep` + 7 days. Executions are trimmed on the exact cutoff of their latest event; graph
-- tables are not touched (nodes are long-lived entities, not time series).
CREATE OR REPLACE PROCEDURE "cdviz"."apply_retention"(keep INTERVAL)
LANGUAGE plpgsql
AS $$
DECLARE
    cutoff TIMESTAMP WITH TIME ZONE := now() - keep;
BEGIN
    PERFORM drop_chunks('cdviz.cdevents_lake', older_than => cutoff);
    DELETE FROM "cdviz"."executions" WHERE last_event_at < cutoff;
END;
$$;

COMMENT ON PROCEDURE "cdviz"."apply_retention" (INTERVAL) IS 'drop cdevents_lake chunks and executions older than `keep`; schedule it externally (no TimescaleDB policy on Apache license)';
