# CDEvents in Action Series

This directory contains episodes for the "CDEvents in Action" educational series focused on practical CDEvents implementation patterns.

## Series Overview

**Goal**: Introduce CDEvents standard and practical implementation with CDviz to the dev.to community
**Target Audience**: DevOps engineers, platform engineers, developers implementing SDLC observability
**Publishing**: Weekly episodes on dev.to with optimal learning progression
**Strategy**: Educational content in blog, detailed implementation in CDviz documentation

## Content Strategy

### **Blog Series Role:**

- **Educational**: Concepts, use cases, decision frameworks
- **Pattern-focused**: Reusable approaches, not tool-specific details
- **Reference-driven**: Points to CDviz documentation for implementation
- **SEO optimized**: "CDEvents in Action #N: Title" format

### **CDviz Documentation Role:**

- **Implementation guides**: Step-by-step integration tutorials
- **Configuration examples**: Real YAML, JSON, code samples
- **Technical references**: API specifications, troubleshooting

## Episode Structure & Learning Progression

### **Season 1: Foundations** (Episodes 0-2)

**Learning Goal**: Understand CDEvents and basic producer/consumer patterns

**Episode #0: "Monitor Your Software Factory"** ✅ Published

- **Location**: `../src/blog/20250821-manager-problem.md`
- **Focus**: Problem identification, CDviz value proposition
- **Audience**: Engineering Managers, Team Leads
- **CDviz Docs**: Uses existing docker compose setup

**Episode #1: "Simulate a Consumer"** ✅ Published

- **Focus**: Test CDEvents integration approaches before building
- **Tools Comparison**: webhook.site, CDviz docker compose, cdviz-collector connect debug
- **Audience**: Developers starting CDEvents integration
- **CDviz Docs**: ✅ Existing (docker compose, webhook endpoints)

**Episode #2: "Send Your First CDEvent"** ✅ Published

- **Focus**: `cdviz-collector send` vs raw curl comparison
- **Tools**: cdviz-collector CLI (primary), curl (comparison/debugging), bash scripts
- **Audience**: DevOps engineers, CI/CD practitioners
- **CDviz Docs**: ✅ Existing (send.md, http.md, header-authentication.md)

### **Season 2: Direct Integration** (Episodes 3-4)

**Learning Goal**: Instrument existing pipelines to send CDEvents

**Episode #3: "Direct CI/CD Pipeline Integration"** ✅ Published

- **Focus**: Universal CI/CD integration patterns with GitHub Actions as primary example
- **Pattern-Based Teaching**: Three universal patterns applicable to all CI/CD systems
- **Tools**: GitHub Actions (detailed), Jenkins, GitLab CI, CircleCI (application examples)
- **Patterns**: send-cdevents action, cdviz-collector send, curl + bash script
- **Audience**: All CI/CD practitioners (GitHub, Jenkins, GitLab, CircleCI users)
- **CDviz Docs**: ✅ Existing (github-action.md, send.md) ❓ May need Jenkins/GitLab examples

**Episode #4: "Advanced CI/CD Patterns"** 📝 Planned

- **Focus**: Enterprise patterns, plugins, shared libraries, advanced orchestration
- **Tools**: Jenkins plugins/shared libraries, GitLab webhooks (passive), advanced GitHub patterns
- **Patterns**: Reusable pipeline components, multi-pipeline orchestration
- **Audience**: Enterprise platform engineers, DevOps architects
- **CDviz Docs**: ❓ Need Jenkins plugins, shared libraries, advanced patterns

### **Season 3: Advanced Event Handling** (Episode 5)

**Learning Goal**: Transform and route events efficiently

**Episode #5: "Webhook and Transformer Patterns"** 📝 Planned

- **Focus**: Passive monitoring, event transformation, routing
- **Tools**: CDviz webhook sources, transformers, filtering
- **Audience**: Platform engineers
- **CDviz Docs**: ❓ Need transformer configuration, webhook routing

### **Season 4: Passive Monitoring** (Episodes 6-7)

**Learning Goal**: Collect events without modifying every pipeline

**Episode #6: "Kubernetes Passive Monitoring"** 📝 Planned

- **Focus**: Monitor deployments without pipeline changes
- **Tools**: kubewatch, custom controllers, deployment watching
- **Audience**: Kubernetes operators, platform teams
- **CDviz Docs**: ❓ Need kubewatch integration, K8s sources

**Episode #7: "ArgoCD & GitOps Integration"** 📝 Planned

- **Focus**: GitOps event patterns, deployment correlation
- **Tools**: ArgoCD webhooks, GitOps workflow events
- **Audience**: GitOps practitioners, platform engineers
- **CDviz Docs**: ❓ Need ArgoCD webhook integration

### **Season 5: Event-Driven Automation** (Episodes 8-10)

**Learning Goal**: Use CDEvents to trigger workflows and actions

**Episode #8: "Trigger Workflows with n8n"** 📝 Planned

- **Focus**: CDEvents as automation triggers, workflow orchestration
- **Tools**: n8n, workflow automation, conditional triggers
- **Audience**: Automation engineers, DevOps teams
- **CDviz Docs**: ❓ Need n8n integration examples

**Episode #9: "Multi-Pipeline Orchestration"** 📝 Planned

- **Focus**: Complex deployment coordination, cross-pipeline triggers
- **Tools**: Multiple workflow tools, orchestration patterns
- **Audience**: Platform engineers, DevOps architects
- **CDviz Docs**: ❓ Need orchestration patterns, API examples

**Episode #10: "CDviz Templated Notifications"** 📝 Planned

- **Focus**: Custom notification patterns, templated sinks
- **Tools**: CDviz templated sinks (planned feature), notification integrations
- **Audience**: Operations teams, notification management
- **CDviz Docs**: ❓ Need templated sink configuration (planned feature)

## Documentation Development Roadmap

### **Priority 1: Episodes 1-4 (Foundations & Direct Integration)**

- [ ] `cdviz-collector send` command reference and templates
- [ ] GitHub webhook source integration guide
- [ ] Jenkins/GitLab webhook integration patterns
- [ ] Authentication and security configuration

### **Priority 2: Episodes 5-7 (Advanced & Passive)**

- [ ] Webhook transformer configuration
- [ ] kubewatch and Kubernetes source setup
- [ ] ArgoCD webhook integration guide
- [ ] Passive monitoring patterns and trade-offs

### **Priority 3: Episodes 8-10 (Automation)**

- [ ] n8n and workflow tool integration examples
- [ ] Orchestration API patterns and examples
- [ ] Templated sink configuration (planned CDviz feature)

## Implementation Dependencies

**Episodes Ready to Write:**

- Episode 0 ✅ (published)
- Episode 1 ✅ (uses existing docker compose)
- Episode 2 ⚠️ (needs cdviz-collector send documentation)

**Episodes Requiring Documentation First:**

- Episodes 3+ all need corresponding CDviz integration guides

## Success Metrics

- **Educational Authority**: Position as definitive CDEvents learning resource
- **SEO Performance**: Rank for "CDEvents" and related terms
- **Community Engagement**: Drive CDviz adoption and GitHub activity
- **Documentation Quality**: Reduce support requests through clear guides
- **Weekly Publishing**: Sustainable 10-15 episode series over 2-3 months
