<script setup>
import { onMounted } from "vue";
onMounted(() => {
  // script: Slashdot / SourceForge / TopBusinessSoftware Tag
  ["sd", "sf", "tbs"].forEach((variant) => {
    const id = "sf-badge-" + variant;
    if (document.getElementById(id)) return;
    const sc = document.createElement("script");
    sc.id = id;
    sc.async = true;
    sc.src = "https://b.sf-syn.com/badge_js?sf_id=4077768&variant_id=" + variant;
    document.body.appendChild(sc);
  });
});
</script>
<template>
  <section class="w-full" aria-label="Software Catalogs" aria-labelledby="software-catalogs">
    <a id="software-catalogs"></a>
    <div class="flex items-center justify-center gap-6">
      <!-- Begin Slashdot Tag -->
      <div
        class="sf-root"
        data-id="4077768"
        data-badge="light-default"
        data-variant-id="sd"
        style="width: 125px"
      >
        <a href="https://slashdot.org/software/p/CDviz/" target="_blank"
        >CDviz Reviews at Slashdot</a>
      </div>
      <!-- End Slashdot Tag -->
      <!-- Begin SF Tag -->
      <div
        class="sf-root"
        data-id="4077768"
        data-badge="light-default"
        data-variant-id="sf"
        style="width: 125px"
      >
        <a href="https://sourceforge.net/software/product/CDviz/" target="_blank"
        >CDviz Reviews at Sourceforge</a>
      </div>
      <!-- End SF Tag -->
      <!-- Begin TBS Tag -->
      <div
        class="sf-root"
        data-id="4077768"
        data-badge="light-default"
        data-variant-id="tbs"
        style="width: 125px"
      >
        <a href="https://topbusinesssoftware.com/products/CDviz/reviews/" target="_blank"
        >CDviz Reviews at TopBusinessSoftware</a>
      </div>
      <!-- End TBS Tag -->
    </div>
  </section>
</template>
