<script setup>
import End from "./landing/SectionEnd.vue";
import Faq from "./landing/SectionFaq.vue";
import Hero from "./landing/SectionHero.vue";
import How from "./landing/SectionHow.vue";
import PanelSamples from "./landing/SectionPanelSamples.vue";
import Problem from "./landing/SectionProblem.vue";
import Stats from "./landing/SectionStats.vue";
import Why from "./landing/SectionWhy.vue";
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
    aria-label="CDviz product information and features"
    id="main-content"
  >
    <!-- AIDA funnel: Attention → Interest → Desire → Action -->
    <Hero />
    <Problem />
    <Stats />
    <PanelSamples />
    <Why />
    <How />
    <Faq />
    <End />
  </main>
</template>
