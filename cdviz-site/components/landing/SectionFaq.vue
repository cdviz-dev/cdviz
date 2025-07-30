<script setup>
import H2 from "./H2.vue";

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
  <section class="my-xl md:my-2xl bg-gradient-to-br from-background to-secondary/4 py-16 px-8 rounded-2xl shadow-sm border border-secondary/10">
    <a id="faq"></a>
    <H2>Frequently Asked Questions</H2>
    <div class="max-w-3xl mx-auto">
      <template v-for="aq in $frontmatter.faq" :key="aq.q">
        <!-- Category Header -->
        <div v-if="aq.a === ''" class="mt-8 mb-4 first:mt-0">
          <h3 class="text-2xl font-bold text-center text-primary">{{ aq.q }}</h3>
          <div class="w-16 h-1 bg-primary mx-auto mt-2 rounded-full"></div>
        </div>
        <!-- FAQ Item -->
        <details v-else class="cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md bg-secondary/20 my-4 rounded-xl p-6 shadow-sm">
          <summary class="text-xl font-semibold cursor-pointer">{{ aq.q }}</summary>
          <div class="pt-4 text-text/90 space-y-4" v-html="aq.a"></div>
        </details>
      </template>
    </div>
  </section>
</template>
