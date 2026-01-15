# AGENTS.md - CDviz Database Component

AI agent instructions for the CDviz database component - PostgreSQL schema management with TimescaleDB and golang-migrate migrations.

## Component Overview

**Purpose**: Event storage database with schema management and time-series optimization\
**Technology**: PostgreSQL 16+ with TimescaleDB extension, golang-migrate for migrations\
**Data**: CDEvents stored in hypertable with automatic partitioning and retention\
**Access Pattern**: Direct database queries from Grafana dashboards (no API layer)

## Key Technologies

- **PostgreSQL**: Primary database with JSONB support for semi-structured CDEvents
- **TimescaleDB**: Time-series extension with hypertables, compression, retention policies
- **golang-migrate/migrate**: Simple and reliable database migration tool
- **sqruff**: SQL linter for code quality and consistency
- **Docker**: Container builds for database with extensions pre-installed

## Development Environment Setup

### Prerequisites

- Docker for container operations
- golang-migrate and sqruff CLI installed via `mise install`

### Quick Start

```bash
cd cdviz-db
mise install                    # Install golang-migrate and sqruff CLI
mise run db-local:start         # Start PostgreSQL container with schema applied
mise run db-local:psql          # Connect with psql client
```

### Essential Commands

```bash
# Migration Management
mise run migrate:create name    # Create a new migration file
mise run migrate:up             # Apply all pending migrations
mise run migrate:down           # Rollback the last migration
mise run migrate:version        # Show current migration version
mise run migrate:force VERSION  # Force set migration version (recovery)

# SQL Linting
mise run lint:sql               # Lint SQL files with sqruff
mise run format:sql             # Format SQL files with sqruff

# Database Operations
mise run db-local:start         # Start database with migrations applied
mise run db-local:start-empty   # Start empty database (no schema)
mise run db-local:stop          # Stop and remove database container
mise run db-local:psql          # Connect with psql

# Container Management
mise run publish                # Publish container images to registry

# Testing
mise run test                   # Test database startup and schema
mise run ci                     # Full CI pipeline (includes linting)
```

## Database Architecture

### Schema Structure

- **Primary Table**: `cdviz.cdevents_lake` - TimescaleDB hypertable for all CDEvents
- **Partitioning**: Time-based partitioning by 7-day intervals + hash partitioning by subject
- **Indexing**: Unique index on `context_id`, GIN index on JSONB payload
- **Retention**: Automatic deletion after 13 months via TimescaleDB policies

### Key Features

- **JSONB Storage**: Full CDEvents stored as JSON with extracted metadata columns
- **Time-Series Optimization**: TimescaleDB hypertables for efficient time-range queries
- **Event Deduplication**: Unique constraint on context_id prevents duplicates
- **Compression**: Automatic compression of older data (via TimescaleDB hypercore)

## Schema Management Workflow

### Critical Pattern: Migration-Based Approach

**NEVER** edit the database directly. All schema changes must go through migration files:

1. **Create Migration**: Run `mise run migrate:create descriptive_name` to create new migration files
   - Creates `YYYYMMDDHHMM_descriptive_name.up.sql` for applying changes (timestamp-based)
   - Creates `YYYYMMDDHHMM_descriptive_name.down.sql` for rollback
2. **Write SQL**: Edit the generated `.up.sql` file with your schema changes
   - Write pure SQL (CREATE, ALTER, DROP, etc.)
   - Keep migrations focused and atomic
   - Use TimescaleDB functions where needed
3. **Write Rollback**: Edit the `.down.sql` file with rollback logic
   - Should undo changes from the `.up.sql` file
   - Critical for safe rollbacks in production
4. **Lint SQL**: Run `mise run lint:sql` to check for SQL quality issues
   - Fixes formatting, capitalization, and style issues
   - Enforces PostgreSQL best practices
5. **Test Migration**: Run `mise run db-local:start` to apply and verify
   - Test both up and down migrations
   - Verify schema changes with `mise run db-local:psql`
6. **Commit**: Include both `.up.sql` and `.down.sql` files in git commit

### Migration Configuration

- **Migration Files**: Stored in `migrations/` directory with timestamp-based versioning
- **Naming Convention**: `YYYYMMDDHHMM_descriptive_name.{up,down}.sql` (e.g., `202601151045_add_column.up.sql`)
- **Version Tracking**: golang-migrate tracks applied migrations in `schema_migrations` table
- **Execution**: Migrations run in chronological order by timestamp

## Database Schema Details

### CDEvents Storage

```sql
-- Main event storage table
CREATE TABLE "cdviz"."cdevents_lake" (
  "imported_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
  "payload" JSONB NOT NULL,
  "subject" VARCHAR(100) NOT NULL,        -- Extracted from context.type
  "predicate" VARCHAR(100) NOT NULL,      -- Extracted from context.type
  "version" INTEGER[3],                   -- Semantic version array
  "context_id" VARCHAR(100) NOT NULL     -- Unique event identifier
);
```

### TimescaleDB Configuration

- **Hypertable**: Partitioned by timestamp (7-day chunks) + subject hash
- **Compression**: Older data automatically compressed
- **Retention**: Events older than 13 months automatically deleted
- **Indexing**: Optimized for time-range and event ID queries

## Development Patterns

### Schema Changes

1. Create migration: `mise run migrate:create add_column_name`
2. Write SQL in generated `.up.sql` file
3. Write rollback in generated `.down.sql` file
4. Lint SQL: `mise run lint:sql` to check quality
5. Test migration: `mise run db-local:start` to verify
6. Test rollback: `mise run migrate:down` then `migrate:up` again
7. Commit both migration files

### Local Development

- Use `mise run db-local:start` for development with full schema
- Use `mise run db-local:start-empty` for testing migrations from scratch
- Connect with `mise run db-local:psql` for manual queries
- Environment variables in `.mise.toml` configure connection details
- Check migration status: `mise run migrate:version`

### Container Management

- Base image: PostgreSQL 16 with TimescaleDB and timescaledb_toolkit extensions
- Migration image: Contains golang-migrate CLI and migration files for deployment
- Published to `ghcr.io/cdviz-dev/cdviz-db-migration`
- Run migrations in container: `docker run <image> -path /migrations -database <url> up`

## Common Tasks

### Adding New CDEvent Fields

1. Create migration: `mise run migrate:create add_new_field`
2. Write SQL to add columns or modify JSONB structure in `.up.sql`
3. Write rollback SQL in `.down.sql`
4. Lint: `mise run lint:sql`
5. Test migration: `mise run db-local:stop && mise run db-local:start`
6. Update Grafana queries that depend on schema changes

### Performance Optimization

1. Review query patterns in `examples/queries.sql`
2. Consider additional indexes for new query patterns
3. Test with representative data volumes
4. Monitor TimescaleDB compression and retention policies

### Debugging Database Issues

```bash
# Check container logs
docker logs cdviz-db

# Connect and inspect
mise run db-local:psql
\dt cdviz.*          # List tables
\d+ cdviz.cdevents_lake  # Describe main table
SELECT * FROM timescaledb_information.hypertables;  # Check hypertable status
```

## Integration Notes

### Grafana Dashboard Queries

- Dashboards query database directly (no API abstraction)
- Use TimescaleDB time-bucket functions for aggregations
- Leverage JSONB operators for event data extraction
- Consider query performance for time-range selections

### CDviz Collector Integration

- Collector inserts events via standard PostgreSQL connection
- JSONB payload contains full CDEvent with metadata extracted
- Unique constraint on context_id prevents duplicate events
- TimescaleDB automatically handles partitioning and performance

## Configuration Files

- **.sqruff**: SQL linting configuration (PostgreSQL dialect, strict rules)
- **migrations/\*.sql**: Migration files in golang-migrate format (up/down pairs)
- **docker-bake.hcl**: Docker build configuration for containers
- **Dockerfile**: Migration container with golang-migrate CLI
- **mise.toml**: Task definitions and environment configuration

## Troubleshooting

### Migration Issues

- Check migration version: `mise run migrate:version`
- Verify database connectivity: `mise run db-local:psql`
- Review migration SQL before applying
- Force version if stuck: `mise run migrate:force VERSION`
- Check golang-migrate logs for error details

### Container Issues

- Ensure Docker daemon is running
- Check port 5432 availability
- Review container logs with `docker logs cdviz-db`
- Verify TimescaleDB extensions are loaded

### Performance Issues

- Check hypertable partitioning: `SELECT * FROM timescaledb_information.chunks;`
- Monitor query performance with `EXPLAIN ANALYZE`
- Review TimescaleDB compression and retention policies
- Consider index optimization for common query patterns

## Resources

- **TimescaleDB Documentation**: [docs.timescale.com](https://docs.timescale.com)
- **golang-migrate Documentation**: [github.com/golang-migrate/migrate](https://github.com/golang-migrate/migrate)
- **sqruff Documentation**: [github.com/quarylabs/sqruff](https://github.com/quarylabs/sqruff)
- **PostgreSQL JSONB**: [PostgreSQL JSON docs](https://www.postgresql.org/docs/current/datatype-json.html)
- **CDEvents Specification**: [cdevents.dev](https://cdevents.dev)
