<script setup>
import H2 from './H2.vue';
import H3 from './H3.vue';
</script>
<template>
  <section class="my-xl md:my-2xl">
    <div class="
    p-8
    border border-white/20 bg-white/10 backdrop-blur-md
    dark:border-white/10 dark:bg-black/10
    rounded-xl shadow-xl
    ">
      <a name="how"></a>
      <H2>How CDviz Works</H2>
      <div class="grid gap-8 md:grid-cols-2 md:grid-rows-2">
        <div class="flex flex-row items-start gap-4 bg-secondary/10 p-6 rounded-xl">
          <div class="bg-accent text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">1</div>
          <div class="flex-1">
            <H3>Event Collection</H3>
            <p class="text-base leading-relaxed mb-4">
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
        <div class="flex flex-row items-start gap-4 bg-secondary/10 p-6 rounded-xl">
          <div class="bg-accent text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">2</div>
          <div class="flex-1">
            <H3>Store Events</H3>
            <p class="text-base leading-relaxed mb-4">
              <!-- Pull or receive events from multiple sources and convert them to standardized cdevents. -->
              Keep events in a database for later analysis. And pre-process them for further analysis.
            </p>
            &nbsp<span class="icon-[simple-icons--postgresql] h-5 w-5"></span>
          </div>
        </div>
        <div class="flex flex-row items-start gap-4 bg-secondary/10 p-6 rounded-xl">
          <div class="bg-accent text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">3</div>
          <div class="flex-1">
            <H3>Event Monitoring</H3>
            <p class="text-base leading-relaxed mb-4">
              Observe the activity of your software factory with dashboard,
              alerts,... And build your own analytics.
            </p>
            &nbsp<span class="icon-[simple-icons--grafana] h-5 w-5"></span>
            &nbsp...
          </div>
        </div>
        <div class="flex flex-row items-start gap-4 bg-secondary/10 p-6 rounded-xl">
          <div class="bg-accent text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">4</div>
          <div class="flex-1">
            <H3>Event Reaction</H3>
            <p class="text-base leading-relaxed mb-4">
              Trigger reaction on cdevents.
            </p>
            &nbsp<span class="icon-[simple-icons--n8n] h-5 w-5"></span>
            &nbsp<span class="icon-[simple-icons--make] h-5 w-5"></span>
            &nbsp<span class="icon-[simple-icons--argo] h-5 w-5"></span>
          </div>
        </div>
      </div>
      <div class="my-md">
        <img
          src="/architectures/overview_04.excalidraw.svg"
          class="rounded-xl object-cover"
          alt="cdviz architecture"
          width="100%"
          height="100%"
        />
      </div>
    </div>
  </section>
</template>
