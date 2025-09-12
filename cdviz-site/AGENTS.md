# AGENTS.md - CDviz Documentation Site

AI agent instructions for working with the CDviz documentation site built with VitePress, Bun, and TailwindCSS.

## Project Overview

This is the `cdviz-site` component - the documentation website for CDviz (Software Delivery Lifecycle observability platform). The site uses VitePress for static site generation, Bun for package management, and TailwindCSS for styling.

**Target Audience**: DevOps engineers, tech leads, platform engineers, and developers implementing SDLC observability.

**Key Technologies**:

- VitePress 2.0 (static site generator)
- Bun (runtime and package manager)
- TailwindCSS 4.x with custom plugins
- Vue.js components
- TypeScript configuration
- ImageMagick for asset optimization

## Development Environment Setup

All development uses `mise` task runner for consistent environments and command execution.

### Prerequisites

- [mise-en-place](https://mise.jdx.dev/) for tool management
- ImageMagick (optional, for asset generation)

### Quick Start

```bash
cd cdviz-site
mise install          # Install bun and other dependencies
mise run dev           # Start development server on http://localhost:5173
```

### Essential Commands

```bash
# Development
mise run dev           # Start dev server with hot reload
mise run build         # Build for production
mise run preview       # Preview built site locally

# Asset Management
mise run build:images  # Rebuild all optimized images
mise run build:favicon # Generate favicon variants from SVG
mise run build:hero-images # Optimize hero dashboard images

# Code Quality
mise run format        # Format all files with dprint/biome
mise run trim:trailing_space # Remove trailing whitespace

# Performance
mise run perf:report   # Run Lighthouse audits on local and production
```

## Project Structure

```
cdviz-site/
├── .vitepress/
│   ├── config.mts           # VitePress configuration
│   ├── theme/              # Custom theme components
│   └── dist/               # Build output
├── src/                    # Documentation source
│   ├── docs/              # Main documentation
│   ├── blog/              # Blog posts
│   ├── pro/               # Terms, privacy, legal pages
│   └── index.md           # Landing page
├── components/            # Vue components
│   └── landing/          # Landing page sections
├── assets/               # Static assets
│   ├── favicon.svg       # Source favicon
│   └── illustrations/    # Images and diagrams
├── package.json          # Bun dependencies
└── .mise.toml           # Task runner configuration
```

## Code Style & Guidelines

### Documentation Writing

- **Concise & Focused**: Avoid long pages except for auto-generated reference material
- **Valid Examples**: Use real code from the project, not fictional examples
- **User-Centric**: Write for DevOps engineers and platform teams
- **Consistent Tone**: Technical but accessible, following material design typography principles

### Content Organization

- **Logical Navigation**: Follow the sidebar structure in `.vitepress/config.mts`
- **Cross-References**: Link related sections appropriately
- **Progressive Disclosure**: Start simple, add complexity gradually

### Technical Standards

- **Markdown**: Standard GitHub-flavored markdown in `src/` directory
- **Vue Components**: Use composition API, TypeScript when beneficial
- **Assets**: Optimize images, use WebP/AVIF formats, provide responsive variants
- **Performance**: Maintain fast load times, optimize bundle splitting

### Style References

- Technical documentation: [TailwindCSS docs](https://tailwindcss.com/docs/installation/using-vite)
- Typography: [Material Design typography rules](https://m3.material.io/styles/typography/applying-type)

## Content Development

### Adding New Pages

1. Create markdown file in appropriate `src/` subdirectory
2. Update navigation in `.vitepress/config.mts` sidebar configuration
3. Follow existing naming conventions and URL structure
4. Test navigation and cross-links

### Working with Assets

- **Images**: Place in `assets/` with descriptive names
- **Favicon**: Edit `assets/favicon.svg`, run `mise run build:favicon`
- **Hero Images**: Edit source, run `mise run build:hero-images`
- **Optimize**: Always run `mise run build:images` after asset changes

### Component Development

- **Landing Components**: Located in `components/landing/`
- **Reusable Elements**: Create in `components/` with clear naming
- **Vue SFC**: Use `<script setup>` with TypeScript when needed
- **TailwindCSS**: Use utility classes, follow responsive design patterns

## Testing & Quality

### Pre-commit Checklist

```bash
mise run format         # Format code
mise run build         # Verify build succeeds
mise run preview        # Test locally
mise run perf:report    # Check performance (optional)
```

### Content Quality

- **Spell Check**: Review for typos and grammar
- **Link Validation**: Ensure internal/external links work
- **Code Examples**: Test all code samples work as documented
- **Accessibility**: Use semantic HTML, alt text for images

### Performance Standards

- **Lighthouse Score**: Target 90+ for all metrics
- **Bundle Size**: Monitor chunk sizes in build output
- **Image Optimization**: Use appropriate formats and sizes
- **Font Loading**: Rely on VitePress font optimization

## Deployment & Publishing

### Build Process

1. `mise run build` generates static files in `.vitepress/dist/`
2. Site deploys automatically via CI/CD when changes merge to main
3. Production URL: https://cdviz.dev

### Content Updates

- **Documentation**: Edit markdown files in `src/docs/`
- **Blog Posts**: Add to `src/blog/` with proper frontmatter
- **Landing Page**: Modify Vue components in `components/landing/`

## Common Tasks

### Adding Documentation for New Collector Feature

1. Create markdown file: `src/docs/cdviz-collector/[feature-name].md`
2. Update sidebar in `.vitepress/config.mts`
3. Include practical examples from actual collector usage
4. Cross-reference related features

### Updating Landing Page Content

1. Edit Vue components in `components/landing/`
2. Update copy to reflect current product capabilities
3. Test responsive design on multiple screen sizes
4. Verify performance impact with `mise run perf:report`

### Adding Blog Post

1. Create file: `src/blog/YYYYMMDD-topic.md`
2. Include proper frontmatter (title, date, description)
3. Update blog sidebar in `.vitepress/config.mts`
4. Follow existing blog post structure and tone

## Troubleshooting

### Common Issues

- **Build Failures**: Check `.vitepress/config.mts` syntax and imports
- **Missing Images**: Verify asset paths and run image build tasks
- **Styling Issues**: Ensure TailwindCSS classes are correct and up-to-date
- **Navigation Problems**: Check sidebar configuration matches file structure

### Development Server Issues

- **Port Conflicts**: VitePress dev server runs on port 5173
- **Hot Reload**: Restart dev server if changes aren't reflecting
- **Cache Issues**: Clear `.vitepress/cache/` if experiencing build problems

## Commit Message Format

Follow conventional commit format for all changes:

```
feat(docs): add new collector source documentation
fix(landing): correct pricing table responsive layout
docs(collector): update webhook integration examples
style(components): improve hero section accessibility
perf(assets): optimize dashboard screenshot compression
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
