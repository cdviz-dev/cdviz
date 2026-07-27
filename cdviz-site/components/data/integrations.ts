/**
 * Central database of the CDviz integrations.
 *
 * Single source of truth for: the row of the CDEvents coverage matrix on
 * `/docs/integrations/` (`IntegrationsCoverage.vue`), the per-page mapping table
 * (`IntegrationCard.vue`) and the plan badges (`PlanBadges.vue`).
 *
 * Kept in sync (by hand) with the "CDEvents Coverage" tables of
 * `cdviz-dev/transformers-community` and `cdviz-dev/transformers-pro`.
 * Do NOT re-declare this data in a page frontmatter.
 */

/** CDEvents subjects, in coverage-matrix column order. */
export const SUBJECTS = [
  "artifact",
  "branch",
  "change",
  "repository",
  "pipelineRun",
  "taskRun",
  "testSuiteRun",
  "service",
  "environment",
  "incident",
  "ticket",
] as const;
export type Subject = (typeof SUBJECTS)[number];

export type Plan = "community" | "cloud" | "pro";

/**
 * Provider groups: one row of the coverage matrix per group, whatever the number of
 * integrations it bundles (GitHub has 4: webhook, REST API, action, CI).
 * Icons come from the installed iconify sets (no svg file to maintain).
 */
export const GROUPS = [
  { id: "github", label: "GitHub", icon: "icon-[simple-icons--github]" },
  { id: "gitlab", label: "GitLab", icon: "icon-[simple-icons--gitlab]" },
  { id: "bitbucket", label: "Bitbucket", icon: "icon-[simple-icons--bitbucket]" },
  { id: "forgejo", label: "Forgejo", icon: "icon-[simple-icons--forgejo]" },
  { id: "gitea", label: "Gitea", icon: "icon-[simple-icons--gitea]" },
  { id: "jenkins", label: "Jenkins", icon: "icon-[simple-icons--jenkins]" },
  { id: "argocd", label: "ArgoCD", icon: "icon-[simple-icons--argo]" },
  { id: "kubernetes", label: "Kubernetes", icon: "icon-[simple-icons--kubernetes]" },
  { id: "jira", label: "Jira", icon: "icon-[simple-icons--jira]" },
  { id: "tests", label: "Test & Quality Reports", icon: "icon-[lucide--flask-conical]" },
  { id: "custom", label: "Custom", icon: "icon-[lucide--code]" },
] as const;
export type GroupId = (typeof GROUPS)[number]["id"];

// ponytail: predicates are free strings, promote to per-subject unions if typos appear.
/** A source event mapped to the CDEvent(s) it produces. */
export type Mapping =
  | { input: string; subject: Subject; predicates: string[] }
  /** Free-form output, for hand-crafted events — excluded from the coverage matrix. */
  | { input: string; output: string };

export interface Integration {
  /** Matches the markdown filename under `src/docs/integrations/`, e.g. `github`. */
  id: string;
  /** Provider row it is displayed under in the coverage matrix. */
  group: GroupId;
  /** Label, within its group: "Webhook" under GitHub, not "GitHub Webhook". */
  name: string;
  /** Documentation page, omit when the integration has no dedicated page yet. */
  page?: string;
  /** Transformer source code, omit when there is no transformer. */
  source?: string;
  plans: Plan[];
  mappings: Mapping[];
}

const community = "https://github.com/cdviz-dev/transformers-community/tree/main";
const pro = "https://github.com/cdviz-dev/transformers-pro/tree/main";

export const integrations: Integration[] = [
  {
    id: "github",
    group: "github",
    name: "Webhook",
    page: "/docs/integrations/github",
    source: `${community}/github_events`,
    plans: ["community", "cloud", "pro"],
    mappings: [
      { input: "package.published", subject: "artifact", predicates: ["published"] },
      { input: "release.published", subject: "artifact", predicates: ["published"] },
      { input: "create (branch)", subject: "branch", predicates: ["created"] },
      { input: "delete (branch)", subject: "branch", predicates: ["deleted"] },
      { input: "pull_request.opened", subject: "change", predicates: ["created"] },
      { input: "pull_request.closed", subject: "change", predicates: ["merged", "abandoned"] },
      { input: "pull_request.*", subject: "change", predicates: ["updated"] },
      { input: "pull_request_review.submitted", subject: "change", predicates: ["reviewed"] },
      { input: "workflow_run.requested", subject: "pipelineRun", predicates: ["queued"] },
      { input: "workflow_run.in_progress", subject: "pipelineRun", predicates: ["started"] },
      { input: "workflow_run.completed", subject: "pipelineRun", predicates: ["finished"] },
      { input: "workflow_job.in_progress", subject: "taskRun", predicates: ["started"] },
      { input: "workflow_job.completed", subject: "taskRun", predicates: ["finished"] },
      { input: "issue.opened", subject: "ticket", predicates: ["created"] },
      { input: "issue.closed", subject: "ticket", predicates: ["closed"] },
      { input: "issue.*", subject: "ticket", predicates: ["updated"] },
    ],
  },
  {
    id: "github-rest-api",
    group: "github",
    name: "REST API (polling)",
    page: "/docs/integrations/github-rest-api",
    source: `${community}/github_rest_api`,
    plans: ["community", "cloud", "pro"],
    mappings: [
      {
        input: "GET /repos/{owner}/{repo}/releases (+ assets)",
        subject: "artifact",
        predicates: ["published"],
      },
      {
        input: "GET /{orgs|users}/{owner}/packages/.../versions",
        subject: "artifact",
        predicates: ["published"],
      },
      {
        input: "GET /repos/{owner}/{repo}/branches",
        subject: "branch",
        predicates: ["created"],
      },
      {
        input: "GET /repos/{owner}/{repo}/pulls",
        subject: "change",
        predicates: ["created", "merged", "abandoned"],
      },
      { input: "GET /orgs/{org}/repos", subject: "repository", predicates: ["created"] },
      {
        input: "GET /repos/{owner}/{repo}/actions/runs",
        subject: "pipelineRun",
        predicates: ["queued", "started", "finished"],
      },
      {
        input: "GET /repos/{owner}/{repo}/deployments",
        subject: "service",
        predicates: ["deployed"],
      },
      {
        input: "GET /repos/{owner}/{repo}/environments",
        subject: "environment",
        predicates: ["created"],
      },
      {
        input: "GET /repos/{owner}/{repo}/issues (non-PR)",
        subject: "ticket",
        predicates: ["created", "closed"],
      },
    ],
  },
  {
    id: "github-action",
    group: "github",
    name: "Action (send-cdevents)",
    page: "/docs/integrations/github-action",
    plans: ["community", "cloud", "pro"],
    mappings: [
      { input: "workflow trigger", output: "any hand-crafted CDEvent" },
      { input: "artifact build", subject: "artifact", predicates: ["packaged"] },
      { input: "test completion", subject: "testSuiteRun", predicates: ["finished"] },
      { input: "deployment success", subject: "service", predicates: ["deployed"] },
    ],
  },
  {
    id: "github-actions-ci",
    group: "github",
    name: "Actions CI (send --run)",
    page: "/docs/integrations/github-actions-ci",
    plans: ["community", "cloud", "pro"],
    mappings: [
      { input: "job step start / finish", subject: "taskRun", predicates: ["started", "finished"] },
      {
        input: "test suite results (JUnit XML)",
        subject: "testSuiteRun",
        predicates: ["started", "finished"],
      },
    ],
  },
  {
    id: "gitlab",
    group: "gitlab",
    name: "Webhook",
    page: "/docs/integrations/gitlab",
    source: `${pro}/gitlab_events`,
    plans: ["cloud", "pro"],
    mappings: [
      { input: "release.created", subject: "artifact", predicates: ["published"] },
      { input: "tag_push", subject: "artifact", predicates: ["published"] },
      { input: "push (branch)", subject: "branch", predicates: ["created", "deleted"] },
      { input: "merge_request.open/reopen", subject: "change", predicates: ["created"] },
      { input: "merge_request.merge", subject: "change", predicates: ["merged"] },
      { input: "merge_request.close", subject: "change", predicates: ["abandoned"] },
      { input: "merge_request.approved", subject: "change", predicates: ["reviewed"] },
      { input: "merge_request.update", subject: "change", predicates: ["updated"] },
      { input: "pipeline.created/pending", subject: "pipelineRun", predicates: ["queued"] },
      { input: "pipeline.running", subject: "pipelineRun", predicates: ["started"] },
      { input: "pipeline.success/failed", subject: "pipelineRun", predicates: ["finished"] },
      { input: "build.running", subject: "taskRun", predicates: ["started"] },
      { input: "build.success/failed", subject: "taskRun", predicates: ["finished"] },
      { input: "issue.open/reopen", subject: "ticket", predicates: ["created"] },
      { input: "issue.close", subject: "ticket", predicates: ["closed"] },
      { input: "issue.update", subject: "ticket", predicates: ["updated"] },
    ],
  },
  {
    id: "gitlab-ci",
    group: "gitlab",
    name: "CI (send --run)",
    page: "/docs/integrations/gitlab-ci",
    plans: ["cloud", "pro"],
    mappings: [
      { input: "job start / finish", subject: "taskRun", predicates: ["started", "finished"] },
      {
        input: "test suite results (JUnit XML)",
        subject: "testSuiteRun",
        predicates: ["started", "finished"],
      },
    ],
  },
  {
    id: "bitbucket",
    group: "bitbucket",
    name: "Webhook",
    page: "/docs/integrations/bitbucket",
    source: `${pro}/bitbucket_events`,
    plans: ["pro"],
    mappings: [
      { input: "repo:push (tag created)", subject: "artifact", predicates: ["published"] },
      { input: "repo:push (branch created)", subject: "branch", predicates: ["created"] },
      { input: "repo:push (branch closed)", subject: "branch", predicates: ["deleted"] },
      { input: "pullrequest:created", subject: "change", predicates: ["created"] },
      { input: "pullrequest:updated", subject: "change", predicates: ["updated"] },
      { input: "pullrequest:approved", subject: "change", predicates: ["reviewed"] },
      { input: "pullrequest:fulfilled", subject: "change", predicates: ["merged"] },
      { input: "pullrequest:rejected", subject: "change", predicates: ["abandoned"] },
      {
        input: "repo:commit_status_created (INPROGRESS)",
        subject: "pipelineRun",
        predicates: ["started"],
      },
      {
        input: "repo:commit_status_updated (SUCCESSFUL/FAILED/STOPPED)",
        subject: "pipelineRun",
        predicates: ["finished"],
      },
      { input: "issue:created", subject: "ticket", predicates: ["created"] },
      { input: "issue:updated (other states)", subject: "ticket", predicates: ["updated"] },
      { input: "issue:updated (resolved, closed, …)", subject: "ticket", predicates: ["closed"] },
    ],
  },
  {
    id: "forgejo",
    group: "forgejo",
    name: "Webhook",
    page: "/docs/integrations/forgejo",
    source: `${community}/forgejo_webhook`,
    plans: ["community", "cloud", "pro"],
    mappings: [
      { input: "release.published", subject: "artifact", predicates: ["published"] },
      { input: "package.created", subject: "artifact", predicates: ["published"] },
      { input: "create (branch)", subject: "branch", predicates: ["created"] },
      { input: "delete (branch)", subject: "branch", predicates: ["deleted"] },
      { input: "pull_request.opened", subject: "change", predicates: ["created"] },
      { input: "pull_request.closed", subject: "change", predicates: ["merged", "abandoned"] },
      { input: "pull_request.*", subject: "change", predicates: ["updated"] },
      {
        input: "pull_request_review_approved/_rejected",
        subject: "change",
        predicates: ["reviewed"],
      },
      {
        input: "action_run_success/_recover/_failure",
        subject: "pipelineRun",
        predicates: ["queued", "started", "finished"],
      },
      { input: "repository.created/deleted", subject: "repository", predicates: ["created"] },
      { input: "fork", subject: "repository", predicates: ["created"] },
      { input: "issues.opened", subject: "ticket", predicates: ["created"] },
      { input: "issues.closed", subject: "ticket", predicates: ["closed"] },
      { input: "issues.*", subject: "ticket", predicates: ["updated"] },
    ],
  },
  {
    id: "gitea",
    group: "gitea",
    name: "Webhook",
    page: "/docs/integrations/gitea",
    source: `${community}/gitea_webhook`,
    plans: ["community", "cloud", "pro"],
    mappings: [
      { input: "release.published", subject: "artifact", predicates: ["published"] },
      { input: "package.created", subject: "artifact", predicates: ["published"] },
      { input: "create (branch)", subject: "branch", predicates: ["created"] },
      { input: "delete (branch)", subject: "branch", predicates: ["deleted"] },
      { input: "pull_request.opened", subject: "change", predicates: ["created"] },
      { input: "pull_request.closed", subject: "change", predicates: ["merged", "abandoned"] },
      { input: "pull_request.*", subject: "change", predicates: ["updated"] },
      { input: "pull_request_review.reviewed", subject: "change", predicates: ["reviewed"] },
      {
        input: "workflow_run.requested/queued/waiting",
        subject: "pipelineRun",
        predicates: ["queued"],
      },
      { input: "workflow_run.in_progress", subject: "pipelineRun", predicates: ["started"] },
      { input: "workflow_run.completed", subject: "pipelineRun", predicates: ["finished"] },
      { input: "workflow_job.in_progress", subject: "taskRun", predicates: ["started"] },
      { input: "workflow_job.completed", subject: "taskRun", predicates: ["finished"] },
      { input: "repository.created/deleted", subject: "repository", predicates: ["created"] },
      { input: "fork", subject: "repository", predicates: ["created"] },
      { input: "issues.opened", subject: "ticket", predicates: ["created"] },
      { input: "issues.closed", subject: "ticket", predicates: ["closed"] },
      { input: "issues.*", subject: "ticket", predicates: ["updated"] },
    ],
  },
  {
    id: "jenkins",
    group: "jenkins",
    name: "Pipelines (send --run)",
    page: "/docs/integrations/jenkins",
    plans: ["pro"],
    mappings: [
      { input: "stage start / finish", subject: "taskRun", predicates: ["started", "finished"] },
      {
        input: "test suite results (JUnit XML)",
        subject: "testSuiteRun",
        predicates: ["started", "finished"],
      },
    ],
  },
  {
    id: "argocd",
    group: "argocd",
    name: "Notifications",
    page: "/docs/integrations/argocd",
    source: `${community}/argocd_notifications`,
    plans: ["community", "cloud", "pro"],
    mappings: [
      { input: "sync.succeeded + healthy", subject: "service", predicates: ["deployed"] },
      { input: "app.deleted", subject: "service", predicates: ["removed"] },
      { input: "sync.failed/error", subject: "incident", predicates: ["detected"] },
      { input: "health.degraded", subject: "incident", predicates: ["detected"] },
    ],
  },
  {
    id: "kubewatch",
    group: "kubernetes",
    name: "Kubewatch",
    page: "/docs/integrations/kubewatch",
    source: `${community}/kubewatch_cloudevents`,
    plans: ["community", "cloud", "pro"],
    mappings: [
      {
        input: "{deployment, statefulset, daemonset}.create",
        subject: "service",
        predicates: ["deployed"],
      },
      {
        input: "{deployment, statefulset, daemonset}.delete",
        subject: "service",
        predicates: ["removed"],
      },
      {
        input: "{deployment, statefulset, daemonset}.update",
        subject: "service",
        predicates: ["deployed", "upgraded", "removed"],
      },
    ],
  },
  {
    id: "jira",
    group: "jira",
    name: "Webhook",
    page: "/docs/integrations/jira",
    source: `${pro}/jira_events`,
    plans: ["pro"],
    mappings: [
      { input: "version_released", subject: "artifact", predicates: ["published"] },
      { input: "issue_created", subject: "ticket", predicates: ["created"] },
      { input: "issue_updated (other status)", subject: "ticket", predicates: ["updated"] },
      { input: "issue_updated (status done)", subject: "ticket", predicates: ["closed"] },
      { input: "issue_deleted (no resolution)", subject: "ticket", predicates: ["closed"] },
    ],
  },
  {
    id: "junit",
    group: "tests",
    name: "JUnit XML",
    page: "/docs/integrations/junit",
    plans: ["community", "cloud", "pro"],
    mappings: [
      {
        input: "JUnit XML report (Maven, Gradle, Jest, …)",
        subject: "testSuiteRun",
        predicates: ["started", "finished"],
      },
    ],
  },
  {
    id: "tap",
    group: "tests",
    name: "TAP",
    page: "/docs/integrations/tap",
    plans: ["community", "cloud", "pro"],
    mappings: [
      {
        input: "TAP report (node --test, bats, prove, …)",
        subject: "testSuiteRun",
        predicates: ["started", "finished"],
      },
    ],
  },
  {
    id: "sarif",
    group: "tests",
    name: "SARIF",
    page: "/docs/integrations/sarif",
    plans: ["community", "cloud", "pro"],
    mappings: [
      {
        input: "SARIF report (Trivy, Semgrep, CodeQL, …)",
        subject: "testSuiteRun",
        predicates: ["started", "finished"],
      },
    ],
  },
  {
    id: "custom",
    group: "custom",
    name: "VRL transformer",
    page: "/docs/integrations/custom",
    plans: ["community", "pro"],
    mappings: [],
  },
];

/** Lookup by page id (the markdown filename without extension). */
export function integrationById(id: string): Integration | undefined {
  return integrations.find((i) => i.id === id);
}

/** Predicates emitted for a subject, empty when the subject is not covered. */
export function predicatesFor(integration: Integration, subject: Subject): string[] {
  const predicates = integration.mappings.flatMap((m) =>
    "subject" in m && m.subject === subject ? m.predicates : [],
  );
  return [...new Set(predicates)];
}

/** One cell of the coverage matrix: the whole group's support for a subject. */
export interface Coverage {
  /** Union of the predicates emitted by the group's integrations. */
  predicates: string[];
  /** Tooltip: the predicates, and which integrations emit them when only some do. */
  title?: string;
}

export function coverageOf(group: Integration[], subject: Subject): Coverage {
  const emitters = group.filter((i) => predicatesFor(i, subject).length > 0);
  if (emitters.length === 0) return { predicates: [] };
  const predicates = [...new Set(emitters.flatMap((i) => predicatesFor(i, subject)))];
  const from =
    emitters.length < group.length ? ` — only from: ${emitters.map((i) => i.name).join(", ")}` : "";
  return { predicates, title: `${subject}.{${predicates.join(", ")}}${from}` };
}

/** The `subject.{a, b}` notation used in the per-page mapping table. */
export function outputOf(mapping: Mapping): string {
  if (!("subject" in mapping)) return mapping.output;
  const { subject, predicates } = mapping;
  return predicates.length > 1
    ? `${subject}.{${predicates.join(", ")}}`
    : `${subject}.${predicates[0]}`;
}
