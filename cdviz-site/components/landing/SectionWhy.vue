<script setup>
import H2 from './H2.vue';
import H3 from './H3.vue';
</script>
<template>
<section class="my-xl md:my-2xl bg-secondary/5 py-16 rounded-2xl"> <!-- Added background -->
  <a id="why"></a>
  <H2>Why Choose CDviz?</H2>
  <div class="flex flex-col items-stretch gap-8 md:flex-row max-w-5xl mx-auto">
    <div class="bg-white dark:bg-secondary/20 w-full rounded-xl p-6 shadow-sm">
      <H3>Enhanced Visibility</H3>
      <p class="leading-relaxed">
        Seamlessly annotate your dashboards with pipeline events and deployment tracking,
        giving you clear insights into your software delivery process.
      </p>
    </div>
    <div class="bg-white dark:bg-secondary/20 w-full rounded-xl p-6 shadow-sm">
      <H3>Seamless Integration</H3>
      <p class="leading-relaxed">
        Seamlessly integrate CDviz with your existing tools and workflows,
        providing a unified view of your software delivery process.
      </p>
    </div>
    <div class="bg-white dark:bg-secondary/20 w-full rounded-xl p-6 shadow-sm">
      <H3>Tools Collaboration</H3>
      <p class="leading-relaxed">
        Build an event driven software factory (reduce cost &amp; increase
        flexibility) without losing the benefits of a centralized dashboard.
      </p>
    </div>
    <!-- <p>
      You want to know what is happening in your pipeline, and how it
      affects your software factory, your customers, and your business.
    </p> -->
    <!-- <p class="bg-secondary/20 w-full rounded-xl p-sm leading-normal md:p-md">
      You want to annotate your dashboards with events from your software
      pipeline (where and when a software version was deployed).
    </p> -->
    <!-- <p>
      You want to see the evolution of your pipelines over time, and
      understand what is going on.
    </p> -->
    <!-- <p class="bg-secondary/20 w-full rounded-xl p-sm leading-normal md:p-md">
      You want to enhance your "software factory / platform" with a
      dashboard, and a set of metrics.
    </p>
    <p class="bg-secondary/20 w-full rounded-xl p-sm leading-normal md:p-md">
      You want an event driven software factory (reduce cost &amp; increase
      flexibility) without losing the benefits of a centralized dashboard.
    </p> -->
  </div>
</section>
</template>
