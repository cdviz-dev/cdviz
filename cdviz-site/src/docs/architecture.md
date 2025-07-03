# Architecture

> [!NOTE]
> CDViz employs a modular architecture with three independent components that can be deployed individually or as an integrated solution.

1.  **Visualization Layer** - [CDViz Grafana](./cdviz-grafana/)

    A comprehensive dashboard solution for visualizing, analyzing, and generating alerts by combining existing runtime and business metrics with SDLC metrics. While built on Grafana, the implementation can be adapted to alternative visualization platforms.
    ![Visualization Layer](/architectures/overview_01.excalidraw.svg)

2.  **Data Persistence** - [CDViz Database](./cdviz-db/)

    An optimized data storage solution for metrics and events, built on PostgreSQL with specialized extensions for time-series analytics.
    ![Data Persistence](/architectures/overview_02.excalidraw.svg)

3.  **Data Acquisition** - [CDViz Collector](./cdviz-collector/)

    A flexible data pipeline for acquiring, transforming, and forwarding data from diverse sources into the database, event processor,...
    ![Data Acquisition](/architectures/overview_03.excalidraw.svg)

4.  **Event Processing**

    An event-driven architecture for triggering downstream actions in external systems based on collected events.
    ![Event Processing](/architectures/overview_04.excalidraw.svg)