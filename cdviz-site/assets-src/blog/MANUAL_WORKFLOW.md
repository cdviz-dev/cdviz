# Manual Blog Asset Creation Workflow

The automated mermaid-to-excalidraw conversion has dependency issues. Here's the **working manual workflow** for creating blog diagrams:

## ✅ What's Working (Automated)

```bash
# Extract mermaid from blog frontmatter
mise run blog:extract-mermaid
# → Creates .mmd files in assets-src/blog/
```

## 📋 Manual Steps Required

### 1. Convert Mermaid to Excalidraw

**For each `.mmd` file in `assets-src/blog/`:**

1. **Copy mermaid code** from the `.mmd` file
2. **Open**: https://mermaid-to-excalidraw.vercel.app/ 
3. **Paste** mermaid code
4. **Convert** and download as `.excalidraw` file
5. **Save** to `assets-src/blog/[filename].excalidraw`

### 2. Apply CDviz Styling

**Open each `.excalidraw` file** in https://excalidraw.com and:

1. **Select all elements** (Ctrl+A)
2. **Set stroke color**: `#f08c00` (orange)
3. **Set background**: Transparent
4. **Set roughness**: 2 (hand-drawn style)
5. **Set font**: Choose sketchy/hand-drawn option
6. **Save** as `[filename].styled.excalidraw`

### 3. Export to PNG

**From Excalidraw:**

1. **Open** styled `.excalidraw` file
2. **Export** → PNG
3. **Settings**: Transparent background, 2x resolution
4. **Save** to `assets/blog/[filename].png`

## Current Status

### ✅ Generated Files
- `blog-github-cdviz-flow.mmd` - Ready for manual conversion

### 📋 Missing (Create Manually)
- `blog-scattered-vs-unified.mmd` - Need to add to series-1 frontmatter
- `blog-cdviz-production-k8s.mmd` - Need to add to series-3 frontmatter

## Quick Commands

```bash
# Extract any new mermaid diagrams
mise run blog:extract-mermaid

# After manual creation, verify assets
ls -la assets/blog/
ls -la assets-src/blog/
```

## Expected Final Assets

```
assets/blog/
├── blog-scattered-vs-unified.png
├── blog-github-cdviz-flow.png
└── blog-cdviz-production-k8s.png
```

## Integration in Blog Posts

**Reference diagrams in markdown:**
```markdown
![Diagram Description](../assets/blog/diagram-name.png)
```

**For external publishing (dev.to):**
```markdown
![Diagram Description](https://raw.githubusercontent.com/cdviz-dev/cdviz/main/cdviz-site/assets/blog/diagram-name.png)
```

## CDviz Visual Standards

**All diagrams must use:**
- **Color**: `#f08c00` (orange) for all elements
- **Background**: Transparent
- **Style**: Hand-drawn, roughness 2
- **Typography**: Sketchy/hand-drawn font
- **Format**: PNG with transparent background

This manual process ensures CDviz visual consistency while working around the automated conversion issues.