---
tags:
  - tutorial
---
# Getting Started with CDViz

This guide provides instructions for implementing a local CDViz environment to explore its capabilities with CDEvents. The demonstration environment includes a pre-configured stack with all necessary components: event forms, collector service, database, and visualization dashboard.

![Architecture Overview](/quickstart/flow.excalidraw.svg)

If you are new to CDViz, we recommend starting with the [CDViz Platform Overview](/docs/) to understand its value proposition and key capabilities.

## Local Environment Setup

### Installation Procedure

1. Clone the repository and launch the stack using Docker Compose:
```bash
git clone https://github.com/cdviz-dev/cdviz.git
cd cdviz/demos/stack-compose
docker compose up
```

2. Access the demonstration dashboard at: <http://localhost:3000/d/demo-service-deployed/demo-service-deployed>
   The initial view will display baseline sample data.

![Initial Dashboard View](/quickstart/metrics_empty.png)

## Event Simulation

### Service Deployment Events

1. Utilize the deployment form located below the metrics dashboard to register service deployment events.

> **Note**: Artifact specifications follow the [Package URL (PURL) format](https://github.com/package-url/purl-spec):
> `scheme:type/namespace/name@version?qualifiers#subpath`
> Reference the [PURL specification examples](https://github.com/package-url/purl-spec/blob/main/PURL-TYPES.rst) for implementation details.

![Service Deployment Form Example](/quickstart/form_services_deployed_sample.png)

The dashboard will automatically update to incorporate the new deployment metrics:

![Updated Deployment Metrics](/quickstart/metrics_with_deployment.png)

### Incident Reporting

1. Submit incident information using the designated reporting form:

![Incident Reporting Form](/quickstart/form_incidents_reported_sample.png)

The visualization will update to reflect the incident data:

![Incident Metrics View](/quickstart/metrics_with_incident.png)

## Extended Functionality

### Advanced Features

- **Multi-environment Simulation**: Test various deployment scenarios across multiple environments and versions using the provided forms
  (utilize the filters at the dashboard top to customize the view)
- **JSON Event Submission**: Access the advanced interface for submitting json CDEvents (reference the [CDEvents conformance repository](https://github.com/cdevents/spec/tree/spec-v0.4/conformance) for sample event structures)![Custom Event Interface](/quickstart/form_raw_json.png)
- **Additional Visualizations**: Explore comprehensive event analytics at <http://localhost:3000/d/cdevents-activity/cdevents-activity>

![Activity Dashboard](/quickstart/dashboard_activity.png)

## Production Implementation

### Enterprise Deployment Considerations

- Implement components in a persistent production environment
- Establish integrations with enterprise systems:
  - GitHub/Version Control
  - Kubernetes clusters
  - Storage solutions (file systems/object storage)
  - CI/CD platforms
  - Developer workflows
- Develop tailored dashboards and alerting mechanisms
- Implement event-driven Software Development Life Cycle (SDLC) automation:
  - Automated test execution triggered by deployment events
  - Environment promotion based on quality gates
  - Asynchronous process execution decoupled from CI infrastructure

### Documentation and Support

For comprehensive documentation and implementation assistance, visit the [CDViz website][CDviz] or contact our technical support team.

[CDviz]: https://cdviz.dev/
[CDEvents]: https://cdevents.dev/
