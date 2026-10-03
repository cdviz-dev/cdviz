-- Drop the GIN index on the full cdevents_lake payload.
--
-- Measured on a production tenant (2026-10-03): 275MB (22% of the table) with 0 scans,
-- and ~90% of per-event insert cost. No shipped query (dashboards, Grafana, examples) uses a
-- GIN-able operator (@>, ?, ?|, ?&, @?, @@) on payload; dashboards read cdviz.executions.
-- Custom SQL that needs it can recreate a targeted index, e.g. on one jsonb path.
DROP INDEX IF EXISTS "cdviz"."idx_cdevents";
