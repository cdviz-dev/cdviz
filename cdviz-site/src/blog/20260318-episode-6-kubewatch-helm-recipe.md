---
title: "CDEvents in Action #6: Monitor Every Kubernetes Deployment with One Helm Command"
description: "Install kubewatch alongside CDviz to automatically capture CDEvents for every deployment in your cluster — kubectl, Helm, ArgoCD, or manual changes."
tags:
  [
    "cdevents",
    "kubernetes",
    "k8s",
    "kubewatch",
    "helm",
    "passive-monitoring",
    "devops",
  ]
author: "David B."
author_github: "davidb31"
date: "2026-03-18"
target_audience: "Platform Engineers, DevOps Engineers, Kubernetes Operators"
reading_time: "4 minutes"
series: "CDEvents in Action"
series_part: 6
status: draft
publications:
  - at: "2026-03-18"
    url: "https://dev.to/davidb31/cdevents-in-action-5-the-kubernetes-deployment-blind-spot-1c3a"
---

# CDEvents in Action #6: Monitor Every Kubernetes Deployment with One Helm Command

_After this, every Deployment, StatefulSet, and DaemonSet change in your cluster generates a CDEvent automatically — no matter how it was deployed._

[Episode #5](/blog/20260311-episode-5-k8s-blind-spot) explained the gap. This episode closes it.

## What You Need

- CDviz running with `cdviz-collector` reachable from inside the cluster
- Kubernetes v1.19+ with kubectl access
- Helm 3

## The Command

```bash
helm install cdviz-collector oci://ghcr.io/cdviz-dev/charts/cdviz-collector \
  --set kubewatch.enabled=true \
  --namespace cdviz \
  --create-namespace
```

That single flag (`kubewatch.enabled=true`) deploys [kubewatch](https://github.com/robusta-dev/kubewatch) alongside cdviz-collector and wires them together:

- kubewatch watches Deployment/StatefulSet/DaemonSet changes cluster-wide (can be configured)
- cdviz-collector receives kubewatch CloudEvents and transforms them to CDEvents
- RBAC is configured automatically (read-only ClusterRole)

See [Kubernetes (via Kubewatch) Integration](/docs/cdviz-collector/integrations/kubewatch) for details.

## Verify It Works

**1. Check both pods are running:**

```bash
kubectl get pods -n cdviz
# NAME                              READY   STATUS
# cdviz-collector-xxx               1/1     Running
# kubewatch-xxx                     1/1     Running
```

**2. Trigger a test deployment:**

```bash
kubectl create deployment test-nginx --image=nginx:latest
```

**3. Confirm the CDEvent arrived:**

```bash
kubectl logs -n cdviz -l app=cdviz-collector --tail=20 | grep service.deployed
```

You should see a `service.deployed` event within a few seconds. Check your Grafana dashboard — the deployment appears there too.

**4. Clean up:**

```bash
kubectl delete deployment test-nginx
```

## What Gets Captured

| Kubernetes change               | CDEvent type       |
| ------------------------------- | ------------------ |
| Deployment created              | `service.deployed` |
| Image or config updated         | `service.upgraded` |
| Deployment deleted              | `service.removed`  |
| StatefulSet / DaemonSet changes | same as above      |

The provided transformer for kubewatch event defines the service ID as `"{{ namespace }}/{{ resource_name }}/{{ container_name }}"` (where `resource_name` is the name of the Deployment, StatefulSet, or DaemonSet) to avoid collisions. In our example: `default/test-nginx/nginx`.

## Limiting Scope (Optional)

By default, kubewatch watches all namespaces. To limit to specific ones:

```bash
helm upgrade cdviz-collector oci://ghcr.io/cdviz-dev/charts/cdviz-collector \
  --set kubewatch.enabled=true \
  --set kubewatch.namespaceToWatch="production,staging" \
  --namespace cdviz
```

This reduces event volume and avoids noise from system namespaces.
