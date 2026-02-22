import { onMounted, onUnmounted } from "vue";

const CATEGORY_MAP: Record<string, string> = {
  "github.com": "github",
  "demo.cdviz.dev": "demo",
  "youtube.com": "youtube",
  "youtu.be": "youtube",
  "discord.gg": "discord",
  "discord.com": "discord",
  "plugins.jenkins.io": "jenkins",
};

function categorize(hostname: string): string {
  for (const [domain, category] of Object.entries(CATEGORY_MAP)) {
    if (hostname === domain || hostname.endsWith(`.${domain}`)) return category;
  }
  return "external";
}

export function useExternalLinkTracking() {
  const handleClick = (event: MouseEvent) => {
    const anchor = (event.target as Element).closest("a");
    if (!anchor?.href) return;

    let url: URL;
    try {
      url = new URL(anchor.href);
    } catch {
      return;
    }

    // Skip same-site links
    if (url.hostname === window.location.hostname || !url.hostname) return;

    const label =
      anchor.getAttribute("aria-label") ||
      anchor.getAttribute("title") ||
      anchor.textContent?.trim() ||
      url.hostname;

    (
      window as Window & {
        posthog?: { capture: (event: string, properties: Record<string, string>) => void };
      }
    ).posthog?.capture("external_link_clicked", {
      url: url.href,
      label: label ?? url.hostname,
      category: categorize(url.hostname),
      page_path: window.location.pathname,
    });
  };

  onMounted(() => document.addEventListener("click", handleClick));
  onUnmounted(() => document.removeEventListener("click", handleClick));
}
