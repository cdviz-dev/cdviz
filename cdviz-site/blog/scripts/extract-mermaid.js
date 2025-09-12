#!/usr/bin/env bun
/**
 * Extract mermaid diagrams from blog frontmatter and save as .mmd files
 * Usage: bun run extract-mermaid.js
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { glob } from 'glob';
import matter from 'gray-matter';
import path from 'path';

const BLOG_SRC_DIR = '../src';
const ASSETS_SRC_DIR = '../assets-src';

// Ensure output directory exists
mkdirSync(ASSETS_SRC_DIR, { recursive: true });

async function extractMermaidDiagrams() {
  console.log('🔍 Extracting mermaid diagrams from blog frontmatter...');
  
  const blogFiles = await glob('series-*.md', { cwd: BLOG_SRC_DIR });
  let extractedCount = 0;

  for (const file of blogFiles) {
    const filePath = path.join(BLOG_SRC_DIR, file);
    const content = readFileSync(filePath, 'utf8');
    const { data: frontmatter } = matter(content);
    
    if (frontmatter.visuals_needed) {
      for (const visual of frontmatter.visuals_needed) {
        if (visual.type === 'mermaid_diagram' && visual.mermaid_code) {
          const filename = visual.filename || `${path.basename(file, '.md')}-diagram`;
          const outputPath = path.join(ASSETS_SRC_DIR, `${filename}.mmd`);
          
          console.log(`📄 Extracting: ${filename}.mmd`);
          writeFileSync(outputPath, visual.mermaid_code.trim());
          extractedCount++;
        }
      }
    }
  }
  
  console.log(`✅ Extracted ${extractedCount} mermaid diagrams to ${ASSETS_SRC_DIR}`);
}

extractMermaidDiagrams().catch(console.error);