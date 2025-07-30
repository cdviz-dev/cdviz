<script setup>
import H2 from "./H2.vue";
import H3 from "./H3.vue";
</script>
<template>
  <section class="my-8 sm:my-12 lg:my-16 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-secondary/4 rounded-2xl shadow-sm border border-secondary/10">
      <a id="how"></a>
      <H2>How CDviz Works</H2>
      <div class="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-rows-2">
        <div class="flex flex-col sm:flex-row items-start gap-4 bg-secondary/10 p-5 sm:p-6 rounded-xl">
          <div class="flex flex-row sm:flex-col items-center gap-2 sm:gap-2">
            <div class="bg-accent text-white rounded-full w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center font-bold text-sm sm:text-base">1</div>
            <span class="icon-[lucide--download] h-4 sm:h-5 w-4 sm:w-5 text-accent/70"></span>
          </div>
          <div class="flex-1">
            <H3>Event Collection</H3>
            <p class="text-sm sm:text-base leading-relaxed mb-4">
              Pull or receive events from multiple sources and convert them to standardized cdevents.
            </p>
            &nbsp<span class="icon-[simple-icons--github] h-5 w-5"></span>
            &nbsp<span class="icon-[simple-icons--gitlab] h-5 w-5"></span>
            &nbsp<span class="icon-[simple-icons--kubernetes] h-5 w-5"></span>
            &nbsp<span class="icon-[simple-icons--amazons3] h-5 w-5"></span>
            &nbsp<span class="icon-[simple-icons--harbor] h-5 w-5"></span>
            &nbsp<span class="icon-[simple-icons--jenkins] h-5 w-5"></span>
            &nbsp<span class="icon-[simple-icons--tekton] h-5 w-5"></span>
            &nbsp<span class="icon-[simple-icons--natsdotio] h-5 w-5"></span>
            &nbsp<span class="icon-[simple-icons--apachekafka] h-5 w-5"></span>
            &nbsp...
          </div>
        </div>
        <div class="flex flex-col sm:flex-row items-start gap-4 bg-secondary/10 p-5 sm:p-6 rounded-xl">
          <div class="flex flex-row sm:flex-col items-center gap-2 sm:gap-2">
            <div class="bg-accent text-white rounded-full w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center font-bold text-sm sm:text-base">2</div>
            <span class="icon-[lucide--database] h-4 sm:h-5 w-4 sm:w-5 text-accent/70"></span>
          </div>
          <div class="flex-1">
            <H3>Store Events</H3>
            <p class="text-sm sm:text-base leading-relaxed mb-4">
              <!-- Pull or receive events from multiple sources and convert them to standardized cdevents. -->
              Keep events in a database for later analysis. And pre-process them for further analysis.
            </p>
            &nbsp<span class="icon-[simple-icons--postgresql] h-5 w-5"></span>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row items-start gap-4 bg-secondary/10 p-5 sm:p-6 rounded-xl">
          <div class="flex flex-row sm:flex-col items-center gap-2 sm:gap-2">
            <div class="bg-accent text-white rounded-full w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center font-bold text-sm sm:text-base">3</div>
            <span class="icon-[lucide--bar-chart-3] h-4 sm:h-5 w-4 sm:w-5 text-accent/70"></span>
          </div>
          <div class="flex-1">
            <H3>Event Monitoring</H3>
            <p class="text-sm sm:text-base leading-relaxed mb-4">
              Observe the activity of your software factory with dashboard,
              alerts,... And build your own analytics.
            </p>
            &nbsp<span class="icon-[simple-icons--grafana] h-5 w-5"></span>
            &nbsp...
          </div>
        </div>
        <div class="flex flex-col sm:flex-row items-start gap-4 bg-secondary/10 p-5 sm:p-6 rounded-xl">
          <div class="flex flex-row sm:flex-col items-center gap-2 sm:gap-2">
            <div class="bg-accent text-white rounded-full w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center font-bold text-sm sm:text-base">4</div>
            <span class="icon-[lucide--zap] h-4 sm:h-5 w-4 sm:w-5 text-accent/70"></span>
          </div>
          <div class="flex-1">
            <H3>Event Reaction</H3>
            <p class="text-sm sm:text-base leading-relaxed mb-4">
              Trigger reaction on cdevents.
            </p>
            &nbsp<span class="icon-[simple-icons--n8n] h-5 w-5"></span>
            &nbsp<span class="icon-[simple-icons--make] h-5 w-5"></span>
            &nbsp<span class="icon-[simple-icons--argo] h-5 w-5"></span>
          </div>
        </div>
      </div>
      <div class="mt-12">
        <img
          src="/architectures/overview_04.excalidraw.svg"
          class="rounded-xl object-cover shadow-md"
          alt="cdviz architecture"
          width="100%"
          height="100%"
        />
      </div>
  </section>
</template>
