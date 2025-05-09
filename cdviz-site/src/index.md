---
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
      CDviz is a set of components to provide a view of which version of
      services are deployed and which environment, what test ran,...
      CDviz components are built on top of cdevents. CDviz'team is part
      of the cdevents community.
  - q:  Why do dashboard tools, like Grafana, have access (read-only) to the DB (PostgreSQL), and NOT go through an API (micro)service?
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
      At CDviz, we firmly believe in the philosophy of Open Source and collaborative development. The cdviz-collector core is licensed under Affero General Public License Version 3 (AGPLv3). The cdviz components for database and grafana are under the Apache Software Licence V2. To understand more, we recommend visiting our <a href="/compliance">Compliance Page</a>.
  - q: Is it free to use?
    a: |
      Yes, you can use the Open Source components for free.
      No, self-hosting is not free, as you have spend time and money on
      configuration, maintenance, and support of your own
      infrastructure.
      <br/>
      No, some components could not be available for free.
  - q: Why should I choose a Commercial license when an Open Source license is available?
    a: |
      Any use of Open Source software comes with rights and obligations. As important as these are for a thriving community, there are some developers and/or organizations who don’t wish to use the software under the Open Source licensing terms and thus would prefer a commercial license. CDviz intends to support both perspectives with the Open Source licensing and a commercial license which provides exceptions to the obligations found in the Open Source licenses.
      <br/>
      Open Source licensing is ideal for use cases where all obligations under “copyleft” licenses can be met. Where those obligations cannot be met, we suggest getting a commercial license.
      <br/>
      The commercial CDviz license gives you the rights to create software on commercial terms without any Open Source license obligations. With the commercial license you also have access to CDviz’s professional support experience (see <a href="/#pricing">Pricing</a>).
  - q: Why should I pay for Open Source?
    a: |
      While Open Source provides a number of benefits, it also comes with certain restrictions.
      Anyway using Open Source is not free, you pay with time.
  - q: Can I continue to use my commercial license after it has expired?
    a: |
      No. You are not permitted to use the commercial license if the subscription is not active. The rights to continue using CDviz software under the commercial license expire when the license term expires or the subscription is canceled.

faq_off:
  - q: Are your prices inclusive of local sales tax, VAT, and withholding obligations?
    a: |
      The prices shown on this page do not include any applicable state and local sales tax or applicable withholdings. Those are the responsibility of the buyers.
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
