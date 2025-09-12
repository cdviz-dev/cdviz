<script setup>
import { computed, onMounted, ref } from "vue";
import { useScrollAnimation } from "../../composables/useScrollAnimation.js";
import AnimatedCounter from "./AnimatedCounter.vue";
import Btn from "./Btn.vue";
import H2 from "./H2.vue";
import H3 from "./H3.vue";

const isYearly = ref(true);
const isToggling = ref(false);

const pricingPlans = [
  {
    id: "community",
    title: "Community",
    subtitle: "Forever free",
    pricing: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      { icon: "icon-[lucide--workflow]", text: "Collector (ASL v2)" },
      { icon: "icon-[lucide--database]", text: "Database schemas (ASL v2)" },
      {
        icon: "icon-[lucide--bar-chart-3]",
        text: "Grafana components (ASL v2)",
      },
      { icon: "icon-[lucide--users]", text: "Community Support" },
    ],
    button: {
      text: "Get Started",
      href: "/docs",
      primary: false,
    },
    colorScheme: "secondary",
    highlighted: false,
    disabled: false,
  },
  {
    id: "enterprise",
    title: "Enterprise",
    subtitle: "",
    pricing: {
      monthly: 109,
      yearly: 1100,
    },
    features: [
      { icon: "icon-[lucide--building]", text: "On-premise" },
      { icon: "icon-[lucide--workflow]", text: "Optional Commercial License" },
      { icon: "icon-[lucide--plug]", text: "Additional integrations" },
      { icon: "icon-[lucide--headphones]", text: "Professional support" },
    ],
    button: {
      text: "Subscribe Now",
      href: "",
      primary: true,
    },
    colorScheme: "primary",
    highlighted: true,
    disabled: false,
  },
  {
    id: "saas",
    title: "SaaS",
    subtitle: "",
    pricing: {
      monthly: 129,
      yearly: 1390,
    },
    features: [
      {
        icon: "icon-[lucide--workflow]",
        text: "Same features than Enterprise",
      },
      { icon: "icon-[lucide--cloud]", text: "Collector on our infrastructure" },
    ],
    button: {
      text: "Join Waitlist",
      href: "/contact",
      primary: false,
    },
    colorScheme: "secondary",
    highlighted: false,
    disabled: true,
    badge: "Coming Soon",
  },
];

const getSubscriptionUrl = (tier) => {
  if (tier === "enterprise") {
    if (isYearly.value) {
      return "https://www.creem.io/payment/prod_1OwS2VDgI2cwcPSB7xiJpA";
    }
    return "https://www.creem.io/payment/prod_1PYPUFjff96gSIKvovlkKk";
  }
  return "";
};

const getPrice = (plan) => {
  if (isYearly.value) {
    return Math.ceil(plan.pricing.yearly / 12);
  }
  return plan.pricing.monthly;
};

const getDiscount = (plan) => {
  if (plan.id === "community") return 0;
  const monthly = plan.pricing.monthly * 12;
  const yearly = plan.pricing.yearly;
  return Math.round(((monthly - yearly) / monthly) * 100);
};

const getDiscountMax = () => {
  return pricingPlans.reduce((max, plan) => {
    const discount = getDiscount(plan);
    return discount > max ? discount : max;
  }, 0);
};

const getButtonHref = (plan) => {
  if (plan.id === "enterprise") {
    return getSubscriptionUrl("enterprise");
  }
  return plan.button.href;
};

const getCardClasses = (plan) => {
  const baseClasses =
    "flex flex-col justify-between rounded-xl p-6 text-center relative transform-gpu card-hover";
  const colorClasses =
    plan.colorScheme === "primary"
      ? "border-2 border-primary/30 bg-primary/5"
      : "border-2 border-secondary/20 bg-secondary/5";
  const highlightClasses = plan.highlighted
    ? "transform md:scale-105 md:shadow-xl md:z-10"
    : "";

  return `${baseClasses} ${colorClasses} ${highlightClasses}`;
};

const togglePricing = () => {
  isToggling.value = true;
  setTimeout(() => {
    isYearly.value = !isYearly.value;
    setTimeout(() => {
      isToggling.value = false;
    }, 150);
  }, 100);
};

const sectionRef = ref(null);
const { observeMultiple } = useScrollAnimation({
  threshold: 0.1,
  stagger: 150,
  animationType: "scale-in",
});

onMounted(() => {
  if (sectionRef.value) {
    const pricingCards = sectionRef.value.querySelectorAll(
      "[data-animate-pricing]",
    );
    observeMultiple(Array.from(pricingCards), "scale-in");
  }
});
</script>

<template>
  <section
    ref="sectionRef"
    class="space-section bg-gradient-to-br from-secondary/2 to-secondary/6 rounded-2xl shadow-sm"
  >
    <a id="pricing"></a>
    <H2>Pricing & Editions</H2>
    <div
      class="text-base sm:text-lg lg:text-xl text-center my-lg max-w-5xl mx-auto text-text/90"
    >
      Start free with open source, scale with enterprise features. Built for
      teams that value transparency and control.
    </div>

    <!-- Pricing Toggle -->
    <div class="flex flex-col sm:flex-row items-center justify-center my-xl gap-4 sm:gap-0">
      <div class="flex items-center gap-3 sm:gap-4">
        <span
          class="text-base sm:text-lg font-medium transition-colors duration-200"
          :class="{ 'text-current': !isYearly, 'text-current/60': isYearly }"
        >
          Monthly
        </span>
        <button
          @click="togglePricing"
          class="relative inline-flex h-7 w-12 sm:h-8 sm:w-14 items-center rounded-full transition-all duration-300 focus:outline-none ring-2 ring-primary shadow-md hover:shadow-lg transform hover:scale-105"
          :class="isYearly ? 'bg-primary' : 'bg-gray-300'"
          :aria-label="`Switch to ${isYearly ? 'monthly' : 'yearly'} billing`"
          role="switch"
          :aria-checked="isYearly.toString()"
        >
          <span
            class="inline-block h-5 w-5 sm:h-6 sm:w-6 transform rounded-full transition-all duration-300 shadow-sm"
            :class="[
              isYearly ? 'translate-x-6 sm:translate-x-7 bg-white' : 'translate-x-1 bg-primary',
              isToggling ? 'scale-110' : 'scale-100',
            ]"
          />
        </button>
        <span
          class="text-base sm:text-lg font-medium transition-colors duration-200"
          :class="{ 'text-current': isYearly, 'text-current/60': !isYearly }"
        >
          Annual
        </span>
      </div>
      <div
        class="flex items-center justify-center mt-2 sm:mt-0 sm:ml-4"
      >
        <span
          class="text-xs sm:text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full font-normal whitespace-nowrap"
        >
          Save up to {{ getDiscountMax() }}%
        </span>
      </div>
    </div>
    <div class="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
      <div
        v-for="plan in pricingPlans"
        :key="plan.id"
        :data-animate-pricing="true"
        :class="getCardClasses(plan)"
      >
        <!-- Badge for special plans -->
        <div
          v-if="plan.badge"
          class="absolute z-10 right-3 top-3 rotate-12 rounded-lg px-3 py-1 text-center text-sm font-semibold bg-secondary/10 border border-secondary/30 shadow-sm"
          :class="`text-${plan.colorScheme}`"
        >
          {{ plan.badge }}
        </div>

        <div :class="{ isDisabled: plan.disabled }" class="mb-8">
          <!-- Title -->
          <H3 :class="`text-${plan.colorScheme} mb-4`">
            {{ plan.title }}
          </H3>

          <!-- Price -->
          <div
            class="text-4xl font-bold mx-auto mb-4 relative overflow-hidden"
            :class="[
              `text-${plan.colorScheme}`,
              plan.highlighted ? 'sm:text-5xl' : '',
            ]"
          >
            <div
              :key="getPrice(plan)"
              class="transition-all duration-300 transform"
              :class="
                isToggling ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
              "
            >
              <AnimatedCounter
                :end="getPrice(plan)"
                prefix="€"
                :suffix="plan.pricing.monthly > 0 ? '/month' : ''"
                class="font-bold"
                :class="[
                  `text-${plan.colorScheme}`,
                  plan.highlighted ? 'text-4xl sm:text-5xl' : 'text-4xl',
                ]"
              />
            </div>
          </div>

          <!-- Subtitle and discount -->
          <div
            v-if="plan.subtitle"
            class="text-sm font-semibold mb-6"
            :class="`text-${plan.colorScheme}/80`"
          >
            {{ plan.subtitle }}
          </div>
          <div
            v-else-if="isYearly && getDiscount(plan) > 0"
            class="text-sm text-green-600 mb-6"
          >
            Save {{ getDiscount(plan) }}%
          </div>
          <div v-else class="text-sm text-gray-600 mb-6">&nbsp;</div>

          <!-- Features -->
          <ul class="mb-8 text-left space-y-3">
            <li
              v-for="feature in plan.features"
              :key="feature.text"
              class="flex items-center gap-3"
            >
              <span
                :class="[
                  feature.icon,
                  'h-5 w-5 flex-shrink-0',
                  `text-${plan.colorScheme}`,
                ]"
              ></span>
              <span>{{ feature.text }}</span>
            </li>
          </ul>
        </div>

        <!-- Button -->
        <Btn
          :href="getButtonHref(plan)"
          :primary="plan.button.primary"
          :aria-label="plan.button.text"
        >
          {{ plan.button.text }}
        </Btn>
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
