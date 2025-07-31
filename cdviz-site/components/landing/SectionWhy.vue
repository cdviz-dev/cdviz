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
    <div
      class="flex flex-col items-stretch space-content md:flex-row max-w-6xl mx-auto"
    >
      <div
        data-animate-card
        class="bg-background/80 w-full rounded-xl p-lg shadow-sm border border-secondary/20 card-hover transform-gpu"
      >
        <div class="flex items-center space-element my-sm">
          <div
            class="flex-shrink-0 w-10 sm:w-12 h-10 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center animate-float"
          >
            <span
              class="icon-[lucide--eye] h-5 sm:h-6 w-5 sm:w-6 text-primary"
            ></span>
          </div>
          <H3>Complete Pipeline Visibility</H3>
        </div>
        <p class="leading-relaxed text-sm sm:text-base text-text/90">
          Track deployments, monitor performance, and identify bottlenecks
          across your entire CI/CD pipeline with real-time dashboards and
          analytics.
        </p>
      </div>
      <div
        data-animate-card
        class="bg-background/80 w-full rounded-xl p-lg shadow-sm border border-secondary/20 card-hover transform-gpu"
      >
        <div class="flex items-center space-element my-sm">
          <div
            class="flex-shrink-0 w-10 sm:w-12 h-10 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center animate-float"
            style="animation-delay: 0.5s"
          >
            <span
              class="icon-[lucide--plug-zap] h-5 sm:h-6 w-5 sm:w-6 text-primary"
            ></span>
          </div>
          <H3>Zero-Friction Integration</H3>
        </div>
        <p class="leading-relaxed text-sm sm:text-base text-text/90">
          Connect with your existing tools—GitHub, GitLab, Jenkins, Kubernetes—
          without changing workflows or disrupting development teams.
        </p>
      </div>
      <div
        data-animate-card
        class="bg-background/80 w-full rounded-xl p-lg shadow-sm border border-secondary/20 card-hover transform-gpu"
      >
        <div class="flex items-center space-element my-sm">
          <div
            class="flex-shrink-0 w-10 sm:w-12 h-10 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center animate-float"
            style="animation-delay: 1s"
          >
            <span
              class="icon-[lucide--users-round] h-5 sm:h-6 w-5 sm:w-6 text-primary"
            ></span>
          </div>
          <H3>Unified Tool Collaboration</H3>
        </div>
        <p class="leading-relaxed text-sm sm:text-base text-text/90">
          Break down silos between development, operations, and quality teams by
          providing a single source of truth for all delivery events and
          metrics.
        </p>
      </div>
    </div>
  </section>
</template>
