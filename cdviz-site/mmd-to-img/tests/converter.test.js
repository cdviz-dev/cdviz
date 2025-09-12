#!/usr/bin/env bun
/**
 * Test cases for MermaidConverter class
 */

import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { MermaidConverter } from "../lib/converter.js";
import { writeFileSync, mkdirSync, rmSync, readFileSync } from "fs";
import path from "path";

const TEST_OUTPUT_DIR = "./tests/output";
const SAMPLE_MERMAID = `flowchart LR
    A[Start] --> B[Process]
    B --> C[End]`;

const COMPLEX_MERMAID = `flowchart TD
    A[GitHub Actions] --> B[CDviz Collector]
    B --> C[PostgreSQL]
    C --> D[Grafana Dashboard]
    D --> E[Developer]`;

describe("MermaidConverter", () => {
  let converter;

  beforeAll(async () => {
    // Clean and create test output directory
    try {
      rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
    } catch {}
    mkdirSync(TEST_OUTPUT_DIR, { recursive: true });

    // Create test mermaid files
    writeFileSync(path.join(TEST_OUTPUT_DIR, "simple.mmd"), SAMPLE_MERMAID);
    writeFileSync(path.join(TEST_OUTPUT_DIR, "complex.mmd"), COMPLEX_MERMAID);

    // Initialize converter
    converter = new MermaidConverter({
      headless: true,
      verbose: true,
    });
    await converter.initialize();
  });

  afterAll(async () => {
    if (converter) {
      await converter.cleanup();
    }
  });

  test("should convert mermaid to excalidraw", async () => {
    const result = await converter.convertMermaid(SAMPLE_MERMAID);

    expect(result.type).toBe("excalidraw");
    expect(result.version).toBe(2);
    expect(Array.isArray(result.elements)).toBe(true);
    expect(result.elements.length).toBeGreaterThan(0);

    // Should have text elements for labels
    const textElements = result.elements.filter((el) => el.type === "text");
    expect(textElements.length).toBeGreaterThan(0);

    console.log(`✅ Conversion: ${result.elements.length} elements (${textElements.length} text)`);
  });

  test("should apply CDviz styling", async () => {
    const result = await converter.convertMermaid(SAMPLE_MERMAID, { style: true });

    expect(result.type).toBe("excalidraw");
    expect(result.appState.currentItemStrokeColor).toBe("#f08c00");
    expect(result.appState.currentItemBackgroundColor).toBe("transparent");
    expect(result.appState.currentItemRoughness).toBe(2);

    // Check if elements have correct styling
    const styledElements = result.elements.filter(
      (el) => el.strokeColor === "#f08c00" && el.roughness === 2,
    );
    expect(styledElements.length).toBeGreaterThan(0);

    console.log(`✅ Styling: ${styledElements.length} elements styled with CDviz colors`);
  });

  test("should export to SVG", async () => {
    const excalidrawData = await converter.convertMermaid(SAMPLE_MERMAID);
    const svg = await converter.exportToSVG(excalidrawData);

    expect(svg).toContain("<svg");
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg.length).toBeGreaterThan(100); // Should be substantial SVG content

    // Save for inspection
    writeFileSync(path.join(TEST_OUTPUT_DIR, "test-output.svg"), svg);

    console.log(`✅ SVG Export: ${svg.length} chars`);
  });

  test("should export to PNG", async () => {
    const excalidrawData = await converter.convertMermaid(SAMPLE_MERMAID);
    const pngBuffer = await converter.exportToPNG(excalidrawData);

    expect(Buffer.isBuffer(pngBuffer)).toBe(true);
    expect(pngBuffer.length).toBeGreaterThan(100); // Should be substantial PNG data

    // Save for inspection
    writeFileSync(path.join(TEST_OUTPUT_DIR, "test-output.png"), pngBuffer);

    console.log(`✅ PNG Export: ${pngBuffer.length} bytes`);
  });

  test("should convert file with all formats", async () => {
    const inputFile = path.join(TEST_OUTPUT_DIR, "simple.mmd");
    const result = await converter.convertFile(inputFile, {
      outputDir: TEST_OUTPUT_DIR,
      format: "all",
      style: true,
    });

    expect(result.success).toBe(true);
    expect(result.outputFiles.length).toBe(3); // .excalidraw, .svg, .png

    // Check that all files were created
    result.outputFiles.forEach((file) => {
      const content = readFileSync(file);
      expect(content.length).toBeGreaterThan(0);
    });

    console.log(`✅ File conversion: ${result.outputFiles.length} files generated`);
    result.outputFiles.forEach((file) => console.log(`   → ${path.basename(file)}`));
  });

  test("should process batch of files", async () => {
    const inputFiles = [
      path.join(TEST_OUTPUT_DIR, "simple.mmd"),
      path.join(TEST_OUTPUT_DIR, "complex.mmd"),
    ];

    const results = await converter.convertBatch(inputFiles, {
      outputDir: TEST_OUTPUT_DIR,
      format: "svg",
      style: true,
      maxConcurrent: 2,
    });

    expect(results.length).toBe(2);
    expect(results.every((r) => r.success)).toBe(true);

    const totalOutputs = results.reduce((sum, r) => sum + r.outputFiles.length, 0);
    console.log(
      `✅ Batch conversion: ${results.length} files processed, ${totalOutputs} outputs generated`,
    );
  });

  test("should handle conversion errors gracefully", async () => {
    const invalidMermaid = "invalid mermaid syntax";

    try {
      await converter.convertMermaid(invalidMermaid);
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error.message).toContain("Mermaid conversion failed");
      console.log(`✅ Error handling: ${error.message}`);
    }
  });
});
