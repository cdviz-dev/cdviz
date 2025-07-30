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
  inline-flex items-center justify-center cursor-pointer
  transition-all duration-200 ease-in-out
  hover:scale-110 hover:shadow-md hover:shadow-primary/25
  rounded-lg bg-primary px-6 sm:px-8 py-3 sm:py-3 text-sm sm:text-base text-background
  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
  active:scale-100 active:shadow-sm font-semibold
  min-h-[44px] min-w-[44px] touch-manipulation
  "><slot></slot></a>
<a v-else v-bind:href v-bind:ariaLabel class="
  inline-flex items-center justify-center cursor-pointer
  transition-all duration-200 ease-in-out
  hover:scale-110 hover:shadow-md hover:bg-secondary/90
  rounded-lg bg-secondary px-6 sm:px-8 py-3 sm:py-3 text-sm sm:text-base text-text
  focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2
  active:scale-100 active:shadow-sm font-semibold
  min-h-[44px] min-w-[44px] touch-manipulation
  "><slot></slot></a>
</template>
