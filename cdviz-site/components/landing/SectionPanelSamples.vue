<script setup>
import { gsap } from "gsap";
import { onMounted } from "vue";
import Btn from "./Btn.vue";
import H2 from "./H2.vue";
import PanelTimelineSvg from "../../assets/screenshots/grafana_panel_timeline_version_on_stage-legend.svg";

onMounted(() => {
  const tl = gsap.timeline();
  // class "annotation" is prefixed by svgo with filename to avoid conflict
  const selector = ".grafana_panel_timeline_version_on_stage-legend_svg__annotation";
  tl.from(selector, {
    opacity: 0,
    duration: 0.5,
    ease: "power2.inOut",
    stagger: {
      from: "end",
      each: 0.8,
    },
    repeat: -1,
    repeatDelay: 2,
  });
});
</script>
<template>
  <section class="space-section">
    <div class="max-w-7xl mx-auto">
      <!-- Section Header -->
      <H2>Dashboard &amp; Panel Starters</H2>
      <p
        class="text-base sm:text-lg text-text/80 text-center mb-lg"
        style="max-width: 48rem; margin-inline: auto"
      >
        Ready-to-use Grafana dashboards and panels as starting points — customize them to match your
        needs
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
              Start with timeline tracking of deployments and versions across environments — adapt
              it to your delivery workflow
            </p>
          </div>
          <div class="md:col-span-3 p-md flex items-center">
            <PanelTimelineSvg
              id="panel-timeline-svg"
              class="w-full h-auto rounded-lg border border-secondary/20 shadow-lg overflow-hidden"
            />
          </div>
        </a>

        <!-- Execution Performance — alternated: image left, text right -->
        <a
          href="/docs/cdviz-grafana/execution_dashboards.html"
          class="group block rounded-xl border border-secondary/20 overflow-hidden bg-gradient-to-br from-background/80 to-secondary/5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.01] transform-gpu transition-all duration-300 md:grid md:grid-cols-5"
        >
          <div class="md:col-span-3 md:order-1 p-md flex items-center">
            <img
              src="/screenshots/grafana_dashboard_pipeline_executions-20260213.png"
              alt="Pipeline execution dashboard showing overview stats, time series charts, and execution table"
              class="w-full h-auto rounded-lg border border-secondary/20 shadow-lg overflow-hidden"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div class="md:col-span-2 md:order-2 p-lg flex flex-col justify-center">
            <h3 class="text-lg sm:text-xl font-semibold mb-sm group-hover:text-primary transition-colors">
              Execution Performance
            </h3>
            <p class="text-sm text-text/70">
              Monitor pipeline runs, task executions, and test results — customize metrics and
              thresholds to fit your team's goals
            </p>
          </div>
        </a>
      </div>

      <!-- CTA -->
      <div class="text-center mt-lg">
        <Btn href="/docs/cdviz-grafana/">Explore all dashboards</Btn>
      </div>
    </div>
  </section>
</template>
