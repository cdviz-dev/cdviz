<script setup>
import H2 from "./H2.vue";

const comparisonRows = [
  {
    feature: "Hosting",
    community: { text: "You host" },
    cloud: { text: "We host", highlight: true },
    pro: { text: "You host" },
  },
  {
    feature: "Data ownership",
    community: { text: "Yours", good: true },
    cloud: { text: "Managed" },
    pro: { text: "Yours", good: true },
  },
  {
    feature: "Customization (sources, transformers, sink, database, dashboards)",
    community: { text: "✓", good: true },
    cloud: { text: "—", muted: true },
    pro: { text: "✓", good: true },
  },
  {
    feature: "GitHub",
    community: { text: "✓", good: true },
    cloud: { text: "✓", good: true },
    pro: { text: "✓", good: true },
  },
  {
    feature: "GitLab",
    community: { text: "DIY" },
    cloud: { text: "✓", good: true },
    pro: { text: "✓", good: true },
  },
  {
    feature: "Jenkins, Jira, ...",
    community: { text: "DIY" },
    cloud: { text: "—", muted: true },
    pro: { text: "✓", good: true },
  },
  {
    feature: "CDEvents (0.3–0.5) via webhook",
    community: { text: "✓", good: true },
    cloud: { text: "✓", good: true },
    pro: { text: "✓", good: true },
  },
  {
    feature: "Kubernetes, ArgoCD",
    community: { text: "✓", good: true },
    cloud: { text: "Self-hosted agent" },
    pro: { text: "✓", good: true },
  },
  {
    feature: "Pipeline reliability dashboards",
    community: { text: "DIY (components)" },
    cloud: { text: "✓ built-in", good: true },
    pro: { text: "components" },
  },
  {
    feature: "30-day history backfill",
    community: { text: "self-managed" },
    cloud: { text: "✓", good: true },
    pro: { text: "self-managed" },
  },
  {
    feature: "Support",
    community: { text: "Community" },
    cloud: { text: "Email & Discord", good: true },
    pro: { text: "Email & Discord", good: true },
  },
  {
    feature: "Response time",
    community: { text: "—", muted: true },
    cloud: { text: "2 business days" },
    pro: { text: "2 business days" },
  },
  {
    feature: "Commercial license",
    community: { text: "—", muted: true },
    cloud: { text: "Included", good: true },
    pro: { text: "Optional" },
  },
  {
    feature: "Price",
    community: { text: "€0" },
    cloud: { text: "€20/mo", highlight: true },
    pro: { text: "€200/mo" },
  },
];
</script>

<template>
  <section class="my-xl max-w-7xl mx-auto px-4">
    <a id="plans"></a>
    <H2 class="text-center mb-12">Compare Plans</H2>

    <div class="overflow-x-auto">
      <table class="w-full border-collapse bg-white rounded-lg shadow-lg overflow-hidden">
        <thead>
          <tr class="bg-gray-50">
            <th class="text-left p-6 font-semibold text-gray-900 border-b border-gray-200">
              Feature
            </th>
            <th class="text-center p-6 font-semibold text-gray-900 border-b border-gray-200 border-l">
              <div class="flex flex-col items-center">
                <span class="text-lg">Community</span>
              </div>
            </th>
            <th class="text-center p-6 font-semibold text-gray-900 border-b border-gray-200 border-l">
              <div class="flex flex-col items-center">
                <span class="text-lg text-primary">Cloud</span>
                <span class="text-xs bg-primary/10 text-primary px-2 py-1 rounded mt-1"
                >Available July 2026</span>
              </div>
            </th>
            <th class="text-center p-6 font-semibold text-gray-900 border-b border-gray-200 border-l">
              <div class="flex flex-col items-center">
                <span class="text-lg">Pro</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in comparisonRows"
            :key="row.feature"
            class="border-b border-gray-100 hover:bg-gray-50"
          >
            <td class="p-4 text-gray-700">{{ row.feature }}</td>
            <td
              v-for='tier in ["community", "cloud", "pro"]'
              :key="tier"
              class="p-4 text-center border-l border-gray-200 font-mono text-sm"
              :class='[
                row[tier].good ? "text-green-600 font-bold" : "",
                row[tier].muted ? "text-gray-400" : "",
                row[tier].highlight ? "text-primary font-bold" : "",
                !row[tier].good && !row[tier].muted && !row[tier].highlight
                  ? "text-gray-600"
                  : "",
              ]'
            >
              {{ row[tier].text }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="text-center text-sm text-gray-500 mt-4">
      Full connector &amp; transformer matrix in the
      <a href="/docs" class="text-primary hover:underline">documentation</a>.
    </p>

    <div class="text-center mt-8">
      <p class="text-sm text-current/90">
        Need something custom? Contact us at <a
          href="mailto:contact@cdviz.dev"
          class="text-primary hover:underline"
        >contact@cdviz.dev</a>
        for consulting and bespoke development.
      </p>
    </div>
  </section>
</template>
