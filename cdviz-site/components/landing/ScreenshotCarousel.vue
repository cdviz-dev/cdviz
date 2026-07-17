<script setup>
import { gsap } from "gsap";
import { onMounted, onUnmounted, ref } from "vue";

// Auto-crossfading screenshot carousel. Stacks `shots` and fades between them
// every `hold` seconds. Container aspect-ratio is taken from the first shot.
// Each shot may set `fit: "cover"` (default "contain"). Respects
// prefers-reduced-motion and cleans up its timer on unmount.
const props = defineProps({
  shots: { type: Array, required: true },
  hold: { type: Number, default: 4 },
  startDelay: { type: Number, default: 3 },
  // Extra classes applied to every image (e.g. border/rounded/shadow).
  frameClass: { type: String, default: "" },
});

const root = ref(null);
let call = null;

onMounted(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || props.shots.length < 2 || !root.value) return;

  const items = Array.from(root.value.querySelectorAll(".carousel-shot"));
  if (items.length < 2) return;

  let index = 0;
  const cycle = () => {
    const current = items[index];
    index = (index + 1) % items.length;
    const next = items[index];

    gsap.to(current, { opacity: 0, duration: 0.5, ease: "power2.in" });
    gsap.to(next, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out",
      onComplete() {
        call = gsap.delayedCall(props.hold, cycle);
      },
    });
  };

  call = gsap.delayedCall(props.startDelay, cycle);
});

onUnmounted(() => call?.kill());
</script>

<template>
  <div
    ref="root"
    class="relative"
    :style="{ aspectRatio: `${shots[0].width} / ${shots[0].height}` }"
  >
    <img
      v-for="(shot, i) in shots"
      :key="shot.src"
      class="carousel-shot absolute inset-0 w-full h-full"
      :class='[frameClass, shot.fit === "cover" ? "object-cover" : "object-contain"]'
      :src="shot.src"
      :alt="shot.alt"
      :width="shot.width"
      :height="shot.height"
      loading="lazy"
      decoding="async"
      :style="{ opacity: i === 0 ? 1 : 0 }"
    />
  </div>
</template>
