# ADR 002: Migrate cdviz-collector from AGPL v3 to Apache License v2

- **Status:** Accepted
- **Date:** 2025-09-08
- **Decision-makers:** Achim312, CDviz team
- **Consulted:** CDEvents community legal teams
- **Informed:** CDviz contributors, early adopters

## Context and Problem Statement

Following the initial licensing decision documented in [ADR 001: License Choices for cdviz Projects](./001-licensing.md), we implemented a dual licensing model (AGPL v3 + Commercial) for cdviz-collector. However, feedback from potential early adopters, particularly the CDEvents community, has highlighted significant concerns:

- Legal teams in enterprise organizations expressed issues with AGPL v3 license evaluation and compliance
- The dual licensing model creates complexity for commercial distribution and packaging
- AGPL v3 may be hindering adoption in the Cloud Native ecosystem where Apache License v2 is the preferred standard

How can we reduce licensing barriers while maintaining our open source commitment and business model?

## Decision Drivers

- **Community feedback**: CDEvents community legal teams flagged AGPL compliance concerns
- **Adoption barriers**: Enterprise hesitation to evaluate or contribute to AGPL projects
- **Ecosystem alignment**: Apache License v2 is standard for CNCF and Cloud Native projects
- **Business simplification**: Reduce dual licensing complexity for commercial offerings
- **Competitive landscape**: Major observability and infrastructure tools use permissive licenses

## Considered Options

1. **Keep AGPL v3 + Commercial** - Maintain current dual licensing
2. **Switch to Apache License v2** - Single permissive license
3. **Switch to Apache License v2 + Commons Clause** - Permissive with anti-competition clause
4. **Switch to Business Source License (BSL)** - Eventually open source with commercial protection

## Decision Outcome

**Chosen option: "Switch to Apache License v2"** - Single permissive license for cdviz-collector v0.15+

### Justification

- **Eliminates adoption barriers**: Apache License v2 is enterprise-friendly and widely accepted
- **Simplifies compliance**: Permissive license reduces legal complexity for users
- **Enables ecosystem integration**: Aligns with CNCF and Cloud Native standards
- **Maintains open source values**: Keeps collector fully open source
- **Business model evolution**: Focus commercial offerings on enterprise features and support services rather than licensing

## Consequences

### Positive

- **Increased adoption potential**: Lower barriers for evaluation, contribution, and integration
- **Simplified business operations**: No dual licensing management or commercial license sales
- **Community alignment**: Better alignment with CDEvents and Cloud Native communities
- **Reduced legal overhead**: Simpler license compliance for both CDviz and users
- **Competitive positioning**: More attractive to enterprises compared to AGPL alternatives

### Negative

- **Reduced IP protection**: No copyleft protection against proprietary forks
- **Commercial model shift**: Must rely on enterprise features and services for monetization
- **Potential competition**: Others can build competing services using our code

### Mitigation Strategies

- **Focus on service differentiation**: Emphasize professional support, SaaS offerings, and enterprise features
- **Community building**: Build strong community relationships to maintain competitive advantage
- **Rapid innovation**: Maintain development velocity to stay ahead of potential forks

## Confirmation

- [x] Update license files to Apache License v2 for cdviz-collector v0.15+
- [x] Update documentation and website to reflect new licensing
- [x] Communicate changes to existing contributors and users
- [ ] Monitor adoption metrics post-change
- [ ] Review commercial subscription model effectiveness after 6 months

## More Information

- **Related ADR**: [ADR 001: License Choices for cdviz Projects](./001-licensing.md)
- **Implementation**: License change effective with cdviz-collector v0.15
- **Legacy versions**: v0.14 and earlier remain under AGPL v3
- **Documentation updates**: All references to dual licensing removed from website and docs
- **Community impact**: Positive feedback expected from CDEvents and CNCF communities
