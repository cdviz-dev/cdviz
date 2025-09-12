# CDviz Blog Asset Pipeline

This directory contains the blog content and asset generation pipeline for CDviz.

## Directory Structure

```
blog/
├── .mise.toml                  # Blog-specific mise tasks
├── README.md                   # This file
├── src/                        # Blog source files
│   ├── series-*.md            # Blog post series
│   └── blog-post-*.md         # Individual blog posts
├── assets-src/                 # Source assets
│   ├── *.mmd                  # Mermaid diagrams extracted from frontmatter
│   ├── *.excalidraw          # Excalidraw diagrams (manual or converted)
│   └── *.styled.excalidraw   # CDviz-styled excalidraw diagrams
├── assets/                     # Generated output assets
│   ├── *.svg                  # SVG exports from excalidraw
│   └── *.README.md           # Manual creation instructions
└── scripts/                    # Blog-specific scripts
    ├── extract-mermaid.js     # Extract mermaid from frontmatter
    ├── mermaid-to-excalidraw.js # Convert mermaid to excalidraw (WIP)
    ├── style-excalidraw.js    # Apply CDviz styling
    └── excalidraw-to-png.js   # Export to SVG/PNG
```

## Pipeline Overview

The blog asset pipeline follows these steps:

1. **Extract Mermaid** (`extract-mermaid`): Extract mermaid diagrams from blog post frontmatter to `.mmd` files
2. **Convert to Excalidraw** (`mermaid-to-excalidraw`): Convert mermaid to excalidraw format *(currently creates placeholders)*
3. **Apply Styling** (`style-excalidraw`): Apply CDviz brand styling to excalidraw diagrams
4. **Export Assets** (`export-png`): Generate SVG files from excalidraw diagrams

## Usage

### Build all blog assets
```bash
mise run build
```

### Individual tasks
```bash
mise run extract-mermaid        # Extract mermaid diagrams from frontmatter
mise run mermaid-to-excalidraw  # Convert mermaid to excalidraw (placeholder)
mise run style-excalidraw       # Apply CDviz styling
mise run export-png             # Export to SVG
```

## Current Status

### ✅ Working Components
- **Mermaid Extraction**: Successfully extracts mermaid diagrams from blog post frontmatter
- **CDviz Styling**: Applies brand colors (#f08c00) and styling to excalidraw elements  
- **SVG Export**: Generates clean SVG files from excalidraw diagrams
- **Asset Pipeline**: Full mise-based workflow with dependency tracking

### ⚠️ Known Issues

#### Mermaid to Excalidraw Conversion
The `@excalidraw/mermaid-to-excalidraw` package requires a DOM environment and doesn't work in Node.js. Currently creates placeholder excalidraw files with instructions for manual creation.

**Workaround**: 
1. Mermaid diagrams are extracted to `assets-src/*.mmd` files
2. Manual creation needed using https://excalidraw.com
3. Save as `*.excalidraw` files in `assets-src/`
4. Pipeline will apply styling and export to SVG

## Manual Diagram Creation

When the mermaid conversion fails, follow these steps:

1. Open https://excalidraw.com
2. Create diagram based on the extracted `.mmd` file content
3. Apply CDviz styling manually:
   - Stroke color: `#f08c00` (orange)
   - Background: `transparent` 
   - Style: Hand-drawn, roughness 2
   - Font: Excalifont or monospace
4. Save as `.excalidraw` file in `assets-src/`
5. Run `mise run style-excalidraw && mise run export-png`

## Integration

The main site can build blog assets using:
```bash
# From cdviz-site/ root
mise run blog:build
```

This delegates to the blog directory's build task.