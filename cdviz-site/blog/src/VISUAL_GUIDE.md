# CDviz Blog Visual Guide

Guide for creating consistent visuals for CDviz blog posts, maintaining the house style across all platforms.

## CDviz Visual Identity

### Color Palette
- **Primary Orange**: `#f08c00` (248, 140, 0)
- **Background**: Black (`#000000`) or transparent
- **Text**: Orange on black for high contrast
- **Accents**: Use orange variations (lighter/darker) sparingly

### Typography
- **Font**: Excalifont (hand-drawn style)
- **Fallbacks**: Xiaolai, Segoe UI Emoji for compatibility
- **Style**: Sketchy, informal, approachable

### Visual Style
- **Hand-drawn aesthetic**: Slightly imperfect lines, sketchy appearance
- **Minimal color usage**: Primarily orange and black
- **Clear information hierarchy**: Size and positioning for importance
- **Technical precision**: Accurate representations despite sketchy style

## Platform Constraints

### dev.to Limitations
- ❌ **No Mermaid support**: Convert all mermaid diagrams to static images
- ❌ **No SVG embedding**: Use PNG/JPG formats for diagrams
- ✅ **Markdown images**: `![alt text](image.png)` format
- ✅ **External image hosting**: Can link to GitHub-hosted images

### Publishing Strategy
1. **Create diagrams** in Excalidraw with CDviz styling
2. **Export as PNG** for platform compatibility  
3. **Host on GitHub** in CDviz repository assets
4. **Reference in articles** with relative paths for site, absolute URLs for external platforms

## Required Diagrams for Blog Series

### Article 1: "Pipeline Visibility Crisis"
**File**: `blog-scattered-vs-unified.excalidraw.svg` → export to `.png`

**Content**:
- **Left side**: 5 tool boxes (GitHub, Jenkins, K8s, Datadog, PagerDuty) with confused arrows pointing to central "You" figure
- **Right side**: Clean flow CDviz Collector → PostgreSQL → Unified Dashboard
- **Title**: "Before vs After Pipeline Visibility"
- **Annotations**: Question marks on left, checkmarks on right

**Style Guide**:
```
- Tool boxes: Rectangular, hand-drawn borders, orange outline
- Arrows: Sketchy, organic curves with arrow heads
- Text: Excalifont, clear hierarchy (title larger, labels smaller)
- Background: Transparent or black
- Dimensions: 800x400px for web compatibility
```

### Article 2: "GitHub Actions Integration"
**File**: `blog-github-cdviz-flow.excalidraw.svg` → export to `.png`

**Content**:
- **Sequential flow**: GitHub Actions → CDviz Collector → PostgreSQL → Grafana
- **Step numbers**: (1), (2), (3), (4) in circles
- **Labels**: "POST /events", "INSERT event", "SELECT events", "Dashboard update"
- **Icons**: Simple representations of each component

**Style Guide**:
```
- Flow direction: Left to right
- Step indicators: Circled numbers, consistent spacing
- Components: Simple boxes with service names
- Arrows: Clear directional flow with labels
- Emphasis: Highlight the API call (step 1) as key integration point
```

### Article 3: "Production Kubernetes"
**File**: `blog-cdviz-production-k8s.excalidraw.svg` → export to `.png`

**Content**:
- **Kubernetes cluster boundary**: Dashed rectangle containing all components
- **CDviz namespace**: Inner boundary with 3 collector replicas, PostgreSQL primary+replica, 2 Grafana instances
- **External sources**: GitHub Actions, Jenkins, ArgoCD connecting through ingress
- **Storage**: Persistent volumes representation
- **High availability**: Visual indication of replica sets

**Style Guide**:
```
- Cluster boundaries: Dashed lines, clearly labeled
- Component grouping: Namespace sections with internal components
- Replication: Multiple identical components with "x3", "x2" annotations
- Data flow: Clear arrows showing external → ingress → internal components
- Scale indicators: Visual representation of HA setup
```

## Creating Diagrams: Mermaid → Excalidraw Workflow

### Automated Conversion Process
**Recommended for consistent, scalable diagram generation**:

1. **Write Mermaid diagram** (structured, version-controlled)
2. **Convert to Excalidraw** using mermaid-to-excalidraw
3. **Apply CDviz styling** (automated or manual)
4. **Export to PNG/SVG** for platform compatibility

### Tools Required
```bash
# Install converter
npm install -g @excalidraw/mermaid-to-excalidraw

# Convert workflow
mermaid-to-excalidraw diagram.mmd diagram.excalidraw
```

### CDviz Styling Configuration
```javascript
// excalidraw-config.js
const cdvizTheme = {
  strokeColor: "#f08c00",
  backgroundColor: "transparent", 
  fontFamily: "Excalifont",
  roughness: 2, // Hand-drawn feel
  strokeStyle: "rough"
};
```

## Manual Excalidraw Creation

### Setup Process (Alternative Method)
1. **Open Excalidraw** (excalidraw.com)
2. **Set font**: Choose "Hand-drawn" or "Excalifont" option
3. **Configure colors**: Use orange (#f08c00) for all elements
4. **Background**: Set to transparent or black

### Drawing Guidelines
1. **Start with layout**: Plan component positioning before drawing
2. **Use consistent shapes**: Rectangles for services, circles for indicators, diamonds for decisions
3. **Maintain spacing**: Equal margins and consistent element spacing
4. **Label clearly**: All components should be easily identifiable
5. **Test readability**: Ensure text is legible at target size

### Export Settings
- **Format**: PNG for maximum compatibility
- **Resolution**: 2x for crisp display on high-DPI screens
- **Dimensions**: Match specified requirements (800x400, 800x600, etc.)
- **Background**: Transparent for flexible placement

## Using Existing CDviz Assets

### Available Screenshots
Located in `cdviz-site/assets/`:

**Quickstart Screenshots**:
- `quickstart/metrics_empty.png` - Clean dashboard before events
- `quickstart/metrics_with_deployment.png` - Dashboard with deployment data
- `quickstart/metrics_with_incident.png` - Dashboard showing incident correlation

**Grafana Panels**:
- `screenshots/grafana_panel_deploy_freq-*.png` - Deployment frequency charts
- `screenshots/grafana_dashboard_*` - Full dashboard views
- `screenshots/grafana_panel_timeline_*` - Timeline visualizations

### Reuse Strategy
1. **Prefer existing assets** when they match article needs
2. **Crop/annotate** existing screenshots for focus
3. **Create new diagrams** only when existing assets don't fit
4. **Maintain consistency** between original assets and new creations

## Publication Workflow

### For CDviz Website
1. **Place images** in `cdviz-site/assets/blog/`
2. **Reference locally**: `![alt](../assets/blog/image.png)`
3. **Update build** to include new assets

### For External Platforms (dev.to, CD Foundation)
1. **Upload to GitHub**: Place in CDviz repository for hosting
2. **Use absolute URLs**: `![alt](https://raw.githubusercontent.com/cdviz-dev/cdviz/main/cdviz-site/assets/blog/image.png)`
3. **Test loading**: Verify images display correctly on target platform
4. **Provide alt text**: Descriptive alt attributes for accessibility

## Quality Checklist

Before publishing any visual:

- [ ] **Follows CDviz color scheme** (orange #f08c00 on black/transparent)
- [ ] **Uses hand-drawn/sketchy style** consistent with existing assets
- [ ] **Readable at target size** (test at 800px width)
- [ ] **Accurate technical content** (no misleading representations)
- [ ] **Platform compatible** (PNG format for external platforms)
- [ ] **Accessible alt text** provided in markdown
- [ ] **Consistent with series** (similar style across all 3 articles)
- [ ] **Professional quality** (clean, organized, purposeful)

## Troubleshooting Common Issues

### Platform Incompatibility
**Problem**: Mermaid/SVG not displaying
**Solution**: Convert to PNG, host externally, update references

### Color Consistency
**Problem**: Colors look different across platforms
**Solution**: Use exact hex values (#f08c00), test on target platforms

### Size/Readability
**Problem**: Text too small on mobile
**Solution**: Increase font size, simplify diagrams, test responsive display

### Loading Issues
**Problem**: External images not loading
**Solution**: Verify GitHub raw URLs, check image permissions, provide fallback descriptions