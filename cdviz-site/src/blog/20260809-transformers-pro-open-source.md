---
title: "GitLab, Bitbucket, Jira, and Jenkins transformers are now open source"
description: "The CDviz team merged transformers-pro into transformers-community: every CDviz transformer is now Apache 2.0 and free to self-host on any plan."
tags: ["cdevents", "open-source", "announcement", "gitlab", "bitbucket", "jira", "jenkins"]
author: "David B."
author_github: "davidB"
date: "2026-08-09"
target_audience: "DevOps Engineers, Platform Engineers"
reading_time: "3 minutes"
status: published
dev_to:
  title: "Why the CDviz team open-sourced its GitLab, Bitbucket, Jira, and Jenkins integrations"
  description: "The CDviz team merged its last private repo into the open-source project, making every CDEvents transformer free to self-host. Here's the reasoning, including the role coding agents played."
  tags: ["opensource", "devops", "ai", "cdevents"]
  canonical_url: "https://cdviz.dev/blog/20260809-transformers-pro-open-source"
---

# GitLab, Bitbucket, Jira, and Jenkins transformers are now open source

_The `transformers-pro` repository has just been merged into [transformers-community](https://github.com/cdviz-dev/transformers-community). Every CDviz transformer (GitHub, GitLab, Bitbucket, Jira, Jenkins, and more) is now Apache 2.0._

## What changed

Until today, the VRL transformers for GitLab, Bitbucket, Jira, and Jenkins lived in a private repository, gated behind the Pro plan. That gate is gone. All transformer source code now lives in one public repo, [transformers-community](https://github.com/cdviz-dev/transformers-community). Three directories were renamed to match the `xxx_webhook` convention (`gitlab_events` became `gitlab_webhook`, `bitbucket_events` became `bitbucket_webhook`, `jira_events` became `jira_webhook`; GitHub's `github_events` kept its existing name). The [Community plan](https://cdviz.dev/pricing) now lists GitLab, Bitbucket, Jira, and Jenkins alongside GitHub, Kubernetes, and ArgoCD.

Nothing else moves. `transformers-pro` had no external users (only CDviz Cloud and internal demos ran off it), so there's no migration guide to write and no breaking change for anyone self-hosting today.

## Why the strategy changed

Open source is the starting point here, but a company still has to earn money. The original strategy was pragmatic: keep the transformers that took real, repeated customer requests to build (GitLab, Bitbucket, Jira, Jenkins) behind Pro for a while, then open-source them later once they'd paid for themselves.

Two things made that strategy obsolete.

First, coding agents have made writing a VRL transformer for a new event source dramatically easier than it used to be (what justified a paywall a year ago is now a reasonable afternoon's work). Holding these back stopped being about protecting real effort and started being just friction.

Second, and more importantly: the whole point of [CDEvents](https://cdevents.dev) is a common format, common rules, common semantics, so tools can talk to each other without everyone reinventing the mapping. That only works if the mappings converge instead of fork. Every team that would otherwise write its own one-off GitLab-to-CDEvents transformer is a missed chance to make one that's shared, reviewed, and improved by everyone who needs it. Keeping transformers private worked against the exact interoperability CDviz exists to promote, so the community sharpening one shared version beats five private, slightly-incompatible ones.

## What Pro is for now

The [Pro plan](https://cdviz.dev/pricing) stops being about which transformers can be used (every transformer is available to everyone now). It's still the plan to reach for when on-premise deployment support, an optional commercial license, or priority (1-business-day) email and Discord support matters.

If you're self-hosting and don't need any of that, [Community](https://cdviz.dev/pricing) gets you the same transformers, forever, for free.

## Try it

Pick any integration on the [integrations page](https://cdviz.dev/docs/integrations/) (GitLab, Bitbucket, and Jira are marked beta, all others are stable) and follow the setup guide. No license key, no plan check, just `[remote.transformers-community]` in your `cdviz-collector.toml`.
