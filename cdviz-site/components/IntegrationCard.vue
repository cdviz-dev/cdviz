<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";
import { integrationById, outputOf } from "./data/integrations.ts";

const { frontmatter, page } = useData();

// The integration data lives in components/data/integrations.ts, keyed by page filename.
const integration = computed(() =>
  integrationById(page.value.relativePath.split("/").pop()!.replace(/\.md$/, "")),
);
</script>
<template>
  <h1>{{ frontmatter.title }}</h1>
  <div>
    <p v-html="frontmatter.description"></p>
    <table v-if="integration?.mappings.length">
      <thead>
        <tr>
          <th>From event</th>
          <th>CDEvents</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(mapping, index) in integration.mappings" :key="index">
          <td>{{ mapping.input }}</td>
          <td>{{ outputOf(mapping) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-if="frontmatter.references || integration?.source">
    <h2 id="references">
      References
      <a
        class="header-anchor"
        href="#references"
        aria-label="Permalink to “References”"
      ></a>
    </h2>
    <ul>
      <li v-if="integration?.source">
        <a :href="integration.source" target="_blank">Source code of the transformer</a>
      </li>
      <li v-for="(ref, index) in frontmatter.references" :key="index">
        <a :href="ref.url" target="_blank">{{ ref.title }}</a>
      </li>
    </ul>
  </div>
</template>
