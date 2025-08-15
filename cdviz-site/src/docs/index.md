# CDViz Platform Overview

## Value Proposition

Effective improvement of Software Development Life Cycle (SDLC), Continuous Integration/Continuous Deployment (CI/CD), and DevOps practices requires comprehensive visibility into current processes and performance metrics.

Organizations face significant challenges when attempting to establish an integrated view across their development ecosystem. While individual components provide localized measurements, a consolidated perspective remains elusive without proper tooling.

CDViz addresses this need by offering a suite of components designed to visualize, analyze, and enhance understanding of your SDLC, CI/CD, and DevOps infrastructure. The platform facilitates improved interoperability between disparate elements of your software development stack.

## Key Capabilities

CDViz enables organizations to answer critical operational questions:

- Current application version deployment status across environments
- Version correlation between deployed applications and observable runtime metrics
- End-to-end deployment process duration metrics
- CI/CD pipeline performance analytics
- DORA metrics implementation and visualization

## Getting Started

If you're new to CDviz, we recommend starting with our **[Getting Started Guide](./getting-started.md)**. This guide will walk you through setting up a local CDviz environment, sending your first events, and seeing the results in Grafana.

## CDEvents

CDviz is built on top of the **[CDEvents](https://cdevents.dev/)** specification. To learn more about CDEvents, please refer to our **[CDEvents](./cdevents.md)** documentation.

## Architecture

To get an overview of how CDviz components collaborate, check out our **[Architecture](./architecture.md)** documentation.

## Components

CDviz is a modular platform with three main components:

- **[CDviz Collector](./cdviz-collector/index.md):** A flexible data pipeline for acquiring, transforming, and forwarding data from diverse sources.
- **[CDviz Database](./cdviz-db/index.md):** An optimized data storage solution for metrics and events.
- **[CDviz Grafana](./cdviz-grafana/index.md):** A comprehensive dashboard solution for visualizing, analyzing, and generating alerts.

## Other Resources

- **[Alternatives](./alternatives.md):** A list of alternative tools to CDviz.
