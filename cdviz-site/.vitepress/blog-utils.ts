import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface BlogPost {
  file: string;
  url: string;
  title: string;
  series_part: number;
  status: Status;
}

export enum Status {
  Draft = "draft",
  Published = "published",
}

function parseFrontmatter(content: string): Record<string, unknown> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const result: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const val = line
      .slice(colonIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (val === "true") result[key] = true;
    else if (val === "false") result[key] = false;
    else if (val !== "" && !isNaN(Number(val))) result[key] = Number(val);
    else result[key] = val;
  }
  return result;
}

export function getBlogPosts(blogDir: string, includeUnpublished: boolean): BlogPost[] {
  return readdirSync(blogDir)
    .filter((f) => f.endsWith(".md") && f !== "index.md")
    .map((f) => {
      const fm = parseFrontmatter(readFileSync(join(blogDir, f), "utf-8"));
      const status = (fm.status as Status) ?? Status.Published;
      return {
        file: f,
        url: `/blog/${f.replace(/\.md$/, "")}`,
        title: String(fm.title ?? f),
        series_part: Number(fm.series_part ?? -1),
        status,
      };
    })
    .filter((p) => includeUnpublished || p.status === Status.Published)
    .sort((a, b) => b.series_part - a.series_part);
}
