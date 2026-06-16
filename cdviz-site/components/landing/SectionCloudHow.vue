<script setup>
import H2 from "./H2.vue";

const steps = [
  {
    n: "1",
    title: "Connect GitHub or GitLab",
    body: "Authorize CDviz Cloud to read your CI activity. One click per provider — that's the whole setup.",
  },
  {
    n: "2",
    title: "We read your pipeline history",
    body: "CDviz pulls recent runs so your dashboards are populated from day one — not blank while you wait for the next push.",
  },
  {
    n: "3",
    title: "See reliability across every repo",
    body: "One view ranks what fails most, where, and whether it's trending up. Built on the open CDEvents standard.",
  },
];
</script>

<template>
  <section
    id="how"
    class="space-section bg-[var(--vp-c-bg-soft)] border-t border-b border-secondary/15 rounded-2xl"
  >
    <div class="text-center max-w-[48ch] mx-auto mb-2xl">
      <H2>From connect to clarity in minutes.</H2>
      <p class="text-text/60 mt-md">
        No agents to install, no pipelines to rewrite, no devops on standby.
      </p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="step in steps" :key="step.n" class="relative pt-2">
        <div class="cdviz-mono font-bold text-primary border border-primary/40 w-9 h-9 rounded-full flex items-center justify-center mb-md text-sm">
          {{ step.n }}
        </div>
        <h3 class="cdviz-h3 mb-sm">{{ step.title }}</h3>
        <p class="text-text/60 text-sm">{{ step.body }}</p>
      </div>
    </div>
  </section>
</template>
