# ADR 001: Initial License Choices for CDviz Project Ecosystem

- **Status:** Superseded by ADR-002 (for cdviz-collector)
- **Date:** 2025-05-05
- **Decision-makers:** Achim312, CDviz team
- **Consulted:** Open source legal experts, enterprise contributors
- **Informed:** CDviz contributors, community

## Context and Problem Statement

CDviz is building an ecosystem of components for software delivery observability. We need to establish licensing strategy that balances multiple objectives:

The CDviz ecosystem includes:

- **cdviz-collector**: Core connector software (interfaces with external services like S3, Kafka, GitHub, etc.)
- **cdviz**: Demos, documentation, Helm charts, and integrations (e.g., Grafana)
- **extensions/transformers**: Paid features and add-ons
- **SaaS**: Hosted version of the service

**Key challenges:**

- How do we protect core intellectual property while encouraging adoption?
- What licensing enables sustainable monetization through extensions and SaaS?
- How do we facilitate contributions from enterprises while maintaining control?

## Decision Drivers

- **IP Protection**: Prevent competitors from building proprietary forks of core components
- **Monetization Strategy**: Enable revenue through commercial licensing, extensions, and SaaS
- **Community Growth**: Encourage open source contributions and enterprise participation
- **Legal Clarity**: Provide clear licensing terms for different use cases
- **Business Flexibility**: Allow future pivots in business model and licensing

## Considered Options

1. **Full Open Source (Apache/MIT)** - All components permissively licensed
2. **Dual License Core (AGPL + Commercial)** - Core protected, ecosystem permissive
3. **Business Source License** - Eventually open source with commercial protection
4. **Full Proprietary** - Closed source commercial model
5. **Apache + Commons Clause** - Permissive with anti-competition terms

## Decision Outcome

**Chosen option: "Dual License Core (AGPL + Commercial)"** - Strategic licensing by component

### Component Licensing Decision

| Component                   | License                             | Rationale                                                                        |
| --------------------------- | ----------------------------------- | -------------------------------------------------------------------------------- |
| **cdviz-collector**         | **Dual License: AGPL + Commercial** | Protects core from competitive forks; allows monetization via commercial license |
| **cdviz**                   | **Apache 2.0**                      | Maximizes adoption for tools/demos/integrations                                  |
| **extensions/transformers** | **Proprietary/Commercial**          | Direct monetization of advanced features                                         |
| **SaaS**                    | **Proprietary/Commercial**          | Full control over hosted offering                                                |

### Justification

- **Core Protection**: AGPL ensures competitors cannot build proprietary services without contributing back
- **Ecosystem Growth**: Apache licensing for tooling maximizes adoption and contributions
- **Clear Monetization**: Commercial licensing provides direct revenue path for core component
- **Business Flexibility**: Multiple licensing options enable various business models

## Consequences

### Positive

- **IP Protection**: AGPL provides strong protection against proprietary competitive forks
- **Multiple Revenue Streams**: Commercial licensing, extensions, and SaaS all enabled
- **Community Growth**: Apache licensing for tooling encourages contributions
- **Enterprise Adoption**: Commercial license option removes AGPL concerns for enterprise users
- **Strategic Flexibility**: Different licenses for different components enable varied business models

### Negative

- **Dual License Complexity**: Managing two licenses for core component increases operational overhead
- **AGPL Adoption Barriers**: Some enterprises may avoid AGPL even with commercial option available
- **Legal Overhead**: Requires clear documentation of license boundaries and compliance requirements
- **Contributor Management**: Need CLA to enable dual licensing of contributions

### Mitigation Strategies

- **Clear Documentation**: Provide comprehensive license compliance guides
- **CLA Implementation**: Use Contributor License Agreement to manage contribution rights
- **Legal Support**: Offer guidance to enterprises on license compliance
- **Simple Commercial Terms**: Make commercial licensing straightforward and accessible

## Confirmation

- [x] Implement CLA for all repositories to enable dual licensing
- [x] Update license files with AGPL-3.0 and commercial license terms
- [x] Create comprehensive licensing documentation
- [x] Integrate commercial license into Terms & Conditions
- [ ] Monitor adoption rates across different license options
- [ ] Review effectiveness after 12 months

## More Information

### Detailed License Analysis

#### 1. **AGPL + Commercial License** (Selected for cdviz-collector)

**Usage**:

- Core software with strong copyleft protection
- Commercial license offered for enterprise use
- Ideal for projects wanting to prevent SaaS competitors while allowing open source contributions

**Pros**:

- Strong protection against competitive forks (requires publishing modifications)
- Monetization of the core via commercial license
- Encourages community contributions
- Clear legal boundaries for commercial use

**Cons**:

- Complexity in managing dual license
- Some enterprises avoid AGPL due to compliance requirements
- Requires careful documentation of license boundaries

**Legal Risks**:

- Misinterpretation of "network use" clause (Section 13)
- Contributor disputes over commercial use
- Enforcement challenges for SaaS violations

**Examples**:

- [MongoDB](https://www.mongodb.com/licensing) (pre-SSPL)
- [Grafana](https://grafana.com/oss/licensing/)
- [Elasticsearch](https://www.elastic.co/licensing/) (pre-Elastic License)

**Companies Using**:

- MongoDB (previously)
- Grafana Labs
- Elastic (previously)

---

### 2. **AGPL Only**

**Usage**:

- Pure open source projects wanting strongest copyleft
- Academic or community-driven projects
- Projects where commercial monetization isn't a priority

**Pros**:

- Strongest protection against proprietary forks
- Ensures all improvements benefit the community
- Clear open source commitment

**Cons**:

- Limits commercial adoption
- No direct monetization path for core
- May deter enterprise contributions

**Legal Risks**:

- Enforcement challenges for SaaS violations
- Potential contributor disputes

**Examples**:

- [Nextcloud](https://nextcloud.com/)
- [Mastodon](https://joinmastodon.org/)
- [PeerTube](https://joinpeertube.org/)

---

### 3. **ASL 2.0 + Commons Clause**

**Usage**:

- Open core projects wanting to prevent commercial competition
- Projects where internal enterprise use is encouraged but SaaS competition is restricted
- Alternative to AGPL for companies wanting simpler compliance

**Pros**:

- Easier adoption than AGPL for enterprises
- Protects against commercial competition
- Still allows internal use and modifications

**Cons**:

- Not OSI-approved (considered non-free by some)
- Legal enforceability not widely tested
- May deter some open source contributions

**Commons Clause Text**:

```plaintext
**Commons Clause**
The Software is provided to you by [Your Company] under the Apache License, Version 2.0 (the "License"), except that the following additional terms apply:

**Additional Use Grant (Section 3 of Apache License, Version 2.0)**
As an exception to Section 4 of the License, you may not use this Software, in whole or in part, to provide a commercial product or service that competes with [Your Company]'s products or services that include the Software.

**Limitation on Commercial Use**
The Software is provided to you for your internal use only, and you may not use the Software to provide a commercial offering, including but not limited to a service bureau, cloud service, or SaaS offering, without entering into a separate license agreement with [Your Company].
```

**Examples**:

- [Redis](https://redis.com/legal/licenses/) (pre-RSAL)
- [TimescaleDB](https://github.com/timescale/timescaledb/blob/master/LICENSE)
- [Confluent Community License](https://www.confluent.io/confluent-community-license/)

---

### 4. **ASL 2.0 Only**

**Usage**:

- Maximizing adoption and compatibility
- Projects where community growth is prioritized over monetization
- Components meant to be embedded in other products

**Pros**:

- Maximum adoption and compatibility
- Simple legal compliance
- Encourages enterprise contributions

**Cons**:

- No protection against commercial forks
- Limited monetization options for core
- Competitors can build proprietary services

**Examples**:

- [Kubernetes](https://kubernetes.io/) by CNCF projets
- [Apache Kafka](https://kafka.apache.org/) by Apache Software Foundation
- [TensorFlow](https://www.tensorflow.org/) by Google

---

### 5. **Permissive Licenses (MIT/BSD)**

**Usage**:

- Maximizing adoption and integration
- Projects where wide usage is more important than control
- Libraries and tools meant to be embedded everywhere

**Pros**:

- Maximum adoption and compatibility
- Minimal legal restrictions
- Encourages integration and contribution

**Cons**:

- No protection against commercial use
- Difficult to monetize
- Competitors can freely use the code

**Examples**:

- [React](https://reactjs.org/) (MIT)
- [jQuery](https://jquery.com/) (MIT)
- [FreeBSD](https://www.freebsd.org/) (BSD)

**Companies Using**:

- Facebook (React)
- Netflix (many projects)
- Microsoft (VS Code)

---

### 6. **PolyForm Licenses**

**Usage**:

- Projects wanting modern, clear licensing
- Startups needing flexible commercial terms
- Projects targeting specific user groups (non-commercial, small business)

**Pros**:

- Modern, clearly written licenses
- Flexible commercial terms
- Designed for startups and small businesses

**Cons**:

- Less widely recognized than traditional licenses
- Limited legal precedent
- May require more explanation for contributors

**Examples**:

- [Tidelift](https://tidelift.com/) (uses PolyForm for some projects)
- Emerging startup projects, Some modern startups

---

### 7. **Creative Commons Licenses**

**Usage**:

- Documentation, artistic content, and non-software assets
- Projects where content sharing is prioritized
- Educational materials

**Pros**:

- Well-understood for non-software content
- Clear attribution requirements
- Share-alike provisions available

**Cons**:

- Not suitable for software
- Multiple versions can cause confusion
- Some versions are non-commercial

**Examples**:

- [Wikipedia](https://www.wikipedia.org/) (CC BY-SA)
- [OpenStreetMap](https://www.openstreetmap.org/) (CC BY-SA for data)
- Many open educational resources

---

### 8. **Full Proprietary**

**Usage**:

- Closed-source commercial software
- Projects where all rights are reserved
- Enterprise software with no open source components

**Pros**:

- Full control over distribution and use
- Clear monetization path
- No open source compliance concerns

**Cons**:

- Limits community adoption and contributions
- Higher development costs (no community contributions)
- May face competition from open source alternatives

**Examples**:

- Microsoft Office (pre-open source)
- Adobe Photoshop
- Oracle Database

---

## License Comparison Table

| License                  | Protection Against Forks | Enterprise Adoption | Core Monetization | Extensions Monetization | Legal Complexity | Community Contributions | Usage Examples                  |
| ------------------------ | ------------------------ | ------------------- | ----------------- | ----------------------- | ---------------- | ----------------------- | ------------------------------- |
| **AGPL + Commercial**    | ✅ Strong                | ⚠️ Limited           | ✅ Yes            | ✅ Yes                  | ⚠️ High           | ✅ Encouraged           | MongoDB, Grafana, Elasticsearch |
| **AGPL Only**            | ✅ Strongest             | ❌ Low              | ❌ No             | ✅ Yes                  | ⚠️ High           | ✅ Encouraged           | Nextcloud, Mastodon             |
| **ASL + Commons Clause** | ⚠️ Medium                 | ✅ High             | ❌ No             | ✅ Yes                  | ✅ Low           | ⚠️ Limited               | Redis, TimescaleDB              |
| **ASL 2.0 Only**         | ❌ None                  | ✅ Very High        | ❌ No             | ✅ Yes                  | ✅ Very Low      | ⚠️ Limited               | Kubernetes, Kafka               |
| **MIT/BSD**              | ❌ None                  | ✅ Very High        | ❌ No             | ✅ Yes                  | ✅ Very Low      | ⚠️ Limited               | React, jQuery                   |
| **PolyForm**             | ⚠️ Medium                 | ✅ High             | ⚠️ Possible        | ✅ Yes                  | ⚠️ Medium         | ⚠️ Limited               | Modern startups                 |
| **Creative Commons**     | N/A (not for software)   | N/A                 | N/A               | N/A                     | ✅ Low           | ✅ Encouraged           | Wikipedia, OSM                  |
| **Full Proprietary**     | ✅ Strongest             | ✅ High             | ✅ Yes            | ✅ Yes                  | ✅ Low           | ❌ None                 | Microsoft Office, Photoshop     |

---

## Need for a CLA (vs DCO or None)

### Why a CLA?

- **Relicensing**: Allows changing the project license in the future
- **Rights protection**: Ensures contributions can be used under commercial terms
- **Flexibility**: Enables reuse in other projects
- **Risk mitigation**: Reduces risk of contributor disputes

**CLA Template**: [Alchim312 CLA Gist](https://gist.github.com/alchim312/EXAMPLE)

### Alternatives

| Option   | Pros                               | Cons                        | Decision                  |
| -------- | ---------------------------------- | --------------------------- | ------------------------- |
| **CLA**  | Full control, relicensing possible | Complexity for contributors | Selected for all projects |
| **DCO**  | Simple, standard                   | No relicensing possible     | Not selected              |
| **None** | No friction                        | High legal risks            | Not selected              |

### References and Resources

- **License Texts:**
  - [AGPL-3.0 Full Text](https://www.gnu.org/licenses/agpl-3.0.html)
  - [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0)
  - [MIT License](https://opensource.org/licenses/MIT)
  - [BSD Licenses](https://opensource.org/licenses/BSD-3-Clause)
  - [Commons Clause](https://commonsclause.com/)
  - [PolyForm Licenses](https://polyformproject.org/)

- **Implementation Resources:**
  - [CLA Assistant](https://cla-assistant.io/)
  - [Open Source Initiative](https://opensource.org/licenses)
  - [Alchim312 CLA Template](https://gist.github.com/alchim312/EXAMPLE)

- **Related Decisions:** Later superseded by [ADR 002: Migrate cdviz-collector from AGPL v3 to Apache License v2](./002-licensing-2.md)

### Implementation Notes

**Risk Mitigation Strategies:**

1. **AGPL Compliance**: Provide clear architecture guidelines
2. **Contributor Relations**: Maintain transparency about licensing
3. **Fork Protection**: Focus on support/extensions/SaaS for monetization

**Technical Boundaries:**

- User Scripts/Templates: Not subject to AGPL if dynamically loaded
- External Services: No AGPL impact on S3, Kafka, GitHub, etc.
- Clear documentation prevents misconceptions about license scope
