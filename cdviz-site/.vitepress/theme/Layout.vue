<script setup lang="ts">
import DefaultTheme from "vitepress/theme";

import Comments from "../../components/Comments.vue";
import { useExternalLinkTracking } from "../../composables/useExternalLinkTracking";

const { Layout } = DefaultTheme;
useExternalLinkTracking();
</script>

<template>
  <Layout>
    <template #doc-after>
      <Comments />
    </template>
  </Layout>
</template>
