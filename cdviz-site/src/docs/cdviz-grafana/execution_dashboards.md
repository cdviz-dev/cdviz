# Latest Execution Dashboards

![panel executions screenshot](/screenshots/grafana_panel_executions_double_barchart-20250608_2105.png)

Allow users to visualize duration & results (ok / ko) of the latest executions of:
- pipelines
- tasks
- builds
- tests & test suites

Example for pipelines execution:

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

## Notes

- Some executions doesn't have queued duration (e.g., tasks).
- The sql query use view on the table cdevents_lake, if some view are missing, feel free to make a PR (to add the view the database schema), to create your own view on table, or to use the `WITH` statement into your query.
- The hidden variable `limit` is used to limit the number of results displayed in the table, it can be set in the dashboard settings (default: `20`).

![dashboards executions screenshot](/screenshots/grafana_dashboard_pipeline_executions-20250606_2103.png)

## Sources

- Database schema: [schema.sql](https://github.com/cdviz-dev/cdviz/blob/main/cdviz-db/src/schema.sql)
- Dashboard generator: [execution_dashboards.ts](https://github.com/cdviz-dev/cdviz/blob/main/cdviz-grafana/dashboards_generator/src/dashboards/execution_dashboards.ts)
