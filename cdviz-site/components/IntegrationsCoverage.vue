<script setup lang="ts">
import { ref } from "vue";
import { GROUPS, SUBJECTS, coverageOf, integrations } from "./data/integrations.ts";

// Both renderings of a cell are in the statically rendered HTML (SEO/GEO friendly);
// the toggle only hides/shows them via v-show — same rule as SectionUseCases.vue.
const showPredicates = ref(false);

// One row per provider, whatever the number of integrations behind it.
const rows = GROUPS.map((group) => {
  const members = integrations.filter((i) => i.group === group.id && i.mappings.length > 0);
  return { group, members, cells: SUBJECTS.map((s) => coverageOf(members, s)) };
}).filter((row) => row.members.length > 0);
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-1.5 rounded-full border px-md py-1.5 text-sm transition-all duration-200 focus-ring"
    :class='showPredicates
    ? "border-primary bg-primary/15 text-primary font-semibold"
    : "border-secondary/20 text-text/70 hover:border-primary/40 hover:text-text"'
    :aria-pressed="showPredicates"
    @click="(showPredicates = !showPredicates)"
  >
    <span class="icon-[lucide--list]" aria-hidden="true"></span>
    Display predicates
  </button>

  <div class="overflow-x-auto">
    <table>
      <thead>
        <tr>
          <th>Source</th>
          <th v-for="subject in SUBJECTS" :key="subject">{{ subject }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.group.id">
          <td class="whitespace-nowrap">
            <span class="inline-flex items-center gap-1.5 font-semibold">
              <span :class="row.group.icon" aria-hidden="true"></span>
              <a v-if="row.members.length === 1" :href="row.members[0].page">{{
                row.group.label
              }}</a>
              <template v-else>{{ row.group.label }}</template>
            </span>
            <span v-if="row.members.length > 1" class="block text-sm text-text/70">
              <template v-for="(member, index) in row.members" :key="member.id">
                <template v-if="index">, </template>
                <a :href="member.page">{{ member.name }}</a>
              </template>
            </span>
          </td>
          <td
            v-for="(cell, index) in row.cells"
            :key="index"
            :title="cell.title"
            class="text-center"
          >
            <template v-if="cell.predicates.length">
              <span v-show="!showPredicates" aria-label="supported">✓</span>
              <span v-show="showPredicates">{{ cell.predicates.join(", ") }}</span>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <p class="text-sm text-text/70">
    A row covers all the integrations listed under it: a subject may be emitted by only some of them
    — hover a cell, or open the integration page, to see which.
  </p>
</template>
