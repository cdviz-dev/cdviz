<script setup>
const props = defineProps({
  href: String,
  primary: Boolean,
  ariaLabel: String,
});
// const colorVariant = primary
//   ? "hover:shadow-primary/20 bg-primary text-background focus:ring-primary"
//   : "hover:shadow-lg bg-secondary text-text focus:ring-secondary"
//   ;
</script>
<template>
<a v-if="primary" v-bind:href v-bind:ariaLabel class="
  cursor-pointer transition-all duration-300
  hover:scale-110 hover:cursor-pointer hover:shadow-lg hover:shadow-primary/20
  rounded-lg bg-primary px-8 py-3 text-background
  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
  active:bg-secondary/80 font-semibold
  "><slot></slot></a>
<a v-else v-bind:href v-bind:ariaLabel class="
  cursor-pointer transition-all duration-300
  hover:scale-110 hover:cursor-pointer hover:shadow-lg
  rounded-lg bg-secondary px-8 py-3 text-text
  focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2
  active:bg-secondary/80 font-semibold
  "><slot></slot></a>
</template>
