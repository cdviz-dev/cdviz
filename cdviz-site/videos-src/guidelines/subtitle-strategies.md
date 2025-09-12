# Subtitle Strategies for CDviz Videos

## Platform-Specific Subtitle Approaches

### TikTok/Instagram Reels Style (Burned-in Subtitles)

**Best for**: Social media, mobile-first content, maximum engagement

**Blender Implementation**:

```
Text Object Settings:
- Font: Bold sans-serif (Inter, Roboto)
- Size: 48-60px (readable on mobile)
- Color: White with black outline (2-3px stroke)
- Position: Lower third, centered
- Animation: Word-by-word appearance with slight scale effect
```

**Styling Guidelines**:

- **Background**: Semi-transparent rounded rectangle behind text
- **Colors**: White text, black outline, colored background for emphasis
- **Timing**: 0.5-1 second per word, synced to speech rhythm
- **Effects**: Slight bounce/scale on key words, color changes for emphasis

### YouTube Studio (Closed Captions)

**Best for**: Long-form content, accessibility compliance, multi-language support

**Advantages**:

- Auto-sync with audio
- Multiple language support
- SEO benefit (searchable text)
- User can customize appearance
- Easier to edit/update

**Export Process**:

1. Export clean video without burned-in subtitles
2. Generate SRT file from script
3. Upload to YouTube Studio
4. Review and adjust timing

## Hybrid Strategy Recommendation

### Phase 1: Blender Burned-in (Social Media Priority)

Create portrait videos with TikTok-style subtitles for maximum engagement:

**Text Animation in Blender**:

```python
# Blender Python script for word-by-word subtitles
import bpy

def create_word_animation(text, start_frame, words_per_second=2):
    words = text.split()
    frame_rate = bpy.context.scene.render.fps
    frames_per_word = int(frame_rate / words_per_second)

    for i, word in enumerate(words):
        # Create text object for each word
        bpy.ops.object.text_add()
        text_obj = bpy.context.active_object
        text_obj.data.body = word

        # Set keyframes for appearance
        text_obj.scale = (0, 0, 0)
        text_obj.keyframe_insert(data_path="scale", frame=start_frame + i * frames_per_word)

        text_obj.scale = (1.1, 1.1, 1.1)
        text_obj.keyframe_insert(data_path="scale", frame=start_frame + i * frames_per_word + 3)

        text_obj.scale = (1, 1, 1)
        text_obj.keyframe_insert(data_path="scale", frame=start_frame + i * frames_per_word + 6)
```

### Phase 2: Clean Export for YouTube Studio

Export the same content without burned-in subtitles for professional platforms.

## Format-Specific Specifications

### Portrait (9:16) - Social Media

```
Resolution: 1080x1920
Subtitle Area: Bottom 400px (safe zone)
Font Size: 54px minimum
Line Length: 25-30 characters max
Background: 80% opacity rounded rectangle
Text Color: #FFFFFF with #000000 2px outline
```

### Landscape (16:9) - Website/YouTube

```
Resolution: 1920x1080
Subtitle Area: Bottom 200px
Font Size: 36px minimum
Line Length: 45-50 characters max
Position: Center-aligned, lower third
Style: Clean, minimal background
```

## Blender Subtitle Workflow

### Setup

1. **Create Text Collection**: Organize all subtitle objects
2. **Master Timeline**: Mark subtitle timing points
3. **Style Template**: Create reusable text style
4. **Animation Library**: Save common text animations

### Animation Techniques

**Word Highlighting**:

- Change color on current word
- Slight scale increase (1.0 → 1.1 → 1.0)
- Subtle glow effect for emphasis

**Smooth Transitions**:

- Fade in/out between subtitle blocks
- Slide up for new lines
- TypeWriter effect for technical terms

**Emphasis Effects**:

- Color change for key terms ("CDviz", "CDEvents")
- Bold/italic variations
- Icon integration (→, ✓, ⚡) for actions

### Code Example - Auto-Subtitle Generation

```python
# Blender script to generate subtitles from SRT file
import bpy
import re

def parse_srt(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    pattern = r'(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\n(.+?)(?=\n\d+\n|\n*$)'
    matches = re.findall(pattern, content, re.DOTALL)

    return [(start, end, text.strip()) for _, start, end, text in matches]

def create_subtitle_objects(srt_data):
    for i, (start, end, text) in enumerate(srt_data):
        # Convert timestamp to frame number
        start_frame = timestamp_to_frame(start)
        end_frame = timestamp_to_frame(end)

        # Create text object
        bpy.ops.object.text_add(location=(0, 0, -2))
        subtitle = bpy.context.active_object
        subtitle.name = f"Subtitle_{i:03d}"
        subtitle.data.body = text

        # Style the text
        subtitle.data.font = bpy.data.fonts.load("//fonts/Inter-Bold.ttf")
        subtitle.data.size = 0.5

        # Animate visibility
        subtitle.hide_render = True
        subtitle.keyframe_insert(data_path="hide_render", frame=start_frame-1)
        subtitle.hide_render = False
        subtitle.keyframe_insert(data_path="hide_render", frame=start_frame)
        subtitle.hide_render = True
        subtitle.keyframe_insert(data_path="hide_render", frame=end_frame)
```

## Style Guide for CDviz Subtitles

### Color Palette

- **Primary Text**: #FFFFFF (White)
- **Outline**: #000000 (Black, 2-3px)
- **Emphasis**: #3B82F6 (CDviz Blue)
- **Success**: #10B981 (Green for positive actions)
- **Warning**: #F59E0B (Orange for problems)

### Typography

- **Font**: Inter Bold or Roboto Bold
- **Size**: 54px (portrait), 36px (landscape)
- **Line Height**: 1.2x font size
- **Letter Spacing**: -0.02em (slightly condensed)

### Animation Timing

- **Appearance**: 0.1s fade + 0.1s scale
- **Hold**: Match audio duration
- **Disappearance**: 0.1s fade out
- **Word Emphasis**: 0.3s color/scale change

## Production Recommendations

**For Social Media (Primary)**:

- Use Blender burned-in subtitles
- TikTok-style word emphasis
- High contrast colors
- Mobile-optimized sizing

**For Professional Platforms (Secondary)**:

- Export clean video
- Use YouTube Studio auto-captions
- Generate SRT files for other platforms
- Maintain accessibility standards

**Efficiency Tips**:

- Create Blender subtitle template
- Use Python scripts for batch processing
- Export both versions from same project
- Maintain subtitle timing database

This hybrid approach maximizes engagement on social platforms while maintaining professionalism for business contexts.
