<script setup>
import { ref, nextTick } from "vue";
import H2 from "./H2.vue";
import H3 from "./H3.vue";
import SkeletonLoader from "./SkeletonLoader.vue";

// Interactive diagram state
const activeComponent = ref(null);
const isLoadingComponent = ref(false);

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

// Enhanced component interaction with loading state
const selectComponent = async (componentName) => {
  if (activeComponent.value === componentName) {
    activeComponent.value = null;
    return;
  }
  
  isLoadingComponent.value = true;
  
  // Simulate brief loading for smooth transition
  await new Promise(resolve => setTimeout(resolve, 200));
  
  activeComponent.value = componentName;
  isLoadingComponent.value = false;
  
  // Smooth scroll to details panel
  await nextTick();
  const detailsPanel = document.querySelector('.component-details');
  if (detailsPanel) {
    detailsPanel.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest' 
    });
  }
};
</script>
<template>
  <section
    class="my-8 sm:my-12 lg:my-16 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-secondary/4 rounded-2xl shadow-sm border border-secondary/10"
  >
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
          <div
            class="bg-primary rounded-full w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center font-bold text-lg sm:text-xl shadow-md text-background"
          >
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
    <!-- Architecture Diagram -->
    <div class="mt-12">
      <div class="text-center mb-6">
        <h3 class="text-xl sm:text-2xl font-bold text-primary mb-2">
          Complete Architecture Overview
        </h3>
        <p class="text-sm sm:text-base text-text/80">
          Click on components below to learn more
        </p>
      </div>

      <!-- Diagram Container -->
      <div
        class="bg-background/50 rounded-xl border border-secondary/20 overflow-hidden shadow-lg"
      >
        <img
          src="/architectures/overview_04.excalidraw.svg"
          class="w-full h-auto object-cover"
          alt="CDviz architecture overview"
        />
      </div>

      <!-- Interactive Component Explorer -->
      <div class="mt-6 space-y-6">
        <!-- Component Buttons -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <button
            class="interactive-element p-4 rounded-lg border border-secondary/20 cursor-pointer transition-all duration-300 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transform-gpu"
            :class="[
              activeComponent === 'collector'
                ? 'bg-primary/10 border-primary/30 shadow-md scale-105'
                : 'hover:bg-primary/5 hover:shadow-sm',
              isLoadingComponent ? 'pointer-events-none opacity-70' : ''
            ]"
            @click="selectComponent('collector')"
          >
            <span
              class="icon-[lucide--workflow] h-6 w-6 text-primary mx-auto mb-2 block"
            ></span>
            <div class="text-sm font-medium text-primary">Collector</div>
            <div class="text-xs text-text/70">Event Processing</div>
          </button>
          <button
            class="interactive-element p-4 rounded-lg border border-secondary/20 cursor-pointer transition-all duration-300 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transform-gpu"
            :class="[
              activeComponent === 'database'
                ? 'bg-primary/10 border-primary/30 shadow-md scale-105'
                : 'hover:bg-primary/5 hover:shadow-sm',
              isLoadingComponent ? 'pointer-events-none opacity-70' : ''
            ]"
            @click="selectComponent('database')"
          >
            <span
              class="icon-[lucide--database] h-6 w-6 text-primary mx-auto mb-2 block"
            ></span>
            <div class="text-sm font-medium text-primary">Database</div>
            <div class="text-xs text-text/70">Event Storage</div>
          </button>
          <button
            class="interactive-element p-4 rounded-lg border border-secondary/20 cursor-pointer transition-all duration-300 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transform-gpu"
            :class="[
              activeComponent === 'grafana'
                ? 'bg-primary/10 border-primary/30 shadow-md scale-105'
                : 'hover:bg-primary/5 hover:shadow-sm',
              isLoadingComponent ? 'pointer-events-none opacity-70' : ''
            ]"
            @click="selectComponent('grafana')"
          >
            <span
              class="icon-[lucide--bar-chart-3] h-6 w-6 text-primary mx-auto mb-2 block"
            ></span>
            <div class="text-sm font-medium text-primary">Dashboards</div>
            <div class="text-xs text-text/70">Visualization</div>
          </button>
          <button
            class="interactive-element p-4 rounded-lg border border-secondary/20 cursor-pointer transition-all duration-300 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transform-gpu"
            :class="[
              activeComponent === 'automation'
                ? 'bg-primary/10 border-primary/30 shadow-md scale-105'
                : 'hover:bg-primary/5 hover:shadow-sm',
              isLoadingComponent ? 'pointer-events-none opacity-70' : ''
            ]"
            @click="selectComponent('automation')"
          >
            <span
              class="icon-[lucide--zap] h-6 w-6 text-primary mx-auto mb-2 block"
            ></span>
            <div class="text-sm font-medium text-primary">Automation</div>
            <div class="text-xs text-text/70">Event Reactions</div>
          </button>
        </div>

        <!-- Component Details Panel -->
        <div
          v-if="activeComponent || isLoadingComponent"
          class="component-details bg-background/80 border border-primary/20 rounded-xl p-6 shadow-lg animate-in slide-in-from-top duration-300 transform-gpu"
        >
          <!-- Loading State -->
          <div v-if="isLoadingComponent" class="space-y-4">
            <div class="flex items-center gap-3 mb-4">
              <SkeletonLoader type="avatar" />
              <SkeletonLoader width="150px" />
            </div>
            <SkeletonLoader count="3" />
            <div class="grid sm:grid-cols-3 gap-4 mt-6">
              <div v-for="i in 3" :key="i" class="space-y-2">
                <SkeletonLoader width="80px" />
                <SkeletonLoader count="4" />
              </div>
            </div>
          </div>
          <!-- Collector Details -->
          <div v-if="activeComponent === 'collector'">
            <div class="flex items-center gap-3 mb-4">
              <span class="icon-[lucide--workflow] h-6 w-6 text-primary"></span>
              <h4 class="text-lg font-semibold text-primary">
                CDviz Collector
              </h4>
            </div>
            <p class="text-sm sm:text-base text-text/90 mb-4 leading-relaxed">
              The core component that connects to multiple sources, normalizes
              events to CDEvents standard, and forwards them to storage. It acts
              as the central hub for processing all delivery pipeline events.
            </p>
            <div class="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div class="font-medium text-primary mb-2">Sources</div>
                <div class="text-text/80 space-y-1">
                  <div>• GitHub, GitLab</div>
                  <div>• Jenkins, Tekton</div>
                  <div>• Kubernetes, S3</div>
                  <div>• Custom webhooks</div>
                </div>
              </div>
              <div>
                <div class="font-medium text-primary mb-2">Output</div>
                <div class="text-text/80 space-y-1">
                  <div>• Standardized CDEvents</div>
                  <div>• Real-time streaming</div>
                  <div>• Event enrichment</div>
                  <div>• Data validation</div>
                </div>
              </div>
              <div>
                <div class="font-medium text-primary mb-2">Licensing</div>
                <div class="text-text/80 space-y-1">
                  <div>• AGPL v3 (Community)</div>
                  <div>• Commercial (Enterprise)</div>
                  <div>• More sources & sinks</div>
                  <div>• Professional support</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Database Details -->
          <div v-if="activeComponent === 'database'">
            <div class="flex items-center gap-3 mb-4">
              <span class="icon-[lucide--database] h-6 w-6 text-primary"></span>
              <h4 class="text-lg font-semibold text-primary">
                PostgreSQL + TimescaleDB
              </h4>
            </div>
            <p class="text-sm sm:text-base text-text/90 mb-4 leading-relaxed">
              High-performance time-series database optimized for storing and
              querying CDEvents with efficient time-based operations. Provides
              reliable storage and fast analytics for delivery pipeline data.
            </p>
            <div class="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div class="font-medium text-primary mb-2">Features</div>
                <div class="text-text/80 space-y-1">
                  <div>• Time-series optimization</div>
                  <div>• Automatic partitioning</div>
                  <div>• Compression</div>
                  <div>• Continuous aggregates</div>
                </div>
              </div>
              <div>
                <div class="font-medium text-primary mb-2">Performance</div>
                <div class="text-text/80 space-y-1">
                  <div>• Millions of events</div>
                  <div>• Sub-second queries</div>
                  <div>• Horizontal scaling</div>
                  <div>• High availability</div>
                </div>
              </div>
              <div>
                <div class="font-medium text-primary mb-2">Schema</div>
                <div class="text-text/80 space-y-1">
                  <div>• CDEvents compliant</div>
                  <div>• Versioned migrations</div>
                  <div>• Extensible structure</div>
                  <div>• ACID compliance</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Grafana Details -->
          <div v-if="activeComponent === 'grafana'">
            <div class="flex items-center gap-3 mb-4">
              <span
                class="icon-[lucide--bar-chart-3] h-6 w-6 text-primary"
              ></span>
              <h4 class="text-lg font-semibold text-primary">
                Grafana Dashboards
              </h4>
            </div>
            <p class="text-sm sm:text-base text-text/90 mb-4 leading-relaxed">
              Pre-built dashboards and custom D3.js panels for visualizing SDLC
              metrics, deployment trends, and delivery performance.
              TypeScript-generated dashboards ensure consistency and
              maintainability.
            </p>
            <div class="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div class="font-medium text-primary mb-2">Dashboards</div>
                <div class="text-text/80 space-y-1">
                  <div>• DORA metrics</div>
                  <div>• Lead time analysis</div>
                  <div>• Deployment frequency</div>
                  <div>• Failure recovery</div>
                </div>
              </div>
              <div>
                <div class="font-medium text-primary mb-2">Technology</div>
                <div class="text-text/80 space-y-1">
                  <div>• TypeScript generated</div>
                  <div>• Grafana Foundation SDK</div>
                  <div>• Version controlled</div>
                  <div>• Automated deployment</div>
                </div>
              </div>
              <div>
                <div class="font-medium text-primary mb-2">Custom Panels</div>
                <div class="text-text/80 space-y-1">
                  <div>• D3.js visualizations</div>
                  <div>• Interactive charts</div>
                  <div>• Real-time updates</div>
                  <div>• Export capabilities</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Automation Details -->
          <div v-if="activeComponent === 'automation'">
            <div class="flex items-center gap-3 mb-4">
              <span class="icon-[lucide--zap] h-6 w-6 text-primary"></span>
              <h4 class="text-lg font-semibold text-primary">
                Event Reactions
              </h4>
            </div>
            <p class="text-sm sm:text-base text-text/90 mb-4 leading-relaxed">
              Automated workflows triggered by CDEvents for continuous delivery,
              notifications, and process automation. Enables real-time responses
              to delivery pipeline events.
            </p>
            <div class="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div class="font-medium text-primary mb-2">Tools</div>
                <div class="text-text/80 space-y-1">
                  <div>• n8n workflows</div>
                  <div>• Make automations</div>
                  <div>• ArgoCD deployments</div>
                  <div>• Custom webhooks</div>
                </div>
              </div>
              <div>
                <div class="font-medium text-primary mb-2">Triggers</div>
                <div class="text-text/80 space-y-1">
                  <div>• Deployment events</div>
                  <div>• Test results</div>
                  <div>• Approval workflows</div>
                  <div>• Security scans</div>
                </div>
              </div>
              <div>
                <div class="font-medium text-primary mb-2">Actions</div>
                <div class="text-text/80 space-y-1">
                  <div>• Slack notifications</div>
                  <div>• Auto deployments</div>
                  <div>• Rollback triggers</div>
                  <div>• Quality gates</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
