<script setup>
import Btn from "./Btn.vue";
import { CTA_TRIAL } from "./ctas.js";
import ScreenshotCarousel from "./ScreenshotCarousel.vue";

const screenshots = [
  {
    src: "/screenshots/cloud_home-20260717.png",
    alt: "CDviz Cloud home dashboard overview",
    width: 1645,
    height: 931,
  },
  {
    src: "/screenshots/cloud_pipelines_dashboard_top-20260717.png",
    alt: "CDviz Cloud pipelines dashboard showing duration and success rate over time",
    width: 1396,
    height: 905,
    fit: "cover",
  },
  {
    src: "/screenshots/cloud_pipelines_executions_panel-20260717.png",
    alt: "CDviz Cloud pipelines dashboard, execution list detail",
    width: 1370,
    height: 497,
    fit: "cover",
  },
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
      <Btn v-bind="CTA_TRIAL" primary />
    </div>
    <p class="cdviz-mono text-text/40 text-xs">
      Webhook setup, about 10 minutes ·
      <span class="text-text/60 font-medium">14-day free trial, no credit card</span> · Open-source
      under the hood, no lock-in
    </p>

    <!-- Dashboard screenshots -->
    <div
      class="max-w-[920px] mx-auto mt-2xl border border-secondary/20 rounded-2xl bg-gradient-to-b from-[var(--vp-c-bg-soft)] to-background shadow-[0_30px_80px_-30px_color-mix(in_oklch,var(--primary)_18%,transparent)] overflow-hidden"
      role="img"
      aria-label="CDviz Cloud dashboards showing pipeline home overview and execution details"
    >
      <ScreenshotCarousel :shots="screenshots" />
    </div>
  </section>
</template>
