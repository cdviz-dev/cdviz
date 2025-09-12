# Blender Project Setup Checklist

**Project**: CDviz 90-Second Explainer Video
**File**: cdviz-explainer.blend

## Pre-Production Setup

### 1. Blender Installation & Configuration

- [ ] Download Blender 4.0+ from blender.org
- [ ] Launch Blender and delete default objects (cube, light, camera)
- [ ] Switch to "Video Editing" workspace
- [ ] Save as `cdviz-explainer.blend` in `/blender/` directory

### 2. Project Settings

- [ ] **Resolution**: 1920x1080 (Properties → Output → Resolution)
- [ ] **Frame Rate**: 30fps (Properties → Output → Frame Rate)
- [ ] **Frame Range**: 1-2700 (90 seconds × 30fps)
- [ ] **Color Management**: sRGB (Render → Color Management)

### 3. Asset Collection

Gather these assets from the repository:

#### From `cdviz-site/assets/`:

- [ ] `logos/cdviz.svg` - Main CDviz logo
- [ ] `logos/cdevents.svg` - CDEvents logo
- [ ] `screenshots/grafana_*.png` - Dashboard screenshots
- [ ] `architectures/overview_*.svg` - Architecture diagrams

#### From `cdviz-site/assets-src/`:

- [ ] `icons_48x48_monochrome/*.svg` - Tool icons (Jenkins, GitLab, K8s, etc.)

#### Create New Assets:

- [ ] Export high-res deployment timeline screenshot
- [ ] Create metrics correlation view screenshot
- [ ] Export DORA metrics dashboard view
- [ ] Take automation workflow screenshot

### 4. Audio Preparation

- [ ] **Record voiceover** using script (226 words at 150 WPM = 90 seconds)
- [ ] **Recording setup**: Quiet room, good microphone, WAV 48kHz format
- [ ] **Practice run**: Read script aloud with stopwatch for timing
- [ ] **Multiple takes**: Record 3-5 versions, choose best delivery
- [ ] **File naming**: `cdviz-explainer-voiceover-v1.wav`

## Production Roadmap

### Week 1: Foundation

**Days 1-2: Blender Learning**

- [ ] Complete basic Blender navigation tutorial (YouTube: "Blender Beginner Tutorial")
- [ ] Learn Video Sequence Editor basics
- [ ] Practice Grease Pencil drawing tools

**Days 3-4: Project Setup**

- [ ] Set up project file with correct settings
- [ ] Import all assets into Blender
- [ ] Create basic timeline structure
- [ ] Import and sync voiceover audio

**Days 5-7: Scene 1 - Opening Hook**

- [ ] Create tool icons floating animation
- [ ] Add "scattered vs organized" transition
- [ ] Implement text overlay: "Know What's Deployed When"

### Week 2: Core Animation

**Days 8-10: Scene 2 - Problem Deep Dive**

- [ ] Animate scattered deployment info across tools
- [ ] Use Grease Pencil for connection lines with question marks
- [ ] Add text: "Scattered History = Lost Context"

**Days 11-12: Scene 3 - Solution Introduction**

- [ ] CDEvents logo entrance animation
- [ ] Create unified timeline formation visual
- [ ] Particle system for standardized events flow

**Days 13-14: Scene 4 - Product Demo**

- [ ] Import dashboard screenshots as image strips
- [ ] Create Grease Pencil highlights and callouts
- [ ] Animate data appearing in charts
- [ ] Show automation workflow (test → deploy)

### Week 3: Polish & Export

**Days 15-16: Scene 5 - Call to Action**

- [ ] Website mockup transition
- [ ] Text animations for final messaging
- [ ] CDviz logo and pricing tier display

**Days 17-18: Audio/Visual Sync**

- [ ] Fine-tune timing to match voiceover exactly
- [ ] Adjust animation speeds for natural flow
- [ ] Add subtle background music (optional)

**Days 19-21: Export & Variations**

- [ ] Render full 90-second version
- [ ] Create 60-second cut (remove problem section)
- [ ] Create 30-second demo version
- [ ] Generate 15-second micro-version

## Technical Reminders

### Blender Workspace Setup

```
Video Sequencer (bottom): Timeline and strips
3D Viewport (top-left): Scene objects and Grease Pencil
Properties Panel (right): Settings and modifiers
Outliner (top-right): Object hierarchy
```

### Key Shortcuts

- **Spacebar**: Play/pause timeline
- **Tab**: Enter/exit Grease Pencil draw mode
- **G**: Grab/move objects
- **S**: Scale objects
- **R**: Rotate objects
- **Shift+A**: Add objects or strips

### Performance Tips

- **Proxy Settings**: Use 50% preview resolution during editing
- **RAM Preview**: Render 10-second sections for quick review
- **Save Often**: Blender can crash, save every 30 minutes
- **Backup Files**: Keep numbered versions (v1, v2, v3)

## Asset Organization in Blender

### File Structure

```
/blender/
├── cdviz-explainer.blend          # Main project file
├── assets/                        # Imported assets
│   ├── images/                    # Screenshots, diagrams
│   ├── logos/                     # CDviz, CDEvents logos
│   ├── icons/                     # Tool icons
│   └── audio/                     # Voiceover files
└── rendered/                      # Export destination
    ├── cdviz-explainer-90s.mp4
    ├── cdviz-explainer-60s.mp4
    ├── cdviz-explainer-30s.mp4
    └── cdviz-explainer-15s.mp4
```

### Color Palette (From CDviz Brand)

- **Primary Blue**: #3B82F6 (used for CDviz elements)
- **Accent Green**: #10B981 (used for positive actions)
- **Warning Orange**: #F59E0B (used for problems/scattered state)
- **Background**: #F8FAFC (clean backgrounds)
- **Text**: #1F2937 (readable text overlays)

## Success Milestones

### Week 1 Success Criteria

- [ ] Blender project opens without issues
- [ ] All assets imported and organized
- [ ] Voiceover audio synced to timeline
- [ ] First scene rough animation complete

### Week 2 Success Criteria

- [ ] All 5 scenes have basic animation
- [ ] Grease Pencil elements working properly
- [ ] Overall timing matches 90-second target
- [ ] Visual style consistent throughout

### Week 3 Success Criteria

- [ ] Full video renders without errors
- [ ] All 4 variations exported successfully
- [ ] Audio/visual sync perfect
- [ ] Ready for upload and distribution

## Getting Started

**Next Immediate Action**: Download Blender 4.0+ and spend 2-3 hours learning basic navigation using any "Blender for Beginners" YouTube tutorial. Focus on:

1. 3D viewport navigation (middle mouse, scroll)
2. Video Sequence Editor basics
3. Adding objects and keyframes
4. Basic Grease Pencil drawing

Once comfortable with navigation, return to this checklist and begin project setup.

The detailed workflow guide in `guidelines/blender-workflow.md` provides step-by-step instructions for each scene when you're ready for production.
