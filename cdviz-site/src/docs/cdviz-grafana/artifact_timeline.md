# Artifact Timeline Dashboard

<!--![Artifact timeline visualization](/screenshots/grafana_panel_timeline_version_on_stage-20250606_2018.png)-->

![Artifact timeline visualization - Legend](/screenshots/grafana_panel_timeline_version_on_stage-legend.svg)

## Overview

The Artifact Timeline Dashboard provides visualization capabilities for tracking package version lifecycles throughout their development and deployment journey. This dashboard enables users to monitor the progression of artifacts across various stages including packaging, publication, signing, and service deployment.

## Features

- Individual timeline visualization for each package version (artifact = package + version)
- Interactive tooltips displaying detailed event information on hover
- Color-coded points and lines based on the latest stage reached by each artifact
- Metrics based on the selected dashboard time range
- Comprehensive per-stage metrics including:
  - Stage identification
    - Action/predicate of the package
    - Environment and service name concatenation for service deployments
  - Event frequency metrics (applicable for DORA metrics: **Deployment Frequency**)
  - Average transition duration from previous stage, facilitating promotion time analysis
  - Latest artifact version per stage, providing visibility into current deployed versions across environments
  - Timestamp of the most recent event per stage, highlighting latest activity

## Implementation

The dashboard utilizes the following SQL query to retrieve artifact timeline data:

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

## Technical Notes

- Package identification follows the [Package URL (PURL) specification](https://github.com/package-url/purl-spec/blob/main/PURL-TYPES.rst)
- For OCI packages, version identification uses:
  - Package digest when available (e.g., `pkg:oci/ghcr.io/cdviz-dev/cdviz-db@sha256:1234567890abcdef`)
  - Package tag as fallback when digest is unavailable (e.g., `pkg:oci/ghcr.io/cdviz-dev/cdviz-db?tag=0.1.0`)

## Source Code References

- Database schema: [migrations](https://github.com/cdviz-dev/cdviz/blob/main/cdviz-db/src/migrations)
- Dashboard generator: [artifact_timeline.ts](https://github.com/cdviz-dev/cdviz/blob/main/cdviz-grafana/dashboards_generator/src/dashboards/artifact_timeline.ts)
- Visualization implementation: [draw_timeline_version_on_stage.ts](https://github.com/cdviz-dev/cdviz/blob/main/cdviz-grafana/dashboards_generator/src/panels/browser_scripts/draw_timeline_version_on_stage.ts)
