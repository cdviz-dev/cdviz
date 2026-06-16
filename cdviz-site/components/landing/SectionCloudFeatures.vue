<script setup>
import H2 from "./H2.vue";

const features = [
  {
    badge: "Core",
    badgeClass: "bg-primary/12 text-primary",
    title: "Cross-repo pipeline reliability",
    body: "Failure rates, chronically broken and intermittent pipelines, and trends — ranked across all your connected repos. The thing you came for.",
  },
  {
    badge: "Core",
    badgeClass: "bg-primary/12 text-primary",
    title: "Pipeline duration & trends",
    body: 'Spot which pipelines are slow and which are creeping slower over time, before "CI feels sluggish" becomes a sprint-killer.',
  },
  {
    badge: "Included",
    badgeClass: "bg-primary/12 text-primary",
    title: "Deployment & version visibility",
    body: "Know which version is running where, across services — without infra permissions or hunting through dashboards.",
  },
  {
    badge: "Coming soon",
    badgeClass: "bg-secondary/14 text-secondary",
    title: "Test failures & flaky detection",
    body: "Surface failing and flaky tests across repos. On the roadmap — tell us if you need it first.",
    link: "https://github.com/cdviz-dev/cdviz/discussions",
  },
];
</script>

<template>
  <section id="features" class="space-section">
    <div class="text-center max-w-[48ch] mx-auto mb-2xl">
      <H2>What you get.</H2>
      <p class="text-text/60 mt-md">
        Focused on the questions a small team actually asks — not a 50-panel enterprise suite.
      </p>
    </div>
    <div class="flex flex-col gap-4 max-w-[760px] mx-auto">
      <div
        v-for="f in features"
        :key="f.title"
        class="flex gap-5 items-start border border-secondary/20 rounded-xl p-lg bg-[var(--vp-c-bg-soft)]"
      >
        <span
          class="cdviz-mono text-[11px] font-semibold tracking-wider px-3 py-1 rounded-full whitespace-nowrap self-center shrink-0"
          :class="f.badgeClass"
        >{{ f.badge }}</span>
        <div>
          <h3 class="cdviz-h3 mb-xs">{{ f.title }}</h3>
          <p class="text-text/60 text-sm">
            {{ f.body }}
            <a
              v-if="f.link"
              :href="f.link"
              class="text-primary hover:underline"
              target="_blank"
              rel="noopener"
            >signal interest →</a>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
