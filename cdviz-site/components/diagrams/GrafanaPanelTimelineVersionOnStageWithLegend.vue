<script setup>
import { gsap } from "gsap";
import { onUnmounted, onMounted, useTemplateRef } from "vue";
import PanelSvg from "./GrafanaPanelTimelineVersionOnStageWithLegend.svg?skipsvgo";

const componentRoot = useTemplateRef("componentRoot");
let timeline = null;

onMounted(() => {
  const sel = gsap.utils.selector(componentRoot.value);
  timeline = gsap.timeline({ defaults: { ease: "back" } });

  timeline.from(sel(".annotation"), {
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
