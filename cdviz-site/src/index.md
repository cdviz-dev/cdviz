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
  - q: What is the relationship between CDviz and cdevents?
    a: |
      CDviz is a collection of components designed to provide visibility into deployed
      service versions, associated environments, testing activities, and related information.
      The CDviz components are built upon cdevents, and the CDviz team is an active
      member of the cdevents community.
  - q: Why do dashboard tools, like Grafana, have access (read-only) to the DB (PostgreSQL), and NOT go through an API (micro)service?
    a: |
      <ul class="list-disc pl-4">
        <li>The data is your value, not the service.</li>
        <li>
          Allow dashboards to use the full query power of SQL to query
          data, and to plug any analytics tools, no incomplete, frustrated
          custom query language.
        </li>
        <li>
          Allow DataOps to split the DB with read-only replicas if
          needed,...
        </li>
      </ul>
  - q: What is the roadmap for Saas?
    a: |
      We are currently working on a SaaS plan. We don't know yet what
      will provide in term of features and pricing (plan). We are open
      to discussions and to partnerships.
      <br/>
      If you are interested in a SaaS plan, please
      <a href="/contact">contact us</a>.
  - q: What is CDviz's commitment to Open Source?
    a: |
      At CDviz, we firmly believe in the philosophy of Open Source and collaborative development. The cdviz-collector core is licensed under Affero General Public License Version 3 (AGPLv3). The cdviz components for database and Frafana are under the Apache Software License V2. For additional information, please refer to our <a href="/compliance">Compliance Page</a>.
  - q: Is it free to use?
    a: |
      Yes, the open-source components can be used at no cost, excepts your time.
      Please note that self-hosting involves expenses related to configuration,
      maintenance, and ongoing support of your infrastructure.
      <br/>
      Additionally, some components may not be available free of charge.
  - q: Why should I consider obtaining a Commercial license when an Open Source license is available?
    a: |
      Using Open Source software entails certain rights and responsibilities.
      While these are essential for maintaining a collaborative community,
      some developers or organizations may prefer not to operate under Open Source licensing terms.
      In such cases, a commercial license provides an alternative.
      <br/>
      Open Source licensing is suitable for scenarios where all obligations under "copyleft" licenses can be fulfilled. When meeting these requirements is not feasible, we recommend opting for a commercial license.
      <br/>
      The commercial CDviz license grants you the rights to develop software on commercial terms without the obligations associated with Open Source licenses. Additionally, purchasing a commercial license provides access to CDviz’s professional support services (see <a href="/#pricing">Pricing</a>).
  - q: Why should I pay for Open Source?
    a: |
      While open source offers numerous advantages, it also involves certain limitations.
      Additionally, utilizing open source resources requires an investment of time.
  - q: Can I continue to use my commercial license after it has expired?
    a: |
      No. You are not permitted to use the commercial license if the subscription is not active.
      The rights to continue using CDviz software under the commercial license expire when the
      license term expires or the subscription is canceled.
  - q: Are your prices inclusive of local sales tax, VAT, and withholding obligations?
    a: |
      The prices displayed on this page do not include applicable state and local sales tax or
      any required withholdings. These obligations are the responsibility of the buyer.

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
