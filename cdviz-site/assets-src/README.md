# CDviz Site Asset Sources

This directory contains source assets that are processed into optimized output files.

## Structure

```
assets-src/
├── blog/                    # Blog diagram sources (generated from frontmatter)
│   ├── *.mmd               # Mermaid diagram sources
│   ├── *.excalidraw        # Generated excalidraw files
│   └── *.styled.excalidraw # CDviz-styled excalidraw files
└── README.md               # This file
```

## Blog Asset Pipeline

The blog asset transformation pipeline converts mermaid diagrams from blog post frontmatter into CDviz-styled PNG images:

### Process Flow

1. **Extract**: `mise run blog:extract-mermaid` - Extract mermaid from blog-src/*.md frontmatter
2. **Convert**: `mise run blog:mermaid-to-excalidraw` - Convert .mmd to .excalidraw format
3. **Style**: `mise run blog:style-excalidraw` - Apply CDviz theme (orange #f08c00, hand-drawn)
4. **Export**: `mise run blog:export-png` - Generate PNG files for blog compatibility

### Quick Commands

```bash
# Run full pipeline
mise run blog:build

# Individual steps
mise run blog:extract-mermaid
mise run blog:mermaid-to-excalidraw
mise run blog:style-excalidraw
mise run blog:export-png

# Include blog assets in main build
mise run build:images
```

### Blog Post Format

Add mermaid diagrams to blog post frontmatter:

```yaml
visuals_needed:
  - type: "mermaid_diagram"
    filename: "my-diagram"
    mermaid_code: |
      graph LR
        A[Source] --> B[CDviz]
        B --> C[Dashboard]
```

The pipeline will:

1. Extract mermaid_code to `assets-src/blog/my-diagram.mmd`
2. Convert to excalidraw format with CDviz styling
3. Export to `assets/blog/my-diagram.png`
4. Reference in blog with `![Description](../assets/blog/my-diagram.png)`

## Dependencies

Blog asset processing requires:

- `bun` - JavaScript runtime and package manager
- `@excalidraw/mermaid-to-excalidraw` - Diagram format conversion
- `puppeteer` - Headless browser for PNG export
- `gray-matter` - Frontmatter parsing

Install with: `mise run blog:install-deps`

## CDviz Visual Standards

All generated diagrams follow CDviz visual identity:

- **Color**: Orange (#f08c00) on transparent/black background
- **Style**: Hand-drawn, sketchy appearance (roughness: 2)
- **Typography**: Excalifont family for consistency
- **Format**: PNG for maximum platform compatibility

See `../blog-src/VISUAL_GUIDE.md` for detailed styling guidelines.
