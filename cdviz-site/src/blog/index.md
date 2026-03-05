---
title: Blog
description: Tutorials, walkthroughs, and deep dives into CDviz and CDEvents — practical SDLC observability in action.
---

<script setup>
import { data as posts } from './posts.data.ts'
</script>

# Blog

Practical walkthroughs showing how to use CDviz and CDEvents to monitor your software delivery pipeline.

## CDEvents in Action

A step-by-step series taking you from zero to a fully observable SDLC stack.

<ul>
  <li v-for="post in posts" :key="post.url">
    <a :href="post.url">{{ post.shortTitle }}</a>
    <em v-if="post.status !== 'published'"> (draft)</em>
  </li>
</ul>
