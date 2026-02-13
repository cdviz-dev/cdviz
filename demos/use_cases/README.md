# Examples of use cases

## Simulated context

- artifacts:
  - format: [purl](https://github.com/package-url/purl-spec/blob/master/PURL-SPECIFICATION.rst)  short:`scheme:type/namespace/name@version?qualifiers#subpath`
  - type: `oci`
  - namespace: `` (none)
  - name x several versions (and convention):
    - `app-a` (semver only): `0.0.1`, `0.1.0`, `1.0.0`
    - `app-b` (git describe + semver): `f2b4da`, `a32d55` `0.1.0-2-ge453fae`
- environments:
  - format `{cluster}/{namespace}` => `{family}-{stage}/{region}/{namespace}`
  - family: `group1`
  - stages: `dev`, `uat`, `prod`
  - regions: `eu-1`, `eu-2`, `us-2` (dev and uat on `eu-1`, prod on `us-2` and `eu-2`)
  - namespace: `ns-a`, `ns-b`

## Sample Data

### Execution Events

Located in [`events/executions.d/`](events/executions.d/):

- **pipelinerun_basic.csv**: Basic pipeline execution examples
- **pipelinerun_variety.csv**: 30+ pipelines with various types, outcomes, and retry patterns distributed over 7 days
- **taskrun_basic.csv**: Basic task execution examples with links to pipelines
- **taskrun_variety.csv**: 50+ tasks including builds, tests, security scans, and deployments across different pipeline runs
- **testsuiterun_basic.csv**: Basic test suite execution examples
- **testsuiterun_variety.csv**: 30+ test suites covering unit, integration, e2e, performance, security, and regression testing
- **testcaserun_basic.csv**: Basic test case execution examples with links to test suites
- **testcaserun_variety.csv**: 40+ test cases with realistic scenarios including failures, retries, and various test types

### Artifact Lifecycle Events

Located in [`events/artifact_lifecycle.d/`](events/artifact_lifecycle.d/):

- **app-a.csv**: Artifact deployment lifecycle for app-a across environments
- **app-b.csv**: Artifact deployment lifecycle for app-b across environments
- **app-c.csv**: Artifact deployment lifecycle for app-c across environments

## Usage

1. The `cdviz-collector` is configured via [`cdviz-collector.toml`](./cdviz-collector.toml) to:

    - Watch sample data directories directly (`events/executions.d/`, `events/artifact_lifecycle.d/`)
    - Transform CSV files using VRL transformers in `transformers/`
    - Push transformed events into the database
    - Accept CDEvents JSON files in `events/cdevents.in.d/` (optional)

2. Run the `cdviz-collector`:

  ```bash
  # same as `mise run use_cases:run`
  cdviz-collector connect -vv --config ./cdviz-collector.toml
  ```

3. The collector automatically loads all sample CSV files from the data directories. No copying or symlinking needed!

4. Open the dashboard (e.g. for local dev launched via `mise run stack:compose:up`, open <http://localhost:3000/dashboards>)
