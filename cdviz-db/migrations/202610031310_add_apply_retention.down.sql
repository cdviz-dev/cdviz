-- Rollback: remove the retention procedure added in 202610031310_add_apply_retention.up.sql
DROP PROCEDURE IF EXISTS "cdviz"."apply_retention"(INTERVAL);
