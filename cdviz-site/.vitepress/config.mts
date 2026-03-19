// import { defineConfig as viteDefineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitepress";
import svgLoader from "vite-svg-loader";
// import { configureDiagramsPlugin } from "vitepress-plugin-diagrams";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getBlogPosts } from "./blog-utils.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const blogDir = join(__dirname, "../src/blog");
const isDev = process.env.NODE_ENV !== "production";

function getDraftExcludes(): string[] {
  if (isDev) return [];
  return getBlogPosts(blogDir, false).map((p) => `blog/${p.file}`);
}

function buildBlogSidebar() {
  return getBlogPosts(blogDir, isDev).map((p) => ({
    text: p.title,
    link: p.url,
  }));
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "CDviz",
  titleTemplate: ":title - CDviz",
  description:
    "Open-source SDLC observability platform built on CDEvents. Monitor software delivery pipelines, deployments, and incidents with Grafana dashboards.",
  cleanUrls: true, // supported by Cloudflare, and when false google search console warns about page with redirect
  head: [
    [
      "meta",
      {
        name: "keywords",
        content:
          "CDEvents,SDLC observability,DORA metrics,deployment tracking,pipeline observability,CI/CD visibility,software delivery events,Grafana DORA metrics,DevOps,DevSecOps",
      },
    ],
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: "CDviz" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    ["link", { rel: "preconnect", href: "https://eu.i.posthog.com" }],
    [
      "script",
      {},
      `
          !function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init hi $r kr ui wr Er capture Ri calculateEventProperties Ir register register_once register_for_session unregister unregister_for_session Fr getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty Cr Tr createPersonProfile Or yr Mr opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing Pr debug L Rr getPageViewId captureTraceFeedback captureTraceMetric gr".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
          posthog.init('phc_KKgD6col77oYBOC1UUIgShHJuHhQMxeTX1A77mezhBO', {
              api_host: 'https://eu.i.posthog.com',
              defaults: '2025-05-24',
              person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
          })
      `,
    ],

    // Font preloading will be handled by VitePress build process
    // The hashed font files are automatically optimized during build
    //   [
    //     // alternative using vitepress-plugin-diagrams (and generate diagrams at build time, but duplicate configuration in every diagrams)
    //     // FIXME the mermaid renderer is not run on page change (only on first load or refresh)
    //     // I also tried by copying the script into each markdown file
    //     'script',
    //     { type: 'module' },
    //     `
    //       import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    //       mermaid.initialize({
    //         startOnLoad: false,
    //         theme: 'base',
    //         look: 'handDrawn',
    //         'themeVariables': {
    //           'darkMode': true,
    //           'mainBkg': '#00000000',
    //           'background': '#00000000',
    //           'primaryColor': '#00000000',
    //           'primaryTextColor': '#f08c00',
    //           'secondaryTextColor': '#f08c00',
    //           'tertiaryTextColor': '#f08c00',
    //           'primaryBorderColor': '#f08c00',
    //           'secondaryBorderColor': '#f08c00',
    //           'tertiaryBorderColor': '#f08c00',
    //           'noteTextColor': '#f08c00',
    //           'noteBorderColor': '#f08c00',
    //           'lineColor': '#f08c00',
    //           'lineWidth': 2
    //         }
    //       });
    //     `
    //   ],
  ],
  // base: "/docs/",
  srcDir: "./src",
  srcExclude: getDraftExcludes(),
  // markdown: {
  //   config: (md) => {
  //     configureDiagramsPlugin(md, {
  //       diagramsDir: "src/public/diagrams", // Optional: custom directory for SVG files
  //       publicPath: "/docs/diagrams", // Optional: custom public path for images
  //     });
  //   },
  // },
  appearance: "dark",
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/favicon.svg",
    search: {
      provider: "local",
    },
    nav: [
      { text: "Get Started", link: "/docs/getting-started" },
      { text: "Docs", link: "/docs/" },
      { text: "Blog", link: "/blog/" },
      { text: "Pricing", link: "/pricing" },
    ],
    sidebar: {
      "/docs/": [
        {
          text: "Overview",
          link: "/docs/",
          items: [
            { text: "Getting Started", link: "/docs/getting-started" },
            { text: "Architecture", link: "/docs/architecture" },
            { text: "CDEvents", link: "/docs/cdevents" },
          ],
        },
        {
          text: "Collector",
          collapsed: true,
          link: "/docs/cdviz-collector/",
          items: [
            {
              text: "🚀 Quick Start",
              link: "/docs/cdviz-collector/quick-start",
            },
            {
              text: "Installation",
              link: "/docs/cdviz-collector/install",
            },
            {
              text: "Usage",
              link: "/docs/cdviz-collector/usage",
              collapsed: true,
              items: [
                {
                  text: "connect",
                  link: "/docs/cdviz-collector/connect",
                },
                {
                  text: "send",
                  link: "/docs/cdviz-collector/send",
                },
                {
                  text: "send --run (test reporting)",
                  link: "/docs/cdviz-collector/send-run",
                },
                {
                  text: "transform",
                  link: "/docs/cdviz-collector/transform",
                },
              ],
            },
            {
              text: "Configuration",
              link: "/docs/cdviz-collector/configuration",
              collapsed: true,
              items: [
                {
                  text: "TOML Guide",
                  link: "/docs/cdviz-collector/toml-guide",
                },
                {
                  text: "Use Cases",
                  link: "/docs/cdviz-collector/use-cases",
                },
                {
                  text: "Header Validation",
                  link: "/docs/cdviz-collector/header-validation",
                },
                {
                  text: "Header Authentication",
                  link: "/docs/cdviz-collector/header-authentication",
                },
              ],
            },
            {
              text: "Sources",
              link: "/docs/cdviz-collector/sources/",
              collapsed: true,
              items: [
                {
                  text: "Noop",
                  link: "/docs/cdviz-collector/sources/noop",
                },
                {
                  text: "WebHook",
                  link: "/docs/cdviz-collector/sources/webhook",
                },
                {
                  text: "SSE",
                  link: "/docs/cdviz-collector/sources/sse",
                },
                {
                  text: "OpenDAL / Files",
                  link: "/docs/cdviz-collector/sources/opendal",
                },
                {
                  text: "Kafka",
                  link: "/docs/cdviz-collector/sources/kafka",
                },
                {
                  text: "NATS",
                  link: "/docs/cdviz-collector/sources/nats",
                },
              ],
            },
            {
              text: "Transformers",
              link: "/docs/cdviz-collector/transformers",
              collapsed: true,
              items: [
                {
                  text: "Transformers & CDEvents Rules",
                  link: "/docs/cdviz-collector/transformers-rules",
                },
                {
                  text: "CDEvents Version Conversion",
                  link: "/docs/cdviz-collector/cdevents-version-conversion",
                },
              ],
            },
            {
              text: "Sinks",
              link: "/docs/cdviz-collector/sinks/",
              collapsed: true,
              items: [
                {
                  text: "Debug",
                  link: "/docs/cdviz-collector/sinks/debug",
                },
                {
                  text: "Database",
                  link: "/docs/cdviz-collector/sinks/db",
                },
                {
                  text: "ClickHouse",
                  link: "/docs/cdviz-collector/sinks/clickhouse",
                },
                {
                  text: "HTTP",
                  link: "/docs/cdviz-collector/sinks/http",
                },
                {
                  text: "Folder",
                  link: "/docs/cdviz-collector/sinks/folder",
                },
                {
                  text: "SSE",
                  link: "/docs/cdviz-collector/sinks/sse",
                },
                {
                  text: "Kafka",
                  link: "/docs/cdviz-collector/sinks/kafka",
                },
                {
                  text: "NATS",
                  link: "/docs/cdviz-collector/sinks/nats",
                },
              ],
            },
            {
              text: "Parsers",
              link: "/docs/cdviz-collector/parsers/",
              collapsed: true,
              items: [
                {
                  text: "Auto",
                  link: "/docs/cdviz-collector/parsers/auto",
                },
                {
                  text: "JSON",
                  link: "/docs/cdviz-collector/parsers/json",
                },
                {
                  text: "JSON Lines",
                  link: "/docs/cdviz-collector/parsers/jsonl",
                },
                {
                  text: "CSV Row",
                  link: "/docs/cdviz-collector/parsers/csv_row",
                },
                {
                  text: "XML",
                  link: "/docs/cdviz-collector/parsers/xml",
                },
                {
                  text: "TAP",
                  link: "/docs/cdviz-collector/parsers/tap",
                },
                {
                  text: "Text",
                  link: "/docs/cdviz-collector/parsers/text",
                },
                {
                  text: "Text Line",
                  link: "/docs/cdviz-collector/parsers/text_line",
                },
                {
                  text: "Metadata",
                  link: "/docs/cdviz-collector/parsers/metadata",
                },
              ],
            },
            {
              text: "Troubleshooting",
              link: "/docs/cdviz-collector/troubleshooting",
            },
            {
              text: "Integrations",
              collapsed: true,
              items: [
                {
                  text: "GitHub",
                  collapsed: false,
                  items: [
                    {
                      text: "Webhook",
                      link: "/docs/cdviz-collector/integrations/github",
                    },
                    {
                      text: "GitHub Action",
                      link: "/docs/cdviz-collector/integrations/github-action",
                    },
                    {
                      text: "Actions CI",
                      link: "/docs/cdviz-collector/integrations/github-actions-ci",
                    },
                  ],
                },
                {
                  text: "GitLab",
                  collapsed: false,
                  items: [
                    {
                      text: "Webhook",
                      link: "/docs/cdviz-collector/integrations/gitlab",
                    },
                    {
                      text: "GitLab CI",
                      link: "/docs/cdviz-collector/integrations/gitlab-ci",
                    },
                  ],
                },
                {
                  text: "Jenkins",
                  link: "/docs/cdviz-collector/integrations/jenkins",
                },
                {
                  text: "ArgoCD",
                  link: "/docs/cdviz-collector/integrations/argocd",
                },
                {
                  text: "Kubernetes (via Kubewatch)",
                  link: "/docs/cdviz-collector/integrations/kubewatch",
                },
                {
                  text: "Custom",
                  link: "/docs/cdviz-collector/integrations/custom",
                },
              ],
            },
          ],
        },
        {
          text: "Database",
          collapsed: true,
          link: "/docs/cdviz-db/",
          items: [{ text: "Hosting", link: "/docs/cdviz-db/hosting" }],
        },
        {
          text: "Grafana",
          collapsed: true,
          link: "/docs/cdviz-grafana/",
          items: [
            {
              text: "Artifact Timeline",
              link: "/docs/cdviz-grafana/artifact_timeline",
            },
            {
              text: "Execution Performance",
              link: "/docs/cdviz-grafana/execution_dashboards",
            },
            {
              text: "CDEvents Activity",
              link: "/docs/cdviz-grafana/cdevents_activity",
            },
            {
              text: "DORA Metrics",
              link: "/docs/cdviz-grafana/dora_metrics",
            },
            {
              text: "Incidents & Tickets",
              link: "/docs/cdviz-grafana/incidents_tickets",
            },
          ],
        },
        {
          text: "Alternatives, tools, ...",
          link: "/docs/alternatives/",
          items: [
            { text: "CDviz vs Apache DevLake", link: "/docs/alternatives/vs-apache-devlake" },
            { text: "CDviz vs Datadog CI", link: "/docs/alternatives/vs-datadog-ci" },
            { text: "CDviz vs DevStats", link: "/docs/alternatives/vs-devstats" },
            { text: "CDviz vs LinearB", link: "/docs/alternatives/vs-linearb" },
            { text: "CDviz vs Powerpipe", link: "/docs/alternatives/vs-powerpipe" },
            { text: "CDviz vs Splunk", link: "/docs/alternatives/vs-splunk" },
          ],
        },
      ],
      "/pro/": [
        { text: "Terms & Conditions", link: "/pro/terms" },
        { text: "Privacy Policy", link: "/pro/privacy" },
        { text: "Legal Information", link: "/pro/legal" },
      ],
      "/blog/": buildBlogSidebar(),
    },
    aside: true,
    outline: {
      level: [2, 3],
    },
    socialLinks: [{ icon: "github", link: "https://github.com/cdviz-dev" }],
    editLink: {
      pattern: "https://github.com/cdviz-dev/cdviz/edit/main/cdviz-site/docs/src/:path",
    },
    footer: {
      message:
        '<a href="/pro/terms">Terms and Conditions</a> | <a href="/pro/privacy">Privacy Policy</a>',
      copyright: "Copyright © 2025-present Alchim312",
    },
  },
  ignoreDeadLinks: [
    // ignore exact url "/playground"
    // '/playground',
    // ignore all localhost links
    /^https?:\/\/localhost/,
    // ignore all links include "/repl/""
    // /\/repl\//,
    // ignore links to excluded (draft) blog posts
    ...getDraftExcludes().map(
      (p) => new RegExp(`^/${p.replace(/\.md$/, "").replace(/\./g, "\\.")}$`),
    ),
  ],
  sitemap: {
    hostname: "https://cdviz.dev",
  },

  transformHead({ pageData }) {
    const siteUrl = "https://cdviz.dev";
    const relativePath = pageData.relativePath.replace(/\.md$/, "").replace(/index\.html$/, "");
    const canonicalUrl = `${siteUrl}/${relativePath}`;
    const title =
      pageData.title ||
      pageData.frontmatter.title ||
      "CDviz - Monitor Your Software Delivery Pipeline";
    const description =
      pageData.description ||
      pageData.frontmatter.description ||
      "Open-source SDLC observability platform built on CDEvents. Monitor software delivery pipelines with Grafana dashboards.";
    const image =
      pageData.frontmatter.image || `${siteUrl}/illustrations/hero-dashboard-01-q60.webp`;

    const head: ReturnType<typeof defineConfig>["head"] = [
      ["link", { rel: "canonical", href: canonicalUrl }],
      ["meta", { property: "og:url", content: canonicalUrl }],
      ["meta", { property: "og:title", content: title }],
      ["meta", { property: "og:description", content: description }],
      ["meta", { property: "og:image", content: image }],
      ["meta", { name: "twitter:title", content: title }],
      ["meta", { name: "twitter:description", content: description }],
      ["meta", { name: "twitter:image", content: image }],
    ];

    const faqItems = (pageData.frontmatter.faq ?? []).filter(
      (aq: { q: string; a: string }) => aq.a !== "",
    );
    if (faqItems.length > 0) {
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((aq: { q: string; a: string }) => ({
          "@type": "Question",
          name: aq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: aq.a.replace(/<[^>]+>/g, ""),
          },
        })),
      };
      head.push(["script", { type: "application/ld+json" }, JSON.stringify(jsonLd)]);
    }

    if (pageData.relativePath === "index.md") {
      head.push([
        "link",
        {
          rel: "preload",
          as: "image",
          href: "/illustrations/hero-dashboard-01-q60.webp",
          type: "image/webp",
        },
      ]);

      const softwareAppSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "CDviz",
        description:
          "Open-source SDLC observability platform built on CDEvents. Monitor software delivery pipelines, deployments, and incidents with Grafana dashboards.",
        url: "https://cdviz.dev",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Linux, macOS, Windows (via Docker)",
        license: "https://www.apache.org/licenses/LICENSE-2.0",
        screenshot: "https://cdviz.dev/illustrations/hero-dashboard-01-q60.webp",
        featureList: [
          "CDEvents collection from GitHub, GitLab, ArgoCD, Kubernetes",
          "Event storage in PostgreSQL + TimescaleDB or ClickHouse",
          "Grafana dashboards for DORA metrics, incidents & tickets, deployment tracking, artifact timelines",
          "Webhook-based passive monitoring without pipeline changes",
          "Event-driven workflow automation via NATS, Kafka, HTTP sinks",
        ],
        author: {
          "@type": "Organization",
          name: "CDviz",
          url: "https://cdviz.dev",
          sameAs: ["https://github.com/cdviz-dev"],
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Open-source, free to self-host",
        },
      };
      head.push(["script", { type: "application/ld+json" }, JSON.stringify(softwareAppSchema)]);

      const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "CDviz",
        url: "https://cdviz.dev",
        logo: "https://cdviz.dev/favicon.svg",
        sameAs: ["https://github.com/cdviz-dev"],
      };
      head.push(["script", { type: "application/ld+json" }, JSON.stringify(orgSchema)]);
    }

    if (pageData.relativePath.startsWith("blog/")) {
      const dateMatch = pageData.relativePath.match(/(\d{8})/);
      const dateStr = dateMatch ? dateMatch[1] : null;
      const datePublished = dateStr
        ? `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
        : null;

      if (datePublished) {
        const articleSchema = {
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: pageData.title,
          description: pageData.description || pageData.frontmatter.description,
          datePublished: datePublished,
          dateModified: pageData.lastUpdated
            ? new Date(pageData.lastUpdated).toISOString().split("T")[0]
            : datePublished,
          author: {
            "@type": "Person",
            name: pageData.frontmatter.author || "CDviz Team",
            url: pageData.frontmatter.author_github
              ? `https://github.com/${pageData.frontmatter.author_github}`
              : "https://github.com/cdviz-dev",
          },
          publisher: {
            "@type": "Organization",
            name: "CDviz",
            logo: {
              "@type": "ImageObject",
              url: "https://cdviz.dev/favicon.svg",
            },
          },
          url: `https://cdviz.dev/${pageData.relativePath.replace(/\.md$/, "").replace(/\/index$/, "")}`,
          image:
            pageData.frontmatter.image ||
            "https://cdviz.dev/illustrations/hero-dashboard-01-q60.webp",
        };
        head.push(["script", { type: "application/ld+json" }, JSON.stringify(articleSchema)]);
      }
    }

    if (pageData.relativePath.startsWith("docs/")) {
      const parts = pageData.relativePath
        .replace(/\.md$/, "")
        .replace(/\/index$/, "")
        .split("/");
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "CDviz", item: "https://cdviz.dev" },
          ...parts.map((part, index) => ({
            "@type": "ListItem",
            position: index + 2,
            name: part.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
            item: `https://cdviz.dev/${parts.slice(0, index + 1).join("/")}`,
          })),
        ],
      };
      head.push(["script", { type: "application/ld+json" }, JSON.stringify(breadcrumbSchema)]);
    }

    return head;
  },

  // see https://github.com/vuejs/vitepress/issues/4433#issuecomment-2551789595
  vite: {
    build: {
      // Optimize bundle splitting for better caching
      rollupOptions: {
        output: {
          // Split landing page and pricing page components into separate chunks
          manualChunks: {
            landing: [
              "./components/landing/SectionHero.vue",
              "./components/landing/SectionHow.vue",
              "./components/landing/SectionWhy.vue",
            ],
            pricing: [
              "./components/landing/SectionPricing.vue",
              "./components/landing/SectionPlans.vue",
              "./components/landing/SectionFaq.vue",
            ],
          },
        },
      },
      // Enable compression for smaller bundles
      minify: true,
    },
    plugins: [
      tailwindcss() as any,
      // https://iconvectors.io/tutorials/use-svg-icons-in-vue-3-with-vite.html
      svgLoader({
        // Use SVGO and keep viewBox; strip width/height so CSS controls size
        svgo: true,
        svgoConfig: {
          // https://svgo.dev/docs/preset-default/
          plugins: [
            {
              name: "preset-default",
              params: {
                overrides: {
                  removeViewBox: false,
                  // Disable cleanupIds to preserve id attributes
                  cleanupIds: false,
                },
              },
            },
            "removeDimensions",
            {
              // avoid ID collisions if your SVG uses ids/gradients
              name: "prefixIds",
              params: {
                // Prefix ids and classes with the filename to avoid conflicts
                prefixIds: true,
                prefixClassNames: true,
              },
            },
          ],
        },
        defaultImport: "component", // allow: import Icon from './icon.svg'
      }),
      {
        name: "vp-tw-order-fix",
        configResolved(c) {
          movePlugin(c.plugins as any, "@tailwindcss/vite:scan", "after", "vitepress");
        },
      },
    ],
  },
});

function movePlugin(
  plugins: { name: string }[],
  pluginAName: string,
  order: "before" | "after",
  pluginBName: string,
) {
  const pluginBIndex = plugins.findIndex((p) => p.name === pluginBName);
  if (pluginBIndex === -1) return;

  const pluginAIndex = plugins.findIndex((p) => p.name === pluginAName);
  if (pluginAIndex === -1) return;

  if (order === "before" && pluginAIndex > pluginBIndex) {
    const pluginA = plugins.splice(pluginAIndex, 1)[0];
    plugins.splice(pluginBIndex, 0, pluginA);
  }

  if (order === "after" && pluginAIndex < pluginBIndex) {
    const pluginA = plugins.splice(pluginAIndex, 1)[0];
    plugins.splice(pluginBIndex, 0, pluginA);
  }
}
