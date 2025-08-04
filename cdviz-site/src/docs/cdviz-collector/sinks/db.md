# Database Sink

The database sink stores CDEvents in a PostgreSQL database, providing persistent storage for event data. It's the primary storage mechanism for CDviz dashboards and analytics.

## Configuration

```toml
[sinks.cdviz_db]
enabled = true
type = "db"
url = "postgresql://postgres:passwd@localhost:5432/cdviz"
pool_connections_min = 1
pool_connections_max = 10
```

## Parameters

### Required Parameters

- **`type`** (string): Must be set to `"db"`
- **`url`** (string): PostgreSQL connection URL

### Optional Parameters

- **`enabled`** (boolean): Enable/disable the database sink (default: `true`)
- **`pool_connections_min`** (integer): Minimum connections in pool (default: `1`)
- **`pool_connections_max`** (integer): Maximum connections in pool (default: `10`)

## Database Requirements

### PostgreSQL Version

- **PostgreSQL 12+** recommended
- **TimescaleDB extension** for time-series optimization (optional but recommended)

### Schema Setup

The database sink requires a stored procedure for event storage:

```sql
-- The sink calls this stored procedure for each event
CALL store_cdevent($1);
```

The CDviz database schema provides this procedure. See [Database Setup](../../cdviz-db/) for complete schema installation.

## Connection URL Format

```
postgresql://[user[:password]@][host][:port][/dbname][?param1=value1&...]
```

### Examples

```toml
# Basic connection
url = "postgresql://cdviz_user:password@localhost:5432/cdviz"

# With SSL
url = "postgresql://user:pass@host:5432/cdviz?sslmode=require"

# Connection pool settings
url = "postgresql://user:pass@host:5432/cdviz?application_name=cdviz-collector"

# Cloud database
url = "postgresql://user:pass@database.cloud.com:5432/cdviz?sslmode=require&connect_timeout=10"
```

## Storage Behavior

### Event Processing

1. **Receives CDEvent** from the event pipeline
2. **Serializes to JSON** for database storage
3. **Calls stored procedure** `store_cdevent(json_data)`
4. **Handles errors** with retry logic and logging

### Data Format

Events are stored as JSON documents in the database:

```json
{
  "context": {
    "version": "0.4.0",
    "id": "dev.cdevents.build.started.0.1.0-12345",
    "source": "github.com/myorg/myrepo",
    "type": "dev.cdevents.build.started.0.1.0",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "subject": {
    "id": "build-456",
    "type": "build",
    "content": {
      "id": "build-456",
      "source": "github.com/myorg/myrepo"
    }
  }
}
```

## Connection Pool Management

### Pool Configuration

```toml
[sinks.cdviz_db]
type = "db"
url = "postgresql://user:pass@host:5432/cdviz"

# Pool settings
pool_connections_min = 2    # Always maintain 2 connections
pool_connections_max = 20   # Allow up to 20 concurrent connections
```

### Pool Behavior

- **Minimum connections**: Always maintained, even when idle
- **Maximum connections**: Upper limit for concurrent database operations
- **Connection reuse**: Connections are reused across events for efficiency
- **Automatic recovery**: Failed connections are automatically replaced

## Error Handling

### Database Connectivity

- **Connection failures**: Automatic retry with exponential backoff
- **Network timeouts**: Configurable timeout settings
- **Pool exhaustion**: Events queue until connections become available

### Schema Errors

- **Missing stored procedure**: Logged as error, events dropped
- **Invalid JSON**: Events logged and dropped
- **Constraint violations**: Database errors logged, processing continues

## Examples

### Basic Configuration

```toml
[sinks.cdviz_db]
enabled = true
type = "db"
url = "postgresql://cdviz:password@localhost:5432/cdviz"
```

### Production Configuration

```toml
[sinks.production_db]
enabled = true
type = "db"
url = "postgresql://cdviz_user:secure_password@db.company.com:5432/cdviz_prod"
pool_connections_min = 5
pool_connections_max = 50
```

### High Availability Setup

```toml
# Primary database
[sinks.primary_db]
enabled = true
type = "db"
url = "postgresql://user:pass@primary-db.company.com:5432/cdviz"
pool_connections_min = 3
pool_connections_max = 15

# Backup database (if needed)
[sinks.backup_db]
enabled = false  # Enable if primary fails
type = "db"
url = "postgresql://user:pass@backup-db.company.com:5432/cdviz"
pool_connections_min = 1
pool_connections_max = 5
```

### Environment-Based Configuration

```toml
# Configuration file
[sinks.cdviz_db]
enabled = true
type = "db"
url = "postgresql://localhost:5432/cdviz"  # Default for development
pool_connections_min = 1
pool_connections_max = 5
```

```bash
# Override for production
export CDVIZ_COLLECTOR__SINKS__CDVIZ_DB__URL="postgresql://user:pass@prod-db:5432/cdviz"
export CDVIZ_COLLECTOR__SINKS__CDVIZ_DB__POOL_CONNECTIONS_MIN="5"
export CDVIZ_COLLECTOR__SINKS__CDVIZ_DB__POOL_CONNECTIONS_MAX="25"
```

## Security Considerations

### Authentication

```toml
# Use environment variables for credentials
[sinks.secure_db]
enabled = true
type = "db"
url = "postgresql://user:${DB_PASSWORD}@host:5432/cdviz"
```

```bash
# Set credentials securely
export DB_PASSWORD="secure_password_here"
export CDVIZ_COLLECTOR__SINKS__SECURE_DB__URL="postgresql://cdviz_user:${DB_PASSWORD}@db.company.com:5432/cdviz"
```

### SSL/TLS Configuration

```toml
[sinks.secure_db]
enabled = true
type = "db"
url = "postgresql://user:pass@host:5432/cdviz?sslmode=require&sslcert=client-cert.pem&sslkey=client-key.pem&sslrootcert=ca-cert.pem"
```

### Network Security

- **Firewall rules**: Restrict database access to collector hosts only
- **VPN/Private networks**: Use private network connections
- **Connection encryption**: Always use SSL in production
- **Credential rotation**: Regularly rotate database passwords

## Performance Tuning

### Connection Pool Sizing

```toml
# For high-volume events
[sinks.high_volume_db]
enabled = true
type = "db"
url = "postgresql://user:pass@host:5432/cdviz"
pool_connections_min = 10   # Higher minimum for consistent performance
pool_connections_max = 100  # Higher maximum for peak loads
```

### Database Optimization

- **Indexes**: Ensure proper indexes on frequently queried columns
- **Partitioning**: Use table partitioning for time-based queries
- **Vacuum**: Configure automatic vacuum for maintaining performance
- **Connection limits**: Adjust PostgreSQL `max_connections` setting

### Monitoring

```sql
-- Monitor active connections
SELECT count(*) FROM pg_stat_activity WHERE application_name = 'cdviz-collector';

-- Check for slow queries
SELECT query, query_start, state FROM pg_stat_activity WHERE state = 'active';

-- Monitor database size
SELECT pg_size_pretty(pg_database_size('cdviz'));
```

## Integration

### With CDviz Dashboards

The database sink provides data for Grafana dashboards:

```toml
# Database configuration for dashboards
[sinks.dashboard_db]
enabled = true
type = "db"
url = "postgresql://readonly_user:pass@db:5432/cdviz"
pool_connections_min = 2
pool_connections_max = 10
```

### With Other Sinks

Use alongside other sinks for redundancy:

```toml
# Primary storage
[sinks.cdviz_db]
enabled = true
type = "db"
url = "postgresql://user:pass@primary-db:5432/cdviz"

# Backup to files
[sinks.backup_files]
enabled = true
type = "folder"
kind = "s3"
parameters = { bucket = "cdviz-backup", region = "us-east-1" }

# Real-time monitoring
[sinks.monitoring_stream]
enabled = true
type = "sse"
id = "monitoring"
```

## Troubleshooting

### Connection Issues

```bash
# Test database connectivity
psql "postgresql://user:pass@host:5432/cdviz" -c "SELECT version();"

# Check collector logs
journalctl -u cdviz-collector | grep "database\|pool"

# Monitor connection pool
RUST_LOG=sqlx::pool=debug cdviz-collector connect --config config.toml
```

### Performance Issues

```bash
# Enable database query logging
RUST_LOG=sqlx::query=debug cdviz-collector connect --config config.toml

# Monitor database performance
-- PostgreSQL: Check slow queries
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

-- Check connection usage
SELECT count(*), state FROM pg_stat_activity GROUP BY state;
```

### Schema Issues

```sql
-- Verify stored procedure exists
SELECT proname FROM pg_proc WHERE proname = 'store_cdevent';

-- Check table structure
\d+ cdevents  -- Or whatever table stores events

-- Test procedure manually
CALL store_cdevent('{"test": "event"}');
```

## Backup and Recovery

### Database Backups

```bash
# Full database backup
pg_dump "postgresql://user:pass@host:5432/cdviz" > cdviz_backup.sql

# Compressed backup
pg_dump "postgresql://user:pass@host:5432/cdviz" | gzip > cdviz_backup.sql.gz

# Custom format backup
pg_dump -Fc "postgresql://user:pass@host:5432/cdviz" > cdviz_backup.dump
```

### Point-in-Time Recovery

```bash
# Enable WAL archiving in PostgreSQL
archive_mode = on
archive_command = 'cp %p /path/to/archive/%f'

# Restore to specific point in time
pg_restore -d cdviz_new cdviz_backup.dump
```

## Default Configuration

The database sink is included in the default configuration:

```toml
[sinks.cdviz_db]
enabled = false
type = "db"
url = "postgresql://postgres:passwd@localhost:5432/cdviz"
pool_connections_min = 1
pool_connections_max = 10
```

## Related

- [Sinks Overview](./index.md) - Understanding sink pipelines
- [Database Setup](../../cdviz-db/) - Database schema and setup
- [Debug Sink](./debug.md) - Development and testing
- [Configuration](../configuration.md) - Environment variables and setup