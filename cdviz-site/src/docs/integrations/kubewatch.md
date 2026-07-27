---
title: Kubernetes (via Kubewatch) Integration
keywords: "Kubernetes integration,kubewatch CDEvents,Kubernetes deployment events,cdviz-collector Kubernetes"
description: |
  Collect Kubernetes events (via kubewatch), transform them to cdevents.
  <ul>
  <li>KubeWatch tracks all changes to Kubernetes resources of given types.</li>
  <li>cdviz-collector transforms these events to cdevents, and sends them to the database, listeners,...</li>
  </ul>
  A CDEvent "service" is created for each containers defined in Kubernetes resource (deployment, statefulset, daemonset) that is created, updated, or deleted.
  Using the container allows to link with packages'events (e.g. from GitHub, GitLab, etc.) that are related to the container.
references:
  - title: Kubewatch
    url: https://github.com/robusta-dev/kubewatch/
  - title: Examples of cdevents converted from kubewatch's events
    url: https://github.com/cdviz-dev/transformers-community/tree/main/kubewatch_cloudevents/outputs
---

<script setup>
import IntegrationCard from '../../../components/IntegrationCard.vue'
</script>

<IntegrationCard />

## Configuration

### Setting Up cdviz-collector's side

> [!WARNING] Unsecured Endpoint
> Kubewatch send cloudevents without any signature or authentication, so you should only use it in a trusted environment (e.g. your own cluster). It is recommended to use it with a cdviz-collector instance that is in the same trusted environment to not expose cdviz-collector unsecured endpoint. You can use a side car container to run cdviz-collector in the same pod as Kubewatch, or use a separate cdviz-collector instance in the same cluster. And maybe this cdviz-collector instance to send the events to a remote cdviz-collector instance (e.g. in a SaaS environment or an other cluster).

Setting up `cdviz-collector.toml` to receive GitHub events involves defining a webhook source in the collector configuration file. Below is an example configuration snippet:

```toml
# Remote transformers repository configuration
[remote.transformers-community]
type = "github://cdviz-dev/transformers-community"

[sources.kubewatch_webhook]
enabled = true
transformer_refs = ["kubewatch_cloudevents"]

[sources.kubewatch_webhook.extractor]
type = "webhook"
id = "000-kubewatch"
metadata.environment_id = "/production/eu-1"
"""

# Transformer from transformers-community repository
[transformers.kubewatch_cloudevents]
type = "vrl"
template_rfile = "transformers-community:///kubewatch_cloudevents/transformer.vrl"
```

The `template_rfile` references the VRL (Vector Remap Language) file from the [transformers-community repository](https://github.com/cdviz-dev/transformers-community) that contains the transformation logic for converting Kubewatch cloudevents into CDEvents. The source code can be found at [kubewatch_cloudevents/transformer.vrl](https://github.com/cdviz-dev/transformers-community/blob/main/kubewatch_cloudevents/transformer.vrl).

The `kubewatch_metadata` transformer is used to add metadata to the events, such as the environment ID. You can customize the `environment_id` field to match your environment.

For more details on remote transformers, including using specific tags or commits, see the [Transformers documentation](../cdviz-collector/transformers.md#using-remote-transformers).

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
