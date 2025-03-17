import { defineConfig } from "vitepress";
// import { configureDiagramsPlugin } from "vitepress-plugin-diagrams";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "CDviz's Documentation",
  titleTemplate: ':title - CDviz',
  description: "Documentation of CDviz's components",
  head: [
    [
      'meta',
      { name: 'keywords', content: 'CD,SDLC,pipeline,CD dashboard,CD metrics,DevOps,DevSecOps' }
    ],
    [
      'link',
      { rel: 'icon', type: 'image/svg+xml', href: '/assets/favicon.svg' }
    ]
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
  base: "/docs/",
  srcDir: "./src",
  // markdown: {
  //   config: (md) => {
  //     configureDiagramsPlugin(md, {
  //       diagramsDir: "src/public/diagrams", // Optional: custom directory for SVG files
  //       publicPath: "/docs/diagrams", // Optional: custom public path for images
  //     });
  //   },
  // },
  appearance: 'dark',
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/favicon.svg',
    nav: [
      { text: "Home", link: "https://cdviz.dev/" },
      { text: "Documentation", link: "/" },
      { text: "Pricing", link: "https://cdviz.dev/#pricing" },
    ],
    sidebar: [
      {
        text: "Overview",
        link: "/",
        items: [
          { text: "Alternatives", link: "/alternatives" },
        ],
      },
      {
        text: "Collector",
        collapsed: true,
        link: "/cdviz-collector/",
        items: [
          { text: "Installation", link: "/cdviz-collector/install" },
          { text: "Usage", link: "/cdviz-collector/usage" },
          { text: "Configuration", link: "/cdviz-collector/configuration",
            items: [
              { text: "Sources", link: "/cdviz-collector/sources" },
              { text: "Transformers", link: "/cdviz-collector/transformers" },
              { text: "Sinks", link: "/cdviz-collector/sinks" },
            ]
          },
          // { text: "Usage", link: "/cdviz-collector/usage" },
          // { text: "Troubleshooting", link: "/cdviz-collector/troubleshooting" },
          // { text: "Contributing", link: "/cdviz-collector/contributing" },
        ],
      },
      {
        text: "Database (postgresql)",
        collapsed: true,
        link: "/cdviz-db/",
        items: [
          // { text: "Installation", link: "/cdviz-db/#install" },
          { text: "Hosting", link: "/cdviz-db/hosting" },
        ],
      },
      {
        text: "Dashboard (grafana)",
        collapsed: true,
        link: "/cdviz-grafana/",
        // items: [
        //   { text: "Installation", link: "/cdviz-grafana/install" },
        // ],
      },
    ],
    aside: true,
    outline: {
      level: [2,3],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/cdviz-dev" },
    ],
    editLink: {
      pattern: 'https://github.com/cdviz-dev/cdviz/edit/main/cdviz-site/docs/src/:path'
    }
  },
});
