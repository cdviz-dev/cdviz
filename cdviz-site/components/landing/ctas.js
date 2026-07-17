// Single source of truth for the site's CTAs — label/href/icon/tooltip in one place.
// Reused across hero + end sections (landing, use-cases, cloud) so they stay identical.
// Spread onto <Btn v-bind="CTA_TRIAL" primary />.
export const CTA_TRIAL = {
  href: "https://app.cdviz.dev",
  label: "Start free trial",
  icon: "icon-[lucide--rocket]",
  title: "CDviz Cloud — 14-day free trial, no credit card",
  ariaLabel: "Start CDviz Cloud free trial",
};

export const CTA_DEMO = {
  href: "https://demo.cdviz.dev/grafana/",
  label: "Try live demo",
  icon: "icon-[lucide--eye]",
  title: "Live Grafana dashboards — no signup",
  ariaLabel: "Open CDviz live demo",
};
