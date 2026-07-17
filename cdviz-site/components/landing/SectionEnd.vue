<script setup>
import Btn from "./Btn.vue";
import { CTA_DEMO, CTA_TRIAL } from "./ctas.js";
</script>

<template>
  <section class="space-section w-full" aria-labelledby="end-heading">
    <a id="end"></a>
    <div class="w-full max-w-6xl mx-auto text-center">
      <slot name="pitch">
        <h2 id="end-heading" class="text-2xl sm:text-3xl font-bold mb-4">
          Ready to See Your Pipeline?
        </h2>
        <p class="text-base sm:text-lg text-text/80 mb-lg leading-relaxed">
          Self-host free forever — open-source, no lock-in.<br />
          Or let us run it: CDviz Cloud, 14-day free trial, no credit card.
        </p>

        <!-- Shared CTAs (see ctas.js) — identical to the hero and the cloud page -->
        <div class="flex flex-wrap justify-center gap-4 mb-lg">
          <Btn v-bind="CTA_TRIAL" primary />
          <Btn v-bind="CTA_DEMO" />
        </div>
      </slot>

      <!-- Secondary contact line -->
      <p class="text-sm text-text/60">
        Have a use case, questions, or ideas? →
        <a href="mailto:contact@cdviz.dev" class="text-primary hover:underline"
        >contact@cdviz.dev</a>
      </p>

      <!-- Social links -->
      <div class="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-secondary/20">
        <a
          href="https://github.com/cdviz-dev"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="CDviz on GitHub"
          class="text-text/50 hover:text-primary transition-colors duration-200"
        >
          <span
            class="icon-[simple-icons--github] h-5 w-5 block"
            aria-hidden="true"
          ></span>
        </a>
        <a
          href="https://www.youtube.com/@CDviz"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="CDviz on YouTube"
          class="text-text/50 hover:text-primary transition-colors duration-200"
        >
          <span
            class="icon-[simple-icons--youtube] h-5 w-5 block"
            aria-hidden="true"
          ></span>
        </a>
        <a
          href="https://dev.to/davidb31"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="CDviz on dev.to"
          class="text-text/50 hover:text-primary transition-colors duration-200"
        >
          <span
            class="icon-[simple-icons--devdotto] h-5 w-5 block"
            aria-hidden="true"
          ></span>
        </a>
        <a
          href="mailto:contact@cdviz.dev"
          aria-label="Email CDviz"
          class="text-text/50 hover:text-primary transition-colors duration-200"
        >
          <span
            class="icon-[lucide--mail] h-5 w-5 block"
            aria-hidden="true"
          ></span>
        </a>
      </div>
    </div>
  </section>
</template>
