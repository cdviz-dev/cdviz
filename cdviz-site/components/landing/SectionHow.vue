<script setup>
import H2 from "./H2.vue";
import H3 from "./H3.vue";

// CDviz process steps data structure
const processSteps = [
  {
    id: 1,
    title: "Event Collection",
    icon: "icon-[lucide--workflow]",
    description:
      "Pull or receive events from multiple sources and convert them to standardized CDEvents.",
    tools: [
      { icon: "icon-[simple-icons--github]", title: "GitHub" },
      { icon: "icon-[simple-icons--gitlab]", title: "GitLab" },
      { icon: "icon-[simple-icons--kubernetes]", title: "Kubernetes" },
      { icon: "icon-[simple-icons--jenkins]", title: "Jenkins" },
      { icon: "icon-[simple-icons--amazons3]", title: "Amazon S3" },
      { icon: "icon-[simple-icons--harbor]", title: "Harbor" },
      { icon: "icon-[simple-icons--tekton]", title: "Tekton" },
      { icon: "icon-[simple-icons--natsdotio]", title: "NATS" },
      { icon: "icon-[simple-icons--apachekafka]", title: "Apache Kafka" },
      { text: "+more" },
    ],
  },
  {
    id: 2,
    title: "Store Events",
    icon: "icon-[lucide--database]",
    description:
      "Keep events in a database for later analysis and pre-process them for efficient querying.",
    tools: [
      { icon: "icon-[simple-icons--postgresql]", title: "PostgreSQL" },
      { text: "TimescaleDB" },
    ],
  },
  {
    id: 3,
    title: "Event Monitoring",
    icon: "icon-[lucide--bar-chart-3]",
    description:
      "Observe the activity of your software factory with dashboards, alerts, and build your own analytics.",
    tools: [
      { icon: "icon-[simple-icons--grafana]", title: "Grafana" },
      { text: "+more" },
    ],
  },
  {
    id: 4,
    title: "Event Reaction",
    icon: "icon-[lucide--zap]",
    description:
      "Trigger automated reactions and workflows based on CDEvents for continuous delivery automation.",
    tools: [
      { icon: "icon-[simple-icons--n8n]", title: "n8n" },
      { icon: "icon-[simple-icons--make]", title: "Make" },
      { icon: "icon-[simple-icons--argo]", title: "ArgoCD" },
      { text: "+more" },
    ],
  },
];
</script>
<template>
  <section class="my-8 sm:my-12 lg:my-16 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-secondary/4 rounded-2xl shadow-sm border border-secondary/10">
      <a id="how"></a>
      <H2>How CDviz Works</H2>

      <!-- Process Flow Steps -->
      <div class="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:grid-rows-2">
          <!-- Process Steps Loop -->
          <div
            v-for="step in processSteps"
            :key="step.id"
            class="group flex flex-col sm:flex-row items-start gap-4 bg-background/80 p-6 sm:p-8 rounded-xl border border-secondary/20 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
          >
            <div class="flex flex-row sm:flex-col items-center gap-3 sm:gap-2">
              <div class="bg-primary rounded-full w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center font-bold text-lg sm:text-xl shadow-md text-background">
                {{ step.id }}
              </div>
              <span
                class="h-5 sm:h-6 w-5 sm:w-6 text-primary/70 group-hover:text-primary transition-colors"
                :class="step.icon"
              ></span>
            </div>
            <div class="flex-1 min-w-0">
              <H3 class="mb-3 text-primary">{{ step.title }}</H3>
              <p class="text-sm sm:text-base leading-relaxed mb-6 text-text/90">
                {{ step.description }}
              </p>
              <!-- Tool Logos Grid -->
              <div class="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4">
                <template v-for="(tool, index) in step.tools" :key="index">
                  <!-- Icon Tool -->
                  <div
                    v-if="tool.icon"
                    class="flex items-center justify-center p-2 rounded-lg bg-background/50 border border-secondary/10 hover:border-primary/20 transition-colors group/tool"
                  >
                    <span
                      class="h-6 w-6 text-text/70 group-hover/tool:text-text transition-colors"
                      :class="tool.icon"
                      :title="tool.title"
                    ></span>
                  </div>
                  <!-- Text Tool -->
                  <div
                    v-else
                    class="flex items-center justify-center p-2 rounded-lg bg-background/50 border border-secondary/10 text-text/50 text-sm font-medium"
                  >
                    {{ tool.text }}
                  </div>
                </template>
              </div>
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
