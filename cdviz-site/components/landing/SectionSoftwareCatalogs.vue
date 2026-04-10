<script setup>
import { onMounted } from "vue";
onMounted(() => {
  // script: Slashdot Tag
  {
    const sc = document.createElement("script");
    sc.async = true;
    sc.src = "https://b.sf-syn.com/badge_js?sf_id=4077768&variant_id=sd";
    document.body.appendChild(sc);
  }
  // script: SF Tag
  {
    const sc = document.createElement("script");
    sc.async = true;
    sc.src = "https://b.sf-syn.com/badge_js?sf_id=4077768&variant_id=sf";
    document.body.appendChild(sc);
  }
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
        <a href="https://slashdot.org/software/p/CDviz/" target="_blank">CDviz Reviews</a>
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
        <a href="https://sourceforge.net/software/product/CDviz/" target="_blank">CDviz Reviews</a>
      </div>
      <!-- End SF Tag -->
    </div>
  </section>
</template>
