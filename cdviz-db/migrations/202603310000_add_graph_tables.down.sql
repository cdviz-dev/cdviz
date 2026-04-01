-- Rollback: remove the graph layer added in 202603310000_add_graph_tables.up.sql
--
-- Drop order matters:
--   1. Trigger first — PostgreSQL refuses to drop a function still referenced by a trigger
--   2. Functions next
--   3. Tables last — CASCADE handles any dependent views added by later migrations
--      (graph_edges before graph_nodes due to the FK from edges → nodes)

DROP TRIGGER IF EXISTS "trg_cdevents_lake_graph" ON "cdviz"."cdevents_lake";

DROP FUNCTION IF EXISTS "cdviz"."fn_cdevents_lake_graph_upsert"();

DROP FUNCTION IF EXISTS "cdviz"."graph_descendants"(TEXT, INT);

DROP FUNCTION IF EXISTS "cdviz"."graph_ancestors"(TEXT, INT);

DROP TABLE IF EXISTS "cdviz"."graph_edges" CASCADE;

DROP TABLE IF EXISTS "cdviz"."graph_nodes" CASCADE;
