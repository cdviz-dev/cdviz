<script setup>
import { gsap } from "gsap";
import { onMounted } from "vue";
import PanelTimelineSvg from "../../assets/screenshots/grafana_panel_timeline_version_on_stage-legend.svg"; // ?component tells SVGR to transform it
onMounted(() => {
  const tl = gsap.timeline();
  // class "annotation" is prefixed by svgo with filename to avoid conflict
  const selector = ".grafana_panel_timeline_version_on_stage-legend_svg__annotation";
  tl.from(selector, {
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
</script>
<template>
  <section>
    <div class="text-sm sm:text-base text-center my-lg max-w-5xl mx-auto text-text/90 italic">
      <a href="/docs/cdviz-grafana/artifact_timeline.html">
        Example of a panel to track timeline & deployment of an artifact.<br />
        <!-- <img
          src="/screenshots/grafana_panel_timeline_version_on_stage-legend.svg"
          atl="artifact timeline panel with legend and annotation"
          class="w-full h-auto object-cover"
          role="img"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
        /> -->
        <PanelTimelineSvg id="panel-timeline-svg" />
      </a>
    </div>
  </section>
</template>
