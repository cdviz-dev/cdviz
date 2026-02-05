<script setup>
import { gsap } from "gsap";
import { onUnmounted, onMounted, useTemplateRef } from "vue";
import PanelSvg from "./Empty.svg";
//import { GSDevTools } from "gsap/GSDevTools";

const componentRoot = useTemplateRef("componentRoot");
const selector_prefix = "Sdlc_svg__";
let timeline = null;

//gsap.registerPlugin(GSDevTools);

onMounted(() => {
  //GSDevTools.create({ animation: timeline });
  // Reset elements to initial state
  // gsap.set(`.${selector_prefix}annotation`, { opacity: 1 });
  // timeline = gsap.timeline({ defaults: { ease: "back" } });
  // GSDevTools.create({ animation: timeline });
  // timeline
  //   .to(`#${selector_prefix}xxx`, { autoAlpha: 1, duration: 0.1 })
  //   .from(`#${selector_prefix}xxx`, {
  //     opacity: 0,
  //     stagger: {
  //       each: 0.8,
  //       from: "end",
  //     },
  //   })
  //   ;
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
