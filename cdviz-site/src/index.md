---
titleTemplate: Monitor Your Software Delivery Pipeline With Confidence - CDviz
description: CDviz is a collection of components designed to provide visibility into deployed service versions, associated environments, testing activities, and related information.
layout: home
markdownStyles: false

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
faq:
  - q: "Getting Started & Product Overview"
    a: ""
  - q: What is CDviz and how does it work?
    a: |
      CDviz is a collection of components designed to provide visibility into deployed
      service versions, associated environments, testing activities, and related information.
      It collects events from your CI/CD pipeline, stores them in a database, and provides
      dashboards and analytics to help you understand your software delivery process.
  - q: What is the relationship between CDviz and CDEvents?
    a: |
      CDviz is built upon CDEvents, the Cloud Native standard for delivery events.
      The CDviz team is an active member of the CDEvents community, ensuring
      compatibility with the industry standard for continuous delivery event data.
  - q: Is it free to use?
    a: |
      Yes, the open-source components can be used at no cost, except your time.
      Self-hosting involves expenses for configuration, maintenance, and infrastructure support.
      <br/>
      However, open source projects need community support and sustainable funding to thrive.
      Without contributions—whether through paid plans, community involvement, or enterprise
      licenses—continuous improvement and long-term maintenance wouldn't be possible.
      <br/>
      Some enterprise components may require a commercial license.

  - q: "Technical Architecture"
    a: ""
  - q: Why do dashboard tools like Grafana access the database directly instead of through an API?
    a: |
      <ul class="list-disc pl-4">
        <li>Your data is the value, not the service layer.</li>
        <li>
          Dashboards can use the full power of SQL to query data and integrate
          with any analytics tools without limitations of a custom API.
        </li>
        <li>
          DataOps teams can easily scale with read-only replicas and
          standard database optimization techniques.
        </li>
      </ul>

  - q: "Licensing & Business Model"
    a: ""
  - q: What is CDviz's commitment to Open Source?
    a: |
      At CDviz, we firmly believe in Open Source and collaborative development.
      The cdviz-collector core is licensed under AGPL v3. The database and
      Grafana components are under Apache License v2. For details, see our
      <a href="/compliance">Compliance Page</a>.
  - q: When should I consider a Commercial license?
    a: |
      Consider a commercial license if you cannot fulfill the obligations of
      "copyleft" licenses like AGPL v3, or if you need enterprise features
      and professional support. The commercial license provides development
      rights without open source obligations plus access to our support services.

  - q: "Pricing & Plans"
    a: ""
  - q: What is the roadmap for SaaS?
    a: |
      We are developing a SaaS plan but don't have final details on features
      and pricing yet. We're open to discussions and partnerships.
      <br/>
      If you're interested in SaaS, please <a href="/contact">contact us</a>.
  - q: Can I continue using my commercial license after it expires?
    a: |
      No. Commercial license rights expire when the subscription ends or is canceled.
      You must maintain an active subscription to continue using the commercial license.
  - q: Are prices inclusive of taxes?
    a: |
      Prices exclude applicable sales tax, VAT, and withholdings.
      These obligations are the buyer's responsibility.

faq_off:
  - q: What are the licensing options available for the cdviz-collector ?
    a: |
      <ul>
        <li>Commercial License</li>
        <li>GNU AGPL v3 Open Source license</li>
      </ul>
      For more information please see our <a href="compliance">Compliance Page</a>.
  - q: Is support included with the subscription?
    a: |
      A commercial license includes direct-to-engineering support delivered through ???TBD???.
---

<script setup>
import LandingPage from '../components/LandingPage.vue'
</script>

<LandingPage />
