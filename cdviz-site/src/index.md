---
title: Monitor Your Software Delivery Pipeline With Confidence
description: Open-source event-driven CI/CD platform built on CDEvents. Collect software delivery events, visualize DORA metrics and deployment timelines in Grafana, and trigger automated workflows — observe your pipelines before acting on them.
layout: home
markdownStyles: false

faq:
  - q: How does CDviz help improve software delivery?
    a: |
      CDviz gives you unified, real-time visibility across your CI/CD tools — GitHub, GitLab,
      ArgoCD, Kubernetes, and more. See what version runs where, when it was deployed, and track
      DORA metrics and deployment timelines in Grafana, without manually correlating data across
      tools. The same event stream can also trigger downstream automation.
      <a href="/docs/">Explore the docs →</a>
  - q: What makes CDviz different from other engineering analytics platforms?
    a: |
      CDviz is event-driven (push) on the open <a href="https://cdevents.dev">CDEvents</a>
      standard instead of polling proprietary APIs. It's open-source (Apache 2.0) and
      self-hostable with no lock-in: your data stays in your own PostgreSQL, queryable with
      plain SQL and Grafana. And it doubles as an automation backbone, not just dashboards.
      <a href="/docs/alternatives/">Compare with alternatives →</a>
  - q: What services does CDviz offer?
    a: |
      Three options: the <strong>open-source</strong> components (collector, database schema,
      Grafana dashboards) — free to self-host; <strong>CDviz Cloud</strong>, a hosted, managed
      service at €20/month; and <strong>CDviz Pro</strong>, self-hosted with professional
      support and additional integrations at €200/month.
      <a href="/pricing">See pricing →</a>
  - q: What are the key features of CDviz?
    a: |
      Event collection from GitHub, GitLab, ArgoCD, Kubernetes, and custom webhooks;
      normalization to CDEvents; storage in PostgreSQL + TimescaleDB; Grafana dashboards for
      DORA metrics, deployments, incidents, and artifact timelines; and event-driven automation
      via HTTP, NATS, or Kafka sinks. <a href="/docs/">Explore the docs →</a>
  - q: Where is CDviz located?
    a: |
      CDviz is built by Alchim312, a French company. CDviz Cloud data is hosted and operated
      in Europe — see our <a href="/pro/privacy">privacy policy</a>.
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
