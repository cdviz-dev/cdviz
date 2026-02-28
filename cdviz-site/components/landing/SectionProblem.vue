<script setup>
import { onMounted, ref } from "vue";
import { useScrollAnimation } from "../../composables/useScrollAnimation.js";
import H2 from "./H2.vue";

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

const problems = [
  {
    icon: "icon-[lucide--alert-triangle]",
    title: "You deploy blind",
    description:
      "You know a deploy happened. You don't know if it went to the right env, what version it replaced, or who approved it.",
  },
  {
    icon: "icon-[lucide--clock]",
    title: "Incidents drag on",
    description:
      "Without a shared timeline of changes, you're rebuilding context from Slack threads and git logs instead of restoring service.",
  },
  {
    icon: "icon-[lucide--bar-chart]",
    title: "DORA is a spreadsheet",
    description:
      "Leadership wants DORA metrics. You're copying numbers from 5 dashboards into a Google Sheet every sprint.",
  },
];
</script>
<template>
  <section
    ref="sectionRef"
    class="space-section"
    aria-labelledby="problem-heading"
  >
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-lg">
        <p class="text-sm font-semibold uppercase tracking-widest text-primary/70 mb-3">
          Sound familiar?
        </p>
        <H2 id="problem-heading" class="mb-0">The visibility gap is costing you.</H2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div
          v-for="(p, i) in problems"
          :key="i"
          data-animate-card
          class="rounded-xl p-lg border border-secondary/20 bg-background/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
        >
          <div class="flex items-center gap-3 mb-sm">
            <div class="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span :class="p.icon" class="h-5 w-5 text-primary"></span>
            </div>
            <h3 class="font-semibold text-base sm:text-lg">{{ p.title }}</h3>
          </div>
          <p class="text-sm sm:text-base text-text/80 leading-relaxed">{{ p.description }}</p>
        </div>
      </div>

      <p class="text-center text-sm sm:text-base text-text/70 mt-lg">
        CDviz automates the visibility layer so you can focus on delivery.
      </p>
    </div>
  </section>
</template>
