# CDviz Blog Working Area

This directory contains draft blog content, ideas, and the asset generation pipeline for CDviz. Published content moves to `cdviz-site/src/blog/` and `cdviz-site/assets/` for the main website.

## Directory Structure

```txt
blog-wip/                       # Working area for drafts and ideas
├── README.md                   # This file
├── src/                        # Draft blog posts and ideas
│   ├── series-*.md            # Blog post series (drafts)
│   ├── plan-*.txt             # Planning documents and ideas
│   └── *.md                   # Individual blog posts (drafts)
├── assets-src/                 # Source assets for blog posts (if needed)
│   ├── *.excalidraw          # Excalidraw diagrams
│   └── icons_48x48_monochrome/ # Icon collection
└── *.md                        # Planning documents and roadmaps
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

### Current Focus: Deployment Monitoring Series

1. **Problem identification** - Published: "Pipeline Visibility Crisis"
2. **Direct pipeline integration** - Planned: GitHub Actions, Jenkins, GitLab CI
3. **Kubernetes passive monitoring** - Planned: Webhooks and controllers
4. **GitOps and registry integration** - Planned: ArgoCD, container registries
5. **Advanced patterns** - Future: Multi-cluster, compliance, scaling

### Future Roadmap

See `FUTURE_ROADMAP_ambitious_blog_series.md` for enterprise use cases when product matures.

## Publishing Recommendations

- **Tone**: Conversational yet professional, honest about limitations
- **Structure**: Problem → Solution → Demo → Value → Next Steps
- **Length**: 5-8 minute reads (1000-1500 words)
- **SEO**: Target keywords: devops, cicd, observability, deployment monitoring
- **Engagement**: Include working code examples and immediate demos
