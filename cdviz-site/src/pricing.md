---
title: Pricing & Plans
description: Transparent pricing for CDviz. Community free forever, Cloud at €20/month, Pro at €200/month. No "contact us" to get started.
layout: home
markdownStyles: false

faq:
  - q: Which plan should I pick?
    a: |
      If you have no devops and want it to just work, start with <strong>Cloud</strong> —
      hosted, focused on cross-repo pipeline reliability, free for 14 days.
      If you want to self-host and need extra integrations (GitLab, Jenkins, ...)
      plus support, choose <strong>Pro</strong>.
      If you're a hands-on team happy to self-host the open-source stack,
      <strong>Community</strong> is free forever.
  - q: Why is there no "contact us" to buy?
    a: |
      Because every plan is a defined package with a price you can see and purchase directly.
      We only ask you to talk to us for genuinely bespoke work — custom development or
      consulting — which lives under Services, not the plans.
  - q: Can I keep using CDviz if I cancel?
    a: |
      Yes. The open-source components (collector, database schemas, Grafana components) are
      Apache 2.0 and yours to keep forever. Cancelling a paid plan ends managed hosting (Cloud)
      or support and the optional commercial license (Pro) — never your access to the open source.
  - q: What does Cloud actually show me?
    a: |
      A cross-repo view of which pipelines fail, which fail repeatedly, and whether reliability
      is trending worse — across all your connected GitHub and GitLab repos. On connect, we
      import ~30 days of history so the dashboard is useful immediately.
  - q: How does this relate to CDEvents?
    a: |
      CDviz is built on <a href="https://cdevents.dev">CDEvents</a>, the CD Foundation standard
      for delivery events. Your event data follows an open, portable standard — no lock-in.
  - q: Are prices inclusive of taxes?
    a: |
      Prices exclude VAT and applicable sales tax. Cloud and Pro are billed per organization,
      not per seat.
---

<script setup>
import PricingPage from '../components/PricingPage.vue'
</script>
<h1 style="opacity:0; margin:0; padding:0">Pricing, plans, features</h1>
<PricingPage />
