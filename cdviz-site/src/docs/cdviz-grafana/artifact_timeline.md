# Artifacts Timeline Dashboard

![panel package timeline screenshot](/screenshots/grafana_panel_timeline_version_on_stage-20250606_2018.png)

Allow users to visualize the versions lifecycle (packaged, published, signed, deployment as service,...) of a package.

- 1 timeline per package's version (artifact = package + version)
- hover each point to see the details of the event
- color of the points & lines are based on the latest stage reached by the artifact
- the metrics are based on the time range selected in the dashboard
- the metrics are per stage:
  - the name of the stage
    - the action/predicate of the package
    - the concatenation of the environment and the service name for the service's deployment
  - the frequency of the events, it can be used as DORA metrics: **Deployment Frequency**
  - the average duration of the transition from previous stage, useful to see the time taken to move from one stage to another (aka promotion time)
  - the latest version of the artifact in the stage, useful to see the latest version of the artifact in each stage   or the current deployed version of the artifact per environment
  - the timestamp of the latest event in the stage, useful to see the latest activity of the artifact in each stage

```sql
SELECT timestamp,
  predicate as action,
  predicate as stage,
  payload -> 'subject' ->> 'id' as artifact_id
FROM cdviz.cdevents_lake
WHERE $__timeFilter(timestamp)
  AND payload -> 'subject' ->> 'id' SIMILAR TO 'pkg:\${artifact_fnames:raw}(@|\\?)%'
  AND subject = 'artifact'
  AND predicate = ANY(ARRAY['published', 'signed'])

UNION ALL

SELECT timestamp,
  predicate as action,
  (payload -> 'subject' -> 'content' -> 'environment' ->> 'id') || '\n' || (payload -> 'subject' ->> 'id') as stage,
  payload -> 'subject' -> 'content' ->> 'artifactId' as artifact_id
FROM cdviz.cdevents_lake
WHERE $__timeFilter(timestamp)
  AND payload -> 'subject' -> 'content' ->> 'artifactId' SIMILAR TO 'pkg:\${artifact_fnames:raw}(@|\\?)%'
  AND subject = 'service'
  AND predicate = ANY(ARRAY['deployed', 'upgraded', 'rolledback'])
```

## Notes

- The package is identified by [PURL](https://github.com/package-url/purl-spec/blob/main/PURL-TYPES.rst)
- For OCI packages, the version is the digest of the package (e.g., `pkg:oci/ghcr.io/cdviz-dev/cdviz-db@sha256:1234567890abcdef`), But sometimes the version is not available in the event, so the tag is used instead (e.g., `pkg:oci/ghcr.io/cdviz-dev/cdviz-db?tag=0.1.0`).

## Sources

- Database schema: [schema.sql](https://github.com/cdviz-dev/cdviz/blob/main/cdviz-db/src/schema.sql)
- Dashboard generator: [artifact_timeline.ts](https://github.com/cdviz-dev/cdviz/blob/main/cdviz-grafana/dashboards_generator/src/dashboards/artifact_timeline.ts)
- Panel (data transformation + metrics computatuib + render): [draw_timeline_version_on_stage]( https://github.com/cdviz-dev/cdviz/blob/main/cdviz-grafana/dashboards_generator/src/panels/browser_scripts/draw_timeline_version_on_stage.ts)
