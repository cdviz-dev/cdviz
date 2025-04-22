# Overview

> [!IMPORTANT]
> CDviz is in **alpha / preview** stage.

## Why

How can you improve SDLC, CI/CD, and DevOps?

The first step is to understand and to observe the current state of your SDLC, CI/CD, and DevOps.
Every part of the SDLC stack can provide measurement and solution at its own level & scope.
But it becomes challenging to have a integrated view.

CDviz's components try to help you visualize and understand your SDLC, CI/CD, and DevOps.
And may be also to help the interactivity between some parts of your Software development stack.

Some questions that CDviz will help you answer include:

- What is the current application's version deployed in environment X?
- Which version of the application was deployed for displayed runtime metrics?
- What is the duration of the deployment process (from development to production)?
- What is the duration of the CI/CD pipeline?
- Which data are available to build my DORA metrics?

Some of the key features of CDviz include:

- Real-time monitoring and visualization of your SDLC, CI/CD, and DevOps processes
- Integration with popular tools and platforms such as GitHub and Kubernetes
- Customizable dashboards and reports to help you track progress and identify areas for improvement

## How

> [!NOTE]
> The 3 main components of CDviz are independent and can be used separately or together. You can used 1, 2 or the 3 components.

1. A [dashboard](/docs/cdviz-grafana/) tool, to be able to visualize (and analyze, alert) and to combine existing runtime, business metrics with SDLC metrics. CDviz provides dashboards & panelsfor [Grafana](https://grafana.com/), but it could be adapted to other tools.
  ![step01](/architectures/overview_01.excalidraw.svg)
2. A [database](/docs/cdviz-db/) to store the data for visualization (dashboards). CDviz provides support for a PostgreSQL database.
  ![step02](/architectures/overview_02.excalidraw.svg)
3. A [collector](/docs/cdviz-collector/) (mini data pipeline) to collect and process data from various sources and to push the data to the database.
  ![step03](/architectures/overview_03.excalidraw.svg)
4. A data pipeline to trigger actions into other systems.
  ![step03](/architectures/overview_04.excalidraw.svg)
