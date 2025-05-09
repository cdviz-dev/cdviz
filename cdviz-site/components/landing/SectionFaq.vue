<script setup>
import H2 from './H2.vue';

// //const { page } = useData()
// const faq = ref([
//   {
//     q: "Is it free to use?",
//     a: "Yes, you can use the Open Source components for free.</br>ee"
//     // No, self-hosting is not free, as you have spend time and money on
//     // configuration, maintenance, and support of your own
//     // infrastructure.
//     // <br/>
//     // No, some components could not be available for free."
//   }
// ])
</script>
<template>
  <section class="my-xl md:my-2xl bg-secondary/5 py-16 rounded-2xl">
    <a id="faq"></a>
    <H2>Frequently Asked Questions</H2>
    <div class="max-w-3xl mx-auto">
      <details v-for="aq in $frontmatter.faq" class="cursor-pointer transition-all duration-300 hover:scale-105 hover:cursor-pointer hover:shadow-lg bg-white dark:bg-secondary/20 my-4 rounded-xl p-6 shadow-sm">
        <summary class="text-xl font-semibold cursor-pointer">{{ aq.q }}</summary>
        <div class="pt-4 text-text/80 space-y-4" v-html="aq.a"></div>
      </details>
    </div>
  </section>
</template>
