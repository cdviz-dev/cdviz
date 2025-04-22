# Transformers

Transformers are in charge of transforming a Message into 0-N Messages.

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

The VRL transformer processes messages by:
- If the template evaluates to `null`, pass through the original message unchanged (clearer meaning of skip)
- If the template evaluates to `[]`, discard the message (nothing sent downstream)
- If the template evaluates to an array of messages (with metadata, headers, body), send each one downstream

The input message is available as the variable `.`. The output is an array of messages.

- `.metadata` to read the metadata of the message
- `.header` to read the metadata of the message
- `.body` to read the body of the message

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
    "header": .header,
    "body": {
        "context": {
            "version": "0.4.1",
            "id": "0",
            "source": "/event/source/123",
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

Read more about VRL at [Vector by Datadog](https://vector.dev/docs/reference/vrl/), and you can also look at some examples or provided templates at [config/transformers](https://github.com/cdviz-dev/cdviz-collector/tree/main/config/transformers).

The transformers template from [config/transformers](https://github.com/cdviz-dev/cdviz-collector/tree/main/config/transformers) are included into the docker/oci image at path `/etc/cdviz-collector/transformers`.

```toml
[transformers.github_events]
type = "vrl"
template_file = "/etc/cdviz-collector/transformers/github_events.vrl"
```

[cdevents]: <https://cdevents.dev/>
[Sources]: sources
[Sinks]: sinks
[Transformers]: transformers
