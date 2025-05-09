<script setup>
import Faq from './landing/SectionFaq.vue';
import Hero from './landing/SectionHero.vue';
import How from './landing/SectionHow.vue';
import Pricing from './landing/SectionPricing.vue';
import Why from './landing/SectionWhy.vue';
</script>

<template>
  <main class="px-sm">
    <Hero/>
    <Why/>
    <!-- <section class="my-xl md:my-2xl">
      <a id="features"></a>
    </section> -->
    <How/>
    <Pricing/>
    <!-- <section class="my-xl md:my-2xl"> -->
      <!-- More social proof -->
      <!-- <a id="testimonials"></a> -->
      <!-- <div>No testimonials yet, but we love to hear from you!</div> -->
    <!-- </section> -->
    <Faq/>
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
