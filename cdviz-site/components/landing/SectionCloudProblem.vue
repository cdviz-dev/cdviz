<script setup>
import H2 from "./H2.vue";

const problems = [
  {
    icon: "!",
    title: "Failures scattered across repos",
    body: "Each repo has its own CI tab. To know what's broken, you check them one by one — or you find out when a teammate complains.",
  },
  {
    icon: "~",
    title: "You can't tell what keeps breaking",
    body: "A pipeline that fails 1 in 3 runs costs you hours of reruns and lost trust. Without failure rates over time, chronic breakage stays invisible.",
  },
  {
    icon: "↑",
    title: "Your CI is quietly getting slower",
    body: "Builds creep from 4 to 11 minutes over a quarter and nobody notices. Per-repo views never show the trend across everything you ship.",
  },
];
</script>

<template>
  <section class="space-section">
    <div class="text-center max-w-[46ch] mx-auto mb-2xl">
      <H2>Your CI is red somewhere. You don't know where.</H2>
      <p class="text-text/60 mt-md">
        With more than a couple of repos, no single person holds the whole picture anymore. The
        failures hide in tabs nobody checks until something ships broken.
      </p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div
        v-for="p in problems"
        :key="p.title"
        class="cdviz-card border border-secondary/20 rounded-xl p-lg bg-[var(--vp-c-bg-soft)] hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_14px_30px_-14px_color-mix(in_oklch,var(--primary)_25%,transparent)] transition-all duration-200"
      >
        <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary cdviz-mono font-bold flex items-center justify-center mb-md text-lg">
          {{ p.icon }}
        </div>
        <h3 class="cdviz-h3 mb-sm">{{ p.title }}</h3>
        <p class="text-text/60 text-sm">{{ p.body }}</p>
      </div>
    </div>
  </section>
</template>
