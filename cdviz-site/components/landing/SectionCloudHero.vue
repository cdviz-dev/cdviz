<script setup>
import { gsap } from "gsap";
import { onMounted } from "vue";
import Btn from "./Btn.vue";

const screenshots = [
  {
    key: "home",
    src: "/screenshots/cloud_home-20260705_2016.png",
    alt: "CDviz Cloud home dashboard overview",
    width: 1429,
    height: 611,
  },
  {
    key: "pipelines-dashboards",
    src: "/screenshots/cloud_pipelines_dashboards-20260705.png",
    alt: "CDviz Cloud pipelines dashboard showing duration and success rate over time",
    width: 1168,
    height: 841,
  },
  {
    key: "pipelines-executions",
    src: "/screenshots/cloud_pipelines_executions-20260705.png",
    alt: "CDviz Cloud pipelines dashboard, execution list detail",
    width: 1170,
    height: 678,
  },
];

let shotIndex = 0;

function cycleScreenshot() {
  const items = Array.from(document.querySelectorAll(".cloud-hero-shot"));
  if (items.length < 2) return;

  const current = items[shotIndex];
  const nextIndex = (shotIndex + 1) % screenshots.length;
  const next = items[nextIndex];
  shotIndex = nextIndex;

  gsap.to(current, {
    opacity: 0,
    duration: 0.5,
    ease: "power2.in",
  });
  gsap.to(next, {
    opacity: 1,
    duration: 0.5,
    ease: "power2.out",
    onComplete() {
      gsap.delayedCall(4, cycleScreenshot);
    },
  });
}

onMounted(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  gsap.delayedCall(3, cycleScreenshot);
});
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
      <Btn href="https://app.cdviz.dev" primary>Start free trial</Btn>
    </div>
    <p class="cdviz-mono text-text/40 text-xs">
      Connect in minutes ·
      <span class="text-text/60 font-medium">14-day free trial, no credit card</span> · Open-source
      under the hood, no lock-in
    </p>

    <!-- Dashboard screenshots -->
    <div
      class="max-w-[920px] mx-auto mt-2xl border border-secondary/20 rounded-2xl bg-gradient-to-b from-[var(--vp-c-bg-soft)] to-background shadow-[0_30px_80px_-30px_color-mix(in_oklch,var(--primary)_18%,transparent)] overflow-hidden relative"
      :style="{ aspectRatio: `${screenshots[0].width} / ${screenshots[0].height}` }"
      role="img"
      aria-label="CDviz Cloud dashboards showing pipeline home overview and execution details"
    >
      <img
        v-for="(shot, i) in screenshots"
        :key="shot.key"
        class="cloud-hero-shot absolute inset-0 w-full h-full"
        :class='i === 0 ? "object-contain" : "object-cover"'
        :src="shot.src"
        :alt="shot.alt"
        :width="shot.width"
        :height="shot.height"
        :aria-hidden="i !== 0"
        loading="lazy"
        decoding="async"
        :style="{ opacity: i === 0 ? 1 : 0 }"
      />
    </div>
  </section>
</template>
