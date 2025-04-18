---
tags:
  - tutorial
---
# Quickstart Guide

This guide helps you get started with [CDviz] and [CDEvents] using our local playground environment, which includes pre-configured components: forms, collector, database, and dashboard.

![Architecture Overview](/quickstart/flow.excalidraw.svg)

## Setting Up the Local Playground

### Installation

1. Clone the repository and start the environment:
```bash
git clone https://github.com/cdviz-dev/cdviz.git
cd cdviz/demos/stack-compose
docker compose up
```

2. Navigate to the dashboard at: <http://localhost:3000/d/demo-service-deployed/demo-service-deployed>
   Initially, you'll see only baseline random data.

![Initial Dashboard View](/quickstart/metrics_empty.png)

## Working with Events

### Simulating Service Deployments

1. Use the deployment form below the metrics dashboard to notify the system of a service deployment.

> **Note**: Artifacts are specified using [PURL format](https://github.com/package-url/purl-spec):
> `scheme:type/namespace/name@version?qualifiers#subpath`
> See [PURL examples](https://github.com/package-url/purl-spec/blob/main/PURL-TYPES.rst) for more details.

![Service Deployment Form Example](/quickstart/form_services_deployed_sample.png)

The metrics dashboard will update automatically to reflect the new deployment:

![Updated Deployment Metrics](/quickstart/metrics_with_deployment.png)

### Reporting Incidents

1. Use the incident reporting form to log new incidents:

![Incident Reporting Form](/quickstart/form_incidents_reported_sample.png)

The dashboard will update to show the incident data:

![Incident Metrics View](/quickstart/metrics_with_incident.png)

## Advanced Usage

### Additional Features

- **Multiple Events**: Experiment with various deployment versions and environments using the forms
  (use the filters at the top for different views)
- **Raw Event Interface**: Access the RAW form to send any CDEvents (eg use sample events from the [CDEvents conformance repository](https://github.com/cdevents/spec/tree/spec-v0.4/conformance))![form with raw json](/quickstart/form_raw_json.png)
- **Explore other Dashboards**: Explore additional visualizations at <http://localhost:3000/d/cdevents-activity/cdevents-activity>

![Activity Dashboard](/quickstart/dashboard_activity.png)

## Next Steps

### Production Implementation

- Deploy components in a persistent environment
- Integrate with external data sources:
  - GitHub
  - Kubernetes
  - File systems/Object storage
  - ...
  - Developer platform
- Develop custom dashboards and alerts
- Implement event-driven Software Development Life Cycle (SDLC):
  - Automated test triggering on deployment
  - Promotion based on successful tests
  - Launch long-running processes without blocking CI runners

### Support and Resources

For additional support and information, visit [CDviz] or contact our team.

[CDviz]: https://cdviz.dev/
[CDEvents]: https://cdevents.dev/
