# CDEvents Activity Dashboard

![cdevents activity screenshot](/screenshots/grafana_dashboard_cdevents_activity-20250606_2102.png)

Allow users to visualize cdevents activity in a Grafana dashboard.

- list raw cdevents stored in the database
  ```sql
  SELECT
    "timestamp",
    "subject",
    "predicate",
    "payload" -> 'subject' as "payload_subject",
    "payload" -> 'context' as "payload_context",
    "payload" -> 'customData' as "payload_custom",
    "imported_at"
  FROM
    cdviz.cdevents_lake
  WHERE
    $__timeFilter(timestamp)
    AND subject = ANY(ARRAY[\${subjects:sqlstring}]::text[])
    AND predicate = ANY(ARRAY[\${predicates:sqlstring}]::text[])
  ORDER BY
    imported_at DESC
  ```
- count cdevents
  - by type (subject & predicate)
    ```sql
    SELECT
      COUNT(*) as count,
      subject || '/' || predicate as path
    FROM cdviz.cdevents_lake
    WHERE $__timeFilter(timestamp)
      AND subject = ANY(ARRAY[\${subjects:sqlstring}]::text[])
      AND predicate = ANY(ARRAY[\${predicates:sqlstring}]::text[])
    GROUP BY subject, predicate
    ORDER BY subject, predicate
    ```
  - by source
    ```sql
    SELECT
      COUNT(*) as count,
      "payload" -> 'context' ->> 'source' as "path"
    FROM cdviz.cdevents_lake
    WHERE $__timeFilter(timestamp)
      AND subject = ANY(ARRAY[\${subjects:sqlstring}]::text[])
      AND predicate = ANY(ARRAY[\${predicates:sqlstring}]::text[])
    GROUP BY path
    ORDER BY path
    ```
  - by time
    ```sql
    SELECT
      time_bucket('1 hour', timestamp) AS time,
      (subject || '/' || predicate) AS kind,
      COUNT(*)
    FROM cdviz.cdevents_lake
    WHERE $__timeFilter(timestamp)
      AND subject = ANY(ARRAY[\${subjects:sqlstring}]::text[])
      AND predicate = ANY(ARRAY[\${predicates:sqlstring}]::text[])
    GROUP BY time, kind
    ORDER BY time, kind
    ```

## Sources

- Database schema: [schema.sql](https://github.com/cdviz-dev/cdviz/blob/main/cdviz-db/src/schema.sql)
- Dashboard generator: [cdevents_activity.ts](https://github.com/cdviz-dev/cdviz/blob/main/cdviz-grafana/dashboards_generator/src/dashboards/cdevents_activity.ts)
