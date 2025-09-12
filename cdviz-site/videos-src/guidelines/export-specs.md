# Video Export Specifications & Guidelines

Technical specifications for exporting CDviz marketing videos across different platforms and use cases.

## Universal Standards

### Video Quality

- **Resolution**: 1080x1920 (Portrait 9:16) primary, 1920x1080 (Landscape 16:9) secondary
- **Frame Rate**: 30fps (smooth motion, universally supported)
- **Bitrate**: 8-12 Mbps for marketing videos (balance quality/file size)
- **Color Space**: sRGB (web standard, consistent across devices)
- **Aspect Ratio**: 9:16 (Portrait) for social/mobile, 16:9 (Landscape) for website/desktop

### Audio Quality

- **Sample Rate**: 48kHz (professional standard)
- **Bit Depth**: 16-bit minimum, 24-bit preferred
- **Levels**: -12dB to -6dB peaks (avoid clipping, room for mastering)
- **Format**: WAV for production, AAC for final export
- **Stereo**: Always export stereo even if mono source

## Platform-Specific Export Settings

### YouTube (Primary Distribution)

**Video**:

```
Format: MP4 (H.264)
Resolution: 1920x1080
Frame Rate: 30fps
Bitrate: 12 Mbps (VBR, 2-pass)
Profile: High
Keyframe: Every 2 seconds
```

**Audio**:

```
Codec: AAC
Sample Rate: 48kHz
Bitrate: 192 kbps
Channels: Stereo
```

**File Naming**: `CDviz_[Topic]_[YYYYMMDD]_YouTube.mp4`
**Example**: `CDviz_ExplainerVideo_20250115_YouTube.mp4`

### Website Embedding

**Hero Section (Autoplay)**:

```
Format: MP4 (H.264)
Resolution: 1920x1080
Frame Rate: 30fps
Bitrate: 6 Mbps (lower for fast loading)
Profile: Main (wider compatibility)
Audio: Muted for autoplay compliance
```

**Documentation/Feature Pages**:

```
Format: MP4 (H.264) + WebM fallback
Resolution: 1280x720 (faster loading)
Frame Rate: 30fps
Bitrate: 4 Mbps
Audio: 128 kbps AAC
```

**File Naming**: `CDviz_[Topic]_[Version]_Web.mp4`

### Social Media Platforms

#### LinkedIn (Professional Network)

```
Format: MP4 (H.264)
Resolution: 1920x1080 (16:9) or 1080x1080 (1:1)
Duration: 30-90 seconds optimal
Frame Rate: 30fps
Bitrate: 8 Mbps
Audio: Always include (many watch with sound)
Captions: Burned-in subtitles recommended
```

#### Twitter/X (Micro-Content)

```
Format: MP4 (H.264)
Resolution: 1280x720 (file size limitations)
Duration: 15-30 seconds
Frame Rate: 30fps
Bitrate: 4 Mbps
File Size: <50MB (platform limit)
```

#### Reddit (Community Sharing)

```
Format: MP4 (H.264)
Resolution: 1920x1080
Duration: 60-120 seconds
Frame Rate: 30fps
Bitrate: 6 Mbps
Audio: Optional (many browse silently)
Captions: Essential for accessibility
```

## Blender Export Configuration

### Project Settings

```
Blender Version: 4.0+
Workspace: Video Editing
Frame Rate: 30fps
Resolution: 1920x1080
Color Management: sRGB
```

### Output Properties

```
File Format: FFmpeg Video
Container: MPEG-4
Video Codec: H.264
Output Quality: High Quality
Encoding Speed: Good (balanced speed/quality)
```

### Advanced Settings

```
Rate Control: Average Bitrate
Bitrate: 12000 (12 Mbps)
Buffer Size: 1835 (1.835 MB)
Mux Rate: 10080000
Mux Packet Size: 2048
```

### Audio Settings in Blender

```
Audio Codec: AAC
Audio Bitrate: 192 kbps
Audio Sample Rate: 48000 Hz
Audio Channels: 2 (Stereo)
```

## Export Workflow Checklist

### Pre-Export Review

- [ ] **Timeline Review**: Verify all elements visible and properly timed
- [ ] **Audio Check**: Levels between -12dB and -6dB, no clipping
- [ ] **Text Legibility**: All text readable at 720p resolution
- [ ] **Brand Consistency**: Colors match website, logos properly placed
- [ ] **Call-to-Action**: Website URL clearly visible and prominently placed

### Export Process

1. **Set Frame Range**: Ensure exact start/end frames
2. **Configure Output Path**: Organized folder structure
3. **Preview Render**: 10-second test section first
4. **Full Render**: Monitor for errors or artifacts
5. **Quality Check**: Review full video before upload

### Post-Export Validation

- [ ] **File Size**: Appropriate for intended platform
- [ ] **Visual Quality**: No compression artifacts or color shifts
- [ ] **Audio Sync**: Perfect lip-sync if applicable, music properly timed
- [ ] **Metadata**: Title, description, tags embedded if supported
- [ ] **Accessibility**: Captions available (SRT file generated)

## Version Control & File Management

### Master Files

```
Project File: cdviz-explainer-master.blend
Assets Folder: /assets/ (all source materials)
Renders Folder: /rendered/ (all export versions)
Archive Folder: /archive/ (completed versions)
```

### Naming Convention

```
Pattern: CDviz_[VideoType]_[Topic]_[Platform]_[Version]_[Date]

Examples:
- CDviz_Explainer_90sec_YouTube_v1_20250115.mp4
- CDviz_Demo_DORAsMetrics_Web_v2_20250122.mp4
- CDviz_Tutorial_Jenkins_LinkedIn_v1_20250130.mp4
```

### Backup Strategy

- **Daily**: Project files backed up during production
- **Weekly**: Export all video versions to external storage
- **Monthly**: Archive completed projects with all assets
- **Cloud**: Master copies in cloud storage (Google Drive, Dropbox)

## Quality Assurance Standards

### Technical Quality Thresholds

- **Resolution**: Minimum 1080p for marketing content
- **Bitrate**: No lower than 4 Mbps for any platform
- **Audio**: No background noise above -60dB
- **Color**: Consistent color grading across all versions
- **Compression**: No visible artifacts in motion sequences

### Content Quality Standards

- **Brand Compliance**: Logo placement, color usage, typography
- **Message Clarity**: Core value proposition clearly communicated
- **Technical Accuracy**: All CDviz/CDEvents information correct
- **Call-to-Action**: Clear next step for viewers
- **Professional Appearance**: No amateur visual elements

### Platform Optimization

- **YouTube**: Optimized for search discovery and watch time
- **Website**: Fast loading, mobile-responsive, autoplay-ready
- **Social Media**: Engaging thumbnails, platform-specific formats
- **Documentation**: Clear instructional value, easy to follow

## Accessibility Considerations

### Subtitle Requirements

- **Format**: SRT files for all videos
- **Timing**: Precise synchronization with audio
- **Readability**: High contrast, appropriate font size
- **Language**: English primary, consider translations for major markets

### Visual Accessibility

- **Color Contrast**: WCAG 2.1 AA compliance for text overlays
- **Font Size**: Readable on mobile devices (minimum 24px equivalent)
- **Motion**: No rapidly flashing elements (seizure prevention)
- **Audio Description**: For complex visual content, consider narrating actions

### Technical Accessibility

- **Multiple Formats**: MP4 + WebM for broader compatibility
- **Captions**: Both closed captions and burned-in options
- **Transcripts**: Full text versions available on website
- **Progressive Loading**: Video starts quickly, quality improves progressively

This comprehensive export specification ensures consistent, high-quality video output across all marketing channels while maintaining technical excellence and accessibility standards.
