import { makeScene2D } from "@motion-canvas/2d";
import {
  View2D,
  Img,
  Txt,
  Layout,
  Circle,
  Line,
  Rect,
  Node,
} from "@motion-canvas/2d/lib/components";
import {
  all,
  chain,
  createRef,
  delay,
  easeInOutCubic,
  easeOutCubic,
  easeInCubic,
  fadeTransition,
  loop,
  sequence,
  tween,
  waitFor,
  createSignal,
} from "@motion-canvas/core";

export default makeScene2D(function* (view) {
  // CDviz Dark Theme - Monochrome Black & Orange
  const colors = {
    primary: "#F59E0B", // CDviz authentic orange (from CSS)
    secondary: "#FB923C", // Lighter orange variation
    danger: "#EF4444", // Red for problems
    warning: "#FCD34D", // Warm orange for highlights
    background: "#000000", // Pure black for maximum contrast
    text: "#FFFFFF", // Pure white text
    textMuted: "#D1D5DB", // Light gray for secondary text
    textDark: "#6B7280", // Medium gray for subtle elements
  };

  // Excalidraw-Style Typography Settings
  const typography = {
    // Authentic Excalidraw hand-drawn style
    excalidraw: '"Excalifont", "Inter", system-ui, sans-serif', // Primary Excalidraw font

    // Professional fonts (only for technical elements)
    code: '"JetBrains Mono", "Fira Code", Consolas, monospace', // Technical (cdviz.dev)
    clean: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', // Clean fallback

    // Since Excalifont is one weight, we simulate emphasis with size and spacing
    excalidrawNormal: 400, // Normal weight
    excalidrawBold: 400, // Same weight, but larger size for "bold" effect

    letterSpacing: {
      tight: 0,
      normal: 1, // Natural spacing for hand-drawn
      wide: 2, // Slightly wider
      wider: 3, // More spaced for emphasis
    },
    lineHeight: {
      tight: 1.2, // Compact for diagrams
      normal: 1.4, // Natural for Excalidraw
      relaxed: 1.6, // Relaxed for notes
    },
  };

  // Optimized Animation Curves - Simpler calculations for better performance
  const easings = {
    // Simplified curves for better performance
    smooth: easeInOutCubic, // Use built-in cubic
    bounce: easeOutCubic, // Simplified bounce
    elastic: easeInOutCubic, // Simplified elastic (was too complex)

    // Standard Motion Canvas easings for best performance
    material: easeInOutCubic, // Material Design standard
    organic: easeInOutCubic, // Simplified organic
    sharp: easeInCubic, // Sharp entry
    gentle: easeOutCubic, // Gentle exit
  };

  // Set background to pure black
  view.fill("#000000");

  // Refs for all major elements
  const titleRef = createRef<Layout>();
  const subtitleRef = createRef<Layout>();
  const toolIconsRef = createRef<Layout>();
  const problemTextRef = createRef<Layout>();
  const solutionLayoutRef = createRef<Layout>();
  const dashboardRef = createRef<Img>();
  const ctaRef = createRef<Layout>();

  // === SCENE 1: Opening Hook (0-15 seconds) ===

  // Main title that will animate in (positioned for vertical layout)
  view.add(
    <Layout ref={titleRef} x={0} y={-650} opacity={0}>
      <Txt
        fontSize={100}
        fontWeight={typography.excalidrawNormal}
        fill={colors.primary}
        fontFamily={typography.excalidraw}
        textAlign="center"
        letterSpacing={typography.letterSpacing.normal}
        y={-50}
        shadowColor="rgba(245, 158, 11, 0.3)"
        shadowBlur={15}
        shadowOffset={[0, 3]}
      >
        Know What's
      </Txt>
      <Txt
        fontSize={100}
        fontWeight={typography.excalidrawNormal}
        fill={colors.primary}
        fontFamily={typography.excalidraw}
        textAlign="center"
        letterSpacing={typography.letterSpacing.normal}
        y={50}
        shadowColor="rgba(245, 158, 11, 0.3)"
        shadowBlur={15}
        shadowOffset={[0, 3]}
      >
        Deployed When
      </Txt>
    </Layout>,
  );

  // Subtitle
  view.add(
    <Layout ref={subtitleRef} x={0} y={-470} opacity={0}>
      <Txt
        fontSize={44}
        fontWeight={typography.excalidrawNormal}
        fill={colors.textMuted}
        fontFamily={typography.excalidraw}
        textAlign="center"
        letterSpacing={typography.letterSpacing.normal}
        y={-25}
      >
        Deployment visibility is
      </Txt>
      <Txt
        fontSize={44}
        fontWeight={typography.excalidrawNormal}
        fill={colors.textMuted}
        fontFamily={typography.excalidraw}
        textAlign="center"
        letterSpacing={typography.letterSpacing.normal}
        y={25}
      >
        scattered across tools
      </Txt>
    </Layout>,
  );

  // Tool icons arranged vertically for portrait layout - much larger, no backgrounds
  view.add(
    <Layout ref={toolIconsRef} x={0} y={-100} opacity={0}>
      <Img
        src="/assets/icons_48x48_monochrome/devicon-plain--jenkins.svg"
        size={120}
        position={[-200, -150]}
        rotation={-15}
      />
      <Img
        src="/assets/icons_48x48_monochrome/mdi--docker.svg"
        size={120}
        position={[200, -80]}
        rotation={25}
      />
      <Img
        src="/assets/icons_48x48_monochrome/mdi--monitor-dashboard.svg"
        size={120}
        position={[0, 0]}
        rotation={-30}
      />
      <Img
        src="/assets/icons_48x48_monochrome/mdi--graph-timeline-variant.svg"
        size={120}
        position={[-180, 120]}
        rotation={20}
      />
      <Img
        src="/assets/icons_48x48_monochrome/mdi--database.svg"
        size={120}
        position={[180, 200]}
        rotation={-10}
      />
    </Layout>,
  );

  // Scene 1 Animation: Opening Hook (0-15s) - Professional staggered entrance
  yield* sequence(
    0.15,
    // Title appears with smooth scale and fade
    all(
      titleRef().opacity(1, 1.2, easings.organic),
      titleRef().scale(0.95, 0).to(1, 1.2, easings.bounce),
    ),
    // Subtitle flows in smoothly
    all(subtitleRef().opacity(1, 0.9, easings.gentle), subtitleRef().y(-430, 0.9, easings.smooth)),
    // Icons appear with staggered timing
    toolIconsRef().opacity(1, 0.8, easings.material),
  );

  // Simplified chaotic icon movement - less intensive
  yield* all(
    ...toolIconsRef()
      .children()
      .map((icon, i) =>
        all(
          icon.rotation(Math.sin(i) * 15, 3.6, easings.gentle),
          icon.scale(0.95 + Math.sin(i * 0.5) * 0.05, 3.6, easings.gentle),
        ),
      ),
  );

  yield* waitFor(2); // Let opening hook sink in

  // === SCENE 2: Problem Deep Dive (15-30 seconds) ===

  // Smooth transition to problem scene
  yield* all(
    titleRef().opacity(0, 1.0, easings.smooth),
    titleRef().scale(0.9, 1.0, easings.gentle),
    subtitleRef().opacity(0, 0.9, easings.smooth),
    toolIconsRef().opacity(0.3, 0.6, easings.material), // Keep icons but dimmed
  );

  // New problem statement
  view.add(
    <Layout ref={problemTextRef} x={0} y={-700} opacity={0}>
      <Txt
        fontSize={80}
        fontWeight={typography.excalidrawNormal}
        fill={colors.danger}
        fontFamily={typography.excalidraw}
        textAlign="center"
        letterSpacing={typography.letterSpacing.normal}
        y={-80}
        shadowColor="rgba(239, 68, 68, 0.4)"
        shadowBlur={12}
        shadowOffset={[0, 2]}
      >
        Scattered History
      </Txt>
      <Txt
        fontSize={80}
        fontWeight={typography.excalidrawNormal}
        fill={colors.danger}
        fontFamily={typography.excalidraw}
        textAlign="center"
        letterSpacing={typography.letterSpacing.normal}
        y={0}
        shadowColor="rgba(239, 68, 68, 0.4)"
        shadowBlur={12}
        shadowOffset={[0, 2]}
      >
        =
      </Txt>
      <Txt
        fontSize={80}
        fontWeight={typography.excalidrawNormal}
        fill={colors.danger}
        fontFamily={typography.excalidraw}
        textAlign="center"
        letterSpacing={typography.letterSpacing.normal}
        y={80}
        shadowColor="rgba(239, 68, 68, 0.4)"
        shadowBlur={12}
        shadowOffset={[0, 2]}
      >
        Lost Context
      </Txt>
    </Layout>,
  );

  // Problem statement appears with dramatic entrance
  yield* all(
    problemTextRef().opacity(1, 1.4, easings.organic),
    problemTextRef().scale(0.8, 0).to(1, 1.4, easings.bounce),
    problemTextRef().y(-680, 1.4, easings.smooth),
  );

  // Add connection lines showing fragmentation - draw BEFORE icons (behind them)
  const connectionLines: Line[] = [];

  // Define icon positions manually (same as in toolIconsRef layout)
  const iconPositions = [
    [-200, -150], // Jenkins
    [200, -80], // Docker
    [0, 0], // Dashboard
    [-180, 120], // Timeline
    [180, 200], // Database
  ];

  for (let i = 0; i < iconPositions.length; i++) {
    const line = createRef<Line>();
    const startPos = iconPositions[i];
    const endPos = iconPositions[(i + 1) % iconPositions.length];

    view.add(
      <Line
        ref={line}
        lineWidth={6}
        stroke={colors.danger}
        opacity={0}
        points={[
          [startPos[0], startPos[1] - 100], // Adjust for toolIconsRef y offset
          [endPos[0], endPos[1] - 100],
        ]}
        lineDash={[15, 15]}
        zIndex={-1} // Behind icons
      />,
    );
    connectionLines.push(line());
  }

  // Draw fragmented connection lines with smooth progression
  yield* sequence(
    0.2,
    ...connectionLines.map((line, i) =>
      all(
        line.opacity(0.8, 0.6, easings.gentle),
        line.end(1, 1.2, easings.organic),
        line.lineWidth(8, 0.8, easings.bounce).to(6, 0.4, easings.smooth),
      ),
    ),
  );

  // Add question marks to show uncertainty - better positioned
  const questionMarks: Txt[] = [];
  const questionPositions = [
    [-100, -200],
    [150, -50],
    [-50, 100],
  ];

  questionPositions.forEach((pos, i) => {
    const questionMark = createRef<Txt>();
    view.add(
      <Txt
        ref={questionMark}
        text="?"
        fontSize={68}
        fontWeight={typography.excalidrawNormal}
        fill={colors.primary}
        fontFamily={typography.excalidraw}
        position={[pos[0], pos[1] - 100]} // Adjust for scene offset
        opacity={0}
        zIndex={1} // Above lines, below icons
      />,
    );
    questionMarks.push(questionMark());
  });

  // Question marks appear with bouncy, organic timing
  yield* sequence(
    0.3,
    ...questionMarks.map((mark, i) =>
      all(
        mark.opacity(1, 0.8, easings.bounce),
        mark.scale(0.3, 0).to(1, 0.8, easings.elastic),
        mark.rotation(-10 + Math.random() * 20, 0.8, easings.gentle),
      ),
    ),
  );

  yield* waitFor(3); // Let problem explanation complete

  // === SCENE 3: Solution Introduction (30-50 seconds) ===

  // Smooth transition away from problem scene with professional timing
  yield* all(
    problemTextRef().opacity(0, 1.2, easings.smooth),
    problemTextRef().scale(0.85, 1.2, easings.gentle),
    toolIconsRef().opacity(0, 1.0, easings.material),
    toolIconsRef().scale(0.9, 1.0, easings.smooth),
    ...connectionLines.map((line) =>
      all(line.opacity(0, 0.9, easings.gentle), line.lineWidth(2, 0.9, easings.smooth)),
    ),
    ...questionMarks.map((mark) =>
      all(mark.opacity(0, 0.8, easings.smooth), mark.scale(0.7, 0.8, easings.gentle)),
    ),
  );

  // Solution layout - stacked vertically for portrait with larger elements
  view.add(
    <Layout ref={solutionLayoutRef} opacity={0} scale={0.8}>
      <Img src="/assets/logos/cdevents.svg" size={200} y={-600} />
      <Txt
        fontSize={52}
        fontWeight={typography.excalidrawNormal}
        fill={colors.text}
        fontFamily={typography.excalidraw}
        textAlign="center"
        letterSpacing={typography.letterSpacing.normal}
        y={-350}
      >
        CDEvents Standard
      </Txt>
      <Txt
        fontSize={70}
        fontWeight={typography.excalidrawNormal}
        fill={colors.primary}
        fontFamily={typography.excalidraw}
        textAlign="center"
        letterSpacing={typography.letterSpacing.normal}
        lineHeight={typography.lineHeight.tight}
        y={-100}
        shadowColor="rgba(245, 158, 11, 0.3)"
        shadowBlur={12}
      >
        Unified SDLC Timeline
      </Txt>
      <Img src="/assets/logos/cdviz.svg" size={180} y={250} />
    </Layout>,
  );

  // Professional solution introduction with staggered reveal
  yield* sequence(
    0.3,
    all(
      solutionLayoutRef().opacity(1, 1.4, easings.organic),
      solutionLayoutRef().scale(1, 1.4, easings.bounce),
    ),
  );

  // Animate standardized event flow with particles (vertical flow) - larger particles
  const eventParticles: Circle[] = [];
  for (let i = 0; i < 10; i++) {
    const particle = createRef<Circle>();
    view.add(
      <Circle
        ref={particle}
        size={32}
        fill={colors.primary}
        x={0}
        y={500 + i * 80}
        opacity={0}
        scale={0.5}
      />,
    );
    eventParticles.push(particle());
  }

  // Optimized particle flow - removed expensive glow effect
  yield* sequence(
    0.15,
    ...eventParticles.map((particle, i) =>
      all(
        particle.opacity(1, 0.4, easings.gentle),
        particle.scale(1, 0.4, easings.material), // Use simpler easing
        particle.y(1000 - i * 80, 2.5, easings.material), // Shorter duration, simpler easing
      ),
    ),
  );

  yield* waitFor(3.5); // Let solution explanation complete with better pacing

  // === SCENE 4: Product Demo (50-75 seconds) ===

  // Professional transition to demo scene with elegant timing
  yield* all(
    solutionLayoutRef().opacity(0, 1.3, easings.smooth),
    solutionLayoutRef().scale(0.85, 1.3, easings.gentle),
    ...eventParticles.map((particle) =>
      all(particle.opacity(0, 0.7, easings.smooth), particle.scale(0.3, 0.7, easings.gentle)),
    ),
  );

  // Dashboard screenshot (larger for vertical viewing)
  view.add(
    <Img
      ref={dashboardRef}
      src="/assets/screenshots/grafana_dashboard_pipeline_executions-20250606_2103.png"
      scale={0.6}
      y={-400}
      opacity={0}
      radius={16}
      shadowColor="rgba(0,0,0,0.3)"
      shadowBlur={20}
    />,
  );

  // Dashboard appears with professional reveal animation
  yield* all(
    dashboardRef().opacity(1, 1.6, easings.organic),
    dashboardRef().scale(0.5, 0).to(0.6, 1.6, easings.bounce),
    dashboardRef().y(-420, 0).to(-400, 1.6, easings.smooth),
  );

  // Feature highlights with proper icons - create layout with icon + text
  const featureLayouts: Layout[] = [];
  const features = [
    {
      icon: "/assets/icons_48x48_monochrome/mdi--graph-timeline-variant.svg",
      text: "Timeline View",
    },
    { icon: "/assets/icons_48x48_monochrome/mdi--graph-line.svg", text: "Metrics & Analytics" },
    { icon: "/assets/icons_48x48_monochrome/mdi--graph-outline.svg", text: "DORA Metrics" },
    { icon: "/assets/icons_48x48_monochrome/mdi--webhook.svg", text: "Event Automation" },
  ];

  features.forEach((feature, i) => {
    const featureLayout = createRef<Layout>();

    view.add(
      <Layout ref={featureLayout} x={0} y={200 + i * 100} opacity={0} scale={0.8}>
        <Txt
          text={feature.text}
          fontSize={44}
          fontWeight={typography.excalidrawNormal}
          fill={colors.primary}
          fontFamily={typography.excalidraw}
          letterSpacing={typography.letterSpacing.normal}
          textAlign="center"
          width={900}
          x={0}
          y={-20}
        />
        <Img src={feature.icon} size={32} x={0} y={25} />
      </Layout>,
    );

    featureLayouts.push(featureLayout());
  });

  // Professional staggered feature reveal with organic timing
  yield* sequence(
    0.4,
    ...featureLayouts.map((layout, i) =>
      all(
        layout.opacity(1, 0.9, easings.organic),
        layout.scale(1, 0.9, easings.bounce),
        layout
          .x(-20 + Math.sin(i * 0.5) * 10, 0)
          .to(0, 0.9, easings.smooth), // Subtle entry motion
      ),
    ),
  );

  // Simplified floating animation - less intensive
  yield* all(
    ...featureLayouts.map((layout, i) =>
      all(
        layout
          .y(layout.y() + (i % 2 === 0 ? 5 : -5), 3.0, easings.gentle)
          .to(layout.y(), 3.0, easings.gentle),
      ),
    ),
  );

  yield* waitFor(2.5); // Show demo features with better pacing

  // === SCENE 5: Call to Action (75-90 seconds) ===

  // Professional final transition with elegant fade timing
  yield* all(
    dashboardRef().opacity(0, 1.4, easings.smooth),
    dashboardRef().scale(0.5, 1.4, easings.gentle),
    ...featureLayouts.map((layout, i) =>
      all(
        layout.opacity(0, 1.0, easings.smooth),
        layout.scale(0.8, 1.0, easings.gentle),
        layout.y(layout.y() + 50, 1.0, easings.smooth), // Drift down as they fade
      ),
    ),
  );

  // CTA Layout - much larger for vertical mobile viewing
  view.add(
    <Layout ref={ctaRef} opacity={0} scale={0.85}>
      <Txt
        text="cdviz.dev"
        fontSize={98}
        fontWeight={700}
        fill={colors.primary}
        fontFamily={typography.code}
        letterSpacing={typography.letterSpacing.normal}
        y={-500}
        shadowColor="rgba(245, 158, 11, 0.4)"
        shadowBlur={20}
      />
      <Txt
        fontSize={60}
        fontWeight={typography.excalidrawNormal}
        fill={colors.text}
        fontFamily={typography.excalidraw}
        textAlign="center"
        letterSpacing={typography.letterSpacing.normal}
        y={-250}
      >
        Complete SDLC Visibility
      </Txt>
      <Txt
        text="Open Source • Enterprise Ready"
        fontSize={36}
        fontWeight={typography.excalidrawNormal}
        fill={colors.textMuted}
        fontFamily={typography.excalidraw}
        textAlign="center"
        letterSpacing={typography.letterSpacing.normal}
        y={50}
      />
    </Layout>,
  );

  // Professional CTA entrance with dramatic impact
  yield* all(ctaRef().opacity(1, 1.8, easings.organic), ctaRef().scale(1, 1.8, easings.bounce));

  // Simplified breathing effect - single cycle, less intensive
  const mainText = ctaRef().children()[0]; // cdviz.dev text
  yield* all(mainText.scale(1.015, 2.0, easings.gentle).to(1, 2.0, easings.gentle));

  // Final elegant fade to black
  yield* waitFor(1.5); // Let CTA settle

  yield* all(
    ctaRef().opacity(0.8, 2.0, easings.smooth),
    view.opacity(0.95, 2.0, easings.gentle), // Subtle fade to suggest ending
  );

  yield* waitFor(0.5); // Final moment
});
