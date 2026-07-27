<script setup>
import { GROUPS, integrations } from "../data/integrations.ts";
import H2 from "./H2.vue";

const cell = (members, plan) =>
  members.some((i) => i.plans.includes(plan))
    ? { text: "✓", good: true }
    : plan === "community"
      ? { text: "DIY" } // no community transformer, but a custom VRL one is always possible
      : { text: "—", muted: true };

// Same source of truth as the coverage matrix of /docs/integrations/.
const integrationRows = GROUPS.filter((g) => g.id !== "custom") // covered by "Customization" below
  .map((group) => {
    const members = integrations.filter((i) => i.group === group.id);
    return {
      feature: group.label,
      icon: group.icon,
      community: cell(members, "community"),
      cloud: cell(members, "cloud"),
      pro: cell(members, "pro"),
    };
  });

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
  ...integrationRows,
  {
    feature: "Kafka, NATS, S3-like, SSE sources & sinks",
    community: { text: "✓", good: true },
    cloud: { text: "—", muted: true },
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
                >14-day free trial</span>
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
            <td class="p-4 text-gray-700">
              <span v-if="row.icon" :class="row.icon" aria-hidden="true"></span> {{ row.feature }}
            </td>
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
      <a href="/docs/integrations/" class="text-primary hover:underline"
      >integrations documentation</a>. Kubernetes &amp; ArgoCD on Cloud require a self-hosted
      collector agent.
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
