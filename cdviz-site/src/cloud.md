---
title: CDviz Cloud — CI/CD visibility for small teams
description: Managed CI/CD observability for small teams. See which pipelines break across all your repos, without running any infrastructure.
keywords: "CDviz Cloud,managed CI/CD observability,SaaS pipeline monitoring,CI/CD visibility for small teams,hosted DORA metrics"
layout: home
markdownStyles: false
faq:
  - q: Why not just use the CI insights built into GitHub or GitLab?
    a: |
      They stop at the repo boundary. Both show you one project's runs at a time, so nothing tells
      you which pipeline across your whole org fails most, or which one has been getting slower all
      quarter. CDviz ranks reliability and duration across every repo you connect — and across
      GitHub and GitLab together, if you use both.
  - q: The Cloud plan says teams of 1–5. What if we're bigger?
    a: |
      The plan is sized for small teams, but the limit isn't a wall — if you need more seats,
      more repos, or access for a wider org,
      <a href="mailto:contact@cdviz.dev">contact us</a> and we'll sort it out.
  - q: What happens when the 14-day trial ends?
    a: |
      Nothing is charged — no credit card was taken. You pick the Cloud plan
      (€20/month, per organization) to keep going, or simply stop. You can also
      switch to self-hosting the open-source stack at any time.
  - q: What access does CDviz Cloud need to my repositories?
    a: |
      Two things, both under your control. A <strong>webhook</strong> you configure in your
      own GitHub or GitLab organization settings, which pushes pipeline event metadata to
      CDviz — names, statuses, durations, timestamps. And, optionally, a
      <strong>read-only token you create and scope yourself</strong> so CDviz can import
      your last 30 days of history. There is no GitHub App and no OAuth grant. CDviz never
      reads your source code, never needs write access, and you can revoke either one from
      your own settings without contacting us.
  - q: How long does setup actually take?
    a: |
      Around ten minutes for the webhook, which is what gets live data flowing. Importing
      your last 30 days of history is a separate optional step and needs a read-only token
      you create yourself — budget another five minutes. We'd rather tell you that up front
      than have you discover it after signing up.
  - q: Where is my data and who can see it?
    a: |
      Pipeline event metadata is stored in our managed database, isolated per
      organization. It's built on the same open-source, CDEvents-based stack you can
      inspect on <a href="https://github.com/cdviz-dev/cdviz">GitHub</a>.
  - q: How is Cloud different from self-hosting CDviz?
    a: |
      Same open-source core. Cloud adds managed hosting, built-in pipeline-reliability
      dashboards, GitLab support, and an optional 30-day history import — with nothing
      to run. If you stop, you can always self-host the Apache 2.0 components.
      <a href="/pricing">Compare plans →</a>
---

<script setup>
import CloudLandingPage from '../components/CloudLandingPage.vue'
</script>
<CloudLandingPage />
