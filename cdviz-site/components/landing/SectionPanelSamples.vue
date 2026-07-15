<script setup>
import { gsap } from "gsap";
import { onMounted } from "vue";
import Btn from "./Btn.vue";
import H2 from "./H2.vue";
import PanelTimelineSvg from "../diagrams/GrafanaPanelTimelineVersionOnStageWithLegend.vue";

const executionShots = [
  {
    src: "/screenshots/grafana_dashboard_pipeline_executions-20260213.png",
    alt: "Pipeline execution dashboard showing overview stats, time series charts, and execution table",
    width: 1613,
    height: 1185,
  },
  {
    src: "/screenshots/cloud_pipelines_dashboards-20260705.png",
    alt: "CDviz Cloud pipelines dashboard — the managed equivalent view",
    width: 1160,
    height: 1200,
  },
];

let executionShotIndex = 0;

function cycleExecutionShot() {
  const items = Array.from(document.querySelectorAll(".execution-shot"));
  if (items.length < 2) return;

  const current = items[executionShotIndex];
  const nextIndex = (executionShotIndex + 1) % executionShots.length;
  const next = items[nextIndex];
  executionShotIndex = nextIndex;

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
      gsap.delayedCall(4, cycleExecutionShot);
    },
  });
}

onMounted(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  gsap.delayedCall(3, cycleExecutionShot);
});
</script>
<template>
  <section class="space-section">
    <div class="max-w-7xl mx-auto">
      <!-- Section Header -->
      <H2>Your SDLC — Finally Visible</H2>
      <p
        class="text-base sm:text-lg text-text/80 text-center mb-lg"
        style="max-width: 48rem; margin-inline: auto"
      >
        Production-ready Grafana dashboards. Customize for your workflow in minutes.
      </p>

      <!-- Dashboard Gallery — stacked full-width cards -->
      <div class="flex flex-col gap-lg">
        <!-- Artifact Timeline -->
        <a
          href="/docs/cdviz-grafana/artifact_timeline.html"
          class="group block rounded-xl border border-secondary/20 overflow-hidden bg-gradient-to-br from-background/80 to-secondary/5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.01] transform-gpu transition-all duration-300 md:grid md:grid-cols-5"
        >
          <div class="md:col-span-2 p-lg flex flex-col justify-center">
            <h3 class="text-lg sm:text-xl font-semibold mb-sm group-hover:text-primary transition-colors">
              Artifact Timeline
            </h3>
            <p class="text-sm text-text/70">
              Track which version landed in which environment — at a glance and historically. A
              starting point you can adapt to your own deployment workflow.
            </p>
          </div>
          <div class="md:col-span-3 p-md flex items-center">
            <PanelTimelineSvg
              id="panel-timeline-svg"
              class="w-full h-auto rounded-lg border border-secondary/20 shadow-lg overflow-hidden"
            />
          </div>
        </a>

        <!-- Pipeline & Test Runs — alternated: image left, text right -->
        <a
          href="/docs/cdviz-grafana/pipeline_runs.html"
          class="group block rounded-xl border border-secondary/20 overflow-hidden bg-gradient-to-br from-background/80 to-secondary/5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.01] transform-gpu transition-all duration-300 md:grid md:grid-cols-5"
        >
          <div
            class="md:col-span-3 md:order-1 p-md relative"
            :style="{ aspectRatio: `${executionShots[0].width} / ${executionShots[0].height}` }"
          >
            <img
              v-for="(shot, i) in executionShots"
              :key="shot.src"
              class="execution-shot absolute inset-0 w-full h-full object-contain rounded-lg border border-secondary/20 shadow-lg overflow-hidden"
              :src="shot.src"
              :alt="shot.alt"
              :width="shot.width"
              :height="shot.height"
              loading="lazy"
              decoding="async"
              :style="{ opacity: i === 0 ? 1 : 0 }"
            />
          </div>
          <div class="md:col-span-2 md:order-2 p-lg flex flex-col justify-center">
            <h3 class="text-lg sm:text-xl font-semibold mb-sm group-hover:text-primary transition-colors">
              Pipeline &amp; Test Runs
            </h3>
            <p class="text-sm text-text/70">
              Spot slow pipelines, flaky tests, and rising failure rates — duration, queue time, and
              pass/fail history for every pipeline, task, and test.
            </p>
          </div>
        </a>
        <!-- Incidents & Tickets — text left (col-2), icon right (col-3) -->
        <a
          href="/docs/cdviz-grafana/incidents_tickets.html"
          class="group block rounded-xl border border-secondary/20 overflow-hidden bg-linear-to-br from-background/80 to-secondary/5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.01] transform-gpu transition-all duration-300 md:grid md:grid-cols-5"
        >
          <div class="md:col-span-2 p-lg flex flex-col justify-center">
            <h3 class="text-lg sm:text-xl font-semibold mb-sm group-hover:text-primary transition-colors">
              Incidents &amp; Tickets
            </h3>
            <p class="text-sm text-text/70">
              Track open incidents, time-to-restore, and change cycle times — fed from your incident
              management and ticketing tools via CDEvents.
            </p>
          </div>
          <div class="md:col-span-3 p-md flex items-center">
            <img
              src="/screenshots/grafana_dashboard_incidents_tickets-20260222.png"
              alt="Incidents and tickets dashboard showing open incidents, time to restore, and change cycle time"
              class="w-full h-auto rounded-lg border border-secondary/20 shadow-lg overflow-hidden"
              loading="lazy"
              decoding="async"
            />
          </div>
        </a>
        <!-- DORA Metrics — image left (col-3), text right (col-2) -->
        <a
          href="/docs/cdviz-grafana/dora_metrics.html"
          class="group block rounded-xl border border-secondary/20 overflow-hidden bg-linear-to-br from-background/80 to-secondary/5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.01] transform-gpu transition-all duration-300 md:grid md:grid-cols-5"
        >
          <div class="md:col-span-3 md:order-1 p-md flex items-center">
            <img
              src="/screenshots/grafana_dashboard_dora_metrics-20260222.png"
              alt="DORA Metrics dashboard showing deployment frequency, lead time, time to restore, and change failure rate"
              class="w-full h-auto rounded-lg border border-secondary/20 shadow-lg overflow-hidden"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div class="md:col-span-2 md:order-2 p-lg flex flex-col justify-center">
            <h3 class="text-lg sm:text-xl font-semibold mb-sm group-hover:text-primary transition-colors">
              DORA Metrics
            </h3>
            <p class="text-sm text-text/70">
              The four DORA indicators — deployment frequency, lead time, time to restore, and
              change failure rate — computed from your existing CDEvents. A baseline to benchmark
              and improve your delivery performance.
            </p>
          </div>
        </a>
      </div>

      <!-- CTA -->
      <div class="flex gap-4 justify-center mt-lg">
        <Btn href="/docs/cdviz-grafana/">Explore All Dashboards</Btn>
        <Btn
          href="https://demo.cdviz.dev/grafana/"
          target="_blank"
          rel="noopener"
          primary
        >Try the Live Demo →</Btn>
      </div>

      <!-- Feedback invite -->
      <p class="text-center text-sm text-text/60 mt-md">
        Missing a dashboard you need?
        <a
          href="https://github.com/cdviz-dev/cdviz/discussions"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary hover:underline"
        >Open a discussion →</a>
      </p>
    </div>
  </section>
</template>
