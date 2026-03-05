---
title: "CDEvents in Action #7: One Commit, Six CDEvents"
description: "Follow a single feature from git push to production and see every CDEvent it generates — the full pipeline timeline that CDviz makes visible."
tags: ["cdevents", "devops", "cicd", "kubernetes", "observability", "pipeline"]
author: "David B."
author_github: "davidb31"
date: "2026-03-25"
target_audience: "DevOps Engineers, Platform Engineers, Engineering Managers"
reading_time: "4 minutes"
series: "CDEvents in Action"
series_part: 7
status: draft
# the content is wrong and should be rewrite because
# it's based on a wrong assumption that every events share
# the same "subject.id" and are on the same thread
---

# CDEvents in Action #7: One Commit, Six CDEvents

_No new tooling in this episode. Just a walk through what happens when a developer pushes a fix — and what the integrations from the previous episodes let you see._

## The Scenario

A developer pushes a bug fix to `main`. The pipeline runs. The fix lands in production. Nothing unusual.

Here's every CDEvent that fires, in order.

## The Chain

**1. `pipeline.run.started`**

_Triggered by_: GitHub Actions (→ [Episode #3](/blog/20251007-episode-3-cicd-integration))

The CI job starts. CDviz records: who pushed, what commit SHA, which branch, when it started.

---

**2. `artifact.published`**

_Triggered by_: `cdviz-collector send` in your build job (→ [Episode #2](/blog/20251001-episode-2-send-first-cdevent))

The Docker image is built and pushed to the registry. CDviz records: image tag, registry URL, build duration.

---

**3. `service.deployed` — staging**

_Triggered by_: kubewatch watching the staging namespace (→ [Episode #6](/blog/20260318-episode-6-kubewatch-helm-recipe))

The pipeline deploys to staging. CDviz records: deployment name, namespace, image version. No pipeline change needed — kubewatch picked it up automatically.

---

**4. `testrun.finished`**

_Triggered by_: `cdviz-collector send` in your test job (→ [Episode #3](/blog/20251007-episode-3-cicd-integration))

Integration tests run against staging. CDviz records: pass/fail, test count, duration.

---

**5. `service.deployed` — production**

_Triggered by_: ArgoCD webhook transformer (→ [Episode #4](/blog/20251020-episode-4-webhook-transformers))

ArgoCD syncs the new image to production. CDviz records: git commit, author, sync status — with the rich context ArgoCD provides.

---

**6. `pipeline.run.finished`**

_Triggered by_: GitHub Actions (→ [Episode #3](/blog/20251007-episode-3-cicd-integration))

The pipeline completes. CDviz records: overall outcome, total duration.

---

## What CDviz Shows You

Those six events share a common thread: the service name (subject ID). CDviz uses that to build a timeline — one view showing the full journey from commit to production, with timestamps at each step.

You can see at a glance:

- How long each stage took
- Which commit is running in staging vs production right now
- Whether any manual deployment happened alongside the automated one

That last point matters. If someone ran `helm upgrade payment-api` on staging while the pipeline was in flight, kubewatch caught it as a separate `service.deployed` event. It appears in the timeline next to the automated one. You can see the collision — something that would have been invisible before.

## The Pattern, Not the Tools

The specific tools here are GitHub Actions, ArgoCD, kubewatch. Your stack is probably different. But the pattern is the same:

- Direct integrations (episodes #2–3) for events your pipeline controls
- Passive monitoring (episodes #4, #6) for events that happen outside the pipeline
- CDEvents as the common format that makes all of them comparable

Any CI system, any deployment tool, any cluster — the chain looks the same in CDviz.

---

_That's the series so far. If you've followed along from Episode #0, you now have full SDLC observability across CI/CD, deployments, and Kubernetes — with no single point of failure in your event collection._
