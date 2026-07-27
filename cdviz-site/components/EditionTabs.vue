<script setup lang="ts">
import { useId } from "vue";
// Same specifier as the theme Layout (no extension): two spellings of the same file can end up as
// two modules — so two `edition` refs — in the dev module graph.
import { useEdition } from "../composables/useEdition";

// `inline`: no tablist, spans instead of blocks — to swap a single value (an endpoint URL) inside
// a sentence or a list item. The switch is then the one of the enclosing section.
defineProps<{ inline?: boolean }>();

// Both editions are in the statically rendered HTML (SEO/GEO friendly); the tabs only hide/show
// them — same rule as IntegrationsCoverage.vue.
const edition = useEdition();

// Reuse the markup and the styles of VitePress' own code groups (`.vp-code-group`), so an edition
// switch looks exactly like the language switch of a code block. Needs one radio group per
// instance.
const group = useId();

const TABS = [
  { id: "selfhosted", label: "Self-hosted" },
  { id: "cloud", label: "CDviz Cloud" },
] as const;
</script>

<template>
  <span v-if="inline">
    <span v-show='edition === "selfhosted"'><slot name="selfhosted" /></span>
    <span v-show='edition === "cloud"'><slot name="cloud" /></span>
  </span>
  <div v-else class="vp-code-group">
    <div class="tabs">
      <template v-for="tab in TABS" :key="tab.id">
        <input
          :id="`${group}-${tab.id}`"
          type="radio"
          :name="group"
          :checked="edition === tab.id"
          @change="(edition = tab.id)"
        />
        <label :for="`${group}-${tab.id}`">{{ tab.label }}</label>
      </template>
    </div>
    <div class="edition-panels">
      <div v-show='edition === "selfhosted"' class="edition-panel">
        <slot name="selfhosted" />
      </div>
      <div v-show='edition === "cloud"' class="edition-panel">
        <slot name="cloud" />
      </div>
    </div>
  </div>
</template>

<style>
/* Panels are toggled with `v-show`, not with the `.active` class of `.vp-code-group`: that class
   only reaches the DOM through a class patch, which VitePress' route changes do not reliably
   apply to reused nodes — the tabs would show one edition and the panel the other. */
.vp-code-group .edition-panel {
  padding: 20px 24px 4px;
}

/* `.vp-code-group` hides every code block it contains — it is meant for groups made *of* code
   blocks, and re-shows only the ones it marks `.active`. Here they are ordinary panel content. */
.vp-code-group .edition-panel div[class*="language-"] {
  display: block;
  margin: 16px 0 !important;
  border-radius: 8px !important;
}
</style>
