<script setup>
import Btn from "./Btn.vue";
import { CTA_TRIAL } from "./ctas.js";
import End from "./SectionEnd.vue";
</script>

<template>
  <End>
    <template #pitch>
      <h2 id="end-heading" class="text-2xl sm:text-3xl font-bold mb-4">
        Stop guessing which pipeline is red.
      </h2>
      <p class="text-base sm:text-lg text-text/80 mb-lg leading-relaxed">
        Connect GitHub or GitLab and see what fails, what's slow, and what's getting worse — across
        every repo you ship. 14-day free trial, no credit card.
      </p>

      <div class="flex flex-wrap justify-center gap-4 mb-md">
        <Btn v-bind="CTA_TRIAL" primary />
      </div>

      <p class="text-sm text-text/60 mb-lg">
        Prefer to run it yourself? The stack is Apache 2.0 —
        <a href="/docs" class="text-primary hover:underline">see the docs →</a>
      </p>
    </template>
  </End>
</template>
