# cdviz-collector

A service & cli to collect SDLC/CI/CD events and to dispatch as [cdevents].

![inside a collector](/architectures/inside_collector.excalidraw.svg)

- to create cdevents by polling some sources (folder on fs, AWS S3, AWS ECR, ...) (see [Sources])
- to receive events from http (GitHub,...), kafka, nats (see [Sources])
- to send (broadcast) cdevents to various destination database, http, kafka, nats (see [Sinks])
- to expose some metrics (TBD)

<!--
## Usage

- service: connect
-

## Configuration

- Environement variables
- Configuration files
  - bases
  - custom
- Sources
- Extractors
- Transformers
- Sink
- Http
- Logging, Metrics, Traces

## Integrations

- FileSystem
- S3
- WebHook
- GitHub
- PostgreSQL
-->

[cdevents]: <https://cdevents.dev/>
[Sources]: sources
[Sinks]: sinks
[Transformers]: transformers
