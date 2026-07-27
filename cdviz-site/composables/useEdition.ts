import { ref, watch } from "vue";

export type Edition = "selfhosted" | "cloud";

const STORAGE_KEY = "cdviz-edition";

function isEdition(value: string | null): value is Edition {
  return value === "selfhosted" || value === "cloud";
}

// Module-level: every EditionTabs instance of the page shares this ref, so all the switches of a
// page stay in sync. "selfhosted" is also the value used for SSR/prerender.
const edition = ref<Edition>("selfhosted");

/**
 * Restore the edition chosen from `?edition=` (so app.cdviz.dev can deep link into the cloud
 * context) or from a previous visit, and persist every switch.
 *
 * Called once from the theme Layout, on mount:
 * - not at import time, because changing the ref before hydration makes the client render diverge
 *   from the prerendered HTML — Vue then keeps the server markup and the panels stay on the
 *   default while the tabs already show the restored choice;
 * - not from `useEdition()`, because on a route change VitePress reuses the mounted EditionTabs
 *   instances, so their `onMounted` never runs again.
 */
export function initEdition() {
  const url = new URL(window.location.href);
  const fromQuery = url.searchParams.get("edition");
  if (isEdition(fromQuery)) {
    edition.value = fromQuery;
    // Consume it, so a later switch is not undone by a re-read.
    url.searchParams.delete("edition");
    history.replaceState(history.state, "", url);
  } else {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isEdition(stored)) edition.value = stored;
  }
  watch(edition, (value) => localStorage.setItem(STORAGE_KEY, value));
}

/** Selected CDviz edition (self-hosted or cloud). */
export function useEdition() {
  return edition;
}
