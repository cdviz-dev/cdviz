<script setup>
import Faq from "./landing/SectionFaq.vue";
import Hero from "./landing/SectionHero.vue";
import How from "./landing/SectionHow.vue";
import Plans from "./landing/SectionPlans.vue";
import Pricing from "./landing/SectionPricing.vue";
import Why from "./landing/SectionWhy.vue";
</script>

<template>
  <!-- Skip navigation link for keyboard users -->
  <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">Skip to main content</a>
  
  <main class="px-sm" role="main" aria-label="CDviz product information and features" id="main-content">
    <Hero />
    <Why />
    <!-- <section class="my-xl md:my-2xl">
      <a id="features"></a>
    </section> -->
    <How />
    <Pricing />
    <Plans />
    <!-- <section class="my-xl md:my-2xl"> -->
    <!-- More social proof -->
    <!-- <a id="testimonials"></a> -->
    <!-- <div>No testimonials yet, but we love to hear from you!</div> -->
    <!-- </section> -->
    <Faq />
    <!-- <a id="featured-posts"></a>
    <section>
      TODO add featured posts
      TODO embed a video demo of cdviz-collector
    </section> -->
    <section class="my-xl md:my-2xl">
      <!-- End & Last CTA -->
      <a id="end"></a>
      <div class="text-center italic text-lg">Thank you!</div>
    </section>
  </main>
</template>
