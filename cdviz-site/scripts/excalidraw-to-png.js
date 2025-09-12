#!/usr/bin/env bun
/**
 * Export excalidraw diagrams to PNG format for blog compatibility
 * Usage: bun run excalidraw-to-png.js
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

const ASSETS_SRC_DIR = './assets-src/blog';
const ASSETS_OUTPUT_DIR = './assets/blog';

// Ensure output directory exists
mkdirSync(ASSETS_OUTPUT_DIR, { recursive: true });

async function generatePlaceholderPNG(filename, outputPath) {
  // For now, create a simple placeholder that indicates manual creation needed
  const placeholderSVG = `
    <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#000000"/>
      <text x="400" y="180" text-anchor="middle" fill="#f08c00" 
            font-family="monospace" font-size="24">
        📋 Manual Creation Needed
      </text>
      <text x="400" y="220" text-anchor="middle" fill="#f08c00" 
            font-family="monospace" font-size="16">
        ${filename}
      </text>
      <text x="400" y="260" text-anchor="middle" fill="#f08c00" 
            font-family="monospace" font-size="14">
        Create this diagram in Excalidraw with CDviz styling
      </text>
    </svg>
  `;
  
  // Write SVG placeholder (can be converted to PNG manually)
  const svgPath = outputPath.replace('.png', '.placeholder.svg');
  writeFileSync(svgPath, placeholderSVG);
  
  // Create a basic PNG placeholder indication file
  const readme = `# ${filename}

This diagram needs manual creation in Excalidraw.

## Instructions:
1. Open https://excalidraw.com
2. Create diagram with CDviz styling:
   - Color: #f08c00 (orange)
   - Style: Hand-drawn, roughness 2
   - Background: Transparent
3. Export as PNG to replace this placeholder

## Content needed:
See ../blog-src/series-*.md frontmatter for diagram specification.
`;
  
  writeFileSync(outputPath.replace('.png', '.README.md'), readme);
}

async function exportToPNG() {
  console.log('📸 Creating placeholders for excalidraw diagrams...');
  
  const styledFiles = await glob('*.styled.excalidraw', { cwd: ASSETS_SRC_DIR });
  let exportedCount = 0;

  if (styledFiles.length === 0) {
    console.log('ℹ️  No styled excalidraw files found. Creating placeholders for expected diagrams...');
    
    // Create placeholders for expected blog diagrams
    const expectedDiagrams = [
      'blog-scattered-vs-unified',
      'blog-github-cdviz-flow', 
      'blog-cdviz-production-k8s'
    ];
    
    for (const filename of expectedDiagrams) {
      const outputPath = path.join(ASSETS_OUTPUT_DIR, `${filename}.png`);
      await generatePlaceholderPNG(filename, outputPath);
      console.log(`📋 Created placeholder: ${filename}`);
      exportedCount++;
    }
  } else {
    for (const file of styledFiles) {
      const basename = path.basename(file, '.styled.excalidraw');
      const outputPath = path.join(ASSETS_OUTPUT_DIR, `${basename}.png`);
      
      await generatePlaceholderPNG(basename, outputPath);
      console.log(`📋 Created placeholder: ${basename}`);
      exportedCount++;
    }
  }
  
  console.log(`✅ Created ${exportedCount} placeholder files in ${ASSETS_OUTPUT_DIR}`);
  console.log(`ℹ️  Manual creation needed - see README files for instructions`);
}

exportToPNG().catch(console.error);