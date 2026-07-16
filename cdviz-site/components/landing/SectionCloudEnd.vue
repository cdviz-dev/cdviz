<script setup>
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
        <a
          href="https://app.cdviz.dev"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-background font-semibold hover:scale-105 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
          aria-label="Start CDviz Cloud free trial"
        >
          <span class="icon-[lucide--rocket] h-5 w-5" aria-hidden="true"></span>
          Start free trial
        </a>
      </div>

      <p class="text-sm text-text/60 mb-lg">
        Prefer to run it yourself? The stack is Apache 2.0 —
        <a href="/docs" class="text-primary hover:underline">see the docs →</a>
      </p>
    </template>
  </End>
</template>
