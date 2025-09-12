# AGENTS.md - CDviz Grafana Component

AI agent instructions for the CDviz Grafana component - programmatic dashboard generation using TypeScript and the Grafana Foundation SDK.

## Component Overview

**Purpose**: Generate Grafana dashboards programmatically from TypeScript code\
**Technology**: TypeScript, Bun runtime, Grafana Foundation SDK, D3.js for custom panels\
**Output**: JSON dashboard files consumed by Grafana\
**Data Source**: Direct PostgreSQL queries to cdviz database (no API abstraction)

## Key Technologies

- **Grafana Foundation SDK**: Type-safe dashboard generation from TypeScript
- **Bun**: Runtime and package manager for TypeScript execution
- **D3.js**: Custom visualization panels embedded as browser scripts
- **TypeScript**: Strong typing for dashboard configuration and panels
- **Biome**: Code formatting and linting

## Development Environment Setup

### Prerequisites

- Bun runtime installed via `mise install`
- Basic understanding of Grafana dashboard structure
- Knowledge of PostgreSQL/TimescaleDB queries for CDEvents

### Quick Start

```bash
cd cdviz-grafana
mise install                    # Install bun, yq, biome
mise run build                  # Generate all dashboards from TypeScript
mise run test                   # Run dashboard tests
```

### Essential Commands

```bash
# Development Workflow
mise run build:dashboards       # Generate JSON from TypeScript source
mise run build                  # Generate + normalize dashboards (sets UIDs, versions)

# Code Quality
mise run check                  # TypeScript compilation + biome linting
mise run format                 # Format code with biome
mise run test                   # Run unit tests

# Development Dependencies
mise run install:deps           # Install npm dependencies in dashboards_generator/

# CI Pipeline
mise run ci                     # Full CI: dependencies, check, build, test
```

## Project Structure

```
cdviz-grafana/
├── dashboards_generator/       # TypeScript source code
│   ├── src/
│   │   ├── index.ts           # Main entry point, dashboard builders
│   │   ├── dashboards/        # Dashboard definitions
│   │   │   ├── artifact_timeline.ts
│   │   │   ├── cdevents_activity.ts
│   │   │   └── execution_dashboards.ts
│   │   ├── panels/            # Panel definitions and D3.js components
│   │   │   ├── d3_panel.ts    # Custom D3 panel wrapper
│   │   │   └── browser_scripts/ # D3.js visualization code
│   │   └── tools.ts           # Utility functions
│   ├── package.json           # Dependencies (Grafana SDK, D3, lodash)
│   └── tsconfig.json          # TypeScript configuration
├── dashboards/                # Generated JSON output (do not edit!)
│   ├── artifact_timeline.json
│   ├── cdevents_activity.json
│   └── execution_*.json
└── .mise.toml                 # Task configuration
```

## Critical Development Pattern

### Generated Content Workflow

**NEVER** edit JSON files in `dashboards/` directory directly. Always follow this pattern:

1. **Edit TypeScript**: Modify dashboard code in `dashboards_generator/src/`
2. **Generate JSON**: Run `mise run build` to compile TypeScript → JSON
3. **Test Changes**: Import generated JSON into Grafana for testing
4. **Version Control**: Commit both TypeScript source AND generated JSON files

### Dashboard Versioning

- Dashboard versions auto-generated from git history or current timestamp
- UIDs automatically set to match filename (e.g., `artifact_timeline.json` → UID: `artifact_timeline`)
- Dirty files (uncommitted changes) get timestamped versions

## Dashboard Architecture

### Core Dashboards

- **artifact_timeline**: Version deployment timeline across stages
- **cdevents_activity**: Event activity monitoring and debugging
- **execution_dashboards**: Pipeline execution performance and metrics

### Panel Types

- **Standard Grafana Panels**: Time series, tables, stats using Foundation SDK
- **Custom D3.js Panels**: Complex visualizations with interactive features
- **Database Panels**: Direct PostgreSQL queries to `cdviz.cdevents_lake` table

### Query Patterns

All dashboards query PostgreSQL directly:

```sql
-- Example: Extract events by type and time range
SELECT
  timestamp,
  payload->>'subject' as subject,
  payload->'data' as event_data
FROM cdviz.cdevents_lake
WHERE
  timestamp >= $__timeFrom()
  AND timestamp <= $__timeTo()
  AND subject = 'pipeline'
```

## Custom D3.js Panel Development

### D3 Panel Structure

Custom visualizations are embedded as browser scripts in Grafana panels:

```typescript
// Example panel with D3.js
export function createTimelinePanel() {
  return d3Panel({
    title: "Artifact Timeline",
    browserScript: "./browser_scripts/draw_timeline_version_on_stage.js",
    queries: [
      /* PostgreSQL queries */
    ],
  });
}
```

### Browser Scripts Location

- **Source**: `src/panels/browser_scripts/*.ts` (TypeScript with D3.js)
- **Compiled**: `build/*.js` (JavaScript for Grafana consumption)
- **Features**: Interactive tooltips, zoom, filtering, real-time updates

### D3.js Development Pattern

1. Write visualization logic in TypeScript with D3.js
2. Export compiled JavaScript for Grafana embedding
3. Handle Grafana data format (time series, table data)
4. Implement responsive design for different screen sizes

## Database Integration

### Direct Query Approach

Grafana panels query PostgreSQL directly without API abstraction:

- **Performance**: Leverage TimescaleDB optimizations and indexes
- **Flexibility**: Full SQL capability including complex joins and aggregations
- **Real-time**: Direct database connection enables live dashboards
- **CDEvents**: Query JSONB payload with PostgreSQL JSON operators

### Query Optimization

- Use TimescaleDB time-bucket functions for aggregations
- Leverage hypertable partitioning for time-range queries
- Index on commonly filtered fields (subject, predicate, context_id)
- JSONB GIN indexes for payload queries

## Development Workflow

### Adding New Dashboard

1. **Create TypeScript File**: Add new dashboard in `src/dashboards/`
2. **Register Dashboard**: Import and export in `src/index.ts`
3. **Build Dashboard**: Use Grafana Foundation SDK for panels
4. **Generate JSON**: Run `mise run build` to create output file
5. **Test in Grafana**: Import generated JSON for validation

### Modifying Existing Dashboard

1. **Edit TypeScript**: Modify source in `dashboards_generator/src/`
2. **Rebuild**: Run `mise run build` to regenerate JSON
3. **Test Changes**: Verify in Grafana with actual data
4. **Commit Both**: Include TypeScript changes AND generated JSON

### Custom Panel Development

1. **Create D3 Script**: Write visualization in `src/panels/browser_scripts/`
2. **Create Panel Wrapper**: Define panel configuration in `src/panels/`
3. **Add to Dashboard**: Use panel in dashboard TypeScript definition
4. **Test Visualization**: Verify D3.js rendering in Grafana

## Code Style & Guidelines

### TypeScript Standards

- **Strong Typing**: Use Grafana Foundation SDK types
- **Modular Design**: Separate panels, queries, and utilities
- **Async/Await**: Handle dashboard generation asynchronously
- **Error Handling**: Graceful fallbacks for missing data

### D3.js Patterns

- **Responsive Design**: Handle container resize events
- **Data Binding**: Efficient D3 data joins and updates
- **Performance**: Optimize for real-time data updates
- **Accessibility**: Include ARIA labels and keyboard navigation

### Query Guidelines

- **Parameterization**: Use Grafana template variables
- **Time Ranges**: Respect dashboard time picker settings
- **Performance**: Optimize for TimescaleDB hypertables
- **Documentation**: Comment complex SQL logic

## Testing & Quality

### Unit Testing

```bash
mise run test                   # Run all tests with Bun
```

- **Panel Tests**: Validate panel configuration and queries
- **Data Transformation**: Test CDEvents data processing
- **Utility Functions**: Test helper functions and tools

### Integration Testing

- **Dashboard Import**: Test generated JSON imports into Grafana
- **Query Validation**: Verify SQL queries against actual database
- **Visualization Testing**: Manual testing of D3.js panels

### Code Quality

- **TypeScript**: Strict type checking enabled
- **Biome**: Consistent formatting and linting
- **Dependency Management**: Keep Grafana SDK and D3.js up to date

## Common Development Tasks

### Adding New Visualization

1. **Study CDEvents Data**: Understand available event fields and structure
2. **Design Query**: Create SQL query to extract visualization data
3. **Create D3 Script**: Implement visualization logic with D3.js
4. **Integrate Panel**: Add to dashboard with proper configuration
5. **Test & Iterate**: Refine based on real data and user feedback

### Performance Optimization

1. **Query Analysis**: Use `EXPLAIN ANALYZE` on PostgreSQL queries
2. **Data Reduction**: Limit data transfer from database to Grafana
3. **Caching**: Leverage Grafana's query caching mechanisms
4. **Aggregation**: Use TimescaleDB functions for time-based grouping

### Debugging Issues

```bash
# Check TypeScript compilation
mise run check

# Test dashboard generation
mise run build:dashboards

# Validate generated JSON
cat dashboards/artifact_timeline.json | jq '.'
```

## Integration Notes

### Grafana Configuration

- **Data Source**: PostgreSQL connection to cdviz database
- **Plugins**: May require D3.js panel plugin for custom visualizations
- **Provisioning**: Dashboards can be auto-provisioned in Kubernetes deployments

### CDviz Ecosystem Integration

- **Database Schema**: Depends on `cdviz.cdevents_lake` table structure
- **Event Types**: Aligned with CDEvents specification and collector output
- **Time Zones**: Handle TimescaleDB timestamps and Grafana time ranges

## Troubleshooting

### Build Issues

- **TypeScript Errors**: Check `mise run check` for compilation issues
- **Missing Dependencies**: Run `mise run install:deps`
- **JSON Generation**: Verify dashboard export functions in TypeScript

### Dashboard Issues

- **Import Failures**: Validate JSON syntax and Grafana compatibility
- **Query Errors**: Test SQL queries directly against database
- **Visualization Problems**: Check browser console for D3.js errors

### Performance Issues

- **Slow Queries**: Optimize SQL and leverage TimescaleDB features
- **Large Payloads**: Implement data pagination or aggregation
- **Rendering Issues**: Profile D3.js code and optimize drawing operations

## Resources

- **Grafana Foundation SDK**: [grafana.github.io/grafana-foundation-sdk](https://grafana.github.io/grafana-foundation-sdk)
- **D3.js Documentation**: [d3js.org](https://d3js.org)
- **TimescaleDB Functions**: [docs.timescale.com](https://docs.timescale.com)
- **CDEvents Specification**: [cdevents.dev](https://cdevents.dev)
