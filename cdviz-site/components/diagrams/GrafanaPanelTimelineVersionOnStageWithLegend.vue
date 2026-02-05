<script setup>
import { gsap } from "gsap";
import { onUnmounted, onMounted, useTemplateRef } from "vue";
import PanelSvg from "./GrafanaPanelTimelineVersionOnStageWithLegend.svg";

const componentRoot = useTemplateRef("componentRoot");
const selector_prefix = "GrafanaPanelTimelineVersionOnStageWithLegend_svg__";
let timeline = null;

onMounted(() => {
  // Reset elements to initial state
  // gsap.set(`.${selector_prefix}annotation`, { opacity: 1 });
  timeline = gsap.timeline({ defaults: { ease: "back" } });

  timeline.from(`.${selector_prefix}annotation`, {
    opacity: 0,
    duration: 0.5,
    ease: "power2.inOut",
    stagger: {
      from: "end",
      each: 0.8,
    },
    repeat: -1,
    repeatDelay: 2,
  });
});

onUnmounted(() => {
  // Clean up timeline on unmount
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
