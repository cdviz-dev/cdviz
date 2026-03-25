---
title: "CDEvents in Action #5: The Kubernetes Deployment Blind Spot"
description: "ArgoCD gives you GitOps visibility — but what about kubectl, Helm, and manual changes? Learn why native Kubernetes monitoring completes the picture."
tags:
  [
    "cdevents",
    "kubernetes",
    "k8s",
    "argocd",
    "monitoring",
    "passive-monitoring",
    "devops",
  ]
author: "David B."
author_github: "davidB"
date: "2026-03-11"
target_audience: "Platform Engineers, DevOps Engineers"
reading_time: "3 minutes"
series: "CDEvents in Action"
series_part: 5
status: published
publications:
  - at: "2026-03-11"
    url: "https://dev.to/davidb31/cdevents-in-action-5-the-kubernetes-deployment-blind-spot-1c3a"
---

# CDEvents in Action #5: The Kubernetes Deployment Blind Spot

_ArgoCD gives you GitOps visibility. But what about the operator who ran `kubectl apply` during an incident? Or the platform team's `helm upgrade`? Those are invisible — and they're the ones that tend to cause problems._

## The Gap ArgoCD Leaves

In [Episode #4](/blog/20251020-episode-4-webhook-transformers), you learned to capture CDEvents passively from ArgoCD webhooks — no pipeline changes, instant visibility into GitOps deployments.

But ArgoCD only sees what ArgoCD manages.

In a real cluster, deployments happen in multiple ways:

- `kubectl apply -f deployment.yaml` — ops team responding to an incident
- `helm upgrade payment-api ./chart` — platform team releasing a patch
- `kubectl set image deployment/api api=v2.1.0` — someone testing a hotfix
- ArgoCD sync — your GitOps flow

Only the last one shows up in ArgoCD. The first three are invisible.

This isn't a criticism of ArgoCD. It's the right tool for what it does. The gap is that **your cluster has more activity than your GitOps tool manages**.

## What Native Kubernetes Monitoring Adds

Instead of watching what ArgoCD knows about, you watch the Kubernetes API directly. When any Deployment, StatefulSet, or DaemonSet changes in the cluster — regardless of how it got there — a CDEvent fires.

|                  | ArgoCD notifications        | Native k8s monitoring     |
| ---------------- | --------------------------- | ------------------------- |
| **Trigger**      | ArgoCD sync                 | Any k8s resource change   |
| **Coverage**     | ArgoCD-managed apps only    | Every deployment method   |
| **Git context**  | Yes — commit, author, PR    | No                        |
| **Event volume** | Low                         | Low–medium                |
| **Setup**        | Webhook + transformer       | One Helm flag             |
| **Best for**     | Rich context per GitOps app | Complete cluster coverage |

## Use Both Together

These approaches complement each other — they don't compete.

- **ArgoCD notifications** → `service.deployed` events with git commit, author, and PR context for your GitOps apps
- **Native k8s monitoring** → `service.deployed` events for everything else, the kubectl runs, the manual hotfixes, the platform team's Helm releases

Combined, you have complete visibility across your cluster. When something breaks, you can see every deployment that happened — not just the ones that went through GitOps.

> [!TIP]
> The one thing to watch: if an app is managed by ArgoCD _and_ you have native monitoring enabled, you may see duplicate events for ArgoCD syncs. These are easy to filter, but worth knowing upfront.
> Or you can use a different granularity level:
>
> - with ArgoCD: `service` is an ArgoCD Application
> - with native k8s monitoring: `service` is a Container (or a Deployment, StatefulSet, ...)
>
> This is the strategy used by CDviz's built-in transformers.
