<script setup>
import Btn from './Btn.vue';
import H2 from './H2.vue';
import H3 from './H3.vue';
</script>

<template>
  <section class="my-xl md:my-2xl bg-gradient-to-b from-background to-secondary/5 py-16">
    <a id="pricing"></a>
    <H2>Pricing & Editions</H2>
    <div class="text-xl text-center mb-12 max-w-3xl mx-auto">
      Choose the plan that works best for your team. Our commitment to Open Source
      means core components are always free.
    </div>
    <div class="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
      <div
        class="flex flex-col justify-between rounded-xl p-8 pt-4 text-center border-primary border-2"
      >
        <div>
          <H3>Community</H3>
          <ul class="my-md ml-2 text-left">
            <li class="check-circle mb-4 pl-8">
              Free to use (commercial &amp; non-commercial)
            </li>
            <li class="check-circle mb-4 pl-8">
              Free to contribute (code, docs, ideas,...)
            </li>
            <li class="check-circle mb-4 pl-8">Free to sponsor</li>
            <li class="check-circle mb-4 pl-8">
              Pay with your time &amp; resources
            </li>
          </ul>
        </div>
        <Btn
          href="https://github.com/sponsors/davidB"
          aria-label="go to sponsor page"
          primary
          >Be a sponsor</Btn>
      </div>
      <div
        class="flex flex-col justify-between rounded-xl p-8 pt-4 text-center border-secondary border-2"
      >
        <div>
          <H3>Enterprise</H3>
          <!-- <p>We can offer consulting to help you with your cdevents needs.</p> -->
          <ul class="my-md ml-2 text-left">
            <li class="check-circle mb-4 pl-8">
              More sources &amp; sinks for collector
            </li>
            <li class="check-circle mb-4 pl-8">
              Support to configure and deploy
            </li>
            <li class="check-circle mb-4 pl-8">
              Create a custom source or sink
            </li>
            <li class="check-circle mb-4 pl-8">
              Create a custom dashboard or alert
            </li>
            <li class="check-circle mb-4 pl-8">Adapt to your needs</li>
          </ul>
        </div>
        <!-- href="mailto:contact@cdviz.dev?subject=Consulting%20inquiry" -->
        <Btn href="/contact" aria-label="Join the waitlist">Join Waitlist</Btn>
      </div>
      <div
        class="flex flex-col justify-between rounded-xl p-8 pt-4 text-center relative border-secondary border-2"
      >
        <div class="absolute z-10 right-2 top-1 rotate-6 rounded-md px-2 py-0.5 text-center align-middle text-accent ring-accent ring-1 bg-accent/10 ring-offset-accent/20 ring-offset-1">preview</div>
        <div class="isDisabled">
          <H3>SaaS</H3>
          <!-- <p>
          We can offer a SaaS solution to collect and store cdevents, and
          provide a dashboard to visualize them.
        </p> -->
          <ul class="my-md ml-2 text-left">
            <li class="check-circle mb-4 pl-8">
              More sources &amp; sinks for collector
            </li>
            <li class="check-circle mb-4 pl-8">
              Collector operated by us (on our infrastucture)
            </li>
            <li class="check-circle mb-4 pl-8">
              Database operated by you or our partners
            </li>
            <li class="check-circle mb-4 pl-8">Dashboard operated by ???</li>
          </ul>
        </div>
        <!-- href="mailto:contact@cdviz.dev?subject=SaaS%20plan%20inquiry" -->
        <Btn href="/contact" aria-label="Join the waitlist">Join Waitlist</Btn>

      </div>
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
}
</style>
