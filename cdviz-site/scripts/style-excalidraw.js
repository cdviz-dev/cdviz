#!/usr/bin/env bun
/**
 * Apply CDviz styling to excalidraw diagrams
 * Usage: bun run style-excalidraw.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

const CDVIZ_THEME = {
  // CDviz brand colors
  strokeColor: '#f08c00',
  backgroundColor: 'transparent',
  fillStyle: 'solid',
  strokeWidth: 2,
  roughness: 2, // Hand-drawn feel
  opacity: 100,
  
  // Typography
  fontFamily: 'Excalifont, Xiaolai, Segoe UI Emoji',
  fontSize: 16,
  textAlign: 'center',
  verticalAlign: 'middle'
};

async function applyCDvizStyling() {
  console.log('🎨 Applying CDviz styling to excalidraw diagrams...');
  
  const excalidrawFiles = await glob('*.excalidraw', { cwd: './assets-src/blog' });
  let styledCount = 0;

  for (const file of excalidrawFiles) {
    const filePath = path.join('./assets-src/blog', file);
    const styledPath = path.join('./assets-src/blog', file.replace('.excalidraw', '.styled.excalidraw'));
    
    try {
      const content = readFileSync(filePath, 'utf8');
      const excalidrawData = JSON.parse(content);
      
      // Apply CDviz styling to all elements
      if (excalidrawData.elements) {
        excalidrawData.elements = excalidrawData.elements.map(element => ({
          ...element,
          strokeColor: CDVIZ_THEME.strokeColor,
          backgroundColor: element.type === 'text' ? 'transparent' : CDVIZ_THEME.backgroundColor,
          fillStyle: CDVIZ_THEME.fillStyle,
          strokeWidth: CDVIZ_THEME.strokeWidth,
          roughness: CDVIZ_THEME.roughness,
          opacity: CDVIZ_THEME.opacity,
          ...(element.type === 'text' && {
            fontFamily: CDVIZ_THEME.fontFamily,
            fontSize: CDVIZ_THEME.fontSize,
            textAlign: CDVIZ_THEME.textAlign,
            verticalAlign: CDVIZ_THEME.verticalAlign
          })
        }));
      }
      
      // Set app state for consistent theming
      excalidrawData.appState = {
        ...excalidrawData.appState,
        currentItemStrokeColor: CDVIZ_THEME.strokeColor,
        currentItemBackgroundColor: CDVIZ_THEME.backgroundColor,
        currentItemFillStyle: CDVIZ_THEME.fillStyle,
        currentItemStrokeWidth: CDVIZ_THEME.strokeWidth,
        currentItemRoughness: CDVIZ_THEME.roughness,
        currentItemOpacity: CDVIZ_THEME.opacity,
        currentItemFontFamily: CDVIZ_THEME.fontFamily,
        currentItemFontSize: CDVIZ_THEME.fontSize,
        currentItemTextAlign: CDVIZ_THEME.textAlign
      };
      
      writeFileSync(styledPath, JSON.stringify(excalidrawData, null, 2));
      console.log(`🎨 Styled: ${path.basename(styledPath)}`);
      styledCount++;
      
    } catch (error) {
      console.error(`❌ Error styling ${file}:`, error.message);
    }
  }
  
  console.log(`✅ Applied CDviz styling to ${styledCount} diagrams`);
}

applyCDvizStyling().catch(console.error);