---
title: Blog
description: Tutorials, walkthroughs, and deep dives into CDviz and CDEvents — practical SDLC observability in action.
---

<script setup>
import { computed } from 'vue'
import { data as posts } from './posts.data.ts'

const seriesPosts = computed(() => posts.filter((p) => p.series === 'CDEvents in Action'))
const otherPosts = computed(() => posts.filter((p) => p.series !== 'CDEvents in Action'))
</script>

# Blog

Practical walkthroughs showing how to use CDviz and CDEvents to monitor your software delivery pipeline.

## Latest

<ul>
  <li v-for="post in otherPosts" :key="post.url">
    <a :href="post.url">{{ post.title }}</a>
    <em v-if="post.status !== 'published'"> (draft)</em>
  </li>
</ul>

## CDEvents in Action

A step-by-step series taking you from zero to a fully observable SDLC stack.

<ul>
  <li v-for="post in seriesPosts" :key="post.url">
    <a :href="post.url">{{ post.shortTitle }}</a>
    <em v-if="post.status !== 'published'"> (draft)</em>
  </li>
</ul>
