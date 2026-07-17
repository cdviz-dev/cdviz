<script setup>
import H2 from "./H2.vue";
import ScreenshotCarousel from "./ScreenshotCarousel.vue";

const features = [
  {
    title: "Cross-repo pipeline reliability",
    body: "Failure rates, chronically broken and intermittent pipelines, and trends — ranked across all your connected repos. The thing you came for.",
  },
  {
    title: "Pipeline duration & trends",
    body: 'Spot which pipelines are slow and which are creeping slower over time, before "CI feels sluggish" becomes a sprint-killer.',
  },
  {
    title: "Test suites & flaky detection",
    body: "Pass/fail history and duration trends per suite, so a test that flip-flops red and green is obvious at a glance — no statistics degree required.",
    images: [
      {
        src: "/screenshots/cloud_testsuites_dashboard_top-20260717.png",
        alt: "CDviz Cloud test suites dashboard showing pass/fail history and duration trends",
        width: 1389,
        height: 905,
      },
      {
        src: "/screenshots/cloud_testsuites_executions_panel-20260717.png",
        alt: "CDviz Cloud test suite executions panel, per-suite run history",
        width: 1377,
        height: 317,
        fit: "cover",
      },
    ],
  },
  {
    title: "Tickets & issues",
    body: "How many issues are open, how long the oldest have been sitting, and how fast they close — fed from Jira, GitHub, or GitLab via CDEvents.",
    images: [
      {
        src: "/screenshots/cloud_tickets_dashboard_top-20260717.png",
        alt: "CDviz Cloud tickets dashboard showing open issues, age, and close rate",
        width: 1406,
        height: 874,
      },
      {
        src: "/screenshots/cloud_tickets_latest_panel-20260717.png",
        alt: "CDviz Cloud tickets panel listing the latest issues",
        width: 1389,
        height: 584,
        fit: "cover",
      },
    ],
  },
  {
    title: "Changes & merge throughput",
    body: "Pull-request lifecycle across repos: how many changes are created, in review, and merged, your merge throughput, and which changes have been open longest.",
    images: [
      {
        src: "/screenshots/cloud_changes_dashboard_top-20260717.png",
        alt: "CDviz Cloud changes dashboard showing merge throughput and oldest open changes",
        width: 1404,
        height: 874,
      },
      {
        src: "/screenshots/cloud_changes_merge_throughput_panel-20260717.png",
        alt: "CDviz Cloud merge throughput panel",
        width: 1368,
        height: 253,
        fit: "cover",
      },
      {
        src: "/screenshots/cloud_changes_open_oldest_panel-20260717.png",
        alt: "CDviz Cloud panel listing the oldest open changes",
        width: 1376,
        height: 499,
        fit: "cover",
      },
    ],
  },
  {
    title: "Artifact & deployment timeline",
    body: "Which version landed in which environment, and when — a per-artifact timeline across services, without infra permissions.",
    images: [
      {
        src: "/screenshots/cloud_artifact_timeline_dashboard-20260717.png",
        alt: "CDviz Cloud artifact timeline showing versions deployed across environments",
        width: 1404,
        height: 595,
      },
      {
        src: "/screenshots/cloud_artifact_timleline_panel-20260717.png",
        alt: "CDviz Cloud artifact timeline panel detail",
        width: 1380,
        height: 455,
        fit: "cover",
      },
    ],
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
          v-if="f.badge"
          class="cdviz-mono text-[11px] font-semibold tracking-wider px-3 py-1 rounded-full whitespace-nowrap self-center shrink-0"
          :class="f.badgeClass"
        >{{ f.badge }}</span>
        <div class="min-w-0 w-full">
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
          <ScreenshotCarousel
            v-if="f.images"
            :shots="f.images"
            frame-class="rounded-lg border border-secondary/20 shadow-lg"
            class="mt-md"
          />
        </div>
      </div>
    </div>
  </section>
</template>
