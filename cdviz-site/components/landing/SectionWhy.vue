<script setup>
import H2 from "./H2.vue";
import H3 from "./H3.vue";
</script>
<template>
<section class="my-xl md:my-2xl bg-gradient-to-br from-secondary/3 to-secondary/8 py-16 px-8 rounded-2xl shadow-sm">
  <a id="why"></a>
  <H2>Transform Your Software Delivery</H2>
  <div class="flex flex-col items-stretch gap-8 md:flex-row max-w-5xl mx-auto">
    <div class="bg-secondary/20 w-full rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3 mb-4">
        <div class="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <span class="icon-[lucide--eye] h-6 w-6 text-primary"></span>
        </div>
        <H3>Complete Pipeline Visibility</H3>
      </div>
      <p class="leading-relaxed">
        Track deployments, monitor performance, and identify bottlenecks across 
        your entire CI/CD pipeline with real-time dashboards and analytics.
      </p>
    </div>
    <div class="bg-secondary/20 w-full rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3 mb-4">
        <div class="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <span class="icon-[lucide--plug-zap] h-6 w-6 text-primary"></span>
        </div>
        <H3>Zero-Friction Integration</H3>
      </div>
      <p class="leading-relaxed">
        Connect with your existing tools—GitHub, GitLab, Jenkins, Kubernetes—
        without changing workflows or disrupting development teams.
      </p>
    </div>
    <div class="bg-secondary/20 w-full rounded-xl p-6 shadow-sm">
      <div class="flex items-center gap-3 mb-4">
        <div class="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <span class="icon-[lucide--users-round] h-6 w-6 text-primary"></span>
        </div>
        <H3>Unified Tool Collaboration</H3>
      </div>
      <p class="leading-relaxed">
        Break down silos between development, operations, and quality teams
        by providing a single source of truth for all delivery events and metrics.
      </p>
    </div>
  </div>
</section>
</template>
