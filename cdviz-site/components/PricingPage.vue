<script setup>
import Faq from "./landing/SectionFaq.vue";
import Plans from "./landing/SectionPlans.vue";
import Pricing from "./landing/SectionPricing.vue";
</script>

<template>
  <!-- Skip navigation link for keyboard users -->
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
  >Skip to main content</a>

  <main
    class="px-sm"
    role="main"
    aria-label="CDviz pricing and plan information"
    id="main-content"
  >
    <Pricing />
    <Plans />
    <Faq />
    <section class="my-xl md:my-2xl">
      <!-- End & Last CTA -->
      <a id="end"></a>
      <div class="text-center italic text-lg">Thank you!</div>
    </section>
  </main>
</template>
