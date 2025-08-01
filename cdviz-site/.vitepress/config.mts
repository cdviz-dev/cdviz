// import { defineConfig as viteDefineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitepress";
// import { configureDiagramsPlugin } from "vitepress-plugin-diagrams";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "CDviz",
  titleTemplate: ":title - CDviz",
  description: "Documentation of CDviz's components",
  head: [
    [
      "meta",
      {
        name: "keywords",
        content: "CD,SDLC,pipeline,CD dashboard,CD metrics,DevOps,DevSecOps",
      },
    ],
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
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
    nav: [
      { text: "Documentation", link: "/docs/" },
      { text: "Pricing", link: "/#pricing" },
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
            { text: "Installation", link: "/docs/cdviz-collector/install" },
            { text: "Usage", link: "/docs/cdviz-collector/usage" },
            {
              text: "Configuration",
              link: "/docs/cdviz-collector/configuration",
            },
            { text: "Sources", link: "/docs/cdviz-collector/sources" },
            {
              text: "Transformers",
              link: "/docs/cdviz-collector/transformers",
            },
            { text: "Sinks", link: "/docs/cdviz-collector/sinks" },
            {
              text: "Integrations",
              items: [
                {
                  text: "GitHub",
                  link: "/docs/cdviz-collector/integrations/github",
                },
                {
                  text: "Kubernetes (via Kubewatch)",
                  link: "/docs/cdviz-collector/integrations/kubewatch",
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
          ],
        },
        { text: "Alternatives", link: "/docs/alternatives" },
      ],
      "/pro/": [
        { text: "Terms & Conditions", link: "/pro/terms" },
        { text: "Privacy Policy", link: "/pro/privacy" },
        { text: "Legal Information", link: "/pro/legal" },
      ],
    },
    aside: true,
    outline: {
      level: [2, 3],
    },
    socialLinks: [{ icon: "github", link: "https://github.com/cdviz-dev" }],
    editLink: {
      pattern:
        "https://github.com/cdviz-dev/cdviz/edit/main/cdviz-site/docs/src/:path",
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
    // custom function, ignore all links include "ignore"
    // (url) => {
    //   return url.toLowerCase().includes('ignore')
    // }
  ],
  sitemap: {
    hostname: "https://cdviz.dev",
  },

  // see https://github.com/vuejs/vitepress/issues/4433#issuecomment-2551789595
  vite: {
    build: {
      // Optimize bundle splitting for better caching
      rollupOptions: {
        output: {
          // Split landing page components into separate chunk
          manualChunks: {
            'landing': [
              './components/landing/SectionHero.vue',
              './components/landing/SectionHow.vue',
              './components/landing/SectionWhy.vue',
              './components/landing/SectionFaq.vue',
              './components/landing/SectionPricing.vue'
            ]
          }
        }
      },
      // Enable compression for smaller bundles
      minify: true
    },
    plugins: [
      tailwindcss() as any,
      {
        name: "vp-tw-order-fix",
        configResolved(c) {
          movePlugin(
            c.plugins as any,
            "@tailwindcss/vite:scan",
            "after",
            "vitepress",
          );
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
