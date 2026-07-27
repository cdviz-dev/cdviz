/**
 * Post-build guard against the indexation issues Google Search Console flagged
 * in July 2026. Three rules, one per bug class we actually hit:
 *
 *   1. no internal link to a redirecting URL (`.html` / `/index` suffix)
 *      -> the homepage linked 4 `.html` URLs, so every crawl re-seeded the
 *         "Page with redirect" bucket and it never drained.
 *   2. every internal link resolves to a file in dist, or to a redirect
 *      -> VitePress checks markdown links but not hrefs in .vue components.
 *   3. every directory holding pages has an index.html, or a redirect
 *      -> /pro/ 404'd: Google reaches parent paths by truncating URLs,
 *         even when nothing links to them.
 *
 * Run against .vitepress/dist after a build: `mise run //cdviz-site:check:urls`
 */
import { Glob } from "bun";
import { existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

const DIST = ".vitepress/dist";
// VitePress build output, not pages: no index.html expected, no links to check.
const NOT_PAGES = ["assets", "fonts", "icons", "illustrations", "logos", "screenshots"];

/** Literal (non-wildcard) redirect sources from assets/_redirects. */
async function redirectSources(): Promise<Set<string>> {
  const text = await Bun.file(`${DIST}/_redirects`).text();
  const sources = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.split(/\s+/)[0])
    // ponytail: wildcard rules are skipped rather than matched. They'd only
    // silence findings, and a missed one is a warning, not a false alarm.
    .filter((s) => !s.includes("*"));
  return new Set(sources);
}

const errors: string[] = [];

const redirects = await redirectSources();
const pages = [...new Glob("**/*.html").scanSync(DIST)].filter(
  (p) => !NOT_PAGES.some((d) => p.startsWith(`${d}/`)),
);

// A directory is not a page: existsSync("dist/pro") is true even though /pro/ 404s.
const isFile = (p: string) => existsSync(p) && statSync(p).isFile();

/** Does `p` (a site-absolute path) exist in dist as a page, or have a redirect? */
const resolves = (p: string) =>
  redirects.has(p) ||
  redirects.has(p.replace(/\/$/, "")) ||
  [p, `${p}.html`, join(p, "index.html")].some((c) => isFile(join(DIST, c)));

// Rules 1 & 2 — internal links.
for (const page of pages) {
  const html = await Bun.file(join(DIST, page)).text();
  for (const [, href] of html.matchAll(/href="([^"]*)"/g)) {
    // internal only: skip external, protocol-relative, anchors, mailto
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const path = href.split(/[#?]/)[0];
    if (!path) continue;

    if (path.endsWith(".html") || path === "/index" || path.endsWith("/index")) {
      errors.push(`${page}: link to redirecting URL "${path}" — drop the suffix`);
    } else if (!resolves(path)) {
      errors.push(`${page}: broken link "${path}" — no page or redirect in dist`);
    }
  }
}

// Rule 3 — a directory of pages with no index is a 404 waiting for a truncated crawl.
for (const dir of new Set(pages.map((p) => dirname(p)))) {
  if (dir === "." || isFile(join(DIST, dir, "index.html"))) continue;
  if (resolves(`/${dir}/`)) continue;
  errors.push(`${dir}/: directory has pages but no index.html and no redirect — /${dir}/ will 404`);
}

const unique = [...new Set(errors)].sort();
if (unique.length > 0) {
  console.error(`${unique.length} URL issue(s):`);
  for (const e of unique) console.error(`  ${e}`);
  process.exit(1);
}
console.log(`ok: ${pages.length} pages, no redirecting/broken links, every page dir reachable`);
