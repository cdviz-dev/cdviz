<script setup>
import Hero from "./landing/SectionHero.vue";
import How from "./landing/SectionHow.vue";
import PanelSamples from "./landing/SectionPanelSamples.vue";
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
    <Hero />
    <Why />
    <PanelSamples />
    <!-- <section class="my-xl md:my-2xl">
      <a id="features"></a>
    </section> -->
    <How />
    <!-- <section class="my-xl md:my-2xl"> -->
    <!-- More social proof -->
    <!-- <a id="testimonials"></a> -->
    <!-- <div>No testimonials yet, but we love to hear from you!</div> -->
    <!-- </section> -->
    <!-- <a id="featured-posts"></a>
    <section>
      TODO add featured posts
      TODO embed a video demo of cdviz-collector
    </section> -->
    <section class="my-xl md:my-2xl">
      <!-- End & Last CTA -->
      <a id="end"></a>
      <div class="text-center italic text-lg">Thank you!</div>
      <div class="flex items-center justify-center gap-6 mt-6">
        <a
          href="https://github.com/cdviz-dev"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="CDviz on GitHub"
          class="text-text/60 hover:text-primary transition-colors duration-200"
        >
          <span class="icon-[simple-icons--github] h-6 w-6 block" aria-hidden="true"></span>
        </a>
        <a
          href="https://www.youtube.com/@CDviz"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="CDviz on YouTube"
          class="text-text/60 hover:text-primary transition-colors duration-200"
        >
          <span class="icon-[simple-icons--youtube] h-6 w-6 block" aria-hidden="true"></span>
        </a>
        <a
          href="https://dev.to/davidb31"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="CDviz on dev.to"
          class="text-text/60 hover:text-primary transition-colors duration-200"
        >
          <span class="icon-[simple-icons--devdotto] h-6 w-6 block" aria-hidden="true"></span>
        </a>
        <a
          href="mailto:contact@cdviz.dev"
          aria-label="Email CDviz"
          class="text-text/60 hover:text-primary transition-colors duration-200"
        >
          <span class="icon-[lucide--mail] h-6 w-6 block" aria-hidden="true"></span>
        </a>
      </div>
    </section>
  </main>
</template>
