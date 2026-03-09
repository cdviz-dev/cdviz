---
tags:
  - tutorial
description: Get started with CDviz in minutes. Set up the collector, send your first CDEvents, and explore Grafana dashboards for pipeline visibility.
---

# Getting Started with CDviz

Welcome to CDviz! This guide will walk you through setting up a local CDviz environment to collect, store, and visualize your first CDEvents.

If you're new to CDviz, we recommend reading the [CDviz Platform Overview](/docs/) to understand its core concepts and components.

## 1. Local Environment Setup

First, you'll need to get the CDviz demo environment up and running on your local machine.

1. Clone the CDviz repository:

   ```bash
   git clone https://github.com/cdviz-dev/cdviz.git
   ```

2. Navigate to the `stack-compose` directory:

   ```bash
   cd cdviz/demos/stack-compose
   ```

3. Launch the Docker Compose stack:

   ```bash
   docker compose up
   ```

   This command will start all the necessary components: a web application for sending events, the CDviz Collector, the CDviz Database, and a pre-configured Grafana instance.

4. Access the demo dashboard in your browser:
   <http://localhost:3000/d/demo_service_deployed/service3a-demo>

   You should see a dashboard with some initial sample data.

   ![Initial Filled Dashboard View](/quickstart/metrics_filled.png)

5. Filter by service `my_app` (not listed, as it didn't exist yet) to have like the Empty Dashboard

   ![Initial Empty Dashboard View](/quickstart/metrics_empty.png)

## 2. Sending Your First Events

Now that your local environment is running, let's send manually some events and see them appear on the dashboard.

We send events to simulate your ticket system, CI tools, registries,... reporting's forms.

### Service Deployment Events

1. On the dashboard page, scroll down to the "Services Deployed" form. This form allows you to simulate service deployment events.

2. Fill out the form with some sample data. For the artifact, you can use the [Package URL (PURL) format](https://github.com/package-url/purl-spec). For example:

   ```yaml
   service: my_app
   action: deployed
   artifact: pkg:oci/my-app@sha256:1234567890abcdef?tag=0.1.0
   environment: cluster/dev-01
   ```

   ![Service Deployment Form Example](/quickstart/form_services_deployed_sample.png)

3. Click "Submit". You should see the "Deployment Frequency" and "Deployed Services" panels on the dashboard update to reflect the new event.

   ![Updated Deployment Metrics](/quickstart/metrics_with_deployment.png)

### Incident Reporting

1. Scroll down to the "Incidents Reported" form. This form allows you to simulate incident events.

2. Fill out the form with some sample data.

   ```yaml
   incident: incident-01
   action: reported
   description: It doesn't work...
   environment: cluster/dev-01
   service: my_app
   artifact: pkg:oci/my-app@sha256:1234567890abcdef?tag=0.1.0
   ticketURI: http://ticket-system.example.com/PRJ-01
   ```

   ![Incident Reporting Form](/quickstart/form_incidents_reported_sample.png)

3. Click "Submit". You should see the "Incidents Reported" panel update to reflect the new incident.

   ![Incident Metrics View](/quickstart/metrics_with_incident.png)

## 3. Exploring Further

Congratulations! You've successfully sent your first CDEvents and visualized them in Grafana. Here are a few things you can do to continue exploring CDviz:

- **Experiment with different events:** Try sending different types of events with different data to see how they are reflected in the dashboards.
- **Explore the CDEvents Activity dashboard:** This dashboard provides a more detailed view of all the CDEvents that have been collected. You can access it at [http://localhost:3000/d/cdevents-activity/cdevents-activity](http://localhost:3000/d/cdevents-activity/cdevents-activity).
- **Submit raw JSON events:** For more advanced use cases, you can use the "Raw JSON" form to submit CDEvents in their raw JSON format.
- **Explore other dashboards:** and look at `cdviz/demos/uses_cases` to see how data was injected (`csv -> cdviz-collector (transformers) -> database`)
<!--

## Frequently Asked Questions

### How long does CDviz take to set up?

CDviz can be running locally in under 5 minutes using Docker Compose. The demo stack (`cdviz/demos/stack-compose`) includes a pre-configured PostgreSQL database, CDviz Collector, and Grafana instance. You send your first CDEvent via a form in the browser and see it appear in the dashboard immediately.

### Does CDviz require modifying my existing pipelines?

No. CDviz supports passive monitoring via webhook transformers for GitHub, GitLab, and ArgoCD. Configure a webhook at the organization or group level once, and all repositories send events automatically — with zero pipeline changes. Active integration (for custom metadata) is optional and additive.

### What DORA metrics does CDviz track?

CDviz collects the raw event data needed to calculate all four DORA metrics: Deployment Frequency (from `service.deployed` events), Lead Time for Changes (from pipeline and deployment events), Change Failure Rate (from incident events), and Mean Time to Recovery (from `incident.detected` and `incident.resolved` events).

### What is the difference between CDviz and CDEvents?

CDEvents is a Continuous Delivery Foundation (CDF) specification — a standardized JSON schema for describing software delivery events. CDviz is a platform that implements CDEvents: it collects events, stores them in a database, and visualizes them in dashboards. CDviz uses CDEvents as its data model; you can also send CDEvents to other CDEvents-compatible systems.
-->
