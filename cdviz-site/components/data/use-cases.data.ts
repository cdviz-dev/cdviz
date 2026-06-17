import MarkdownIt from "markdown-it";
import { createContentLoader } from "vitepress";

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

export type Component = "platform" | "collector" | "db" | "grafana";
export type Audience = "cto" | "devops" | "platform" | "developer";

/** A use case as authored in the `cases:` frontmatter of `src/use-cases.md`. */
interface RawUseCase {
  id: string;
  title: string;
  component: Component;
  audiences: Audience[];
  goal: string;
  solution: string;
  image?: string;
  imageAlt?: string;
}

/** A use case with its markdown fields rendered to HTML at build time. */
export interface UseCase {
  id: string;
  title: string;
  component: Component;
  audiences: Audience[];
  goalHtml: string;
  solutionHtml: string;
  image?: string;
  imageAlt?: string;
  /** Lowercased plain-text haystack for client-side search (no HTML/markdown). */
  searchText: string;
}

const componentText: Record<Component, string> = {
  platform: "whole platform",
  collector: "collector",
  db: "database",
  grafana: "grafana",
};
const audienceText: Record<Audience, string> = {
  cto: "cto",
  devops: "devops",
  platform: "platform engineer",
  developer: "developer",
};

// Populated by the loader below; declared so consumers get types.
export declare const data: UseCase[];

// Read the use cases from the page frontmatter via VitePress's own (bundled) YAML
// parser — no extra dependency. Markdown fields are rendered to HTML here, at build
// time, so neither markdown-it nor the raw markdown ship to the client (SEO/GEO safe).
export default createContentLoader("use-cases.md", {
  transform(raw): UseCase[] {
    const cases = (raw[0]?.frontmatter.cases ?? []) as RawUseCase[];
    return cases.map((c) => ({
      id: c.id,
      title: c.title,
      component: c.component,
      audiences: c.audiences,
      goalHtml: md.render(c.goal ?? ""),
      solutionHtml: md.render(c.solution ?? ""),
      image: c.image,
      imageAlt: c.imageAlt,
      searchText: [
        c.title,
        componentText[c.component],
        ...c.audiences.map((a) => audienceText[a]),
        c.goal,
        c.solution,
      ]
        .join(" ")
        .toLowerCase(),
    }));
  },
});
