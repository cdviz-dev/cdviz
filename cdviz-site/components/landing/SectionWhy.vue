<script setup>
import { onMounted, ref } from "vue";
import { useScrollAnimation } from "../../composables/useScrollAnimation.js";
import H2 from "./H2.vue";
import H3 from "./H3.vue";

const sectionRef = ref(null);
const { observeMultiple } = useScrollAnimation({
  stagger: 150,
  animationType: "fade-in",
  threshold: 0.2,
});

onMounted(() => {
  if (sectionRef.value) {
    const cards = sectionRef.value.querySelectorAll("[data-animate-card]");
    observeMultiple(Array.from(cards), "fade-in");
  }
});
</script>
<template>
  <section
    ref="sectionRef"
    class="space-section bg-gradient-to-br from-secondary/3 to-secondary/8 rounded-2xl shadow-sm"
    aria-labelledby="why-heading"
  >
    <a id="why"></a>
    <H2 id="why-heading">Transform Your Software Delivery</H2>
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 max-w-6xl mx-auto">
      <!-- First card - smaller, 2 columns -->
      <div
        data-animate-card
        class="bg-background/80 md:col-span-2 rounded-xl p-lg shadow-sm border border-secondary/20 hover:border-primary/40 hover:shadow-[0_8px_25px_-8px_var(--primary)] hover:shadow-primary/25 hover:scale-[1.02] transition-all duration-300 transform-gpu"
      >
        <div class="flex items-center space-element my-sm">
          <div class="flex-shrink-0 w-10 sm:w-12 h-10 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center animate-float">
            <span class="icon-[lucide--eye] h-5 sm:h-6 w-5 sm:w-6 text-primary"></span>
          </div>
          <H3>Complete Pipeline Visibility</H3>
        </div>
        <p class="leading-relaxed text-sm sm:text-base text-text/90">
          Track deployments, monitor performance, and identify bottlenecks across your entire CI/CD
          pipeline with real-time dashboards and analytics.
        </p>
      </div>
      <!-- Second card - larger, emphasized, 3 columns -->
      <div
        data-animate-card
        class="bg-gradient-to-br from-primary/5 to-primary/10 md:col-span-3 rounded-xl p-lg md:p-xl shadow-md border-2 border-primary/30 hover:border-primary/50 hover:shadow-[0_12px_35px_-8px_var(--primary)] hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 transform-gpu relative overflow-hidden"
      >
        <!-- Decorative dot pattern -->
        <div class="absolute top-0 right-0 w-32 h-32 opacity-10 data-dots-bg"></div>
        <div class="flex items-center space-element my-sm relative z-10">
          <div
            class="flex-shrink-0 w-12 sm:w-14 h-12 sm:h-14 bg-primary/20 rounded-full flex items-center justify-center animate-float shadow-sm"
            style="animation-delay: 0.5s"
          >
            <span class="icon-[lucide--plug-zap] h-6 sm:h-7 w-6 sm:w-7 text-primary"></span>
          </div>
          <H3 class="text-lg sm:text-xl">Zero-Friction Integration</H3>
        </div>
        <p class="leading-relaxed text-base sm:text-lg text-text/90 relative z-10">
          Connect with your existing tools—GitHub, GitLab, Jenkins, Kubernetes— without changing
          workflows or disrupting development teams.
        </p>
      </div>
      <!-- Third card - full width on mobile, spans all columns -->
      <div
        data-animate-card
        class="bg-background/80 md:col-span-5 rounded-xl p-lg shadow-sm border border-secondary/20 hover:border-primary/40 hover:shadow-[0_8px_25px_-8px_var(--primary)] hover:shadow-primary/25 hover:scale-[1.01] transition-all duration-300 transform-gpu"
      >
        <div class="flex items-center space-element my-sm">
          <div
            class="flex-shrink-0 w-10 sm:w-12 h-10 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center animate-float"
            style="animation-delay: 1s"
          >
            <span class="icon-[lucide--users-round] h-5 sm:h-6 w-5 sm:w-6 text-primary"></span>
          </div>
          <H3>Unified Tool Collaboration</H3>
        </div>
        <p class="leading-relaxed text-sm sm:text-base text-text/90">
          Break down silos between development, operations, and quality teams by providing a single
          source of truth for all delivery events and metrics.
        </p>
      </div>
    </div>
  </section>
</template>
