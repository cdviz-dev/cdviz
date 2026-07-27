# Rules

Opinionated rules for creating CDEvents and transformers.

## CDEvents Best Practices

Choosing good values for key fields improves observability, event correlation, and entity tracking.

Always follow the [official CDEvents specification](https://github.com/cdevents/spec/blob/main/spec.md).

### context.source - Event Origin

#### Official definition

Extract from [context.source](https://github.com/cdevents/spec/blob/main/spec.md#source-context)

> Type: URI-Reference
> Description: defines the context in which an event happened. The main purpose of the source is to provide global uniqueness for source + id.
> The source MAY identify a single producer or a group of producer that belong to the same application.
> When selecting the format for the source, it may be useful to think about how clients may use it. Using the root use cases as reference:
>
> - A client may want to react only to events sent by a specific service, like the instance of Tekton that runs in a specific cluster or the instance of Jenkins managed by team X
> - A client may want to collate all events coming from a specific source for monitoring, observability or visualization purposes
>
> Constraints:
>
> - REQUIRED
> - MUST be a non-empty URI-reference
> - An absolute URI is RECOMMENDED

#### Complementary rules

- Use the URI of the latest service that creates or modifies the event, regardless of what triggered it (webhook, another event, etc.)
- Prefer the URI of the service (or sub-service) generating the event, regardless of subject or event type
- Prefer API URIs over human-facing view URIs
- Use query parameters to provide additional information

**Why**: Allows consumers to identify where the event producer is configured

```yaml
# ✅ Good - Specific service identifiers
"source": "https://github.com/myorg/myrepo/workflow-a" # Event sent from specific workflow
"source": "https://jenkins.example.com/job/job_name"
"source": "https://cdviz-collector.example.com/?source=source_name" # Use query params when needed

# ❌ Avoid - Too generic, conflicts in larger scopes
"source": "github.com/myorg/myrepo"
"source": "myrepo"
```

### subject.id - Event Subject Identifier

#### Official definition

Extract from [subject.id](https://github.com/cdevents/spec/blob/main/spec.md#id-subject):

> Identifier for a subject. Subsequent events associated to the same subject MUST use the same subject id.
> Constraints:
>
> - REQUIRED
> - MUST be a non-empty string
> - MUST be unique within the given source (in the scope of the producer)

#### Complementary rules

Use **unique, hierarchical identifiers** scoped to your organization or globally.

- Use a URI (URL, PURL, or absolute path starting with `/`)
  - use PURL format as id for `artifact` (look at [PURL's type](https://github.com/package-url/purl-spec/tree/main/types))
- Prefer API URIs over human-facing view URIs
- **DO NOT use `subject.source`** - it's confusing and optional. Instead, make `subject.id` globally unique and let `context.source` identify the event origin

**Why**:

- The ID should be a standalone identifier that can be used as a reference or link in any context
- Manipulating a single `id` field is simpler than managing `id` + optional `source`

```yaml
# ✅ Good - Globally unique, hierarchical, semantic
"subject.id": "/namespace/my-service"
"subject.id": "/cluster/us-1/staging"
"subject.id": "https://github.com/org-id/repo-id/workflow-id/run-id"
"subject.id": "https://jenkins.example.com/job/job_name/"

# ❌ Avoid - Not globally unique or too generic
"subject.id": "550e8400-e29b-41d4-a716-446655440000" # UUID
"subject.id": "run-12345" # Not globally unique
"subject.id": "production" # Too generic, not a path
```

### subject.source

**DO NOT use**, it will be removed on 0.6+

### environment.id - Deployment Environment

Follow the same rules as `subject.id` since `environment.id` is a reference to an environment subject. However, often:

- The subject/system doesn't know its environment, so this information isn't in the source event
- Environments may lack clear URIs or scopes (VPC, Kubernetes cluster, region, etc.)

Guidelines:

- Define `environment.id` as an absolute path starting with `/`
- Use your organization name for consistency
- Be consistent across all apps and configurations - use the same naming convention
- Use hierarchical paths like `/level/region/owner` ordered from most to least stable
- Consider how you want to group data in dashboards and reports

**Why**: Enables environment-level dashboards, filtering, and alerts.

```yaml
"environment": { "id": "/production" }
"environment": { "id": "/pro" }
"environment": { "id": "/pro/us-1/cluster-33" }
"environment": { "id": "/staging" }
"environment": { "id": "/dev/ephemeral-42" }
```

### artifactId - Package URL (PURL)

- Follow the same rules as `subject.id` since `artifactId` is a reference to an artifact subject
- Follow the [Package URL specification](https://github.com/package-url/purl-spec) for your artifact type
- Use the appropriate type if supported, otherwise fallback to `generic` (official CDEvents requirement)

**Why**: Enables universal artifact identification, dependency tracking, and interoperability with other tools

**Common Patterns**:

```yaml
# OCI images (Docker/container registries)
# Note: OCI type doesn't support namespace - use query params for registry/repo
"artifactId": "pkg:oci/my-app@sha256:abc123def456...?repository_url=ghcr.io/myorg/my-app&tag=v1.2.3"
"artifactId": "pkg:oci/nginx@sha256:def456abc123...?repository_url=docker.io/library/nginx&tag=latest"

# NPM packages
"artifactId": "pkg:npm/lodash@4.17.21"

# Maven artifacts
"artifactId": "pkg:maven/org.springframework/spring-core@5.3.10"

# Generic packages
"artifactId": "pkg:generic/my-app@1.2.3"
```

**Common Pitfalls**:

- **Digest vs Tag**: Use digest (`@sha256:...`) for immutability - this is the image digest, NOT the source code commit SHA
- **Version Semantics**: For OCI, the version is the image digest, not the git commit that built it
- **OCI Namespace Limitation**: `pkg:oci/` does NOT support namespace in the path - use `repository_url` query parameter
- **Registry Encoding**: OCI requires `repository_url` query parameter; other types encode registries differently
- **Type-Specific Rules**: Each PURL type has unique encoding rules - consult the specification

### xxxName - Name of a entity

eg: `taskName`, `pipelineName`

- Use a global name (consider a larger scope like a company, organization)
- Use `/` to compose a name like a path (or `subject.id`) from general (left) to specific (right)

**Why**: Names can be used in larger scope dashboard or to group subjects. Often local names are duplicated between lower scope (eg same task names `test`, `publish`,... and pipeline names are reused between project / repository)

### Use `customData`

- Use `customData` to preserve complementary information not covered by CDEvents standard fields
- Use `customData.links` to add / repeat relation with other 'subject', use a similar format than `context.links` (until context.links supports linking subject, maybe with 0.6+), below an example for a `testsuiterun`

  ```jsonc
  "customData": { "links": [
    {
      "linkKind": "testedAgainst", // what is the kind of relation between current subject and the target
      "target": {
        "subject": {
          "type": "artifact", // use same value as fragment `subject` type used in `context.type`
          "id": "pkg:oci/my-app@sha256:abc123def456...?repository_url=ghcr.io/myorg/my-app&tag=v1.2.3" // guessed `subject.id` of the target
        }
      }
    },
    {
      "linkKind": "testedAgainst", // multiple link can use the same kind
      "target": {
        "subject": {
          "type": "environment",
          "id": "/cluster/A-dev"
        }
      }
    },
    {
      "linkKind": "storedAt",
      "target": {
        "subject": {
          "type": "repository", // use same value as fragment `subject` type used in `context.type`
          "id": "https://github.com/my-org/my-repo" // guessed `subject.id` of the target
        }
      }
    },
    {
      "linkKind": "runsIn",
      "target": {
        "subject": {
          "type": "pipelinerun", // use same value as fragment `subject` type used in `context.type`
          "id": "https://api.github.com/my-org/my-repo/aaaaa-aaaaaaaaa/actions/runs/11111111111/attempts/1" // guessed `subject.id` of the target
        }
      }
    },
  ]}
  ```

- Avoid redundancy between `customData.links` and required info under `subject.content` or `context.links`
- Structure as a JSON object with the source name at the first level (`github`, `argocd`, etc.)
- For webhook events, mirror the original event structure under the first level (can be complete or filtered, the purpose is to allow post-processing to be able to extract information if needed)
- Additional first-level keys may be added for information useful to other consumers

## Rules for Transformers

The following rules apply specifically when writing VRL transformer files, in addition to the CDEvents field conventions above.

### Use metadata for transformer chaining

- Use `metadata` to transfer information between transformers
- Use `metadata` from extractors to initialize information (not available with the `transform` subcommand)
- Use the first transformer to initialize information when:
  - Not possible via extractor (pre-0.19 or `transform` subcommand)
  - Sharing information/transformers between multiple sources and transformer chains

Example of "first" transformer:

```toml
[transformers.init_metadata]
type = "vrl"
template = """
.metadata = object(.metadata) ?? {}

[{
  "metadata": merge(.metadata, {
    "environment_id": "/cluster/A-dev",
  }),
  "headers": .headers,
  "body": .body,
}]
"""
```

### Automatic `context.id` generation

- Let cdviz-collector generate `context.id` by setting it to `"0"`
- Do NOT omit `context.id` to generate valid cdevents as output
- Do NOT reuse IDs from incoming events (webhooks, Kafka messages, etc.)
- **Exception**: Keep `context.id` when the transformer's purpose is NOT to create a new CDEvent (filtering, normalizing, validating, or adding customData)

**Why**:

- Ensures content-based deduplication
- Enables reproducible, deterministic IDs for testing

### `context.timestamp` generation

- Extract timestamp from input data (events, files) when available
- Avoid `now()` or automatic timestamps for reproducibility

**Why**:

- Creates reproducible output for the same input
- Ensures the same automatic ID generation, enabling reliable testing with transform CLI

### Polling Transformers — Idempotent Backfill

When a polling snapshot returns a terminal state (e.g., `completed`), synthesize events for **all prior lifecycle phases** so the CDEvents timeline is complete. Each synthesized event must be **idempotent**: re-generating it from a later poll of the same resource must produce identical content (and thus the same content-based `context.id`).

Rules:

- Use the **phase-specific timestamp field**, not the latest update time for all events:
  - queued → `created_at`
  - started → `run_started_at`
  - finished → `updated_at`
- `customData` must only contain fields that are **stable for that phase** — i.e., they would have the same value if the event were regenerated from any future poll:
  - ✅ Include: immutable identifiers (`id`, `url`, `head_sha`, `head_branch`, `name`), phase-specific timestamps
  - ❌ Exclude: fields that change as the subject progresses (`status`, `conclusion`) — their values differ from what was true at queue/start time and would produce different content on re-poll

**Why**: The content-based `context.id` computed by cdviz-collector must be identical across polls of the same run, enabling deduplication. Including a field like `conclusion` in a synthetic `queued` event would make it differ from a real `queued` event captured at webhook time, breaking idempotency.

### Define `context.source`

As defined in the CDEvents rules above, `context.source` should be the URI of the cdviz-collector service that creates or modifies the event.

The value depends on cdviz-collector's running mode and external address:

- **`connect` mode (server)**: Use the cdviz-collector URI with `source` as a query parameter
- **`send` mode**: Use the URL of the triggering system (pipeline, workflow, etc.)
- **`transform` mode**: Use `http://cdviz-collector.example.com?source=cli-transform`

To simplify development, cdviz-collector provides a suggested value in metadata `.metadata.context.source`. Transformers may use or override it.

- Customize the URL using `http.root_url` in `cdviz-collector.toml` (default: `http://cdviz-collector.example.com`)
- If `context.source` is empty or undef after transformers chain, then the value is automatically set the default/suggested value
