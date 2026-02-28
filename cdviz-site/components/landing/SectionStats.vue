<script setup>
import AnimatedCounter from "./AnimatedCounter.vue";

const stats = [
  { value: 20, suffix: "+", label: "Integrations", icon: "icon-[lucide--plug-zap]" },
  { value: 10, suffix: "+", label: "Dashboard panels", icon: "icon-[lucide--layout-dashboard]" },
  { value: 4, suffix: "", label: "DORA indicators", icon: "icon-[lucide--bar-chart-3]" },
];
</script>
<template>
  <section
    class="space-section"
    aria-label="CDviz key numbers"
  >
    <div class="max-w-6xl mx-auto">
      <div class="rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/10 border border-primary/15 py-lg px-lg">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div
            v-for="(s, i) in stats"
            :key="i"
            class="flex flex-col items-center text-center gap-2"
          >
            <span :class="s.icon" class="h-5 w-5 text-primary/70"></span>
            <div class="text-2xl sm:text-3xl font-extrabold text-primary leading-none">
              <AnimatedCounter :end="s.value" :suffix="s.suffix" />
            </div>
            <div class="text-xs text-text/70 font-medium">{{ s.label }}</div>
          </div>
          <!-- License — text-only, no counter -->
          <div class="flex flex-col items-center text-center gap-2">
            <span class="icon-[lucide--shield-check] h-5 w-5 text-primary/70"></span>
            <div class="text-xl sm:text-2xl font-extrabold text-primary leading-none">
              Apache 2.0
            </div>
            <div class="text-xs text-text/70 font-medium">Open-source license</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
