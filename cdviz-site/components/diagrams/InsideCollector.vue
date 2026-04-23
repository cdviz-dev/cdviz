<script setup>
import { gsap } from "gsap";
import { onUnmounted, onMounted, useTemplateRef } from "vue";
import PanelSvg from "./InsideCollector.svg";

const componentRoot = useTemplateRef("componentRoot");
const p = "InsideCollector_svg__";
let timeline = null;

onMounted(() => {
  //gsap.set(`.${p}source-group, .${p}sink-group, #${p}g3`, { autoAlpha: 0 });
  gsap.set(`.${p}source-group, .${p}sink-group`, { autoAlpha: 0 });

  timeline = gsap.timeline({ repeat: -1, repeatDelay: 2, defaults: { ease: "power2.out" } });

  // Sources appear one by one (each wrapper contains icon + arrow)
  timeline.to(`.${p}source-group`, {
    autoAlpha: 1,
    duration: 0.4,
    stagger: 0.45,
  });

  // Queue appears after all sources
  //timeline.to(`#${p}g3`, { autoAlpha: 1, duration: 0.5 }, "+=0.2");

  // Sinks appear one by one (each wrapper contains icon + arrow)
  timeline.to(`.${p}sink-group`, {
    autoAlpha: 1,
    duration: 0.4,
    stagger: 0.45,
  }, "+=0.2");
});

onUnmounted(() => {
  if (timeline) {
    timeline.kill();
    timeline = null;
  }
});
</script>
<template>
  <div ref="componentRoot">
    <PanelSvg class="h-full w-full" />
  </div>
</template>
