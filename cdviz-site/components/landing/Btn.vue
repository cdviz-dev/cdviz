<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  href: String,
  primary: Boolean,
  ariaLabel: String,
  loading: Boolean,
  disabled: Boolean,
});

const isLoading = ref(false);
const isHovered = ref(false);

const buttonClasses = computed(() => {
  const base = `
    inline-flex items-center justify-center cursor-pointer
    font-semibold min-h-[44px] min-w-[44px] touch-manipulation
    rounded-lg px-6 sm:px-8 py-3 sm:py-3 text-sm sm:text-base
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transform-gpu transition-all duration-300 ease-out
    relative overflow-hidden
  `;

  if (props.disabled || props.loading) {
    return base + ` opacity-50 cursor-not-allowed pointer-events-none`;
  }

  if (props.primary) {
    return (
      base +
      `
      bg-primary text-background
      hover:scale-105 hover:shadow-[0_8px_30px_-8px_var(--primary)] hover:shadow-primary/50
      focus:ring-primary focus:scale-105
      active:scale-95 active:shadow-sm
      before:absolute before:inset-0 before:bg-gradient-to-r
      before:from-transparent before:via-white/20 before:to-transparent
      before:translate-x-[-100%] hover:before:translate-x-[100%]
      before:transition-transform before:duration-700 before:ease-out
      shadow-lg shadow-primary/20
    `
    );
  } else {
    return (
      base +
      `
      bg-secondary text-text
      hover:scale-105 hover:shadow-lg hover:bg-secondary/90
      focus:ring-secondary focus:scale-105
      active:scale-95 active:shadow-sm
      before:absolute before:inset-0 before:bg-gradient-to-r
      before:from-transparent before:via-white/10 before:to-transparent
      before:translate-x-[-100%] hover:before:translate-x-[100%]
      before:transition-transform before:duration-700 before:ease-out
    `
    );
  }
});

const handleClick = (event) => {
  if (props.disabled || props.loading) {
    event.preventDefault();
    return;
  }

  // Add loading state for external links
  if (props.href && (props.href.startsWith("http") || props.href.includes("creem.io"))) {
    isLoading.value = true;
    // Reset loading state after a reasonable time
    setTimeout(() => {
      isLoading.value = false;
    }, 2000);
  }
};
</script>
<template>
  <a
    :href="href"
    :aria-label="ariaLabel"
    :class="buttonClasses"
    @click="handleClick"
    @mouseenter="(isHovered = true)"
    @mouseleave="(isHovered = false)"
  >
    <!-- Loading Spinner -->
    <div
      v-if="loading || isLoading"
      class="absolute inset-0 flex items-center justify-center"
    >
      <div class="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent">
      </div>
    </div>

    <!-- Button Content -->
    <span
      :class='{ "opacity-0": loading || isLoading }'
      class="relative z-10 transition-opacity duration-200"
    >
      <slot></slot>
    </span>

    <!-- Ripple Effect -->
    <span
      v-if="isHovered && !loading && !isLoading"
      class="absolute inset-0 rounded-lg animate-pulse"
      :class='primary ? "bg-white/10" : "bg-primary/10"'
    ></span>
  </a>
</template>
