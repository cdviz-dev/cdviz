// env.d.ts
/// <reference types="vite/client" />
declare module "*.svg" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent;
  export default component;
}
declare module "*.svg?component" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent;
  export default component;
}
