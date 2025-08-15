# [![cdevents logo](/logos/cdevents.svg)](https://cdevents.dev/)

CDEvents are the fundamental building blocks of CDviz. They are structured data that represent actions that occur in your software development lifecycle. CDviz uses the [CDEvents](https://cdevents.dev/) specification for its event format.

## What are CDEvents?

CDEvents (Continuous Delivery Events) are a standardized way to represent events in the continuous delivery process. They provide a common format for describing events that occur in software development, such as deployments, builds, and tests. This standardization allows different tools and systems to communicate effectively about the state of software delivery.

## CDEvent Structure

A CDEvent is a JSON object with a specific structure. Here is an example of a `service.deployed` event:

```json
{
  "context": {
    "version": "0.4.0-draft",
    "id": "a2f2b6f0-8e0d-4b4c-9a6d-8f3e5f7e8f5d",
    "source": "/my-app/my-pipeline",
    "type": "dev.cdevents.service.deployed.0.1.1",
    "timestamp": "2025-07-03T10:00:00Z"
  },
  "subject": {
    "id": "my-service",
    "source": "/my-app/my-pipeline",
    "type": "service",
    "content": {
      "environment": {
        "id": "production"
      },
      "artifactId": "pkg:oci/my-app@sha256:1234567890abcdef"
    }
  }
}
```

## Key Fields

- **`context.type`:** The type of the event. This is a namespaced string that identifies the event, such as `dev.cdevents.service.deployed.0.1.1`.
- **`subject.id`:** The unique identifier of the subject of the event, such as the name of a service or a build ID.
- **`subject.content`:** A JSON object that contains the details of the event.

For a complete list of all the available event types and their fields, please refer to the [CDEvents specification](https://cdevents.dev/docs/spec).
