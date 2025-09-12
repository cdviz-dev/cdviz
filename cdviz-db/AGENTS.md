# AGENTS.md - CDviz Database Component

AI agent instructions for the CDviz database component - PostgreSQL schema management with TimescaleDB and Atlas migrations.

## Component Overview

**Purpose**: Event storage database with schema management and time-series optimization\
**Technology**: PostgreSQL 16+ with TimescaleDB extension, Atlas for migrations\
**Data**: CDEvents stored in hypertable with automatic partitioning and retention\
**Access Pattern**: Direct database queries from Grafana dashboards (no API layer)

## Key Technologies

- **PostgreSQL**: Primary database with JSONB support for semi-structured CDEvents
- **TimescaleDB**: Time-series extension with hypertables, compression, retention policies
- **Atlas**: Schema migration management and versioning
- **Docker**: Container builds for database with extensions pre-installed

## Development Environment Setup

### Prerequisites

- Docker for container operations
- Atlas CLI installed via `mise install`

### Quick Start

```bash
cd cdviz-db
mise install                    # Install Atlas CLI
mise run db-local:start         # Start PostgreSQL container with schema applied
mise run db-local:psql          # Connect with psql client
```

### Essential Commands

```bash
# Schema Management
mise run plan                   # Generate migration for schema changes
mise run apply                  # Apply migrations to local database

# Database Operations
mise run db-local:start         # Start database with migrations applied
mise run db-local:start-empty   # Start empty database (no schema)
mise run db-local:stop          # Stop and remove database container
mise run db-local:psql          # Connect with psql

# Container Management
mise run build:cdviz-db-pg      # Build PostgreSQL image with extensions
mise run publish                # Publish container images to registry

# Testing
mise run test                   # Test database startup and schema
mise run ci                     # Full CI pipeline
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

### Critical Pattern: Atlas-First Approach

**NEVER** edit the database directly. All schema changes must go through Atlas migrations:

1. **Edit Schema**: Modify `src/schema.sql` with desired changes
2. **Generate Migration**: Run `mise run plan` to create Atlas migration files
3. **Review Migration**: Check generated files in `migrations/` directory
4. **Test Migration**: Run `mise run apply` to test on local database
5. **Commit**: Include both schema and migration files in git commit

### Atlas Configuration

- **Config**: `atlas.hcl` defines environments and migration settings
- **Target Schema**: `src/schema.sql` is the source of truth
- **Migration Files**: Generated in `migrations/` directory with checksums
- **Environments**: `db-local` for development, production configs in deployment

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

1. Edit `src/schema.sql` - the single source of truth
2. Always run `mise run plan` to generate migrations
3. Review generated SQL in `migrations/` before applying
4. Test with `mise run apply` on local database
5. Never edit migration files directly

### Local Development

- Use `mise run db-local:start` for development with full schema
- Use `mise run db-local:start-empty` for testing migrations from scratch
- Connect with `mise run db-local:psql` for manual queries
- Environment variables in `.mise.toml` configure connection details

### Container Management

- Base image: PostgreSQL 16 with TimescaleDB and timescaledb_toolkit extensions
- Migration image: Contains Atlas and migration files for deployment
- Published to `ghcr.io/cdviz-dev/cdviz-db-pg` and `ghcr.io/cdviz-dev/cdviz-db-migration`

## Common Tasks

### Adding New CDEvent Fields

1. Edit `src/schema.sql` to add columns or modify JSONB structure
2. Run `mise run plan` to generate Atlas migration
3. Test migration: `mise run db-local:stop && mise run apply`
4. Update Grafana queries that depend on schema changes

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

- **atlas.hcl**: Atlas migration configuration and environments
- **src/schema.sql**: Master schema definition (source of truth)
- **migrations/\*.sql**: Generated Atlas migration files (do not edit)
- **docker-bake.hcl**: Docker build configuration for containers
- **Dockerfile**: PostgreSQL image with TimescaleDB extensions

## Troubleshooting

### Migration Issues

- Check Atlas configuration in `atlas.hcl`
- Verify database connectivity and permissions
- Review generated migration files before applying
- Use `atlas migrate validate` to check migration consistency

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
- **Atlas Documentation**: [atlasgo.io](https://atlasgo.io)
- **PostgreSQL JSONB**: [PostgreSQL JSON docs](https://www.postgresql.org/docs/current/datatype-json.html)
- **CDEvents Specification**: [cdevents.dev](https://cdevents.dev)
