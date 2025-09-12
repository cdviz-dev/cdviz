import {makeScene2D} from '@motion-canvas/2d';
import {
  View2D,
  Img,
  Txt,
  Layout,
  Circle,
  Line,
  Rect,
  Node,
} from '@motion-canvas/2d/lib/components';
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
} from '@motion-canvas/core';

export default makeScene2D(function* (view) {
  // CDviz Dark Theme - Monochrome Black & Orange
  const colors = {
    primary: '#F59E0B',      // CDviz authentic orange (from CSS)
    secondary: '#FB923C',    // Lighter orange variation
    danger: '#EF4444',       // Red for problems
    warning: '#FCD34D',      // Warm orange for highlights
    background: '#000000',   // Pure black for maximum contrast
    text: '#FFFFFF',         // Pure white text
    textMuted: '#D1D5DB',    // Light gray for secondary text
    textDark: '#6B7280',     // Medium gray for subtle elements
  };

  // Set background to pure black
  view.fill('#000000');

  // Refs for all major elements
  const titleRef = createRef<Txt>();
  const subtitleRef = createRef<Txt>();
  const toolIconsRef = createRef<Layout>();
  const problemTextRef = createRef<Txt>();
  const solutionLayoutRef = createRef<Layout>();
  const dashboardRef = createRef<Img>();
  const ctaRef = createRef<Layout>();

  // === SCENE 1: Opening Hook (0-15 seconds) ===
  
  // Main title that will animate in (positioned for vertical layout)
  view.add(
    <Txt
      ref={titleRef}
      fontSize={92}
      fontWeight={700}
      fill={colors.primary}
      fontFamily="Inter, sans-serif"
      textAlign="center"
      y={-650}
      opacity={0}
    >
      Know What's{'\n'}Deployed When
    </Txt>
  );

  // Subtitle
  view.add(
    <Txt
      ref={subtitleRef}
      fontSize={48}
      fontWeight={500}
      fill={colors.textMuted}
      fontFamily="Inter, sans-serif"
      textAlign="center"
      y={-450}
      opacity={0}
    >
      Deployment visibility is{'\n'}scattered across tools
    </Txt>
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
    </Layout>
  );

  // Scene 1 Animation: Opening Hook (0-15s)
  yield* sequence(
    0.2,
    titleRef().opacity(1, 1.0, easeOutCubic),
    subtitleRef().opacity(1, 0.8, easeOutCubic),
    toolIconsRef().opacity(1, 0.6, easeOutCubic),
  );

  // Chaotic icon movement to show scattered nature
  yield* loop(3, function* () {
    yield* all(
      ...toolIconsRef().children().map((icon, i) => 
        icon.rotation(Math.random() * 30 - 15, 0.8, easeInOutCubic)
      )
    );
  });

  yield* waitFor(2); // Let opening hook sink in

  // === SCENE 2: Problem Deep Dive (15-30 seconds) ===
  
  // Fade out opening elements
  yield* all(
    titleRef().opacity(0, 0.8),
    subtitleRef().opacity(0, 0.8),
  );

  // New problem statement
  view.add(
    <Txt
      ref={problemTextRef}
      fontSize={84}
      fontWeight={700}
      fill={colors.danger}
      fontFamily="Inter, sans-serif"
      textAlign="center"
      y={-700}
      opacity={0}
    >
      Scattered History{'\n'}={'\n'}Lost Context
    </Txt>
  );

  yield* problemTextRef().opacity(1, 1.0);

  // Add connection lines showing fragmentation - draw BEFORE icons (behind them)
  const connectionLines: Line[] = [];
  
  // Define icon positions manually (same as in toolIconsRef layout)
  const iconPositions = [
    [-200, -150], // Jenkins
    [200, -80],   // Docker  
    [0, 0],       // Dashboard
    [-180, 120],  // Timeline
    [180, 200],   // Database
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
          [endPos[0], endPos[1] - 100]
        ]}
        lineDash={[15, 15]}
        zIndex={-1}  // Behind icons
      />
    );
    connectionLines.push(line());
  }

  // Draw fragmented connection lines
  yield* sequence(
    0.3,
    ...connectionLines.map(line => 
      all(
        line.opacity(0.7, 0.5),
        line.end(1, 1.0, easeOutCubic),
      )
    )
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
        fontSize={64}
        fontWeight={700}
        fill={colors.primary}
        fontFamily="Inter, sans-serif"
        position={[pos[0], pos[1] - 100]} // Adjust for scene offset
        opacity={0}
        zIndex={1} // Above lines, below icons
      />
    );
    questionMarks.push(questionMark());
  });

  yield* sequence(
    0.2,
    ...questionMarks.map(mark => mark.opacity(1, 0.5))
  );

  yield* waitFor(3); // Let problem explanation complete

  // === SCENE 3: Solution Introduction (30-50 seconds) ===
  
  // Clear problem elements
  yield* all(
    problemTextRef().opacity(0, 0.8),
    toolIconsRef().opacity(0, 0.8),
    ...connectionLines.map(line => line.opacity(0, 0.8)),
    ...questionMarks.map(mark => mark.opacity(0, 0.8)),
  );

  // Solution layout - stacked vertically for portrait with larger elements
  view.add(
    <Layout ref={solutionLayoutRef} opacity={0}>
      <Img
        src="/assets/logos/cdevents.svg"
        size={200}
        y={-600}
      />
      <Txt
        fontSize={56}
        fontWeight={600}
        fill={colors.text}
        fontFamily="Inter, sans-serif"
        textAlign="center"
        y={-350}
      >
        CDEvents{'\n'}Standard
      </Txt>
      <Txt
        fontSize={72}
        fontWeight={700}
        fill={colors.primary}
        fontFamily="Inter, sans-serif"
        textAlign="center"
        y={-100}
      >
        Unified{'\n'}SDLC Timeline
      </Txt>
      <Img
        src="/assets/logos/cdviz.svg"
        size={180}
        y={250}
      />
    </Layout>
  );

  yield* solutionLayoutRef().opacity(1, 1.2, easeOutCubic);

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
      />
    );
    eventParticles.push(particle());
  }

  // Animate particles flowing vertically
  yield* sequence(
    0.1,
    ...eventParticles.map((particle, i) =>
      all(
        particle.opacity(1, 0.3),
        particle.y(1000 - i * 80, 2.5, easeInOutCubic),
      )
    )
  );

  yield* waitFor(4); // Let solution explanation complete

  // === SCENE 4: Product Demo (50-75 seconds) ===
  
  // Fade solution, bring in dashboard
  yield* all(
    solutionLayoutRef().opacity(0, 1.0),
    ...eventParticles.map(particle => particle.opacity(0, 0.5)),
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
    />
  );

  yield* dashboardRef().opacity(1, 1.0);

  // Feature highlights stacked vertically for mobile viewing - much larger
  const featureTexts: Txt[] = [];
  const features = [
    "📊 Timeline View",
    "🔗 Metrics Correlation", 
    "📈 DORA Metrics",
    "⚡ Event Automation",
  ];

  features.forEach((feature, i) => {
    const featureText = createRef<Txt>();
    
    view.add(
      <Txt
        ref={featureText}
        text={feature}
        fontSize={56}
        fontWeight={600}
        fill={colors.primary}
        fontFamily="Inter, sans-serif"
        y={150 + i * 120}
        opacity={0}
      />
    );
    
    featureTexts.push(featureText());
  });

  // Animate feature highlights appearing in sequence
  yield* sequence(
    0.8,
    ...featureTexts.map((text) =>
      all(
        text.opacity(1, 0.6),
        text.scale(1.1, 0.3).to(1, 0.3),
      )
    )
  );

  yield* waitFor(4); // Show demo features

  // === SCENE 5: Call to Action (75-90 seconds) ===
  
  // Fade dashboard and features
  yield* all(
    dashboardRef().opacity(0, 1.0),
    ...featureTexts.map(text => text.opacity(0, 0.8)),
  );

  // CTA Layout - much larger for vertical mobile viewing
  view.add(
    <Layout ref={ctaRef} opacity={0}>
      <Txt
        text="cdviz.dev"
        fontSize={110}
        fontWeight={700}
        fill={colors.primary}
        fontFamily="Inter, sans-serif"
        y={-500}
      />
      <Txt
        fontSize={64}
        fontWeight={600}
        fill={colors.text}
        fontFamily="Inter, sans-serif"
        textAlign="center"
        y={-250}
      >
        Complete{'\n'}SDLC Visibility
      </Txt>
      <Rect
        size={[480, 100]}
        fill={colors.primary}
        radius={20}
        y={50}
      >
        <Txt
          text="Start Free Today"
          fontSize={44}
          fontWeight={600}
          fill="white"
          fontFamily="Inter, sans-serif"
        />
      </Rect>
      <Txt
        text="Open Source • Enterprise Ready"
        fontSize={36}
        fontWeight={400}
        fill={colors.textMuted}
        fontFamily="Inter, sans-serif"
        textAlign="center"
        y={200}
      />
    </Layout>
  );

  yield* ctaRef().opacity(1, 1.2, easeOutCubic);

  // Subtle button highlight animation
  yield* loop(2, function* () {
    yield* (ctaRef().children()[2] as Rect).scale(1.05, 0.8).to(1, 0.8);
  });

  yield* waitFor(3); // Final call to action display
});