---
version: 0.6.4
---

# Installation of cdviz-collector

## CLI

`cdviz-collector` is a command-line tool that can be downloaded from it's [GitHub's release page](https://github.com/cdviz/cdviz-collector/releases):

Install prebuilt binaries via shell script

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/cdviz-dev/cdviz-collector/releases/download/{{ $params.version }}/cdviz-collector-installer.sh | sh
```

Install prebuilt binaries via Homebrew

```bash
brew install cdviz-dev/tap/cdviz-collector
```

Install prebuilt binaries via `mise` (and `.mise.toml`):

```toml
[tools]
"ubi:cdviz-dev/cdviz-collector" = "latest"
```

Install prebuilt binaries via `cargo-binstall`:

```bash
cargo binstall cdviz-collector
```

Install from source via `cargo`:

```bash
cargo install cdviz-collector
```

## Docker / OCI Images

see [GitHub's package page](https://github.com/cdviz-dev/cdviz-collector/pkgs/container/cdviz-collector)

```bash
docker pull ghcr.io/cdviz-dev/cdviz-collector:latest
```

## Kubernetes

Install via Helm chart:

(browse versions on [github](https://github.com/cdviz-dev/cdviz/pkgs/container/charts%2Fcdviz-collector))

```bash
helm install cdviz-collector oci://ghcr.io/cdviz-dev/charts/cdviz-collector
```

### Values.yaml

Look at the default values.yaml file in the [GitHub repository](https://github.com/cdviz-dev/cdviz/blob/main/charts/cdviz-collector/values.yaml).

<<< ../../../../charts/cdviz-collector/values.yaml

### Example with Helmwave

```yaml
project: k8s-apps
version: "0.41.1"

registries:
  - host: ghcr.io

.options: &options
  create_namespace: true
  atomic: true
  force: true
  # resetValues: true
  timeout: 1m
  wait: true
  max_history: 3

releases:
  # ...
  - name: cdviz-collector
    namespace: cdviz-dev
    chart:
      name: oci://ghcr.io/cdviz-dev/charts/cdviz-collector
      version: 0.2.0-4-g62e72d1
    <<: *options
    create_namespace: false
    values:
      - src: values/secret.yaml
        renderer: sops
        strict: true
      - src: values/cdviz-collector.yaml
        renderer: copy
        strict: true
    tags:
      - cdviz
```
