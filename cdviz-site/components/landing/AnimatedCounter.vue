<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCountAnimation } from '../../composables/useScrollAnimation.js';

const props = defineProps({
  end: {
    type: Number,
    required: true
  },
  start: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 2000
  },
  suffix: {
    type: String,
    default: ''
  },
  prefix: {
    type: String,
    default: ''
  },
  formatter: {
    type: Function,
    default: (n) => n.toLocaleString()
  },
  trigger: {
    type: String,
    default: 'intersection' // 'intersection' or 'immediate'
  }
});

const counterRef = ref(null);
const hasAnimated = ref(false);
const { animate } = useCountAnimation();

const formattedNumber = computed(() => {
  return props.prefix + props.formatter(props.end) + props.suffix;
});

const startAnimation = () => {
  if (hasAnimated.value || !counterRef.value) return;
  
  hasAnimated.value = true;
  animate(counterRef.value, {
    start: props.start,
    end: props.end,
    duration: props.duration,
    formatter: (n) => props.prefix + props.formatter(n) + props.suffix
  });
};

onMounted(() => {
  if (props.trigger === 'immediate') {
    startAnimation();
  } else {
    // Use intersection observer for scroll-triggered animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAnimation();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '0px 0px -20% 0px'
      }
    );

    if (counterRef.value) {
      observer.observe(counterRef.value);
    }
  }
});
</script>

<template>
  <span 
    ref="counterRef" 
    class="counter-number font-bold text-primary tabular-nums"
    :class="$attrs.class"
  >
    {{ formattedNumber }}
  </span>
</template>

<style scoped>
.counter-number {
  font-variant-numeric: tabular-nums;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>