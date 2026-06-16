---
title: Monitor Your Software Delivery Pipeline With Confidence
description: Open-source event-driven CI/CD platform built on CDEvents. Collect software delivery events, visualize DORA metrics and deployment timelines in Grafana, and trigger automated workflows — observe your pipelines before acting on them.
layout: home
markdownStyles: false

faq:
  - q: Is it really free to use?
    a: |
      Yes. The open-source components — collector, database schemas, and Grafana dashboards —
      are free forever under Apache 2.0 and free to self-host. Self-hosting involves your own
      infrastructure costs. <a href="/pricing">See all pricing options →</a>
  - q: What's the difference between Cloud and Pro?
    a: |
      <strong>Cloud</strong> is a hosted, managed service for small teams who don't want to run
      infrastructure — focused on cross-repo pipeline visibility at €20/month.
      <strong>Pro</strong> is for organizations that want to self-host with professional support
      and additional integrations (GitLab, Jenkins, ...) at €200/month.
  - q: What is CDviz's commitment to open source?
    a: |
      The collector (from v0.15+), database schemas, and Grafana components are all licensed
      under Apache 2.0. You can always keep using the open-source components — even if a
      commercial subscription ends. No lock-in.
  - q: How does it relate to CDEvents?
    a: |
      CDviz is built on <a href="https://cdevents.dev">CDEvents</a>, the CD Foundation standard
      for software delivery events. The team is an active member of the CDEvents working group,
      so your event data follows an open, portable standard.

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
