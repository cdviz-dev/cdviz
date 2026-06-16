# updatecli — automated dependency updates

[updatecli](https://www.updatecli.io/) keeps third-party versions across this monorepo up to date.
It runs weekly (and on demand) via `.github/workflows/update-deps.yml` and opens one pull request per
manifest.

This guide documents the conventions every manifest must follow, the commands to run locally, and the
dependencies intentionally left unmanaged. **Read it before adding or editing a manifest** — the rules
below exist to avoid concrete problems we already hit (see [Conventions](#conventions)).

> The same conventions are portable to other repositories: copy this README plus the
> `updatecli.d/`, `values.yaml`, `mise.toml`, `schema/`, and `.v8rrc.yaml` layout.

## Layout

| Path | Purpose |
|---|---|
| `updatecli.d/*.yaml` | One manifest (pipeline) per dependency group. Each = sources → targets → action(s). |
| `values.yaml` | Shared template values (GitHub owner/repo/branch/bot identity). |
| `mise.toml` | Pins `updatecli` + `v8r`; defines the `diff` / `apply` / `lint` / `schema:update` tasks. |
| `schema/` | Local **patched** JSON Schema used to validate manifests (adds `labels`, `targets`, `matrix`). |
| `.v8rrc.yaml` | Points `v8r` at the local schema. |
| `not-managed.txt` | _Removed_ — its content now lives in [Dependencies intentionally NOT managed](#dependencies-intentionally-not-managed) below. |

## Commands

Run from the `updatecli/` directory (or via `mise run //updatecli:<task>` from the repo root). All need
`gh` to be authenticated (the tasks export `UPDATECLI_GITHUB_TOKEN=$(gh auth token)`).

```bash
mise run //updatecli:diff           # dry run — show what would change, no PRs
mise run //updatecli:apply          # apply updates and open/refresh PRs
mise run //updatecli:lint           # render manifests + validate YAML against the local schema
mise run //updatecli:schema:update  # regenerate the patched schema (after an updatecli version bump)
```

## Conventions

### Commit messages: `fix(deps): …`

Every manifest's `scms.default.spec` sets:

```yaml
      commitmessage:
        type: fix
        scope: deps
```

updatecli builds each commit subject from the target's `name:`, so the result is
`fix(deps): <target name>`. Keep this on **every** manifest for consistent, Conventional-Commit history.

### One PR per manifest, generic title when bumping many tools

All targets sharing `scmid: default` are pushed to a single branch → a **single PR**.

- If a manifest bumps **many tools** (e.g. `mise-tools.yaml`), use **one** action with a **generic**
  title (`fix(deps): bump mise tool versions`). Omit `targets:` so the action covers every target.
- **Do not** create one `github/pullrequest` action per tool while they share the same `scmid`. They
  collapse into one PR whose title is just one tool's — misrepresenting the PR contents (this was the
  bug behind PR #500: a PR titled "Bump bun" that actually bumped a dozen tools).
- If a manifest bumps **one** logical thing, a descriptive per-tool title is fine
  (`fix(deps): bump kubewatch to {{ source "kubewatch" }}`).

### Target names read `bump <tool> in <file>`

Because the target `name:` becomes the commit subject, write it as `bump <tool> in <file>`, e.g.
`bump bun in cdviz-site/mise.toml` → commit `fix(deps): bump bun in cdviz-site/mise.toml`.
(The resolved version can't appear in the name — sources resolve after manifest templating.)
Autodiscovery crawlers — `npm.yaml`, `github-actions.yaml` — auto-generate their target names; leave
them, the `fix(deps)` scope still applies.

### Lowercase action title descriptions

Conventional-Commit subjects are lowercase: `fix(deps): bump …`, not `Bump …`.

### Merging

Merge dependency PRs with **Rebase and merge** to keep each `fix(deps): …` commit. Auto-merge is
intentionally **off** (no `automerge:` in any action) — review and merge manually.

### updatecli YAML rules (gotchas)

- Spec property names are **lowercase**: `versionfilter`, `matchpattern`, `replacepattern`.
- `kind: file` targets do **full-line replacement** — the pattern must match the whole line.
- `kind: shell` targets need `disablesourceinput: true` when not using a direct `sourceid`.
- Each manifest document needs a root `name:`; each source entry needs a `name:`.
- SCMs live at the **root** level (alongside `autodiscovery:`), never nested under it.
- Auth comes from env vars (`UPDATECLI_GITHUB_APP_*` or `UPDATECLI_GITHUB_TOKEN`) — no tokens in
  manifests.
- The schema is a **local patched copy**. After bumping the `updatecli` pin in `mise.toml`, run
  `mise run //updatecli:schema:update` to regenerate it (the task re-applies the `labels` / `targets` /
  `matrix` patches). Note: `matrix:` is in the schema but **not** implemented by updatecli — don't use
  it.

## Dependencies intentionally NOT managed

These are excluded from automation on purpose. To change a version, edit it manually.

### Docker images — major-version pinned

- **`timescale/timescaledb-ha:pg18`** (`demos/stack-compose/docker-compose.yaml`) — pinned to pg18
  (PostgreSQL 18). A major Postgres upgrade needs schema-compatibility review and a manual migration
  runbook.
- **`migrate/migrate:4`** (`cdviz-db/Dockerfile`) — pinned to major 4; the CLI may change across majors.

### Docker images — internal / always-latest

- **`ghcr.io/cdviz-dev/*:latest`** (`demos/stack-compose/docker-compose.yaml`) — internal images,
  always `:latest` to pick up the most recent build without a version bump here.

### Generated manifests

- **`demos/stack-k8s/`** — rendered by `helmwave build`; editing the YAML directly would be overwritten
  on the next build.

### Mise tools — unmanageable by updatecli

- **helmwave** (`demos/stack-k8s/mise.toml`) — configured as an inline TOML table under the key
  `[tools."ubi:helmwave/helmwave"]` with special characters (colon, slash). Neither a file regex nor a
  TOML key path can reliably target it; update the `version` field in that section manually.

### Mise tools — pinned to "latest"

- **bun** in `cdviz-grafana-plugin.off/mise.toml` and `cdviz-site/perf/mise.toml` — bare string
  `"latest"`, no pinned version.

### npm packages — manually managed

- **vitepress** (`cdviz-site`) — tracking the `^2.0.0-alpha.x` pre-release; re-enable once VitePress
  2.x is stable.
- **`@grafana/grafana-foundation-sdk`** (`cdviz-grafana/dashboards_generator`) — non-standard timestamp
  versioning.
