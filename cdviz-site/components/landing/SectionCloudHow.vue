<script setup>
import H2 from "./H2.vue";

const steps = [
  {
    n: "1",
    title: "Create your organization",
    body: "Sign up and create your org in CDviz Cloud. You'll get a webhook URL and a secret to paste in the next step. (~1 minute)",
  },
  {
    n: "2",
    title: "Add a webhook in GitHub or GitLab",
    body: "Paste the URL and secret into your organization's webhook settings — two values, one form, on your side. No GitHub App, no OAuth grant, and you can revoke it yourself at any time. (~5 minutes)",
  },
  {
    n: "3",
    title: "Import your history (recommended)",
    body: "New pipeline runs appear immediately. To see trends from day one instead of waiting a few weeks, add a read-only token so CDviz can import your last 30 days. You create and scope the token yourself.",
  },
  {
    n: "4",
    title: "See reliability across every repo",
    body: "One view ranks what fails most, where, and whether it's trending up. Built on the open CDEvents standard.",
  },
];
</script>

<template>
  <section
    id="how"
    class="space-section bg-[var(--vp-c-bg-soft)] border-t border-b border-secondary/15 rounded-2xl"
  >
    <div class="text-center max-w-[48ch] mx-auto mb-2xl">
      <H2>Set it up once, in about ten minutes.</H2>
      <p class="text-text/60 mt-md">
        No agents to install, no pipelines to rewrite, no access to your source code.
      </p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="step in steps" :key="step.n" class="relative pt-2">
        <div class="cdviz-mono font-bold text-primary border border-primary/40 w-9 h-9 rounded-full flex items-center justify-center mb-md text-sm">
          {{ step.n }}
        </div>
        <h3 class="cdviz-h3 mb-sm">{{ step.title }}</h3>
        <p class="text-text/60 text-sm">{{ step.body }}</p>
      </div>
    </div>
  </section>
</template>
