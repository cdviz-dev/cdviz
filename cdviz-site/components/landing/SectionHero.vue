<script setup>
import { gsap } from "gsap";
import { onMounted } from "vue";
import Btn from "./Btn.vue";

const headlines = [
  {
    line1: "See What's Happening Across Your CI/CD Pipeline.",
    line2: "Then Act On It.",
  },
  {
    line1: "DORA Metrics. Deployment Timelines. Test Results.",
    line2: "Open-Source. Self-Hosted. No Lock-In.",
  },
  {
    line1: "Observe Your Software Delivery.",
    line2: "Automate When You're Ready.",
  },
];

let headlineIndex = 0;

function cycleHeadline() {
  const items = Array.from(document.querySelectorAll(".hero-headline"));
  if (items.length < 2) return;

  const current = items[headlineIndex];
  const nextIndex = (headlineIndex + 1) % headlines.length;
  const next = items[nextIndex];
  headlineIndex = nextIndex;

  // 1. Slide + fade out current
  gsap.to(current, {
    opacity: 0,
    y: -20,
    duration: 0.45,
    ease: "power2.in",
    onComplete() {
      // 2. Snap current to absolute overlay, prep next below viewport
      gsap.set(current, { position: "absolute", top: 0, left: 0, right: 0 });
      gsap.set(next, { position: "relative", y: 20, opacity: 0 });
      // 3. Slide + fade in next
      gsap.to(next, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete() {
          gsap.delayedCall(4, cycleHeadline);
        },
      });
    },
  });
}

onMounted(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  // Breathing glow: animates opacity of overlay element — no layout properties
  gsap.to(".hero-image-glow", {
    opacity: 1,
    duration: 2.5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  gsap.delayedCall(3, cycleHeadline);
});
</script>
<template>
  <section
    id="hero"
    class="space-section md:grid md:grid-cols-2 space-content relative overflow-hidden particle-container data-grid-bg"
    aria-labelledby="hero-title"
    role="banner"
  >
    <div
      id="hero-image"
      class="order-2 md:order-last flex items-center justify-center rounded-xl my-lg md:my-0"
    >
      <a
        href="https://demo.cdviz.dev/grafana"
        target="_blank"
        rel="noopener"
        class="group relative block"
        aria-label="Open live CDviz Grafana demo"
      >
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

          <img
            id="hero-image-img"
            width="666"
            height="596"
            class="w-full h-auto max-h-[500px] md:max-h-[600px] lg:max-h-none rounded-xl object-contain"
            src="/illustrations/hero-dashboard-01-q60.webp"
            alt="CDviz dashboard showing software delivery pipeline monitoring with deployment tracking and analytics"
            fetchpriority="high"
            loading="eager"
          />
        </picture>

        <!-- Glow overlay: opacity animated by GSAP (no layout property) -->
        <div class="hero-image-glow" aria-hidden="true"></div>

        <!-- Hover overlay -->
        <div class="absolute inset-0 rounded-xl flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
          <span
            class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white font-semibold text-lg px-4 py-2 rounded-lg bg-black/50 backdrop-blur-sm"
          >
            Open live demo →
          </span>
        </div>
      </a>
    </div>
    <div class="order-1 md:order-first overflow-hidden rounded-xl p-lg relative z-10">
      <h1
        id="hero-title"
        class="cdviz-h1-sketch my-md relative"
      >
        <!-- All variants rendered in DOM for crawlers; inactive ones hidden via inline style from SSR -->
        <span
          v-for="(h, i) in headlines"
          :key="i"
          class="hero-headline block w-full"
          :style='i !== 0 ? { position: "absolute", top: 0, left: 0, right: 0, opacity: 0 } : {}'
        >
          <span
            class="text-text block"
            :class='i === 0 ? "animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out" : ""'
          >{{ h.line1 }}</span>
          <span
            class="cdviz-gradient-text block mt-2 sm:mt-3"
            :class='i === 0
            ? "animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out delay-300"
            : ""'
          >{{ h.line2 }}</span>
        </span>
      </h1>
      <div
        id="hero-subtitle"
        class="my-lg text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-text/90 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out delay-500"
      >
        CDviz is an open-source observability platform built on
        <a href="https://cdevents.dev">CDEvents</a>, the
        <a href="https://cd.foundation">CD Foundation</a>-backed standard for software delivery.
        Connect GitHub, GitLab, Kubernetes, and more. Get DORA metrics, deployment timelines, and
        test results in Grafana — then trigger workflows from the same event stream.
      </div>

      <div
        id="hero-actions"
        class="my-lg flex flex-col sm:flex-row gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out delay-700"
      >
        <!-- CTA: lowest friction first — let skeptical engineers see the product immediately -->
        <Btn
          href="https://demo.cdviz.dev/grafana"
          target="_blank"
          rel="noopener"
          primary
        >Try Live Demo</Btn>
        <Btn href="/docs">Get Started Free</Btn>
        <Btn href="#how">See How It Works</Btn>
      </div>
      <div
        id="hero-social-proof"
        class="mt-12 py-4 border-t border-secondary/20"
      >
        <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
          <!-- CDEvents badge -->
          <div class="flex items-center gap-3">
            <span class="svg-mask svg-cdevents w-20 h-10 opacity-70 cdevents-badge-glow"></span>
            <div class="text-xs text-text/80">
              <div class="font-medium">CDEvents Compatible</div>
              <div class="opacity-75">CD Foundation standard</div>
            </div>
          </div>
          <span class="hidden sm:block text-secondary/40 text-lg">|</span>
          <!-- GitHub stars -->
          <a
            href="https://github.com/cdviz-dev/cdviz"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 text-text/70 hover:text-primary transition-colors duration-200"
            aria-label="Star CDviz on GitHub"
          >
            <span class="icon-[simple-icons--github] h-4 w-4"></span>
            <img
              src="https://img.shields.io/github/stars/cdviz-dev/cdviz?style=social"
              alt="GitHub stars"
              loading="lazy"
              height="20"
              width="80"
            />
          </a>
          <span class="hidden sm:block text-secondary/40 text-lg">|</span>
          <!-- License -->
          <div class="flex items-center gap-2 text-xs text-text/70">
            <span class="icon-[lucide--shield-check] h-4 w-4 text-primary/70"></span>
            <span>Apache 2.0 · Free Forever</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="css">
/* technics from https://iconify.design/docs/usage/css/ */
.svg-mask {
  display: inline-block;
  background-color: currentColor;
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}
.svg-cdevents {
  --svg: url("/logos/cdevents_monochrome.svg");
}

/* CDEvents badge glow — opacity animation (GPU-composited) */
@keyframes badge-pulse-glow {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 0.95; }
}

.cdevents-badge-glow {
  animation: badge-pulse-glow 3s ease-in-out infinite;
}

/* Glow overlay for hero image — opacity animated by GSAP */
.hero-image-glow {
  position: absolute;
  inset: 0;
  border-radius: 0.75rem; /* matches rounded-xl */
  box-shadow: 0 0 30px color-mix(in oklch, var(--primary) 40%, transparent);
  opacity: 0.3;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .cdevents-badge-glow {
    animation: none;
  }
}
</style>
