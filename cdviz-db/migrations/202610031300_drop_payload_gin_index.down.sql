-- Rollback: restore the GIN index on cdevents_lake.payload (as created by the baseline).
CREATE INDEX IF NOT EXISTS "idx_cdevents" ON "cdviz"."cdevents_lake" USING GIN ("payload");
