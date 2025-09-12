# Voiceover Recording Guide

**Script**: 90-Second CDviz Explainer
**Target**: 226 words at 150 WPM = 90 seconds
**Quality**: Professional but approachable, technical confidence

## Recording Setup

### Equipment (Budget-Friendly)

**Essential**:

- **USB Microphone**: Audio-Technica ATR2100x-USB (~$79) or Blue Yeti Nano (~$100)
- **Quiet Space**: Closet with clothes, small room with carpets/curtains
- **Pop Filter**: $10-15 foam windscreen or fabric pop filter
- **Headphones**: Any decent headphones for monitoring

**Free Software**:

- **Audacity** (Windows/Mac/Linux) - Free, excellent for voice recording
- **GarageBand** (Mac only) - Built-in, very user-friendly
- **Reaper** (60-day free trial) - Professional features

### Room Preparation

- [ ] **Minimize Echo**: Record in closet, use blankets, or mattress fort
- [ ] **Reduce Noise**: Turn off AC, fans, close windows, silence phone notifications
- [ ] **Test Recording**: 30-second test to check levels and room sound
- [ ] **Backup Plan**: Have secondary quiet location identified

## Recording Process

### Pre-Recording Checklist

- [ ] **Script Practice**: Read through 5+ times for natural flow
- [ ] **Timing Check**: Use stopwatch, aim for 88-92 seconds (allows editing buffer)
- [ ] **Voice Warm-up**: Hum, lip trills, tongue twisters for 5 minutes
- [ ] **Water Ready**: Room temperature water, avoid dairy/alcohol before recording

### Recording Settings

```
Sample Rate: 48kHz (professional video standard)
Bit Depth: 24-bit (captures full dynamic range)
Format: WAV (uncompressed for editing)
Input Level: -12dB to -6dB peaks (avoid clipping)
```

### Recording Technique

1. **Distance**: 6-8 inches from microphone
2. **Position**: Speak across microphone, not directly into it (reduces plosives)
3. **Posture**: Stand or sit straight, good breath support
4. **Pace**: Slightly slower than normal conversation (150 WPM)
5. **Energy**: Confident and helpful, not salesy

## Script Performance Notes

### Section-by-Section Direction

#### Opening Hook (0-15 seconds)

_"Your team deploys constantly across dev, staging, and production. But do you actually know what version is running where? And when performance drops, can you correlate it with recent deployments?"_

**Tone**: Conversational questions, slight emphasis on "actually know" and "correlate"
**Pacing**: Natural questioning rhythm, pause after "where?"

#### Problem Deep Dive (15-30 seconds)

_"The challenge? Deployment history is scattered across Jenkins builds, GitLab releases, Kubernetes events, and monitoring dashboards. You can't see the complete timeline or easily correlate runtime issues with specific deployments. Your SDLC visibility is fragmented."_

**Tone**: Understanding the frustration, building the problem
**Emphasis**: "scattered," "complete timeline," "fragmented"
**Pacing**: Steady build, slight pause after "dashboards"

#### Solution Introduction (30-50 seconds)

_"Enter CDEvents - the Cloud Native standard for delivery events. CDviz collects these standardized events from all your tools and creates a unified deployment timeline. Now you have complete visibility into what's deployed where, when, and by whom."_

**Tone**: Introducing the solution with confidence
**Emphasis**: "CDEvents," "unified deployment timeline," "complete visibility"
**Pacing**: Clear pronunciation of "CDEvents," smooth flow

#### Product Demo (50-75 seconds)

_"See every service deployment across environments in one timeline. Correlate performance metrics with specific versions. Track your DORA metrics automatically. And when tests pass, trigger the next deployment. CDviz gives you the visibility to optimize your entire software delivery pipeline."_

**Tone**: Demonstrating capabilities, building excitement
**Emphasis**: "one timeline," "automatically," "optimize your entire"
**Pacing**: Energetic but clear, pause after "automatically"

#### Call to Action (75-90 seconds)

_"CDviz is open source - start with the free community edition, upgrade when you need enterprise features. Get complete SDLC visibility today. Visit cdviz.dev and take control of your deployments."_

**Tone**: Helpful guidance, clear next steps
**Emphasis**: "open source," "free," "cdviz.dev," "take control"
**Pacing**: Confident close, clear pronunciation of website

## Recording Session Workflow

### Session 1: Multiple Takes

1. **Take 1**: Focus on timing and overall flow
2. **Take 2**: Focus on energy and enthusiasm
3. **Take 3**: Focus on technical clarity
4. **Take 4-5**: Combine best elements

**Between takes**: Sip water, do lip trills, stay relaxed

### Session 2: Section Re-records (if needed)

- Record individual sections that need improvement
- Maintain consistent tone and energy
- Match overall recording style

### Post-Recording Review

- [ ] **Timing**: 88-92 seconds total
- [ ] **Audio Quality**: No clipping, consistent levels
- [ ] **Clarity**: All technical terms clearly pronounced
- [ ] **Energy**: Engaging throughout, no energy drops
- [ ] **Flow**: Natural transitions between sections

## Audio Editing (Basic Cleanup)

### Essential Edits in Audacity

1. **Noise Reduction**: Remove background hum/noise
2. **Normalize**: Consistent volume levels
3. **Compress**: Even out loud/quiet parts slightly
4. **EQ**: Boost clarity in 2-4kHz range if needed
5. **Export**: WAV 48kHz for Blender import

### File Naming Convention

```
cdviz-explainer-voiceover-raw-v1.wav         # Original recording
cdviz-explainer-voiceover-edited-v1.wav      # Post-processing
cdviz-explainer-voiceover-final.wav          # Final version for Blender
```

## Quality Checklist

### Technical Quality

- [ ] **No Clipping**: Audio levels never hit 0dB
- [ ] **Consistent Volume**: No dramatic volume changes
- [ ] **Clean Audio**: Minimal background noise
- [ ] **Clear Pronunciation**: All words easily understood
- [ ] **Proper Format**: WAV 48kHz 24-bit for Blender

### Performance Quality

- [ ] **Natural Pace**: 150 WPM, comfortable to follow
- [ ] **Confident Tone**: Knowledgeable but approachable
- [ ] **Good Energy**: Engaging throughout, no flat sections
- [ ] **Clear Emphasis**: Key terms properly highlighted
- [ ] **Smooth Flow**: Natural transitions between sections

### Content Accuracy

- [ ] **Script Adherence**: No ad-libs that change meaning
- [ ] **Technical Terms**: "CDEvents," "DORA metrics" pronounced correctly
- [ ] **Timing Match**: Fits planned animation timing
- [ ] **Website URL**: "cdviz.dev" clearly stated
- [ ] **Call-to-Action**: Compelling and clear

## Backup Plan

If initial recording isn't working:

1. **Try Different Location**: Bathroom, car, different room
2. **Adjust Technique**: Closer/farther from mic, different angle
3. **Break Into Sections**: Record each section separately, edit together
4. **Professional Option**: Local recording studio (~$100-200 for session)

## Next Step After Recording

Once you have a quality voiceover file:

1. **Import to Blender**: Add to audio track in Video Sequence Editor
2. **Sync to Timeline**: Align with planned animation timing
3. **Mark Sections**: Add markers for each script section transition
4. **Begin Animation**: Use audio timing to guide visual pacing

The voiceover serves as the foundation for all animation timing, so getting this right is crucial for the overall video quality.
