import { defineConfig } from "vitepress";
//import { configureDiagramsPlugin } from "vitepress-plugin-diagrams";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "CDviz's Documentation",
  titleTemplate: ':title - CDviz',
  description: "Documentation of CDviz's components",
  base: "/docs/",
  srcDir: "./src",
  // markdown: {
  //   config: (md) => {
  //     configureDiagramsPlugin(md, {
  //       diagramsDir: "public/diagrams", // Optional: custom directory for SVG files
  //       publicPath: "/diagrams", // Optional: custom public path for images
  //     });
  //   },
  // },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      // { text: "Pricing", link: "https://cdviz.dev/#pricing" },
    ],

    sidebar: [
      {
        text: "Collector",
        link: "/cdviz-collector/",
        // items: [
        //   { text: "Installation", link: "/cdviz-collector/install" },
        //   { text: "Configuration", link: "/cdviz-collector/config" },
        //   { text: "Usage", link: "/cdviz-collector/usage" },
        //   { text: "Troubleshooting", link: "/cdviz-collector/troubleshooting" },
        //   { text: "Contributing", link: "/cdviz-collector/contributing" },
        // ],
      },
      {
        text: "Database (postgresql)",
        link: "/cdviz-db/",
        // items: [
        //   { text: "Installation", link: "/cdviz-db/#install" },
        // ],
      },
      {
        text: "Dashboard (grafana)",
        link: "/cdviz-grafana/",
        // items: [
        //   { text: "Installation", link: "/cdviz-grafana/install" },
        // ],
      },
      //{ text: "Compare us", link: "/alternatives" },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/cdviz-dev" },
    ],
  },
});
