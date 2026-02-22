<script setup lang="ts">
import { computed } from "vue";
import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";

import Comments from "../../components/Comments.vue";
import { useExternalLinkTracking } from "../../composables/useExternalLinkTracking";

const { Layout } = DefaultTheme;
const { page, frontmatter } = useData();

useExternalLinkTracking();

const isBlogPost = computed(() => page.value.relativePath.startsWith("blog/"));
const showBlogMeta = computed(
  () => isBlogPost.value && (frontmatter.value.author || frontmatter.value.date),
);
</script>

<template>
  <Layout>
    <template #doc-before>
      <div v-if="showBlogMeta" class="blog-meta">
        <time v-if="frontmatter.date" :datetime="frontmatter.date">{{ frontmatter.date }}</time>
        <span v-if="frontmatter.author">
          &nbsp;·&nbsp; by&nbsp;
          <a
            v-if="frontmatter.author_github"
            :href="`https://github.com/${frontmatter.author_github}`"
            target="_blank"
            rel="noopener noreferrer"
          >{{ frontmatter.author }}</a>
          <span v-else>{{ frontmatter.author }}</span>
        </span>
      </div>
    </template>
    <template #doc-after>
      <Comments />
    </template>
  </Layout>
</template>

<style scoped>
.blog-meta {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
}
</style>
