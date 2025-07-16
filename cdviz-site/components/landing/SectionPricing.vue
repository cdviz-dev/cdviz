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

const getPrice = (tier) => {
  if (isYearly.value) {
    return Math.round(pricing[tier].yearly / 12);
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
    class="my-xl md:my-2xl bg-gradient-to-b from-background to-secondary/5 py-16"
  >
    <a id="pricing"></a>
    <H2>Pricing & Editions</H2>
    <div class="text-xl text-center mb-8 max-w-3xl mx-auto">
      Choose the plan that works best for your team. Our commitment to Open
      Source means core components are always free.
    </div>

    <!-- Pricing Toggle -->
    <div class="flex items-center justify-center mb-12">
      <span
        class="text-lg mr-4 font-medium"
        :class="{ 'text-current': isYearly, 'text-current/70': !isYearly }"
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
        :class="{ 'text-current': !isYearly, 'text-current/70': isYearly }"
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
      <div
        class="flex flex-col justify-between rounded-xl p-8 pt-4 text-center border-primary border-2"
      >
        <div>
          <H3>Open Source / Community</H3>
          <div class="text-4xl font-bold mx-auto my-4 text-primary">
            €{{ getPrice("community") }}
          </div>
          <div class="text-sm text-gray-600 mb-4">Forever free</div>
          <ul class="my-md ml-2 text-left">
            <li class="check-circle mb-4 pl-8">Collector (AGPL v3)</li>
            <li class="check-circle mb-4 pl-8">Database schemas (ASL v2)</li>
            <li class="check-circle mb-4 pl-8">Grafana components (ASL v2)</li>
            <li class="check-circle mb-4 pl-8">Community Support</li>
          </ul>
        </div>
        <Btn
          href="https://github.com/sponsors/davidB"
          aria-label="go to sponsor page"
          primary
          >Be a sponsor</Btn
        >
      </div>
      <div
        class="flex flex-col justify-between rounded-xl p-8 pt-4 text-center border-secondary border-2"
      >
        <div>
          <H3>Enterprise</H3>
          <div class="text-4xl font-bold mx-auto my-4">
            €{{ getPrice("enterprise") }}
            <span class="text-lg font-normal text-gray-600">/month</span>
          </div>
          <div v-if="isYearly" class="text-sm text-green-600 mb-4">
            Save {{ getDiscount("enterprise") }}%
          </div>
          <div v-else class="text-sm text-gray-600 mb-4">&nbsp;</div>
          <ul class="my-md ml-2 text-left">
            <li class="check-circle mb-4 pl-8">On-premise</li>
            <li class="check-circle mb-4 pl-8">
              Collector (Commercial License)
            </li>
            <li class="check-circle mb-4 pl-8">
              More sources &amp; sinks for collector
            </li>
            <li class="check-circle mb-4 pl-8">Professional support</li>
            <!-- <li class="check-circle mb-4 pl-8">
              Create a custom source or sink
            </li>
            <li class="check-circle mb-4 pl-8">
              Create a custom dashboard or alert
            </li>
            <li class="check-circle mb-4 pl-8">Adapt to your needs</li> -->
          </ul>
        </div>
        <Btn href="/contact" aria-label="Join the waitlist">Join Waitlist</Btn>
      </div>
      <div
        class="flex flex-col justify-between rounded-xl p-8 pt-4 text-center relative border-secondary border-2"
      >
        <div
          class="absolute z-10 right-2 top-1 rotate-6 rounded-md px-2 py-0.5 text-center align-middle text-accent ring-accent ring-1 bg-accent/10 ring-offset-accent/20 ring-offset-1"
        >
          preview
        </div>
        <div class="isDisabled">
          <H3>SaaS</H3>
          <div class="text-4xl font-bold mx-auto my-4">
            €{{ getPrice("saas") }}
            <span class="text-lg font-normal text-gray-600">/month</span>
          </div>
          <div v-if="isYearly" class="text-sm text-green-600 mb-4">
            Save {{ getDiscount("saas") }}%
          </div>
          <div v-else class="text-sm text-gray-600 mb-4">&nbsp;</div>
          <ul class="my-md ml-2 text-left">
            <li class="check-circle mb-4 pl-8">
              Collector with same features than Enterprise
            </li>
            <li class="check-circle mb-4 pl-8">
              Collector operated by us (on our infrastucture)
            </li>
            <li class="check-circle mb-4 pl-8">
              Database operated by you or your provider
            </li>
            <li class="check-circle mb-4 pl-8">
              Dashboard operated by you or your provider
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

.check-circle {
  background-image: url("/icons/check-circle.svg");
  background-position: 0em 0.2em;
  background-repeat: no-repeat;
  background-size: 1.2em;
}
</style>
