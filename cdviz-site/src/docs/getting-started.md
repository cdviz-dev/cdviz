---
tags:
  - tutorial
---
# Getting Started with CDviz

Welcome to CDviz! This guide will walk you through setting up a local CDviz environment to collect, store, and visualize your first CDEvents.

If you're new to CDviz, we recommend reading the [CDviz Platform Overview](/docs/) to understand its core concepts and components.

## 1. Local Environment Setup

First, you'll need to get the CDviz demo environment up and running on your local machine.

1.  Clone the CDviz repository:
    ```bash
    git clone https://github.com/cdviz-dev/cdviz.git
    ```

2.  Navigate to the `stack-compose` directory:
    ```bash
    cd cdviz/demos/stack-compose
    ```

3.  Launch the Docker Compose stack:
    ```bash
    docker compose up
    ```
    This command will start all the necessary components: a web application for sending events, the CDviz Collector, the CDviz Database, and a pre-configured Grafana instance.

4.  Access the demo dashboard in your browser:
    [http://localhost:3000/d/demo-service-deployed/demo-service-deployed](http://localhost:3000/d/demo-service-deployed/demo-service-deployed)

    You should see a dashboard with some initial sample data.

    ![Initial Dashboard View](/quickstart/metrics_empty.png)

## 2. Sending Your First Events

Now that your local environment is running, let's send some events and see them appear on the dashboard.

### Service Deployment Events

1.  On the dashboard page, scroll down to the "Services Deployed" form. This form allows you to simulate service deployment events.

2.  Fill out the form with some sample data. For the artifact, you can use the [Package URL (PURL) format](https://github.com/package-url/purl-spec). For example: `pkg:oci/my-app@sha256:1234567890abcdef`

    ![Service Deployment Form Example](/quickstart/form_services_deployed_sample.png)

3.  Click "Submit". You should see the "Deployment Frequency" and "Deployed Services" panels on the dashboard update to reflect the new event.

    ![Updated Deployment Metrics](/quickstart/metrics_with_deployment.png)

### Incident Reporting

1.  Scroll down to the "Incidents Reported" form. This form allows you to simulate incident events.

2.  Fill out the form with some sample data.

    ![Incident Reporting Form](/quickstart/form_incidents_reported_sample.png)

3.  Click "Submit". You should see the "Incidents Reported" panel update to reflect the new incident.

    ![Incident Metrics View](/quickstart/metrics_with_incident.png)

## 3. Exploring Further

Congratulations! You've successfully sent your first CDEvents and visualized them in Grafana. Here are a few things you can do to continue exploring CDviz:

*   **Experiment with different events:** Try sending different types of events with different data to see how they are reflected in the dashboards.
*   **Explore the CDEvents Activity dashboard:** This dashboard provides a more detailed view of all the CDEvents that have been collected. You can access it at [http://localhost:3000/d/cdevents-activity/cdevents-activity](http://localhost:3000/d/cdevents-activity/cdevents-activity).
*   **Submit raw JSON events:** For more advanced use cases, you can use the "Raw JSON" form to submit CDEvents in their raw JSON format.

## Next Steps

Now that you have a basic understanding of how to use CDviz, you're ready to start using it in your own environment. Here are some resources to help you get started:

*   **[CDviz Collector Documentation](/docs/cdviz-collector/):** Learn how to configure the CDviz Collector to collect events from your own systems.
*   **[CDviz Database Documentation](/docs/cdviz-db/):** Learn how to set up and manage the CDviz Database.
*   **[CDviz Grafana Documentation](/docs/cdviz-grafana/):** Learn how to create your own custom dashboards and alerts in Grafana.