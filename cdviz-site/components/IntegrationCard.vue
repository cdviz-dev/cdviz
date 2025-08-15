<script setup>
</script>
<template>
  <h1>{{ $frontmatter.title }}</h1>
  <div>
    <p v-html="$frontmatter.description"></p>
    <table>
      <thead>
        <tr>
          <th>CDEvents</th>
          <th>From event</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="event in $frontmatter.integration.events" :key="index">
          <td v-html="event.output"></td>
          <td v-html="event.input"></td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-if="$frontmatter.references">
    <h2 id="references">
      References
      <a
        class="header-anchor"
        href="#references"
        aria-label="Permalink to “References”"
      ></a>
    </h2>
    <ul>
      <li v-for="(ref, index) in $frontmatter.references" :key="index">
        <a :href="ref.url" target="_blank">{{ ref.title }}</a>
      </li>
    </ul>
  </div>
</template>
