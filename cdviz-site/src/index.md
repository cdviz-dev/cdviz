---
title: Monitor Your Software Delivery Pipeline With Confidence
description: Open-source event-driven CI/CD platform built on CDEvents. Collect software delivery events, visualize DORA metrics and deployment timelines in Grafana, and trigger automated workflows — observe your pipelines before acting on them.
layout: home
markdownStyles: false

faq:
  - q: What is CDviz and how does it work?
    a: |
      CDviz is an open-source CI/CD observability platform built on CDEvents,
      the CD Foundation-backed standard for software delivery. It collects events
      from your pipelines (GitHub, GitLab, Kubernetes, and more), stores them in
      PostgreSQL or ClickHouse, and surfaces DORA metrics, deployment timelines,
      and test results in Grafana dashboards. The same event stream can then
      trigger automated workflows — observe first, automate when you're ready.
  - q: Is it free to use?
    a: |
      Yes. CDviz is open-source (Apache 2.0) and free to self-host.
      Pro and Enterprise features are also free during the current beta.
      <br/>
      A commercial support plan is available for teams that want help with
      setup, maintenance, or custom integrations. Subscriptions help fund
      ongoing development. <a href="/pricing">See pricing details →</a>
  - q: What is CDviz's commitment to Open Source?
    a: |
      At CDviz, we firmly believe in Open Source and collaborative development.
      The cdviz-collector is licensed under Apache License v2 (from v0.15+). The database and
      Grafana components are under Apache License v2. For details, see our
      <a href="/compliance">Compliance Page</a>.

# hero:
#   name: VitePress
#   text: Vite & Vue powered static site generator.
#   tagline: Lorem ipsum...
#   image:
#     src: /logo.png
#     alt: VitePress
#   actions:
#     - theme: brand
#       text: Get Started
#       link: /guide/what-is-vitepress
#     - theme: alt
#       text: View on GitHub
#       link: https://github.com/vuejs/vitepress
# features:
#   - icon: 🛠️
#     title: Simple and minimal, always
#     details: Lorem ipsum...
#   - icon:
#       src: /cool-feature-icon.svg
#     title: Another cool feature
#     details: Lorem ipsum...
#   - icon:
#       dark: /dark-feature-icon.svg
#       light: /light-feature-icon.svg
#     title: Another cool feature
#     details: Lorem ipsum...
---

<script setup>
import LandingPage from '../components/LandingPage.vue'
</script>

<LandingPage />
