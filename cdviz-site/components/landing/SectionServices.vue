<script setup>
import Btn from "./Btn.vue";

const services = [
  {
    title: "Custom transformer development",
    body: "Bespoke VRL transformers or connectors for sources/sinks specific to your environment.",
  },
  {
    title: "Custom dashboards",
    body: "Tailored Grafana dashboards and reporting beyond the provided components.",
  },
  {
    title: "Onboarding & integration help",
    body: "Hands-on setup, tuning, and architecture guidance for your delivery stack.",
  },
];
</script>

<template>
  <section class="space-section bg-[var(--vp-c-bg-soft)] border-t border-b border-secondary/15 rounded-2xl">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-9 items-center">
      <div>
        <p class="cdviz-mono text-secondary text-xs uppercase tracking-widest mb-md">Services</p>
        <h2 class="cdviz-h2 mb-md">Need something bespoke?</h2>
        <p class="text-text/70 mb-sm">
          The plans above are self-serve and fixed-price. For work that's specific to your stack,
          that's consulting — billed at a day rate, scoped with you. This is the one place where it
          makes sense to talk first.
        </p>
        <Btn href="mailto:contact@cdviz.dev" class="mt-sm">Let's talk →</Btn>
      </div>
      <div class="flex flex-col gap-4">
        <div
          v-for="s in services"
          :key="s.title"
          class="border border-secondary/20 rounded-xl p-5 bg-background"
        >
          <h3 class="text-base font-semibold text-text mb-1 cdviz-mono">{{ s.title }}</h3>
          <p class="text-sm text-text/60">{{ s.body }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
