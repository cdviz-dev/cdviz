---
title: Kubernetes (via Kubewatch) Integration
description: |
  Collect Kubernetes events (via kubewatch), transform them to cdevents.
  <ul>
  <li>KubeWatch tracks all changes to Kubernetes resources of given types.</li>
  <li>cdviz-collector transforms these events to cdevents, and sends them to the database, listeners,...</li>
  </ul>
  A CDEvent "service" is created for each containers defined in Kubernetes resource (deployment, statefulset, daemonset) that is created, updated, or deleted.
  Using the container allows to link with packages'events (e.g. from GitHub, GitLab, etc.) that are related to the container.
editions:
  - community
  - enterprise
integration:
  icon: /icons/kubewatch.svg
  type: source/webhook
  events:
    - input: "{deployment, statefulset, daemonset}.create"
      output: "service.deployed"
    - input: "{deployment, statefulset, daemonset}.delete"
      output: "service.removed"
    - input: "{deployment, statefulset, daemonset}.update"
      output: "service.{deployed, upgraded, removed}"
references:
  - title: Kubewatch
    url: https://github.com/robusta-dev/kubewatch/
  - title: Source code of the transformation of Kubewatch cloudevents to cdevents
    url: https://github.com/cdviz-dev/cdviz-collector/blob/main/config/transformers/kubewatch_cloudevents.vrl
  - title: Examples of cdevents converted from kubewatch's events
    url: https://github.com/cdviz-dev/cdviz-collector/tree/main/examples/assets/outputs/transform-kubewtach_cloudevents
---

<script setup>
import IntegrationCard from '../../../../components/IntegrationCard.vue'
</script>

<IntegrationCard />

## Configuration

### Setting Up cdviz-collector's side

> [!WARNING] Unsecured Endpoint
> Kubewatch send cloudevents without any signature or authentication, so you should only use it in a trusted environment (e.g. your own cluster). It is recommended to use it with a cdviz-collector instance that is in the same trusted environment to not expose cdviz-collector unsecured endpoint. You can use a side car container to run cdviz-collector in the same pod as Kubewatch, or use a separate cdviz-collector instance in the same cluster. And maybe this cdviz-collector instance to send the events to a remote cdviz-collector instance (e.g. in a SaaS environment or an other cluster).

Setting up `cdviz-collector.toml` to receive GitHub events involves defining a webhook source in the collector configuration file. Below is an example configuration snippet:

```toml
[sources.kubewatch_webhook]
enabled = true
transformer_refs = [ "kubewatch_metadata", "kubewatch_cloudevents" ]

[sources.kubewatch_webhook.extractor]
type = "webhook"
id = "000-kubewatch"

[transformers.kubewatch_metadata]
type = "vrl"
template = """
.metadata = object(.metadata) ?? {}

[{
  "metadata": merge(.metadata, {
    "environment_id": "cluster/A-dev",
  }),
  "header": .header,
  "body": .body,
}]
"""

[transformers.kubewatch_cloudevents]
type = "vrl"
template_file = "/etc/cdviz-collector/transformers/kubewatch_cloudevents.vrl"
```

The `template_file` points to the VRL (Vector Remap Language) file that contains the transformation logic for converting GitHub webhook events into cdevents. The file `/etc/cdviz-collector/transformers/kubewatch_cloudevents.vrl` is included in the container image. The source code for this file can be found in the [cdviz-collector repository](https://github.com/cdviz-dev/cdviz-collector/blob/main/config/transformers/kubewatch_cloudevents.vrl).

The `kubewatch_metadata` transformer is used to add metadata to the events, such as the environment ID. You can customize the `environment_id` field to match your environment.

### Setting Up Kubewatch's side

- Install Kubewatch in your Kubernetes cluster.
  - You can follow the [Kubewatch installation guide](https://github.com/robusta-dev/kubewatch/tree/master?tab=readme-ov-file#install)
  - Use the helm chart of cdviz-collector to install Kubewatch `kubewatch.enabled=true`:
    ```bash
    helm install cdviz-collector oci://ghcr.io/cdviz-dev/charts/cdviz-collector --set kubewatch.enabled=true
    ```
- Configure Kubewatch to send **cloudevents** to the `cdviz-collector` service (webhook events doesn't contains enough information)
  ```yaml
  resourcesToWatch:
    deployment: true
    daemonset: true
    statefulset: true
    replicationcontroller: false
    replicaset: false
    services: false
    pod: false
    job: false
    node: false
    clusterrole: false
    clusterrolebinding: false
    serviceaccount: false
    persistentvolume: false
    namespace: false
    secret: false
    configmap: false
    ingress: false
    coreevent: false
    event: false

  ## Seems like only one handler could be enabled at a time

  slack:
    enabled: false # true by default

  # cloudevent include the webhook's data + manifest of the resource + ... use by the template
  cloudevent:
    enabled: true
    # update the name to match the name of the service (if not cdviz-collector)
    url: "http://cdviz-collector:8080/webhook/000-kubewatch"
  ```
