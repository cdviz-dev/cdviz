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

## Core Features

The CDViz platform delivers essential capabilities for engineering organizations:

- Real-time monitoring and visualization of SDLC, CI/CD, and DevOps processes
- Seamless integration with industry-standard tools including GitHub and Kubernetes
- Configurable dashboards and reports for progress tracking and performance analysis

## Architecture

> [!NOTE]
> CDViz employs a modular architecture with three independent components that can be deployed individually or as an integrated solution.

1. **Visualization Layer** - [CDViz Grafana](/docs/cdviz-grafana/)

   A comprehensive dashboard solution for visualizing, analyzing, and generating alerts by combining existing runtime and business metrics with SDLC metrics. While built on Grafana, the implementation can be adapted to alternative visualization platforms.
   ![Visualization Layer](/architectures/overview_01.excalidraw.svg)

2. **Data Persistence** - [CDViz Database](/docs/cdviz-db/)

   An optimized data storage solution for metrics and events, built on PostgreSQL with specialized extensions for time-series analytics.
   ![Data Persistence](/architectures/overview_02.excalidraw.svg)

3. **Data Acquisition** - [CDViz Collector](/docs/cdviz-collector/)

   A flexible data pipeline for acquiring, transforming, and forwarding data from diverse sources into the database, event processor,...
   ![Data Acquisition](/architectures/overview_03.excalidraw.svg)

4. **Event Processing**

   An event-driven architecture for triggering downstream actions in external systems based on collected events.
   ![Event Processing](/architectures/overview_04.excalidraw.svg)
