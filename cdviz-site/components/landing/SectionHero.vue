<script setup>
import { gsap } from "gsap";
import { onMounted } from "vue";
import Btn from "./Btn.vue";

// const randomInt = Math.floor(Math.random() * 8);
// const heroImageSrc = `illustrations/hero-${randomInt}.webp`;
// const heroImageSrc = "illustrations/hero-dashboard-01.webp";

onMounted(() => {
  // Subtle breathing pulse effect on hero dashboard to suggest "live monitoring"
  gsap.to("#hero-image-img", {
    boxShadow: "0 0 30px var(--primary / 0.3)",
    duration: 2.5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
});
</script>
<template>
  <section
    id="hero"
    class="space-section md:grid md:grid-cols-2 space-content relative overflow-hidden particle-container data-grid-bg"
    aria-labelledby="hero-title"
    role="banner"
  >
    <!-- class="my-lg md:grid md:grid-cols-2 md:gap-md relative overflow-hidden before:absolute before:inset-0" -->
    <div
      id="hero-image"
      class="order-2 md:order-last flex items-center justify-center rounded-xl my-lg md:my-0"
    >
      <!-- class="order-last items-center overflow-hidden rounded-xl md:absolute md:relative" -->
      <!-- Help people visualize what we're offering: snapshot/screenshot of the product -->
      <!-- TODO: replace with a screenshot of the product -->
      <picture>
        <!-- AVIF format for modern browsers -->
        <source
          media="(max-width: 640px)"
          srcset="/illustrations/hero-dashboard-01-400w.avif"
          type="image/avif"
        />
        <source
          media="(max-width: 768px)"
          srcset="/illustrations/hero-dashboard-01-600w.avif"
          type="image/avif"
        />
        <source
          srcset="/illustrations/hero-dashboard-01.avif"
          type="image/avif"
        />

        <!-- WebP format fallback -->
        <source
          media="(max-width: 640px)"
          srcset="/illustrations/hero-dashboard-01-400w.webp"
          type="image/webp"
        />
        <source
          media="(max-width: 768px)"
          srcset="/illustrations/hero-dashboard-01-600w.webp"
          type="image/webp"
        />
        <source
          srcset="/illustrations/hero-dashboard-01-q60.webp"
          type="image/webp"
        />

        <!-- Original fallback -->
        <img
          id="hero-image-img"
          width="666"
          height="596"
          class="w-full h-auto max-h-[500px] md:max-h-[600px] lg:max-h-none rounded-xl object-contain parallax-element"
          src="/illustrations/hero-dashboard-01-q60.webp"
          alt="CDviz dashboard showing software delivery pipeline monitoring with deployment tracking and analytics"
          fetchpriority="high"
          loading="eager"
        />
      </picture>
    </div>
    <div class="order-1 md:order-first overflow-hidden rounded-xl p-lg relative z-10">
      <h1
        id="hero-title"
        class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold my-md leading-tight"
      >
        <!-- Explain the value we provide -->
        <span
          class="text-text animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out block"
        >
          Monitor Your Software Delivery Pipeline
        </span>
        <span
          class="block text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-clip-text font-extrabold mt-2 sm:mt-3 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out delay-300 bg-[length:200%_auto] animate-gradient hero-glow-text"
        >
          With Confidence
        </span>
      </h1>
      <div
        id="hero-subtitle"
        class="my-lg text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-text/90 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out delay-500"
      >
        <!-- Explain how we'll create the value -->
        Get complete visibility into your CI/CD pipelines and SDLC with powerful analytics,
        deployment tracking, and real-time monitoring - all in one place.
      </div>

      <div
        id="hero-actions"
        class="my-lg flex flex-col sm:flex-row gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out delay-700"
      >
        <!-- CTA: what should viewer do next : Get Started, Learn More, Book a call, Subscribe to Waitlist, ...-->
        <Btn href="/docs" primary>Get Started</Btn>
        <Btn href="#how">See How It Works</Btn>
      </div>
      <div
        id="hero-social-proof"
        class="mt-12 py-4 border-t border-secondary/20"
      >
        <div class="flex items-center gap-4">
          <span class="svg-mask svg-cdevents w-24 h-12 opacity-70 cdevents-badge-glow"></span>
          <div class="text-sm text-text/80">
            <div class="font-medium">CDEvents Compatible</div>
            <div class="opacity-75">
              Cloud Native standard for delivery events
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="css">
/* technics from https://iconify.design/docs/usage/css/ */
.svg-mask {
  /* Add dimensions to span */
  display: inline-block; /* width: 32px; height: 32px; */ /* Add background color */
  background-color: currentColor; /* Add mask image, use variable to reduce duplication */ /* --svg:
  url("https://api.iconify.design/bi/bell-fill.svg"); */
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}
.svg-cdevents {
  /* width: 444px; height: 184px; */
  --svg: url("/logos/cdevents_monochrome.svg");
}

/* Pulse glow effect for CDEvents badge */
@keyframes badge-pulse-glow {
  0%, 100% {
    filter: drop-shadow(0 0 2px var(--primary / 0.3));
    opacity: 0.7;
  }
  50% {
    filter: drop-shadow(0 0 8px var(--primary / 0.6));
    opacity: 0.9;
  }
}

.cdevents-badge-glow {
  animation: badge-pulse-glow 3s ease-in-out infinite;
}

/* Enhanced text glow for hero gradient text */
.hero-glow-text {
  filter: drop-shadow(0 0 20px var(--primary / 0.4));
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .cdevents-badge-glow,
  .hero-glow-text {
    animation: none !important;
    filter: none !important;
  }
}
</style>
