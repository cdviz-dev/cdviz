---
description: "CDviz Collector transformers: convert raw events to CDEvents using VRL templates. Configuration reference and example transformers."
---

# Transformers

Transform, filter, or enrich messages as they flow through the pipeline.

## Quick Reference

```toml
[transformers.my_transform]
type = "vrl"  # or "log", "passthrough", "discard_all"
template = '''
[{
    "metadata": .metadata,
    "headers": .headers,
    "body": {
        "context": {
            "type": "dev.cdevents.service.deployed.0.1.1",
            # ... transform logic
        }
    }
}]
'''
```

> [!WARNING] CDEvents Transformation Disclaimer
> VRL templates shown in examples may be incomplete, outdated, or incorrect.
> For production use: consult the [CDEvents specification](https://cdevents.dev/) and use provided transformers at `/etc/cdviz-collector/transformers/` (GitHub, etc.).

**Common Uses:**

- Convert external events to CDEvents format
- Filter events based on conditions
- Enrich events with additional data
- Split one event into multiple events

## `type = "log"`

Print the message to the console / log at `INFO` level.
You could have several references to the transformers `log` into the chain `transformer_refs` (e.g to log before and after an other transformer).

```toml
[transformers.log]
type = "log"
# target of the log (usefull to filter, to categorize)
target = "transformers::log"
```

## `type = "discard_all"`

Discard all messages. Nothing send to the next transformer or loader.

```toml
[transformers.discard_all]
type = "discard_all"
```

## `type = "passthrough"`

Every message are passed to the next transformer or loader.

```toml
[transformers.passthrough]
type = "passthrough"
```

## `type = "vrl"`

For more custom transformations, can be used to transform the body or headers,
to split into multiple messages, to discard or to skip messages with a condition...

[Vector Remap Language (VRL)](https://vector.dev/docs/reference/vrl/) is an expression-oriented language designed for transforming
observability data (logs and metrics) in a safe and performant manner. It features a simple syntax and a rich set of built-in
functions tailored specifically to observability use cases. It is built for transformation in [Vector by Datadog](https://vector.dev/),
a lightweight, ultra-fast tool for building observability pipelines.

The input message is available as the variable `.`. Read its parts with:

- `.metadata` — metadata of the message (used to pass information between transformers)
- `.headers` — headers of the message
- `.body` — body of the message

### Return value — three behaviors

The value the template evaluates to (its last expression) decides what happens next. A returned
message is a full object: any of `metadata`, `headers`, or `body` you omit is **not** carried
over from the input — only the fields you put in the object are kept. Echo `.metadata` /
`.headers` explicitly when you want to preserve them.

| Returned value   | Behavior                                                                |
| ---------------- | ----------------------------------------------------------------------- |
| `null`           | **Passthrough** — the original message is forwarded unchanged.          |
| `[]`             | **Discard** — nothing is sent downstream (drops/filters the message).   |
| `[{ … }, { … }]` | **Replace** — each object in the array is sent downstream as a message. |

```toml
[transformers.three_cases]
type = "vrl"
template = """
# 1. Passthrough: keep the message exactly as received
if .body.kind == "ignore_me_keep_as_is" {
    null
} else if .body.kind == "drop_me" {
    # 2. Discard: emit nothing
    []
} else {
    # 3. Replace: build the outgoing message; fields not listed here are dropped,
    #    so re-attach .metadata and .headers to preserve them.
    [{
        "metadata": .metadata,
        "headers": .headers,
        "body": {
            "context": { "type": "dev.cdevents.service.deployed.0.1.1", "id": "0" },
            "subject": { "id": .body.id, "type": "service" }
        }
    }]
}
"""
```

Returning a single transformed message is the array form with one element — `[.]` re-emits the
current message after in-place edits (see the example below).

You can specify the VRL template directly in the config:

```toml
[transformers.vrl_example]
type = "vrl"
template = """
# Transform message body
.body, err = { "value": (.body.x * 10 + .body.y) }
if err != null {
    log(err, level: "error")
}
# Return array with transformed message
[.]
"""

[transformers.vrl_example2]
type = "vrl"
template = """
[{
    "metadata": .metadata,
    "headers": .headers,
    "body": {
        "context": {
            "version": "0.4.1",
            "type": "dev.cdevents.service.deployed.0.1.1",
            "timestamp": .body.timestamp,
        },
        "subject": {
            "id": .body.id,
            "source": "/event/source/123",
            "type": "service",
            "content": {
                "environment": {
                    "id": .body.env,
                },
                "artifactId": .body.artifact_id,
            }
        }
    }
}]
"""
```

Or reference an external template file:

```toml
[transformers.vrl_external]
type = "vrl"
template_file = "path/to/template.vrl"
```

Using an external file allows you to take advantage of VRL editor support and syntax highlighting. Note that the template file must be deployed alongside your configuration.

### Using Remote Transformers

You can reference transformers from remote storage (GitHub, S3, HTTP), which makes it easier to maintain and update transformation logic without rebuilding your configuration.

Remote transformers use [OpenDAL](https://opendal.apache.org/) for storage access, supporting multiple backends with authentication.

#### GitHub Repository

```toml
# Configure remote GitHub repository
[remote.transformers-community]
type = "github://cdviz-dev/transformers-community"
# token = "ghp_..."  # GitHub token for private repositories

# Use remote transformer
[transformers.github_events]
type = "vrl"
template_rfile = "transformers-community:///github_events/transformer.vrl"

[transformers.kubewatch_cloudevents]
type = "vrl"
template_rfile = "transformers-community:///kubewatch_cloudevents/transformer.vrl"

[transformers.argocd_notifications]
type = "vrl"
template_rfile = "transformers-community:///argocd_notifications/transformer.vrl"
```

> [!NOTE] Using Specific Tags or Commits
> The GitHub remote type always fetches from the default branch (typically `main`). To use a specific tag or commit, switch to the HTTP remote type:
>
> ```toml
> [remote.raw_github]
> type = "http"
> endpoint = "https://raw.githubusercontent.com"
>
> [transformers.github_events]
> type = "vrl"
> template_rfile = "raw_github:///cdviz-dev/transformers-community/refs/tags/v1.0.0/github_events/transformer.vrl"
> ```

#### S3-Compatible Storage

```toml
# Configure S3-compatible bucket
[remote.s3-transformers]
type = "s3"
bucket = "my-transformers-bucket"
region = "us-east-1"
# endpoint = "https://s3.example.com"  # Optional: custom endpoint
# access_key_id = "..."  # Optional: AWS credentials
# secret_access_key = "..."  # Optional: AWS credentials

# Use remote transformer from S3
[transformers.custom_transform]
type = "vrl"
template_rfile = "s3-transformers:///path/to/transformer.vrl"
```

See [OpenDAL S3 service documentation](https://docs.rs/opendal/latest/opendal/services/struct.S3.html) for all available S3 configuration options.

#### HTTP/HTTPS

```toml
# Configure HTTP endpoint
[remote.http-transformers]
type = "http"
endpoint = "https://example.com/transformers/"
# username = "user"  # Optional: HTTP basic auth
# password = "pass"  # Optional: HTTP basic auth

# Use remote transformer from HTTP
[transformers.http_transform]
type = "vrl"
template_rfile = "http-transformers:///my-transformer.vrl"
```

**Benefits of remote transformers:**

- Always up-to-date with latest transformation logic
- No need to copy files or rebuild configuration
- Version control via Git branches, tags, or commits
- Shared transformers across multiple collector instances
- Centralized management of transformation logic

The [transformers-community repository](https://github.com/cdviz-dev/transformers-community) provides production-ready transformers for common integrations like GitHub, ArgoCD, and Kubewatch.

### Using Bundled Transformers

The transformers from [config/transformers](https://github.com/cdviz-dev/cdviz-collector/tree/main/config/transformers) are included in the Docker/OCI image at path `/etc/cdviz-collector/transformers`:

```toml
[transformers.github_events]
type = "vrl"
template_file = "/etc/cdviz-collector/transformers/github_events.vrl"
```

Read more about VRL at [Vector by Datadog](https://vector.dev/docs/reference/vrl/), and you can also look at examples or provided templates at [config/transformers](https://github.com/cdviz-dev/cdviz-collector/tree/main/config/transformers).

[cdevents]: https://cdevents.dev/
[Sources]: sources
[Sinks]: sinks
[Transformers]: transformers
