<script setup>
import H2 from './H2.vue';
</script>
<template>
  <section class="my-xl md:my-2xl bg-secondary/5 py-16 rounded-2xl">
    <a id="faq"></a>
    <H2>Frequently Asked Questions</H2>
    <div class="max-w-3xl mx-auto">
      <details class="cursor-pointer transition-all duration-300 hover:scale-105 hover:cursor-pointer hover:shadow-lg bg-white dark:bg-secondary/20 my-4 rounded-xl p-6 shadow-sm">
        <summary class="text-xl font-semibold cursor-pointer">Is it free to use?</summary>
        <div class="pt-4 text-text/80 space-y-4">
          Yes, you can use the Open Source components for free.</br>
          No, self-hosting is not free, as you have spend time and money on
          configuration, maintenance, and support of your own
          infrastructure.
          <br/>
          No, some components could not be available for free.
        </div>
    </details>
    <details class="cursor-pointer transition-all duration-300 hover:scale-105 hover:cursor-pointer hover:shadow-lg bg-white dark:bg-secondary/20 my-4 rounded-xl p-6 shadow-sm">
      <summary class="text-xl font-semibold cursor-pointer">What is the plan for Saas?</summary>
        <div class="pt-4 text-text/80 space-y-4">
          We are currently working on a SaaS plan. We don't know yet what
          will provide in term of features and pricing (plan). We are open
          to discussions and to partnerships.
        <br/>
          If you are interested in a SaaS plan, please
          <a href="mailto:contact@cdviz.io">contact us</a>.
        </div>
      </details>
      <details class="cursor-pointer transition-all duration-300 hover:scale-105 hover:cursor-pointer hover:shadow-lg bg-white dark:bg-secondary/20 my-4 rounded-xl p-6 shadow-sm">
        <summary class="text-xl font-semibold cursor-pointer">
          What is the relationship between CDviz and cdevents?
        </summary>
          <div class="pt-4 text-text/80 space-y-4">
            CDviz is a set of components to provide a view of which version of
            services are deployed and which environment, what test ran,...
            CDviz components are built on top of cdevents. CDviz'team is part
            of the cdevents community.
          </div>
      </details>
      <details class="cursor-pointer transition-all duration-300 hover:scale-105 hover:cursor-pointer hover:shadow-lg bg-white dark:bg-secondary/20 my-4 rounded-xl p-6 shadow-sm">
        <summary class="text-xl font-semibold cursor-pointer">
          Why do dashboard tools, like Grafana, have access (read-only) to the
          DB (PostgreSQL), and NOT go through an API (micro)service?
        </summary>
        <div class="pt-4 text-text/80 space-y-4">
          <ul class="list-disc pl-4">
            <li>The data is your value, not the service.</li>
            <li>
              Allow dashboards to use the full query power of SQL to query
              data, and to plug any analytics tools, no incomplete, frustrated
              custom query language.
            </li>
            <li>
              Allow Data Ops to split the DB with read-only replicas if
              needed,...
            </li>
          </ul>
        </div>
      </details>
    </div>
  </section>
</template>
