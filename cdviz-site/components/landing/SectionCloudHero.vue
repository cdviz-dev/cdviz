<script setup>
import Btn from "./Btn.vue";

const repos = [
  { name: "api-gateway", pct: 62, rate: "31%" },
  { name: "billing-svc", pct: 44, rate: "22%" },
  { name: "web-frontend", pct: 30, rate: "15%" },
  { name: "worker-jobs", pct: 18, rate: "9%" },
  { name: "auth-service", pct: 8, rate: "4%" },
];
</script>

<template>
  <section class="space-section text-center" aria-labelledby="cloud-hero-title">
    <p class="cdviz-mono text-secondary text-xs uppercase tracking-widest mb-md">
      CI/CD visibility for small teams
    </p>
    <h1
      id="cloud-hero-title"
      class="cdviz-h1-sketch max-w-[18ch] mx-auto mb-lg"
    >
      See which pipelines break — and
      <span class="text-primary">which keep breaking</span>
      — across all your repos.
    </h1>
    <div class="text-text/70 text-base sm:text-lg max-w-[60ch] mx-auto mb-lg">
      Stop opening every repo's CI tab to find what's red. Connect GitHub or GitLab and get one
      place that shows where your pipelines fail, how often, and whether it's getting worse.
    </div>
    <div class="flex flex-col sm:flex-row gap-4 justify-center mb-sm">
      <Btn href="https://app.cdviz.dev" primary disabled>Available July 2026</Btn>
      <Btn href="https://demo.cdviz.dev/grafana" target="_blank" rel="noopener">
        Try the Live Demo →
      </Btn>
    </div>
    <p class="cdviz-mono text-text/40 text-xs">
      Connect in minutes · <span class="text-text/60 font-medium">No devops needed</span> ·
      Open-source under the hood, no lock-in
    </p>

    <!-- Dashboard mock -->
    <div
      class="max-w-[920px] mx-auto mt-2xl border border-secondary/20 rounded-2xl bg-gradient-to-b from-[var(--vp-c-bg-soft)] to-background shadow-[0_30px_80px_-30px_color-mix(in_oklch,var(--primary)_18%,transparent)] overflow-hidden"
      role="img"
      aria-label="Dashboard showing pipeline failure rates across repositories"
    >
      <!-- Window bar -->
      <div class="flex items-center gap-2 px-4 py-3 border-b border-secondary/20">
        <span class="w-3 h-3 rounded-full bg-secondary/20 inline-block"></span>
        <span class="w-3 h-3 rounded-full bg-secondary/20 inline-block"></span>
        <span class="w-3 h-3 rounded-full bg-secondary/20 inline-block"></span>
        <span class="ml-3 cdviz-mono text-text/30 text-xs"
        >app.cdviz.dev — pipeline reliability</span>
      </div>
      <!-- Dashboard content -->
      <div class="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- KPIs -->
        <div class="border border-secondary/15 rounded-xl p-4 bg-background">
          <div class="cdviz-mono text-text/40 text-[11px] uppercase tracking-wider">
            Failing pipelines
          </div>
          <div class="cdviz-mono text-3xl font-bold text-primary mt-2">7</div>
        </div>
        <div class="border border-secondary/15 rounded-xl p-4 bg-background">
          <div class="cdviz-mono text-text/40 text-[11px] uppercase tracking-wider">
            Avg failure rate
          </div>
          <div class="cdviz-mono text-3xl font-bold text-primary mt-2">18%</div>
        </div>
        <div class="border border-secondary/15 rounded-xl p-4 bg-background">
          <div class="cdviz-mono text-text/40 text-[11px] uppercase tracking-wider">
            Repos connected
          </div>
          <div class="cdviz-mono text-3xl font-bold text-secondary mt-2">12</div>
        </div>
        <!-- Repo rows -->
        <div class="col-span-full border border-secondary/15 rounded-xl bg-background overflow-hidden">
          <div
            v-for="repo in repos"
            :key="repo.name"
            class="flex items-center justify-between px-4 py-3 border-b border-secondary/10 last:border-0 text-sm"
          >
            <span class="cdviz-mono text-text w-32 shrink-0">{{ repo.name }}</span>
            <span class="flex-1 mx-4 h-1.5 rounded-full bg-secondary/10 relative max-w-[340px]">
              <span
                class="absolute inset-y-0 left-0 rounded-full bg-primary"
                :style='{ width: repo.pct + "%" }'
              ></span>
            </span>
            <span class="cdviz-mono text-text/50 w-10 text-right">{{ repo.rate }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
