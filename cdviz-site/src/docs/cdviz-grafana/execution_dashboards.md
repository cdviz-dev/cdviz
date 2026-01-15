# Execution Performance Dashboard

![Execution visualization panel](/screenshots/grafana_panel_executions_double_barchart-20250608_2105.png)

## Overview

The Execution Performance Dashboard provides comprehensive visualization capabilities for monitoring duration and outcome statistics across various execution types in the continuous delivery pipeline. This dashboard enables stakeholders to analyze performance metrics for:

- Pipeline executions
- Task executions
- Build processes
- Test and test suite runs

## Implementation Details

The dashboard implements visualization through parameterized SQL queries that extract execution metrics from the CDViz database. The example below demonstrates the query structure for pipeline execution analysis:

```sql
SELECT
  LEAST(queued_at, started_at, finished_at) AS at,
  subject_id AS subject_id,
  extract('epoch' from (started_at - queued_at)) AS queued_duration,
  extract('epoch' from (finished_at - started_at)) AS run_duration,
  --
  last_payload -> 'subject' -> 'content' ->> 'url' AS url,
  outcome AS outcome
FROM cdviz.pipelinerun
WHERE
  ($__timeFilter(queued_at) OR $__timeFilter(finished_at))
  AND last_payload -> 'subject' -> 'content' ->> 'pipelineName' = ANY(ARRAY[${selected_value:sqlstring}]::text[])
ORDER BY at DESC
LIMIT $limit
```

## Technical Considerations

- Some execution types may not include queued duration metrics (e.g., tasks)
- The SQL queries utilize views defined on the `cdevents_lake` table
- For missing views, consider:
  - Submitting a pull request to add the view to the database schema
  - Creating custom views in your environment
  - Using SQL `WITH` statements in your queries as a workaround
- The dashboard includes a hidden `limit` variable that controls the number of displayed results (default: `20`)

![Pipeline executions dashboard](/screenshots/grafana_dashboard_pipeline_executions-20250606_2103.png)

## Source Code References

- Database schema: [migrations](https://github.com/cdviz-dev/cdviz/blob/main/cdviz-db/src/migrations)
- Dashboard generator: [execution_dashboards.ts](https://github.com/cdviz-dev/cdviz/blob/main/cdviz-grafana/dashboards_generator/src/dashboards/execution_dashboards.ts)
