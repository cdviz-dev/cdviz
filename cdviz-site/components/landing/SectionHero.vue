
<script setup>
import Btn from "./Btn.vue";

// const randomInt = Math.floor(Math.random() * 8);
// const heroImageSrc = `illustrations/hero-${randomInt}.webp`;
const heroImageSrc = "illustrations/hero-dashboard-01.webp";
</script>
<template>
  <section id="hero" class="my-lg md:grid md:grid-cols-2 md:gap-md relative overflow-hidden">
    <!-- class="my-lg md:grid md:grid-cols-2 md:gap-md relative overflow-hidden before:absolute before:inset-0" -->
    <div
      id="hero-image"
      class="order-last items-center overflow-hidden rounded-xl md:relative"
    >
      <!-- class="order-last items-center overflow-hidden rounded-xl md:absolute md:relative" -->
      <!-- Help people visualize what we're offering: snapshot/screenshot of the product -->
      <!-- TODO: replace with a screenshot of the product -->
      <img
        id="hero-image-img"
        height="8"
        width="8"
        class="left-0 top-0 h-64 w-full rounded-xl object-cover md:absolute md:h-full"
        v-bind:src="heroImageSrc"
        alt="illustrations"
      />
    </div>
    <div class="overflow-hidden rounded-xl p-8">
      <div id="hero-title" class="text-5xl font-bold mb-6 leading-[3.2rem] md:text-6xl md:leading-[4.2rem] bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        <!-- Explain the value we provide -->
        Monitor Your Software Delivery Pipeline
        <span class="font-outline italic text-accent">With Confidence</span>
      </div>
      <div id="hero-subtitle" class="my-lg text-xl leading-relaxed text-text/80">
        <!-- Explain how we'll create the value -->
        <!-- TODO? maybe add a rotation between different subtitles -->
        <!-- A collection of components to collect, store and view information
        about which version of services are deployed in each environment,
        what test ran,... -->
        Get complete visibility into your CI/CD pipelines and SDLC with powerful analytics,
        deployment tracking, and real-time monitoring - all in one place.
      </div>

      <div id="hero-actions" class="my-lg flex flex-row gap-md">
        <!-- CTA: what should viewer do next : Get Started, Learn More, Book a call, Subscribe to Waitlist, ...-->
        <Btn href="/docs" primary>Get Started</Btn>
        <Btn href="#how" >See How It Works</Btn>
      </div>
      <div id="hero-social-proof" class="mt-auto py-2 opacity-50">
        <!--
        TODO Make it believable quick social proof (optional): logos of companies using CDviz, a metrics like number of deployments,...
        Ideas: cdevents logo
        -->
        <span class="svg-mask svg-cdevents w-32 h-16"></span><br/>
        <span class="text-sm">Compatible</span>
      </div>
    </div>
  </section>
</template>

<style lang="css">
.font-outline {
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: var(--text);
  color: var(--background);
}

/* technics from https://iconify.design/docs/usage/css/ */
.svg-mask {
  /* Add dimensions to span */
  display: inline-block;
  /* width: 32px;
  height: 32px; */
  /* Add background color */
  background-color: currentColor;
  /* Add mask image, use variable to reduce duplication */
  /* --svg: url("https://api.iconify.design/bi/bell-fill.svg"); */
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}

.svg-cdevents {
  /* width: 444px;
  height: 184px; */
  --svg: url("/logos/cdevents_monochrome.svg");
}
</style>
