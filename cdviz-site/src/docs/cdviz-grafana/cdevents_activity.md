# CDEvents Activity Dashboard

![CDEvents activity visualization](/screenshots/grafana_dashboard_cdevents_activity-20250606_2102.png)

## Overview

The CDEvents Activity Dashboard provides comprehensive visualization capabilities for monitoring CDEvents activity within the platform. This dashboard enables users to analyze event patterns, frequencies, and details through multiple interactive views.

## Features

### Raw CDEvents Explorer

View and inspect individual CDEvents stored in the database with detailed payload information:

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
  AND subject = ANY(ARRAY[${subjects:sqlstring}]::text[])
  AND predicate = ANY(ARRAY[${predicates:sqlstring}]::text[])
ORDER BY
  imported_at DESC
```

### Event Distribution Analytics

#### Event Type Distribution

Analyze the distribution of events by subject and predicate combinations:

```sql
SELECT
  COUNT(*) as count,
  subject || '/' || predicate as path
FROM cdviz.cdevents_lake
WHERE $__timeFilter(timestamp)
  AND subject = ANY(ARRAY[${subjects:sqlstring}]::text[])
  AND predicate = ANY(ARRAY[${predicates:sqlstring}]::text[])
GROUP BY subject, predicate
ORDER BY subject, predicate
```

#### Source Distribution

Identify the primary sources generating CDEvents in your environment:

```sql
SELECT
  COUNT(*) as count,
  "payload" -> 'context' ->> 'source' as "path"
FROM cdviz.cdevents_lake
WHERE $__timeFilter(timestamp)
  AND subject = ANY(ARRAY[${subjects:sqlstring}]::text[])
  AND predicate = ANY(ARRAY[${predicates:sqlstring}]::text[])
GROUP BY path
ORDER BY path
```

#### Temporal Analysis

Visualize event frequency over time with customizable bucketing:

```sql
SELECT
  time_bucket('1 hour', timestamp) AS time,
  (subject || '/' || predicate) AS kind,
  COUNT(*)
FROM cdviz.cdevents_lake
WHERE $__timeFilter(timestamp)
  AND subject = ANY(ARRAY[${subjects:sqlstring}]::text[])
  AND predicate = ANY(ARRAY[${predicates:sqlstring}]::text[])
GROUP BY time, kind
ORDER BY time, kind
```

## Source Code References

- Database schema: [migrations](https://github.com/cdviz-dev/cdviz/blob/main/cdviz-db/src/migrations)
- Dashboard generator: [cdevents_activity.ts](https://github.com/cdviz-dev/cdviz/blob/main/cdviz-grafana/dashboards_generator/src/dashboards/cdevents_activity.ts)
