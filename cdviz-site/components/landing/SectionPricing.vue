<script setup>
import { ref } from "vue";
import Btn from "./Btn.vue";
import H2 from "./H2.vue";
import H3 from "./H3.vue";

const isYearly = ref(true);

const pricing = {
  community: {
    monthly: 0,
    yearly: 0,
  },
  enterprise: {
    monthly: 109,
    yearly: 1100,
  },
  saas: {
    monthly: 129,
    yearly: 1390,
  },
};

const getSubscriptionUrl = (tier) => {
  if (tier === "enterprise") {
    if (isYearly.value) {
      return "https://www.creem.io/payment/prod_1OwS2VDgI2cwcPSB7xiJpA";
    }
    return "https://www.creem.io/payment/prod_1PYPUFjff96gSIKvovlkKk";
  }
  return "";
};

const getPrice = (tier) => {
  if (isYearly.value) {
    return Math.ceil(pricing[tier].yearly / 12);
  }
  return pricing[tier].monthly;
};

const getDiscount = (tier) => {
  if (tier === "community") return 0;
  const monthly = pricing[tier].monthly * 12;
  const yearly = pricing[tier].yearly;
  return Math.round(((monthly - yearly) / monthly) * 100);
};

const getDiscountMax = () => {
  return Object.keys(pricing).reduce((max, key) => {
    const discount = getDiscount(key);
    return discount > max ? discount : max;
  }, 0);
};
</script>

<template>
  <section
    class="my-xl md:my-2xl bg-gradient-to-br from-secondary/2 to-secondary/6 py-16 px-8 rounded-2xl shadow-sm"
  >
    <a id="pricing"></a>
    <H2>Pricing & Editions</H2>
    <div class="text-xl text-center mb-8 max-w-3xl mx-auto text-text/90">
      Start free with open source, scale with enterprise features. 
      Built for teams that value transparency and control.
    </div>

    <!-- Pricing Toggle -->
    <div class="flex items-center justify-center mb-12">
      <span
        class="text-lg mr-4 font-medium"
        :class="{ 'text-current': isYearly, 'text-current/80': !isYearly }"
        >Monthly</span
      >
      <button
        @click="isYearly = !isYearly"
        class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ring-2 ring-primary shadow-md"
        :class="isYearly ? 'bg-primary' : 'bg-gray-300'"
      >
        <span
          class="inline-block h-6 w-6 transform rounded-full bg-primary transition-transform shadow-sm"
          :class="isYearly ? 'translate-x-7' : 'translate-x-1'"
        />
      </button>
      <span
        class="text-lg ml-4 flex items-center font-medium"
        :class="{ 'text-current': !isYearly, 'text-current/80': isYearly }"
      >
        Annual
        <span
          class="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full font-normal"
        >
          Save up to {{ getDiscountMax() }}%
        </span>
      </span>
    </div>
    <div class="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
      <!-- Community Plan -->
      <div
        class="flex flex-col justify-between rounded-xl p-8 pt-4 text-center border-2 border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800 relative"
      >
        <div>
          <H3 class="text-green-700 dark:text-green-300">Open Source / Community</H3>
          <div class="text-4xl font-bold mx-auto my-4 text-green-700 dark:text-green-300">
            €{{ getPrice("community") }}
          </div>
          <div class="text-sm font-semibold text-green-600 dark:text-green-400 mb-4">Forever free</div>
          <ul class="my-6 text-left">
            <li class="flex items-center gap-3 mb-4">
              <span class="icon-[lucide--workflow] h-5 w-5 text-green-600 flex-shrink-0"></span>
              <span>Collector (AGPL v3)</span>
            </li>
            <li class="flex items-center gap-3 mb-4">
              <span class="icon-[lucide--database] h-5 w-5 text-green-600 flex-shrink-0"></span>
              <span>Database schemas (ASL v2)</span>
            </li>
            <li class="flex items-center gap-3 mb-4">
              <span class="icon-[lucide--bar-chart-3] h-5 w-5 text-green-600 flex-shrink-0"></span>
              <span>Grafana components (ASL v2)</span>
            </li>
            <li class="flex items-center gap-3 mb-4">
              <span class="icon-[lucide--users] h-5 w-5 text-green-600 flex-shrink-0"></span>
              <span>Community Support</span>
            </li>
          </ul>
        </div>
        <Btn href="/docs">Get Started</Btn>
      </div>
      <!-- Enterprise Plan -->
      <div
        class="flex flex-col justify-between rounded-xl p-8 pt-4 text-center border-2 border-blue-300 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-700 relative transform md:scale-105 md:shadow-xl md:z-10"
      >
        <div>
          <H3 class="text-blue-700 dark:text-blue-300">Enterprise</H3>
          <div class="text-5xl font-bold mx-auto my-4 text-blue-700 dark:text-blue-300">
            €{{ getPrice("enterprise") }}
            <span class="text-xl font-normal text-gray-600 dark:text-gray-400">/month</span>
          </div>
          <div v-if="isYearly" class="text-sm text-green-600 mb-4">
            Save {{ getDiscount("enterprise") }}%
          </div>
          <div v-else class="text-sm text-gray-600 mb-4">&nbsp;</div>
          <ul class="my-6 text-left">
            <li class="flex items-center gap-3 mb-4">
              <span class="icon-[lucide--building] h-5 w-5 text-blue-600 flex-shrink-0"></span>
              <span>On-premise</span>
            </li>
            <li class="flex items-center gap-3 mb-4">
              <span class="icon-[lucide--workflow] h-5 w-5 text-blue-600 flex-shrink-0"></span>
              <span>Collector (Commercial License)</span>
            </li>
            <li class="flex items-center gap-3 mb-4">
              <span class="icon-[lucide--plug] h-5 w-5 text-blue-600 flex-shrink-0"></span>
              <span>More sources &amp; sinks for collector</span>
            </li>
            <li class="flex items-center gap-3 mb-4">
              <span class="icon-[lucide--headphones] h-5 w-5 text-blue-600 flex-shrink-0"></span>
              <span>Professional support</span>
            </li>
            <!-- <li class="check-circle mb-4 pl-8">
              Create a custom source or sink
            </li>
            <li class="check-circle mb-4 pl-8">
              Create a custom dashboard or alert
            </li>
            <li class="check-circle mb-4 pl-8">Adapt to your needs</li> -->
          </ul>
        </div>
        <Btn
          :href="getSubscriptionUrl('enterprise')"
          aria-label="Subscribe to Enterprise"
          primary
          >Subscribe Now</Btn
        >
      </div>
      <!-- SaaS Plan - Preview -->
      <div
        class="flex flex-col justify-between rounded-xl p-8 pt-4 text-center relative border-2 border-purple-200 bg-purple-50/30 dark:bg-purple-950/10 dark:border-purple-800"
      >
        <div
          class="absolute z-10 right-3 top-3 rotate-12 rounded-lg px-3 py-1 text-center text-sm font-semibold text-purple-700 bg-gradient-to-r from-purple-100 to-purple-200 border border-purple-300 shadow-sm dark:from-purple-800 dark:to-purple-900 dark:text-purple-200 dark:border-purple-600"
        >
          Coming Soon
        </div>
        <div class="isDisabled">
          <H3 class="text-purple-700 dark:text-purple-300">SaaS</H3>
          <div class="text-4xl font-bold mx-auto my-4 text-purple-700 dark:text-purple-300">
            €{{ getPrice("saas") }}
            <span class="text-lg font-normal text-gray-600 dark:text-gray-400">/month</span>
          </div>
          <div v-if="isYearly" class="text-sm text-green-600 mb-4">
            Save {{ getDiscount("saas") }}%
          </div>
          <div v-else class="text-sm text-gray-600 mb-4">&nbsp;</div>
          <ul class="my-6 text-left">
            <li class="flex items-center gap-3 mb-4">
              <span class="icon-[lucide--workflow] h-5 w-5 text-purple-600 flex-shrink-0"></span>
              <span>Collector with same features than Enterprise</span>
            </li>
            <li class="flex items-center gap-3 mb-4">
              <span class="icon-[lucide--cloud] h-5 w-5 text-purple-600 flex-shrink-0"></span>
              <span>Collector operated by us (on our infrastructure)</span>
            </li>
            <li class="flex items-center gap-3 mb-4">
              <span class="icon-[lucide--database] h-5 w-5 text-purple-600 flex-shrink-0"></span>
              <span>Database operated by you or your provider</span>
            </li>
            <li class="flex items-center gap-3 mb-4">
              <span class="icon-[lucide--monitor] h-5 w-5 text-purple-600 flex-shrink-0"></span>
              <span>Dashboard operated by you or your provider</span>
            </li>
          </ul>
        </div>
        <!-- href="mailto:contact@cdviz.dev?subject=SaaS%20plan%20inquiry" -->
        <Btn href="/contact" aria-label="Join the waitlist">Join Waitlist</Btn>
      </div>
    </div>
    <div class="text-center mt-12 text-current/90">
      <p>
        All prices are in Euro (€) and exclude VAT. The Community edition is
        free forever, while the Enterprise and SaaS editions offer additional
        features and support. For more information or custom request, please
        <a href="/contact" class="text-primary hover:underline">contact us</a>.
      </p>
    </div>
  </section>
</template>

<style lang="css">
.isDisabled {
  color: currentColor;
  cursor: not-allowed;
  opacity: 0.5;
  text-decoration: none;
  pointer-events: none;
}
</style>
