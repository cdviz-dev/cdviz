<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";

const { frontmatter } = useData();

const labels: Record<string, string> = {
  community: "Community",
  cloud: "Cloud",
  pro: "Pro",
};

const plans = computed<string[]>(() =>
  (frontmatter.value.plans ?? []).filter((plan: string) => plan in labels),
);
</script>

<template>
  <div v-if="plans.length" class="plan-badges">
    <span class="plan-badges-label">Available on</span>
    <a
      v-for="plan in plans"
      :key="plan"
      href="/pricing"
      class="plan-badge"
      :class="`plan-badge--${plan}`"
    >{{ labels[plan] }}</a>
  </div>
</template>

<style scoped>
.plan-badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.plan-badges-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-2);
}
.plan-badge {
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  line-height: 1;
  padding: 4px 10px;
  border: 1px solid;
  text-decoration: none;
  transition: filter 160ms cubic-bezier(0.23, 1, 0.32, 1);
}
.plan-badge:hover {
  filter: brightness(1.15);
}
.plan-badge--community {
  color: var(--vp-c-text-2);
  background: color-mix(in oklch, var(--vp-c-text-2) 12%, transparent);
  border-color: color-mix(in oklch, var(--vp-c-text-2) 30%, transparent);
}
.plan-badge--cloud {
  color: var(--primary);
  background: color-mix(in oklch, var(--primary) 15%, transparent);
  border-color: color-mix(in oklch, var(--primary) 30%, transparent);
}
.plan-badge--pro {
  color: var(--secondary);
  background: color-mix(in oklch, var(--secondary) 15%, transparent);
  border-color: color-mix(in oklch, var(--secondary) 30%, transparent);
}
/* secondary purple is too light for small text on the light background */
html:not(.dark) .plan-badge--pro {
  color: color-mix(in oklch, var(--secondary) 55%, black);
}
</style>
