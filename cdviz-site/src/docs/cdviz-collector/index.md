# cdviz-collector

The CDviz Collector is a service and CLI tool that collects events from your software development lifecycle, transforms them into [CDEvents](https://cdevents.dev/), and dispatches them to various destinations.

![Inside a collector](/architectures/inside_collector.excalidraw.svg)

## Key Features

*   **Extensible:** The Collector is built on a modular architecture that allows you to easily add new sources, sinks, and transformers.
*   **Flexible:** The Collector can be configured to collect events from a wide variety of sources, including Git repositories, CI/CD servers, and container registries.
*   **Powerful:** The Collector's powerful transformation capabilities allow you to enrich, filter, and transform your events to meet your specific needs.

## Getting Started

To get started with the CDviz Collector, we recommend reading the following documentation:

*   **[Installation](./install.md):** Learn how to install the CDviz Collector.
*   **[Configuration](./configuration.md):** Learn how to configure the CDviz Collector.
*   **[Usage](./usage.md):** Learn how to use the CDviz Collector CLI.

## Core Components

The CDviz Collector is made up of three core components:

*   **[Sources](./sources.md):** The components that collect events from your various development tools and systems.
*   **[Sinks](./sinks.md):** The components that send events to their final destination.
*   **[Transformers](./transformers.md):** The components that can modify events as they pass through the Collector pipeline.

## Integrations

The CDviz Collector comes with a number of pre-built integrations for popular development tools and systems:

*   **[GitHub](./integrations/github.md):** Collect events from your GitHub repositories.
*   **[Kubernetes (via Kubewatch)](./integrations/kubewatch.md):** Collect events from your Kubernetes clusters.