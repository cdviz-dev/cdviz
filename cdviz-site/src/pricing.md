---
titleTemplate: Pricing & Plans - CDviz
description: Transparent pricing for CDviz. Start free with open source, scale with enterprise features.
layout: home
markdownStyles: false

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
      Without contributions—whether through paid subscriptions, community involvement, or donations—
      continuous improvement and long-term maintenance wouldn't be possible.
      <br/>
      Some enterprise features may require a commercial subscription, and subscriptions help
      support the ongoing development of all CDviz components.

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
      The cdviz-collector is licensed under Apache License v2 (from v0.15+). The database and
      Grafana components are under Apache License v2. For details, see our
      <a href="/compliance">Compliance Page</a>.
  - q: When should I consider a Commercial subscription?
    a: |
      Consider a commercial subscription if you need enterprise features,
      professional support, or want to support the ongoing development of CDviz.
      The subscription provides access to additional functionality, our support services,
      and helps fund the maintenance and enhancement of all CDviz components, including open source.
      <br/>
      Note: All open source components use Apache License v2, so no licensing fees are required.

  - q: "Pricing & Plans"
    a: ""
  - q: What is the roadmap for SaaS?
    a: |
      We are developing a SaaS plan but don't have final details on features
      and pricing yet. We're open to discussions and partnerships.
      <br/>
      If you're interested in SaaS, please <a href="/contact">contact us</a>.
  - q: Can I continue using CDviz after my commercial subscription expires?
    a: |
      Yes. You can always use the open source components under Apache License v2.
      However, access to enterprise features and professional support requires an active subscription.
  - q: Are prices inclusive of taxes?
    a: |
      Prices exclude applicable sales tax, VAT, and withholdings.
      These obligations are the buyer's responsibility.

faq_off:
  - q: What licensing is used for cdviz-collector?
    a: |
      cdviz-collector uses Apache License v2 (from v0.15+), which is a permissive open source license.
      No commercial license is needed - you can use it freely for any purpose, including commercial use.
      <br/>
      For more information please see our <a href="compliance">Compliance Page</a>.
  - q: Is support included with the subscription?
    a: |
      A commercial subscription includes direct-to-engineering support delivered through ???TBD???.
---

<script setup>
import PricingPage from '../components/PricingPage.vue'
</script>

<PricingPage />
