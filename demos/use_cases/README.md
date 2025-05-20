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

## Scenarii

### service deployment

- sequence stages: [202401-dev-uat-prods](`202401-dev-uat-prods.csv`): dev -> uat -> all prod
- sequence clusters: [202402-dev-uat-prod1](`202402-dev-uat-prod1.csv`): dev -> uat -> prod 1 -> prod 2
- wip: [202403-dev](`202403-dev.csv`): dev
- rejected on uat: [202404-dev-uat](`202404-dev-uat.csv`): dev -> uat
- hotfix: [202405-dev-prod](`202405-dev-prod.csv`): dev -> prod 1

## Usage

1. Setup a `cdviz-collector` with a configution like in [`cdviz-collector.yaml`](./cdviz-collector.toml):

    - push events into a db
    - watch content of the `cdevents` folder (json files & csv files)

2. Run the `cdviz-collector`:

  ```bash
  # same as `mise run use_cases:run`
  cdviz-collector connect -vv --config ./cdviz-collector.toml
  ```

3. Copy the files (json or csv) from `events/{subject}_{predicate}.sampled.d/*.{json, csv}` into the `eventscdevents/{subject}_{predicate}.in.d/` folder to trigger the processing.
4. Open the dashboard (e.g. for local dev launched via `mise run stack:compose:up`, open <http://localhost:3000/dashboards>)
