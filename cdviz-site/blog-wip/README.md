# CDviz Blog Working Area

This directory contains draft blog content, ideas, and the asset generation pipeline for CDviz. Published content moves to `cdviz-site/src/blog/` and `cdviz-site/assets/` for the main website.

## Directory Structure

```txt
blog-wip/                       # Working area for drafts and ideas
├── README.md                   # This file
├── cdevents-in-action/         # CDEvents in Action series episodes
│   └── episode-*.md           # Individual episode drafts
├── ideas/                      # Content ideas and future planning
│   ├── ideas-bank.md          # Educational article ideas
│   └── future-roadmap.md      # Future series and content roadmap
├── archive/                    # Outdated planning documents
│   └── *.md                   # Superseded plans and series concepts
├── assets-src/                 # Source assets for blog posts (if needed)
│   ├── *.excalidraw          # Excalidraw diagrams
│   └── icons_48x48_monochrome/ # Icon collection
├── VISUAL_GUIDE.md            # CDviz brand guidelines for blog assets
├── WORK_SUMMARY.md            # Historical record of previous blog work
└── .mise.toml                  # Asset generation pipeline
```

### Published Content Location

When blog posts are ready for publication, they move to:

```txt
cdviz-site/
├── src/blog/                   # Published blog posts
│   └── *.md                   # Final blog post content
└── assets/blog/               # Published blog assets
    ├── *.svg                  # Generated diagrams
    ├── *.png                  # Screenshots and images
    └── *.excalidraw.svg      # Excalidraw exports
```

## Purpose

This working area serves as a place to:

- **Draft** blog post content and ideas
- **Plan** blog series and content strategy
- **Store** planning documents and roadmaps
- **Collect** assets and resources for future posts

## Publishing Workflow

### 1. Draft Creation

Write drafts in `src/` directory or as planning documents in the root.

### 2. Content Review

Review tone, structure, and technical accuracy before publication.

### 3. Asset Preparation

Create any needed diagrams or images:

- Use [Excalidraw](https://excalidraw.com) for diagrams
- Apply CDviz styling: orange (#f08c00), hand-drawn style
- Export as SVG for web use

### 4. Publication Steps

1. **External publication** (e.g., dev.to) for wider reach
2. **Move to main site**: Copy content to `cdviz-site/src/blog/`
3. **Move assets**: Copy images/diagrams to `cdviz-site/assets/blog/`
4. **Update references**: Ensure all asset paths work in main site

### 5. Cross-Platform Publishing

- **dev.to**: Use for community engagement and SEO
- **CDviz website**: Include in main site for documentation value
- **Social media**: Extract key points for LinkedIn, Twitter

## Content Strategy

### Current Focus: "CDEvents in Action" Series

Educational series introducing CDEvents and practical implementation patterns for dev.to community.

**Overview:**

- **Goal**: Position as definitive CDEvents learning resource on dev.to
- **Strategy**: Educational content in blog + detailed implementation in CDviz docs
- **Publishing**: Weekly episodes with optimal learning progression
- **Target**: DevOps engineers, platform engineers, developers implementing SDLC observability

**Series Progress:**

- **Episode #0**: "Monitor Your Software Factory" ✅ Published & rebranded
- **Episodes 1-2**: Foundations (Consumer/Producer basics)
- **Episodes 3-4**: Direct Integration (GitHub, Jenkins, GitLab)
- **Episodes 5-7**: Advanced & Passive Monitoring
- **Episodes 8-10**: Event-Driven Automation

**📋 Detailed Series Plan**: See [`cdevents-in-action/README.md`](cdevents-in-action/README.md) for complete episode structure, learning progression, and documentation dependencies.

### Future Content Ideas

See `ideas/future-roadmap.md` for enterprise use cases and advanced series when product matures.

## Publishing Recommendations

### Series Format

- **Title Format**: "CDEvents in Action #N: Episode Title" for optimal dev.to SEO
- **Series Branding**: Consistent naming builds topic authority and searchability
- **Progressive Complexity**: Start accessible, build to advanced implementation patterns

### Content Guidelines

- **Tone**: Conversational yet professional, honest about limitations
- **Structure**: Problem → Solution → Demo → Value → Next Steps
- **Length**: 6-12 minute reads (1200-2000 words)
- **SEO**: Target keywords: cdvents, ci-cd-standardization, pipeline-observability
- **Engagement**: Include working code examples and immediate demos

### Dev.to Strategy

- **First-mover advantage**: Few compete for "CDEvents" searches
- **Community building**: Encourage discussion and experience sharing
- **Cross-references**: Link episodes together for SEO and user journey
