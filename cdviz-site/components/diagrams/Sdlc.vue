<script setup>
import { gsap } from "gsap";
import { onUnmounted, onMounted, useTemplateRef } from "vue";
import PanelSvg from "./Sdlc.svg";

const componentRoot = useTemplateRef("componentRoot");
const selector_prefix = "Sdlc_svg__";
let timeline = null;

onMounted(() => {
  gsap.set(`#${selector_prefix}cdevents text`, {
    opacity: 0,
    scaleY: 0.1,
  });
  gsap.set(`#${selector_prefix}apps path`, {
    opacity: 0,
    scaleY: 0.2,
  });
  timeline = gsap.timeline({ defaults: { ease: "back" } });
  timeline
    //.to(`#${selector_prefix}apps`, { autoAlpha: 1, duration:0.1 })
    .from(`#${selector_prefix}boxflow g`, {
      opacity: 0,
      stagger: {
        each: 0.8,
        from: "end",
      },
    })
    .to(
      `#${selector_prefix}apps path`,
      {
        opacity: 1,
        scale: 1,
        transformOrigin: "center center",
        stagger: {
          each: 0.1,
          from: "end",
        },
      },
      "+=3",
    )
    .add("cdevents")
    .to(
      `#${selector_prefix}apps`,
      {
        opacity: 0,
        duration: 0.5,
      },
      "+=1",
    )
    .to(
      `#${selector_prefix}cdevents text`,
      {
        opacity: 1,
        scale: 1,
        stagger: {
          each: 0.3,
          from: "end",
        },
      },
      ">",
    );
});

onUnmounted(() => {
  // Clean up timeline on unmount
  if (timeline) {
    timeline.kill();
  }
});
</script>
<template>
  <div ref="componentRoot">
    <PanelSvg class="h-full w-full" />
  </div>
</template>
