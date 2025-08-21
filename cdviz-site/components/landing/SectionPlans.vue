<script setup>
import H2 from "./H2.vue";

const comparisonFeatures = {
  "Core Features": {
    "Collect and process Events from your Dev & Ops tools": {
      url: "/docs/cdviz-collector/",
      community: {
        value: true,
      },
      enterprise: {
        value: true,
        tooltip: "Optional Commercial license for enterprise usage",
      },
      saas: {
        value: true,
      },
    },
    "Collector Self-hosted Deployment": {
      community: {
        value: true,
        tooltip: "Full self-hosting capabilities",
      },
      enterprise: {
        value: true,
        tooltip: "Enterprise deployment with support",
      },
      saas: {
        value: false,
        tooltip: "SaaS is cloud-hosted only",
      },
    },
    "Database Schemas (ASL v2)": {
      url: "/docs/cdviz-db/",
      tooltip: "Open source database schemas for storing CDEvents data",
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: false,
        tooltip: "Database hosting not included",
      },
    },
    "Data Self-Hosted & Self-Owned": {
      url: "/docs/cdviz-db/",
      tooltip: "Database ownership and management on your infrastructure / provider",
      community: {
        value: true,
      },
      enterprise: {
        value: true,
        tooltip: "Enterprise deployment with support",
      },
      saas: {
        value: true,
        tooltip: "Enterprise deployment with support",
      },
    },
    "Grafana Components (ASL v2)": {
      url: "/docs/cdviz-grafana/",
      tooltip: "Pre-built Grafana dashboards and panels",
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: false,
      },
    },
    "Grafana Self-Hosted & Self-Owned": {
      url: "/docs/cdviz-db/",
      tooltip: "Grafana management on your infrastructure / provider",
      community: {
        value: true,
      },
      enterprise: {
        value: true,
        tooltip: "Enterprise deployment with support",
      },
      saas: {
        value: true,
        tooltip: "Enterprise deployment with support",
      },
    },
  },
  "Sources Connectors": {
    WebHook: {
      url: "/docs/cdviz-collector/integrations/webhook",
      tooltip: "Collect CDEvents from any tool that supports webhooks",
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    "S3 compatible & File System": {
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    "Server-Sent Event (SSE)": {
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    "Kafka Topic": {
      comingSoon: true,
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    NATS: {
      comingSoon: true,
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
  },
  Transformers: {
    "Filtering, Logging, Splitting, Chaining": {
      url: "/docs/cdviz-collector/transformers",
      tooltip: "Process and transform Events before sending to sinks",
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    "Scripting with VRL (Vector Remap Language)": {
      tooltip: "Advanced scripting capabilities for custom transformations",
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    "Custom Transformers": {
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: "Limited",
        tooltip: "Custom transformers are reviewed and approved by the team",
      },
    },
    "Custom Transformers Development": {
      tooltip: "Build custom transformers for your specific needs",
      community: {
        value: "DIY",
        tooltip: "DIY development only with community support",
      },
      enterprise: {
        value: "Consulting",
        tooltip: "Professional services available, contact us",
      },
      saas: {
        value: "Consulting",
        tooltip: "Professional services available, contact us",
      },
    },
    "Transformer on source side": {
      tooltip: "Transformers on the source pipeline to generate CDEvents",
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    "Transformer on sink side": {
      tooltip: "Transformers on the sink pipeline to generate event from CDEvents",
      comingSoon: true,
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: "Maybe",
      },
    },
  },
  "Sources Pre-configured integration": {
    "CDEvents old version": {
      tooltip: "Convert old CDEvents to new format",
      comingSoon: true,
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    GitHub: {
      url: "/docs/cdviz-collector/integrations/github",
      tooltip: "Collect Events from GitHub repositories via webhooks",
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    GitLab: {
      tooltip: "Collect Events from GitLab repositories via webhooks",
      comingSoon: true,
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    Jenkins: {
      url: "https://plugins.jenkins.io/cdevents/",
      comingSoon: true,
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    Jira: {
      comingSoon: true,
      community: {
        value: false,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    "Kubernetes (Deployment, Daemonset, StatefulSet,...)": {
      url: "/docs/cdviz-collector/integrations/kubewatch",
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    ArgoCD: {
      comingSoon: true,
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    AWS: {
      comingSoon: true,
      community: {
        value: false,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    AzureDevOps: {
      comingSoon: true,
      community: {
        value: false,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
  },
  "Sink / Destination Connectors": {
    Database: {
      url: "/docs/cdviz-collector/sinks",
      tooltip: "Store CDEvents in a database for querying and analysis",
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    WebHook: {
      url: "/docs/cdviz-collector/sinks",
      // tooltip: 'Send CDEvents to any tool that supports webhooks',
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    "S3 compatible & File System": {
      url: "/docs/cdviz-collector/sinks",
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    "Server-Sent Event (SSE)": {
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    "Kafka Topic": {
      comingSoon: true,
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    NATS: {
      comingSoon: true,
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
  },
  "Management & Operations": {
    Documentation: {
      url: "/docs",
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    Community: {
      url: "https://github.com/davidB/cdviz/discussions",
      tooltip: "Community-driven support and discussions",
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    // 'Monitoring': {
    //   community: {
    //     value: false,
    //   },
    //   enterprise: {
    //     value: false,
    //   },
    //   saas: {
    //     value: true,
    //   }
    // },
    "Managed Upgrade": {
      tooltip: "Upgrade of the collector and database schemas",
      community: {
        value: false,
      },
      enterprise: {
        value: false,
      },
      saas: {
        value: true,
      },
    },
    Support: {
      community: {
        value: "community",
      },
      enterprise: {
        value: "standard",
        tooltip: "Email and Discord support included",
      },
      saas: {
        value: "standard",
        tooltip: "Email and Discord support included",
      },
    },
    "Response Time": {
      community: {
        value: "N/A",
        tooltip: "Community support has no guaranteed response time",
      },
      enterprise: {
        value: "3 business days",
      },
      saas: {
        value: "3 business days",
      },
    },
  },
  "Online Tools": {
    "Online VRL playground": {
      tooltip: "Test and experiment with VRL scripts online",
      comingSoon: true,
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    "Configuration Validator": {
      comingSoon: true,
      community: {
        value: true,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
    "Simple Configuration Editor": {
      comingSoon: true,
      community: {
        value: false,
      },
      enterprise: {
        value: true,
      },
      saas: {
        value: true,
      },
    },
  },
  "Advanced Features": {
    "Custom Dashboards": {
      tooltip: "Tailored visualization and reporting",
      community: {
        value: "DIY",
        tooltip: "Build your own with provided components",
      },
      enterprise: {
        value: "Consulting",
        tooltip: "Professional services available, contact us",
      },
      saas: {
        value: "Consulting",
        tooltip: "Professional services available, contact us",
      },
    },
    "Multi-tenant Support": {
      url: "/docs/multi-tenant",
      tooltip: "Support multiple teams or organizations",
      comingSoon: true,
      community: {
        value: false,
      },
      enterprise: {
        value: false,
      },
      saas: {
        value: true,
        tooltip: "Native multi-tenant architecture",
      },
    },
  },
};

const renderFeatureValue = (feature, tier) => {
  const value = feature[tier]?.value ?? feature[tier];
  if (value === true) return "✓";
  if (value === false) return "✗";
  return value;
};

const getFeatureClass = (feature, tier) => {
  const value = feature[tier]?.value ?? feature[tier];
  if (value === true) return "text-green-600";
  return "text-gray-400";
};

const getFeatureTooltip = (feature, tier) => {
  return feature[tier]?.tooltip;
};

const isComingSoon = (feature) => {
  return feature.comingSoon === true;
};
</script>

<template>
  <section class="my-xl max-w-7xl mx-auto px-4">
    <a id="plans"></a>
    <H2 class="text-center mb-12">Compare Plans</H2>

    <div class="overflow-x-auto">
      <table class="w-full border-collapse bg-white rounded-lg shadow-lg overflow-hidden">
        <thead>
          <tr class="bg-gray-50">
            <th class="text-left p-6 font-semibold text-gray-900 border-b border-gray-200">
              Features
            </th>
            <th class="text-center p-6 font-semibold text-gray-900 border-b border-gray-200 border-l">
              <div class="flex flex-col items-center">
                <span class="text-lg">Community</span>
              </div>
            </th>
            <th class="text-center p-6 font-semibold text-gray-900 border-b border-gray-200 border-l">
              <div class="flex flex-col items-center">
                <span class="text-lg">Enterprise</span>
              </div>
            </th>
            <th class="text-center p-6 font-semibold text-gray-900 border-b border-gray-200 border-l">
              <div class="flex flex-col items-center">
                <span class="text-lg">SaaS</span>
                <span class="text-xs bg-accent/20 text-accent px-2 py-1 rounded mt-1">Preview</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <template
            v-for="(section, sectionName) in comparisonFeatures"
            :key="sectionName"
          >
            <tr class="bg-gray-100">
              <td
                colspan="4"
                class="p-4 font-semibold text-gray-800 border-b border-gray-200"
              >
                {{ sectionName }}
              </td>
            </tr>
            <tr
              v-for="(feature, featureName) in section"
              :key="featureName"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="p-4 text-gray-700">
                <div class="flex items-center relative group">
                  <a
                    v-if="feature.url"
                    :href="feature.url"
                    class="text-primary hover:underline hover:text-primary/80 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ featureName }}
                  </a>
                  <span v-else>{{ featureName }}</span>
                  <div v-if="isComingSoon(feature)" class="ml-2">
                    <span
                      class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium shadow-sm"
                    >Coming Soon</span>
                  </div>
                  <div v-if="feature.tooltip" class="ml-2 relative">
                    <span
                      class="icon-[mdi--information]"
                      style="color: #807e7c"
                    ></span>
                    <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-pre-wrap break-words w-[30ch] z-50">
                      {{ feature.tooltip }}
                      <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900">
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td
                v-for='tier in ["community", "enterprise", "saas"]'
                :key="featureName"
                class="p-4 text-center border-l border-gray-200"
                :class="getFeatureClass(feature, tier)"
              >
                <div class="flex items-center justify-center relative group">
                  <span>{{ renderFeatureValue(feature, tier) }}</span>
                  <div
                    v-if="getFeatureTooltip(feature, tier)"
                    class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-pre-wrap break-words w-[30ch] z-50"
                  >
                    {{ getFeatureTooltip(feature, tier) }}
                    <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900">
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Legend for coming soon features -->
    <div class="flex justify-center items-center mt-6 mb-8">
      <div class="flex items-center space-x-6 text-sm text-gray-600">
        <div class="flex items-center">
          <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          <span>Available</span>
        </div>
        <div class="flex items-center">
          <span class="w-3 h-3 bg-gray-300 rounded-full mr-2"></span>
          <span>Not Available</span>
        </div>
        <div class="flex items-center">
          <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium mr-2"
          >Coming Soon</span>
          <span>On our roadmap</span>
        </div>
      </div>
    </div>

    <div class="text-center mt-8 space-y-4">
      <p class="text-sm text-gray-600">
        You can contribute to the Community edition and to the Roadmap of the Enterprise and SaaS
        editions via GitHub Discussions and support's channels. We are always looking for feedback
        and contributions to improve our offerings.
      </p>
    </div>

    <div class="text-center mt-8 space-y-4">
      <!-- <div class="flex justify-center space-x-8">
        <Btn href="/docs" primary>Get Started</Btn>
        <Btn href="/contact">Contact for Enterprise</Btn>
        <Btn href="/contact">Join SaaS Waitlist</Btn>
      </div> -->
      <p class="text-sm text-current/90">
        Need something custom?
        <a href="/contact" class="text-primary hover:underline">Contact us</a>
        for tailored solutions.
      </p>
    </div>
  </section>
</template>
