---
title: "Pipeline Visibility Crisis: When Your Tools Don't Talk"
description: "Engineering teams waste time correlating data across CI/CD tools. CDviz provides unified event collection and visualization for deployment tracking."
tags: [EngineeringManagement, DORA, DevOps, CI/CD, Observability]
target_audience: "Engineering Managers, Team Leads"
reading_time: "5 minutes"
series: "CDviz Pipeline Visibility"
series_part: 1
visuals_needed:
  - type: "excalidraw_diagram"
    description: "Before/After comparison showing scattered tools vs unified CDviz"
    filename: "blog-scattered-vs-unified.excalidraw.svg"
    style: "CDviz house style - orange (#f08c00) on black, hand-drawn, sketchy"
    elements:
      - "Left side: GitHub, Jenkins, K8s, Datadog, PagerDuty boxes with question marks"
      - "Arrow pointing to right side: CDviz Collector → PostgreSQL → Unified Dashboard"
      - "Title: 'Before vs After Pipeline Visibility'"
    dimensions: "800x400"
  - type: "screenshot"
    description: "CDviz demo dashboard from quickstart guide"
    source: "reuse existing: cdviz-site/assets/quickstart/metrics_with_deployment.png"
    caption: "Real CDviz dashboard showing deployment events"
---

# Pipeline Visibility Crisis: When Your Tools Don't Talk

Your CI/CD stack is impressive: GitHub, Jenkins, Kubernetes, Datadog, PagerDuty. But when leadership asks "How fast do we deploy?" you're opening 6 browser tabs and building spreadsheets.

## The Current Reality

![Scattered Tools Problem](blog-scattered-vs-unified.excalidraw.svg)
*Before CDviz: You manually correlate data from scattered tools*

Each tool has data. None talk to each other. You become the integration layer.

## What CDviz Actually Provides Today

**Event Collection**: Standardized [CDEvents](https://cdevents.dev/) from your existing tools
**Storage**: PostgreSQL database with TimescaleDB for time-series data
**Visualization**: Pre-built Grafana dashboards for deployment tracking

### Current Dashboards

- Service deployment timeline
- CDEvents activity feed
- Artifact tracking across environments

### What's Not Included (Yet)

- DORA metrics calculations (you build the SQL)
- Automated incident correlation (data is there, queries are yours)
- Multi-team comparisons (possible but requires setup)

## 5-Minute Demo: See the Difference

```bash
# Start CDviz locally
git clone https://github.com/cdviz-dev/cdviz.git
cd cdviz/demos/stack-compose
docker compose up

# Send a deployment event
curl -X POST http://localhost:8080/events \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "version": "0.4.0",
      "id": "demo-deploy-1",
      "source": "demo",
      "type": "dev.cdevents.service.deployed.0.1.1",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    },
    "subject": {
      "id": "my-service",
      "type": "service",
      "content": {
        "environment": {"id": "production"},
        "artifactId": "pkg:oci/my-service@v1.2.3"
      }
    }
  }'

# View dashboard
open http://localhost:3000/d/demo-service-deployed/demo-service-deployed
```

**Result**: Event appears immediately in timeline. No manual correlation needed.

## The Value: Time and Accuracy

**Before CDviz**:

- Query GitHub: 5 minutes
- Check Jenkins: 3 minutes
- Correlate timestamps: 10 minutes
- Build report: 15 minutes
- **Total**: 33 minutes per request

**With CDviz integration**:

- Open dashboard: 1 minute
- **Total**: 1 minute

## Real Questions CDviz Helps Answer

✅ "What version is running in production right now?"
✅ "When did we last deploy service X?"
✅ "Show me all deployments from last week"
✅ "What's our deployment frequency?"

🔄 "How do teams compare?" (data available, dashboard TBD)
❌ "What's our lead time?" (needs commit events integration)

## Next Steps

**Article 2**: Hands-on tutorial connecting your GitHub Actions to CDviz
**Article 3**: Production deployment patterns with Kubernetes

The goal isn't perfect metrics overnight—it's unified event collection that scales with your team.

---

*Ready to stop playing pipeline detective? Next week: connecting your first CI/CD tool in 15 minutes.*
