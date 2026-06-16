<script setup>
import H2 from "./H2.vue";
import Pricing from "./SectionPricing.vue";
</script>

<template>
  <Pricing :only='["cloud"]'>
    <template #header>
      <div class="text-center max-w-[46ch] mx-auto mb-2xl">
        <H2>Simple pricing for small teams.</H2>
        <p class="text-text/60 mt-md">
          Start free. Upgrade when it's earning its place in your week.
        </p>
      </div>
    </template>
    <template #footer>
      <p class="mt-lg text-sm text-text/60 text-center">
        Want to self-host, or need support &amp; integrations for a larger org?<br />
        <a href="/pricing" class="text-primary cdviz-mono hover:underline">
          See the open-source &amp; Pro plans →
        </a>
      </p>
    </template>
  </Pricing>
</template>
