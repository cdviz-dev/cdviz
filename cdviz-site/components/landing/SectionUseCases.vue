<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useScrollAnimation } from "../../composables/useScrollAnimation.js";
import { data as useCases } from "../data/use-cases.data.ts";
import H2 from "./H2.vue";

// Filter definitions. `all` is the default so every card is visible in the
// statically rendered HTML (SEO/GEO friendly); chips only hide/show via v-show.
const componentFilters = [
  { value: "all", label: "All", icon: "icon-[lucide--layout-grid]" },
  { value: "platform", label: "Whole platform", icon: "icon-[lucide--boxes]" },
  { value: "collector", label: "Collector", icon: "icon-[lucide--antenna]" },
  { value: "db", label: "Database", icon: "icon-[lucide--database]" },
  { value: "grafana", label: "Grafana", icon: "icon-[lucide--line-chart]" },
];

const audienceFilters = [
  { value: "all", label: "All" },
  { value: "cto", label: "CTO" },
  { value: "devops", label: "DevOps" },
  { value: "platform", label: "Platform engineer" },
  { value: "developer", label: "Developer" },
];

const componentLabels = {
  platform: "Whole platform",
  collector: "Collector",
  db: "Database",
  grafana: "Grafana",
};
const componentIcons = {
  platform: "icon-[lucide--boxes]",
  collector: "icon-[lucide--antenna]",
  db: "icon-[lucide--database]",
  grafana: "icon-[lucide--line-chart]",
};
const audienceLabels = {
  cto: "CTO",
  devops: "DevOps",
  platform: "Platform engineer",
  developer: "Developer",
};

const selectedComponent = ref("all");
const selectedAudience = ref("all");
const query = ref("");

const matches = (c) => {
  const q = query.value.trim().toLowerCase();
  return (
    (selectedComponent.value === "all" || c.component === selectedComponent.value) &&
    (selectedAudience.value === "all" || c.audiences.includes(selectedAudience.value)) &&
    (q === "" || c.searchText.includes(q))
  );
};

const visibleCount = computed(() => useCases.filter(matches).length);

const sectionRef = ref(null);
const searchInput = ref(null);
const { observeMultiple } = useScrollAnimation({
  stagger: 80,
  animationType: "fade-in",
  threshold: 0.15,
});

// Focus the search box on "/" (unless already typing in a field).
const onKeydown = (e) => {
  if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
  const el = document.activeElement;
  const tag = el?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || el?.isContentEditable) return;
  e.preventDefault();
  searchInput.value?.focus();
};

onMounted(() => {
  if (sectionRef.value) {
    const cards = sectionRef.value.querySelectorAll("[data-animate-card]");
    observeMultiple(Array.from(cards), "fade-in");
  }
  window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <section ref="sectionRef" class="space-section" aria-labelledby="use-cases-heading">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-lg">
        <p class="text-sm font-semibold uppercase tracking-widest text-primary/70 mb-3">
          Use cases
        </p>
        <H2 id="use-cases-heading" class="mb-0">What you can do with CDviz</H2>
        <div class="text-sm sm:text-base text-text/70 mt-sm max-w-[40rem] mx-auto">
          Real scenarios across the whole platform and each component — pick your role or the piece
          you care about.
        </div>
      </div>

      <!-- Search -->
      <div class="max-w-[26rem] mx-auto mb-md">
        <div class="relative">
          <span
            class="icon-[lucide--search] absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text/40 pointer-events-none"
          ></span>
          <input
            ref="searchInput"
            v-model="query"
            type="search"
            placeholder="Search use cases…  ( / )"
            aria-label="Search use cases"
            class="w-full rounded-full border border-secondary/20 bg-background/60 pl-9 pr-9 py-2 text-sm text-text placeholder:text-text/40 outline-none focus-ring focus:border-primary/40 transition-colors"
          />
          <button
            v-show="query"
            type="button"
            aria-label="Clear search"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-text/40 hover:text-text"
            @click='(query = "")'
          >
            <span class="icon-[lucide--x] h-4 w-4"></span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="space-y-sm mb-lg">
        <div class="flex flex-wrap items-center justify-center gap-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-text/50 mr-1">
            Component
          </span>
          <button
            v-for="f in componentFilters"
            :key="f.value"
            type="button"
            :aria-pressed="selectedComponent === f.value"
            class="inline-flex items-center gap-1.5 rounded-full border px-md py-1.5 text-sm transition-all duration-200 focus-ring"
            :class='selectedComponent === f.value
            ? "border-primary bg-primary/15 text-primary font-semibold"
            : "border-secondary/20 text-text/70 hover:border-primary/40 hover:text-text"'
            @click="(selectedComponent = f.value)"
          >
            <span :class="f.icon" class="h-4 w-4"></span>
            {{ f.label }}
          </button>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-text/50 mr-1">
            Audience
          </span>
          <button
            v-for="f in audienceFilters"
            :key="f.value"
            type="button"
            :aria-pressed="selectedAudience === f.value"
            class="inline-flex items-center rounded-full border px-md py-1.5 text-sm transition-all duration-200 focus-ring"
            :class='selectedAudience === f.value
            ? "border-secondary bg-secondary/15 text-secondary font-semibold"
            : "border-secondary/20 text-text/70 hover:border-secondary/40 hover:text-text"'
            @click="(selectedAudience = f.value)"
          >
            {{ f.label }}
          </button>
        </div>
      </div>

      <!-- Cards: all rendered server-side; v-show toggles visibility (SEO-safe) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <article
          v-for="c in useCases"
          v-show="matches(c)"
          :key="c.id"
          data-animate-card
          class="flex flex-col rounded-xl p-lg border border-secondary/20 bg-background/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
        >
          <img
            v-if="c.image"
            :src="c.image"
            :alt="c.imageAlt || c.title"
            loading="lazy"
            class="mb-sm rounded-lg border border-secondary/15 w-full object-cover aspect-video"
          />

          <div class="flex items-center gap-2 mb-sm">
            <span
              :class="componentIcons[c.component]"
              class="h-4 w-4 text-primary flex-shrink-0"
            ></span>
            <span class="text-xs font-semibold uppercase tracking-wider text-primary/80">
              {{ componentLabels[c.component] }}
            </span>
          </div>

          <h3 class="font-semibold text-base sm:text-lg text-text mb-xs">{{ c.title }}</h3>

          <div class="flex flex-wrap gap-1.5 mb-sm">
            <span
              v-for="a in c.audiences"
              :key="a"
              class="inline-flex items-center rounded-full bg-secondary/10 text-secondary/90 px-2 py-0.5 text-xs"
            >
              {{ audienceLabels[a] }}
            </span>
          </div>

          <div
            class="mb-sm text-sm text-text/80 leading-relaxed space-text [&_a]:text-primary [&_a:hover]:underline"
            v-html="c.goalHtml"
          >
          </div>

          <details class="group mt-auto pt-sm">
            <summary class="cursor-pointer list-none outline-none focus-ring rounded-lg text-sm font-semibold text-primary inline-flex items-center gap-1">
              How CDviz helps
              <span class="text-primary transition-transform duration-300 group-open:rotate-180"
              >▼</span>
            </summary>
            <div
              class="pt-sm text-sm text-text/80 leading-relaxed space-text [&_a]:text-primary [&_a:hover]:underline"
              v-html="c.solutionHtml"
            >
            </div>
          </details>
        </article>
      </div>

      <p v-show="visibleCount === 0" class="text-center text-text/60 py-xl">
        No use case matches this combination yet.
      </p>
    </div>
  </section>
</template>
