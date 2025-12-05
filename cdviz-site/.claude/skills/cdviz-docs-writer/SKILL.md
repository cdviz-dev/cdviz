---
name: cdviz-docs-writer
description: Create and edit technical documentation, blog posts, and articles for the CDviz VitePress site following project style guidelines, Material Design typography principles, and content organization standards. Use when writing docs pages, blog posts, tutorials, or updating technical content.
---

# CDviz Documentation Writer

Expert skill for creating high-quality technical documentation and articles for the CDviz observability platform documentation site.

## Project Context

**Target Audience**: DevOps engineers, tech leads, platform engineers, developers implementing SDLC observability

**Tech Stack**: Markdown, VitePress 2.0, TailwindCSS 4.x, Vue.js components, TypeScript

**Key Principles**:

- Concise and focused content (avoid long pages except for auto-generated references)
- Valid, real examples from the actual codebase (never fictional examples)
- User-centric language focused on practical implementation
- Technical but accessible tone
- Progressive disclosure (start simple, add complexity gradually)

## Content Types & Structure

### Documentation Pages

**Location**: `src/docs/`

**File naming**:

- Use kebab-case: `feature-name.md`
- Organize by component: `cdviz-collector/`, `cdviz-grafana/`, etc.

**Structure**:

```markdown
# Page Title

Brief introduction paragraph explaining what this is and why it matters.

## Main Section

Focused content with practical examples.

### Subsection

Specific implementation details.

## Examples

Real code from the project.

## Related

- Cross-references to related documentation
```

**Best practices**:

- Start with a clear "what" and "why"
- Use code blocks with proper language tags
- Include practical, working examples
- Add cross-references to related topics
- Break complex topics into multiple focused pages

### Blog Posts

**Location**: `src/blog/`

**File naming**: `YYYYMMDD-topic-name.md` (e.g., `20251127-kubernetes-monitoring.md`)

**Frontmatter required**:

```yaml
---
title: Your Article Title
date: 2025-11-27
description: Brief description for preview and SEO (1-2 sentences)
tags: ["tag1", "tag2", "tag3", "tag4"] # also used as tag on dev.to, and keywords on html
---
```

**Structure**:

```markdown
---
title: CDEvents in Action: Episode Title
date: 2025-11-27
description: Brief overview of what this post covers
---

# {{ $frontmatter.title }}

Opening paragraph that hooks the reader and sets context.

## Problem or Context

What challenge does this address?

## Solution or Approach

How CDviz/CDEvents solves it.

## Implementation

Practical code examples and configuration.

## Results or Takeaways

What users should understand or be able to do.

## Next Steps

Where to go from here, related topics.
```

**Blog post guidelines**:

- Tell a story or solve a specific problem
- Use real-world scenarios
- Include diagrams or screenshots when helpful, "clear diagrams and images are better than words"
- Keep paragraphs short (3-5 sentences max)
- Use subheadings for scannability
- Ready to be cross published (eg on dev.to)

## Writing Style Guidelines

### Tone & Voice

- **Technical but accessible**: Assume expertise but explain concepts clearly
- **Direct and active**: "Deploy the collector" not "The collector can be deployed"
- **Helpful, not patronizing**: Respect the reader's intelligence
- **Objective**: Focus on facts and implementation, not hype

### Typography Rules (Material Design)

- **Headings**: Use sentence case, not title case
- **Lists**: Use for series of items, not single points
- **Code**: Always use backticks for inline code, proper fenced blocks for snippets
- **Emphasis**: Use **bold** for UI elements and important terms, _italic_ sparingly

### Common Patterns

**Good**:

- "Configure the Kafka source in your collector"
- "The dashboard displays pipeline metrics"
- "Deploy with Helm or Docker Compose"

**Avoid**:

- "You can configure the Kafka source" (passive, wordy)
- "This is an amazing feature that will revolutionize..." (hype)
- "Simply just easily configure..." (patronizing filler words)

## Technical Standards

### Code Examples

**Always**:

- Use real code from the CDviz project
- Include language tags in fenced code blocks
- Show complete, working examples
- Add comments for clarity when needed

**Example formats**:

```yaml
# Kafka source configuration
sources:
  - type: kafka
    brokers: ["localhost:9092"]
    topics: ["cdevents"]
```

```bash
# Deploy with Helm
helm install cdviz-collector charts/cdviz-collector
```

### Asset References

- **Images**: Place in `assets/` or `assets/illustrations/`
- **Optimize**: Run `mise run build:images` after adding images
- **Alt text**: Always provide descriptive alt text
- **Responsive**: Consider multiple sizes for large images

### Navigation Updates

**Always update `.vitepress/config.mts`** when adding new pages:

1. Read current sidebar configuration
2. Add new page in appropriate section
3. Maintain logical grouping and ordering
4. Test navigation after changes

## Workflow Checklist

### Creating New Documentation

- [ ] Choose appropriate location (`src/docs/` or `src/blog/` or `blog-wip` for articles preparation)
- [ ] Use correct naming convention
- [ ] Add frontmatter (for blog posts)
- [ ] Write content following style guidelines
- [ ] Include practical, real code examples
- [ ] Add cross-references to related pages
- [ ] Update `.vitepress/config.mts` sidebar
- [ ] Optimize any new images
- [ ] Run `mise run format` to format
- [ ] Run `mise run build` to verify
- [ ] Run `mise run preview` to test locally

### Editing Existing Content

- [ ] Read entire page/section first
- [ ] Maintain consistent tone with existing content
- [ ] Preserve working examples
- [ ] Update cross-references if needed
- [ ] Format with `mise run format`
- [ ] Verify with `mise run build`

## Quality Checks

### Content Quality

- Is it concise and focused?
- Are examples real and working?
- Is the tone appropriate for the audience?
- Does it follow progressive disclosure?
- Are technical terms explained when first used?

### Technical Quality

- Do all code examples work?
- Are all links valid?
- Are images optimized?
- Does the page build without errors?
- Is navigation correct?

### SEO & Accessibility

- Is there a clear page title?
- Are headings hierarchical (h1 → h2 → h3)?
- Do images have alt text?
- Is the description/frontmatter complete?

## Reference Resources

- **Style inspiration**: [TailwindCSS docs](https://tailwindcss.com/docs)
- **Typography rules**: [Material Design Typography](https://m3.material.io/styles/typography/applying-type)
- **CDEvents spec**: See `cdevents-spec/` directory in monorepo
- **Architecture overview**: `../README.md` in monorepo root

## Common Tasks

### Add new collector source documentation

1. Create `src/docs/cdviz-collector/sources/[source-name].md`
2. Include configuration examples from actual source code
3. Document all configuration options
4. Add troubleshooting section
5. Update sidebar in `.vitepress/config.mts`

### Write "CDEvents in Action" blog post

1. Create `src/blog/YYYYMMDD-cdevents-in-action-ep-N-topic.md`
2. Follow episode structure: Problem → Solution → Implementation → Results
3. Include real CDEvents examples
4. Add diagrams or screenshots if helpful
5. Update blog sidebar configuration

### Update landing page copy

1. Edit Vue components in `components/landing/`
2. Keep messaging aligned with current product state
3. Test responsive design
4. Check performance impact with `mise run perf:report`

## Important Constraints

- **Never** edit generated files (Grafana JSON dashboards, etc.)
- **Never** create documentation without reading existing related docs first
- **Never** use fictional examples when real code exists
- **Always** maintain the concise, focused style
- **Always** update navigation configuration
- **Always** format code with `mise run format` before committing

## Commands Reference

```bash
mise run :dev           # Start dev server (localhost:5173)
mise run :build         # Build for production
mise run :preview       # Preview production build
mise run :format        # Format all files
mise run :build_images  # Optimize images
mise run //perf:report   # Run Lighthouse audits
```
