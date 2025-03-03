-- !! Hand written migration
-- see [Timescale Documentation | Getting Started](https://docs.timescale.com/getting-started/setup)
CREATE EXTENSION IF NOT EXISTS timescaledb;

SELECT create_hypertable('cdevents_lake', by_range('timestamp', INTERVAL '7 day'), if_not_exists => TRUE, migrate_data => TRUE);
SELECT add_dimension('cdevents_lake', by_hash('subject', 2));
-- atlas:nolint MF101
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
