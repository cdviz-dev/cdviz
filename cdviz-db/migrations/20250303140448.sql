-- Drop index "cdevents_lake_context_id_key" from table: "cdevents_lake"
DROP INDEX "cdevents_lake_context_id_key";
-- Drop index "idx_subject" from table: "cdevents_lake"
DROP INDEX "idx_subject";
-- Drop index "idx_timestamp" from table: "cdevents_lake"
DROP INDEX "idx_timestamp";
-- Modify "cdevents_lake" table
-- atlas:nolint DS103
ALTER TABLE "cdevents_lake" DROP CONSTRAINT "cdevents_lake_pkey", DROP COLUMN "id";
