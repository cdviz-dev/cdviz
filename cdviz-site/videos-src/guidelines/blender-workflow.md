# Blender Production Workflow for CDviz Videos

This guide provides a step-by-step workflow for creating professional marketing videos using Blender's Grease Pencil and Video Sequence Editor.

## Prerequisites

- **Blender 4.0+** (latest version recommended)
- **Basic Blender knowledge** (navigation, timeline, keyframes)
- **Project assets** organized in `blender/assets/` folder

## Project Setup

### 1. Initial Configuration

```
1. Open Blender → Delete default scene objects
2. Switch to "Video Editing" workspace
3. Set project settings:
   - Resolution: 1920x1080
   - Frame Rate: 30fps
   - Frame Range: 1-2700 (90 seconds at 30fps)
4. Save as "cdviz-explainer.blend"
```

### 2. Audio Import

```
1. Drag voiceover WAV file into Video Sequence Editor
2. Place on audio track at frame 1
3. Set volume levels (peak at -6dB for headroom)
4. Add music track on separate audio channel (if using)
```

## Scene-by-Scene Production

### Scene 1: Opening Hook (Frames 1-450)

**Objective**: Show problem - chaotic tools vs organized CDviz

**Blender Workflow**:

1. **Import tool icons** (PNG/SVG) as image strips
2. **Create chaotic animation**:
   - Add keyframes for random positions/rotations
   - Use "Random" modifier for organic movement
   - Duration: 10 seconds (300 frames)

3. **Transition to organized**:
   - Keyframe icons moving to organized positions
   - Add CDviz logo with scale animation (0→1)
   - Use "Ease In/Out" interpolation

**Grease Pencil Elements**:

- Draw connecting lines between tools
- Animate line drawing using "Build" modifier
- Color: Start red (chaos) → blue (organized)

### Scene 2: Problem Deep Dive (Frames 450-900)

**Objective**: Visualize disconnected tools and confusion

**Blender Workflow**:

1. **Tool separation animation**:
   - Move icons apart with "bounce" effect
   - Add question mark symbols between tools
   - Scale question marks with "elastic" animation

2. **Text overlay**:
   - Add "Fragmented Tools = Blind Spots" text object
   - Animate with fade-in + slight scale
   - Font: Match website typography

### Scene 3: Solution Introduction (Frames 900-1500)

**Objective**: Introduce CDEvents standard and CDviz

**Blender Workflow**:

1. **CDEvents logo entrance**:
   - Import CDEvents logo
   - Animate with dramatic scale + rotation
   - Add subtle glow effect (Shader Editor)

2. **Event flow visualization**:
   - Create particle system for "event packets"
   - Particles flow from tools to central hub
   - Use Grease Pencil to draw flow lines
   - Color: Consistent blue/green theme

3. **Standardization effect**:
   - Transform chaotic elements into organized grid
   - Use "Smooth" keyframe interpolation
   - Add "whoosh" sound effect timing markers

### Scene 4: Product Demo (Frames 1500-2250)

**Objective**: Show real CDviz dashboard functionality

**Blender Workflow**:

1. **Dashboard screenshots**:
   - Import high-res dashboard images
   - Add as image strips in sequence
   - Use "Cross" dissolve transitions

2. **Grease Pencil highlights**:
   - Draw highlight circles around key metrics
   - Animate circle drawing with "Build" modifier
   - Add arrow pointing to specific features
   - Use "Additive" blending for glow effect

3. **Data animation**:
   - Create fake "data loading" effect
   - Use moving gradient on dashboard elements
   - Animate charts "filling up" with masks

### Scene 5: Call to Action (Frames 2250-2700)

**Objective**: Drive traffic to cdviz.dev

**Blender Workflow**:

1. **Clean background transition**:
   - Fade to solid color background
   - Keep CDviz logo prominent

2. **Text animation sequence**:
   - "cdviz.dev" - Large, bold entrance
   - "Free Community Edition" - Fade in
   - "Enterprise & SaaS Available" - Final fade in
   - Use staggered timing for impact

3. **Button highlight**:
   - Add subtle pulsing glow to CTA area
   - Use "Ping Pong" animation loop

## Advanced Techniques

### Grease Pencil Best Practices

**Layer Organization**:

```
- Layer 1: Background elements
- Layer 2: Main illustrations
- Layer 3: Highlights and callouts
- Layer 4: Text overlays
```

**Animation Modifiers**:

- **Build**: For line drawing effects
- **Offset**: For wave/ripple effects
- **Noise**: For organic movement
- **Time Offset**: For sequence variations

**Stroke Properties**:

- **Thickness**: 8-12px for main lines, 4-6px for details
- **Opacity**: 80-90% for main elements, 60% for subtle guides
- **Colors**: Use website color palette consistently

### Video Sequence Editor Tips

**Track Organization**:

```
Track 8: Text overlays
Track 7: Grease Pencil scenes
Track 6: Logo/graphics
Track 5: Dashboard screenshots
Track 4: Background elements
Track 3: Sound effects
Track 2: Music
Track 1: Voiceover
```

**Transitions**:

- Use "Cross" for smooth dissolves
- "Add" for brightness-based transitions
- "Multiply" for darkening effects
- Keep transitions 10-15 frames (0.3-0.5 seconds)

## Export Settings

### Final Render Configuration

```
Output Properties:
- File Format: FFmpeg Video
- Container: MP4
- Video Codec: H.264
- Output Quality: High Quality
- Encoding Speed: Good (balanced)

Dimensions:
- Resolution: 1920x1080
- Frame Rate: 30fps
- Aspect Ratio: 1.000

Color Management:
- View Transform: Standard
- Look: None (for accurate colors)
```

### Multiple Versions Export

1. **Full 90-second**: Frames 1-2700
2. **60-second cut**: Frames 450-2250 (skip problem intro)
3. **30-second demo**: Frames 1500-2400 (demo + CTA only)
4. **15-second teaser**: Frames 1-450 + 2250-2700 (problem + CTA)

## Quality Control Checklist

### Technical Quality

- [ ] Audio levels consistent (-12dB to -6dB range)
- [ ] No frame drops or stuttering
- [ ] Text readable at 720p (mobile compatibility)
- [ ] Colors match brand guidelines
- [ ] All animations smooth (no jarring jumps)

### Content Accuracy

- [ ] CDEvents terminology correct
- [ ] DORA metrics accurately represented
- [ ] CDviz features shown are real/available
- [ ] Website URL prominently displayed
- [ ] Call-to-action clear and compelling

### Brand Consistency

- [ ] Logo usage follows brand guidelines
- [ ] Typography matches website fonts
- [ ] Color palette consistent throughout
- [ ] Professional tone maintained
- [ ] No conflicting visual messages

## Troubleshooting

### Common Issues

**Slow Playback**:

- Reduce preview resolution (50% or 25%)
- Use proxy files for large images
- Close unnecessary applications

**Grease Pencil Not Visible**:

- Check layer visibility (eye icon)
- Verify object is not behind camera
- Confirm material has correct blend mode

**Audio Sync Issues**:

- Lock audio track to prevent drift
- Use "Frame Dropping" playback method
- Render test sections frequently

**Export Quality Poor**:

- Increase bitrate in encoding settings
- Use "Lossless" for master copy
- Check source image resolution

## File Management

### Project Structure

```
cdviz-explainer.blend          # Main project file
cdviz-explainer-backup.blend   # Daily backup
assets/                        # Imported images/audio
  ├── images/
  ├── audio/
  └── logos/
rendered/                      # Export destination
  ├── full-90s.mp4
  ├── demo-60s.mp4
  ├── teaser-30s.mp4
  └── micro-15s.mp4
```

### Backup Strategy

- **Daily**: Save numbered backup (explainer-v001.blend)
- **Weekly**: Export project package with all assets
- **Milestone**: Archive completed versions separately

This workflow ensures professional quality output while maintaining efficiency for solo production.
