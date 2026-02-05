<script setup>
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onUnmounted, onMounted, useTemplateRef } from "vue";
import PanelSvg from "./CdvizArchitecture.svg";

const componentRoot = useTemplateRef("componentRoot");
const selector_prefix = "CdvizArchitecture_svg__";
let timeline = null;

gsap.registerPlugin(ScrollTrigger);

onMounted(() => {
  // Reset elements to initial state
  //gsap.set(`#${ selector_prefix }cdviz-db`, { opacity: 1 });
  timeline = gsap.timeline({
    defaults: {
      duration: 0.5,
      ease: "back",
    },
    scrollTrigger: { trigger: componentRoot.value, start: "top center" },
    // repeat: -1,
    // repeatDelay: 2,
  });

  timeline
    .from(`#${selector_prefix}cdviz-collector`, { opacity: 0 })
    .from(`#${selector_prefix}providers-1-to-cdviz-collector`, { opacity: 0 }, "<")
    .from(`#${selector_prefix}providers-2-to-cdviz-collector`, { opacity: 0 }, "<")
    .from(`#${selector_prefix}cdviz-db`, { opacity: 0 }, "+=1")
    .from(
      `#${selector_prefix}cdviz-collector-to-cdviz-db`,
      {
        opacity: 0,
      },
      "<",
    )
    .from(
      `#${selector_prefix}dashboards-to-cdviz-db`,
      {
        opacity: 0,
      },
      "+=1",
    )
    .from(
      `#${selector_prefix}bus`,
      {
        opacity: 0,
      },
      "+=1",
    )
    .from(
      `#${selector_prefix}cdviz-collector-to-bus`,
      {
        opacity: 0,
      },
      "<",
    )
    .from(
      `#${selector_prefix}webhooks`,
      {
        opacity: 0,
      },
      "+=1",
    )
    .from(
      `#${selector_prefix}cdviz-collector-to-webhooks`,
      {
        opacity: 0,
      },
      "<",
    );
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
    <!-- <img
      src="/architectures/overview_04.excalidraw.svg"
      class="w-full h-auto object-cover relative z-10 transition-transform duration-500 group-hover:scale-[1.02]"
      alt="CDviz architecture diagram showing event flow from sources through collector to database and dashboards"
      role="img"
      loading="lazy"
      decoding="async"
      fetchpriority="low"
    /> -->

    <PanelSvg
      class="h-auto w-full"
      alt="CDviz architecture diagram showing event flow from sources through collector to database and dashboards"
    />
  </div>
</template>
