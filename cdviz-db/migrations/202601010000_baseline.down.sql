-- Rollback CDviz Database Schema
-- This migration removes all CDviz database objects

-- Drop all views
DROP VIEW IF EXISTS "cdviz".testcasesuite CASCADE;
DROP VIEW IF EXISTS "cdviz".testcaserun CASCADE;
DROP VIEW IF EXISTS "cdviz".incident CASCADE;
DROP VIEW IF EXISTS "cdviz".service CASCADE;
DROP VIEW IF EXISTS "cdviz".artifact CASCADE;
DROP VIEW IF EXISTS "cdviz".build CASCADE;
DROP VIEW IF EXISTS "cdviz".taskrun CASCADE;
DROP VIEW IF EXISTS "cdviz".pipelinerun CASCADE;

-- Drop stored procedure
DROP PROCEDURE IF EXISTS "cdviz".store_cdevent(jsonb) CASCADE;

-- Drop main table (CASCADE will also drop hypertable metadata)
-- pgls-ignore lint/safety/banDropTable
DROP TABLE IF EXISTS "cdviz"."cdevents_lake" CASCADE;

-- Drop schema
DROP SCHEMA IF EXISTS "cdviz" CASCADE;
