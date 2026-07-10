---
title: CDviz Cloud — CI/CD visibility for small teams
description: Managed CI/CD observability for small teams. See which pipelines break across all your repos, without running any infrastructure.
layout: home
markdownStyles: false
faq:
  - q: What happens when the 14-day trial ends?
    a: |
      Nothing is charged — no credit card was taken. You pick the Cloud plan
      (€20/month, per organization) to keep going, or simply stop. You can also
      switch to self-hosting the open-source stack at any time.
  - q: What access does CDviz Cloud need to my repositories?
    a: |
      Read-only access to pipeline and workflow events and their metadata (names,
      statuses, durations, timestamps) via a GitHub App or GitLab webhook. CDviz
      never reads your source code and never needs write access to your repositories.
  - q: Where is my data and who can see it?
    a: |
      Pipeline event metadata is stored in our managed database, isolated per
      organization. It's built on the same open-source, CDEvents-based stack you can
      inspect on <a href="https://github.com/cdviz-dev/cdviz">GitHub</a>.
  - q: How is Cloud different from self-hosting CDviz?
    a: |
      Same open-source core. Cloud adds managed hosting, built-in pipeline-reliability
      dashboards, GitLab support, and a 30-day history import on connect — with nothing
      to run. If you stop, you can always self-host the Apache 2.0 components.
      <a href="/pricing">Compare plans →</a>
---

<script setup>
import CloudLandingPage from '../components/CloudLandingPage.vue'
</script>
<h1 style="opacity:0; margin:0; padding:0">CDviz Cloud — managed CI/CD visibility for small teams</h1>
<CloudLandingPage />
