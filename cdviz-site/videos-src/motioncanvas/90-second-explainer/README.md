# CDviz 90-Second Explainer - Vertical Motion Canvas

This Motion Canvas project creates the 90-second explainer video for CDviz in **vertical/portrait format (1080x1920)** optimized for short video platforms like YouTube Shorts, TikTok, and Instagram Reels.

## Project Structure

- `src/project.ts` - Main project configuration (vertical format)
- `src/scenes/explainer.tsx` - Main animation scene with 5 sections optimized for mobile viewing
- `public/assets/` - All required assets (logos, icons, screenshots)
- `public/style.css` - CDviz brand colors and typography

## Quick Start

### Using mise (Recommended)

```bash
# Install dependencies and build
mise run ci

# Start development server with live preview
mise run dev

# Open Motion Canvas editor
mise run edit

# Build for production
mise run build
```

### Using bun directly

```bash
# Install dependencies
bun install

# Start development server (with preview)
bun run start

# Build for production
bun run build
```

## Available Tasks

Run `mise tasks` to see all available tasks:

### **Development Server Management**

- **`mise run dev`** - Start development server (smart restart - stops existing servers first)
- **`mise run dev-check`** - Check if dev server is running, start if not (smart start)
- **`mise run dev-status`** - Show development server status and port
- **`mise run dev-stop`** - Stop development server

### **Main Tasks**

- **`mise run edit`** - Open Motion Canvas editor (alias for `dev`)
- **`mise run preview`** - Start preview server (alias for `dev-check`)
- **`mise run build`** - Build the TypeScript and Motion Canvas project
- **`mise run ci`** - Run CI tasks (install + build)
- **`mise run lint`** - Lint TypeScript files
- **`mise run clean`** - Clean build artifacts and dependencies
- **`mise run export`** - Instructions for video export via UI

## Development

1. **Preview**: Open http://localhost:9000/ (or next available port) to see the vertical animation
2. **Timeline**: The animation is structured in 5 sections matching the script:
   - 0-15s: Opening Hook
   - 15-30s: Problem Deep Dive
   - 30-50s: Solution Introduction
   - 50-75s: Product Demo
   - 75-90s: Call to Action

## Animation Sections (Mobile-Optimized for Vertical Viewing)

### Opening Hook (0-15s)

- **Large title** (92px): "Know What's\nDeployed When"
- **Bigger tool icons** (120px): Arranged vertically for portrait layout
- **Subtitle** (48px): "Deployment visibility is\nscattered across tools"

### Problem Deep Dive (15-30s)

- **Bold message** (84px): "Scattered History\n=\nLost Context"
- Fragmented connection lines between tools
- Question marks showing uncertainty

### Solution Introduction (30-50s)

- **Large CDEvents logo** (200px) prominently displayed
- **Big text** (56px + 72px): "CDEvents\nStandard" and "Unified\nSDLC Timeline"
- **CDviz logo** (180px)
- **Larger particles** (32px): Vertical flow showing event standardization

### Product Demo (50-75s)

- **Larger dashboard screenshot** (0.6x scale) for mobile visibility
- **Big feature highlights** (56px) with emojis:
  - 📊 Timeline View
  - 🔗 Metrics Correlation
  - 📈 DORA Metrics
  - ⚡ Event Automation

### Call to Action (75-90s)

- **Huge website** (110px): "cdviz.dev"
- **Large tagline** (64px): "Complete\nSDLC Visibility"
- **Big button** (480x100px): "Start Free Today" (44px text)
- **Subtitle** (36px): "Open Source • Enterprise Ready"

## Brand Compliance

- **Format**: 1080x1920 Vertical/Portrait for short video platforms
- **Colors**: Official CDviz brand colors
- **Typography**: Inter font family with mobile-optimized sizes
- **Frame Rate**: 30fps (configurable in Motion Canvas UI)
- **Platform Ready**: YouTube Shorts, TikTok, Instagram Reels

## Assets Used

- **Logos**: CDviz and CDEvents from `assets/logos/`
- **Icons**: Monochrome tool icons from `assets/icons_48x48_monochrome/`
- **Screenshots**: Real Grafana dashboards from `assets/screenshots/`

## Export Options

Using Motion Canvas UI, you can export to:

- **Video**: MP4, WebM, MOV formats
- **Image Sequence**: PNG frames for further editing
- **GIF**: For web use (with quality/size trade-offs)

## Customization

- **Timing**: Adjust `waitFor()` and animation durations in `explainer.tsx`
- **Colors**: Modify the `colors` object at the top of the scene
- **Text**: Update titles and messages to match script changes
- **Assets**: Replace images in `public/assets/` and update paths in code

## Production Notes

- Total duration: ~90 seconds (matches script timing)
- Optimized for YouTube, website embedding, and social media
- Uses real CDviz assets for authenticity
- Follows Motion Canvas best practices for smooth animations
