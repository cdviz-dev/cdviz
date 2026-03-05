import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getBlogPosts, type BlogPost } from "../../.vitepress/blog-utils.ts";

const blogDir = join(dirname(fileURLToPath(import.meta.url)));
const isDev = process.env.NODE_ENV !== "production";

export interface PostData extends BlogPost {
  shortTitle: string;
}

export default {
  load(): PostData[] {
    return getBlogPosts(blogDir, isDev).map((p) => ({
      ...p,
      shortTitle: p.title.replace(/^CDEvents in Action /, ""),
    }));
  },
};
