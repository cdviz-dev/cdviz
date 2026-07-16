<script setup>
import CloudEnd from "./landing/SectionCloudEnd.vue";
import CloudFeatures from "./landing/SectionCloudFeatures.vue";
import CloudHero from "./landing/SectionCloudHero.vue";
import CloudHow from "./landing/SectionCloudHow.vue";
import CloudPricing from "./landing/SectionCloudPricing.vue";
import CloudProblem from "./landing/SectionCloudProblem.vue";
import CloudTrust from "./landing/SectionCloudTrust.vue";
import Faq from "./landing/SectionFaq.vue";
</script>

<template>
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
  >Skip to main content</a>

  <main
    class="px-sm"
    role="main"
    aria-label="CDviz Cloud — managed CI/CD visibility"
    id="main-content"
  >
    <CloudHero />
    <CloudTrust />
    <CloudProblem />
    <CloudHow />
    <CloudFeatures />
    <CloudPricing />
    <Faq />
    <CloudEnd />
  </main>
</template>
