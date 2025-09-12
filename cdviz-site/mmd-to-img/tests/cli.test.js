#!/usr/bin/env bun
/**
 * Integration tests for CLI functionality
 */

import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { spawn } from "child_process";
import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync } from "fs";
import path from "path";

const TEST_DIR = "./tests/cli-test";
const CLI_PATH = "./bin/mmd-to-img.js";

const SAMPLE_MERMAID = `flowchart LR
    A[Start] --> B[Process]
    B --> C[End]`;

const COMPLEX_MERMAID = `flowchart TD
    A[GitHub Actions] --> B[CDviz Collector]
    B --> C[PostgreSQL]
    C --> D[Grafana Dashboard]
    D --> E[Developer]`;

function runCLI(args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn("bun", ["run", CLI_PATH, ...args], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: process.cwd(),
      ...options,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });

    child.on("error", (error) => {
      reject(error);
    });

    // Set timeout
    setTimeout(() => {
      child.kill();
      reject(new Error("CLI test timeout"));
    }, 30000); // 30 second timeout
  });
}

describe("CLI Integration Tests", () => {
  beforeAll(async () => {
    // Clean and create test directory
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
    mkdirSync(TEST_DIR, { recursive: true });

    // Create test mermaid files
    writeFileSync(path.join(TEST_DIR, "simple.mmd"), SAMPLE_MERMAID);
    writeFileSync(path.join(TEST_DIR, "complex.mmd"), COMPLEX_MERMAID);
  });

  afterAll(async () => {
    // Clean up test directory
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  test("should show help information", async () => {
    const result = await runCLI(["--help"]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("mmd-to-img");
    expect(result.stdout).toContain("Convert mermaid diagrams");
    expect(result.stdout).toContain("--format");
    expect(result.stdout).toContain("--output");

    console.log("✅ Help command works");
  });

  test("should convert single format (SVG)", async () => {
    const outputDir = path.join(TEST_DIR, "svg-output");
    const result = await runCLI([
      "--input",
      TEST_DIR,
      "--output",
      outputDir,
      "--format",
      "svg",
      "--verbose",
    ]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Successfully converted");

    // Check output files
    expect(existsSync(path.join(outputDir, "simple.svg"))).toBe(true);
    expect(existsSync(path.join(outputDir, "complex.svg"))).toBe(true);

    // Verify SVG content
    const svgContent = readFileSync(path.join(outputDir, "simple.svg"), "utf-8");
    expect(svgContent).toContain("<svg");
    expect(svgContent).toContain("xmlns");

    console.log("✅ SVG conversion successful");
  });

  test("should convert single format (PNG)", async () => {
    const outputDir = path.join(TEST_DIR, "png-output");
    const result = await runCLI([
      "--input",
      TEST_DIR,
      "--output",
      outputDir,
      "--format",
      "png",
      "--verbose",
    ]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Successfully converted");

    // Check output files
    expect(existsSync(path.join(outputDir, "simple.png"))).toBe(true);
    expect(existsSync(path.join(outputDir, "complex.png"))).toBe(true);

    // Verify PNG files have content
    const pngBuffer = readFileSync(path.join(outputDir, "simple.png"));
    expect(pngBuffer.length).toBeGreaterThan(100);

    console.log("✅ PNG conversion successful");
  });

  test("should convert to excalidraw format", async () => {
    const outputDir = path.join(TEST_DIR, "excalidraw-output");
    const result = await runCLI([
      "--input",
      TEST_DIR,
      "--output",
      outputDir,
      "--format",
      "excalidraw",
      "--verbose",
    ]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Successfully converted");

    // Check output files
    expect(existsSync(path.join(outputDir, "simple.excalidraw"))).toBe(true);
    expect(existsSync(path.join(outputDir, "complex.excalidraw"))).toBe(true);

    // Verify excalidraw structure
    const excalidrawContent = JSON.parse(
      readFileSync(path.join(outputDir, "simple.excalidraw"), "utf-8"),
    );
    expect(excalidrawContent.type).toBe("excalidraw");
    expect(excalidrawContent.version).toBe(2);
    expect(Array.isArray(excalidrawContent.elements)).toBe(true);

    console.log("✅ Excalidraw conversion successful");
  });

  test("should convert all formats", async () => {
    const outputDir = path.join(TEST_DIR, "all-output");
    const result = await runCLI([
      "--input",
      TEST_DIR,
      "--output",
      outputDir,
      "--format",
      "all",
      "--verbose",
    ]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Successfully converted");

    // Check that all formats were generated
    const formats = ["excalidraw", "svg", "png"];
    const files = ["simple", "complex"];

    for (const file of files) {
      for (const format of formats) {
        const filePath = path.join(outputDir, `${file}.${format}`);
        expect(existsSync(filePath)).toBe(true);

        const content = readFileSync(filePath);
        expect(content.length).toBeGreaterThan(0);
      }
    }

    console.log("✅ All formats conversion successful");
  });

  test("should apply styling by default", async () => {
    const outputDir = path.join(TEST_DIR, "styled-output");
    const result = await runCLI([
      "--input",
      TEST_DIR,
      "--output",
      outputDir,
      "--format",
      "excalidraw",
      "--verbose",
    ]);

    expect(result.code).toBe(0);

    // Check that styling was applied
    const excalidrawContent = JSON.parse(
      readFileSync(path.join(outputDir, "simple.excalidraw"), "utf-8"),
    );
    expect(excalidrawContent.appState.currentItemStrokeColor).toBe("#f08c00");
    expect(excalidrawContent.appState.currentItemRoughness).toBe(2);

    console.log("✅ Default styling applied");
  });

  test("should disable styling with --no-style", async () => {
    const outputDir = path.join(TEST_DIR, "no-style-output");
    const result = await runCLI([
      "--input",
      TEST_DIR,
      "--output",
      outputDir,
      "--format",
      "excalidraw",
      "--no-style",
      "--verbose",
    ]);

    expect(result.code).toBe(0);

    // Check that styling was not applied (should have default values)
    const excalidrawContent = JSON.parse(
      readFileSync(path.join(outputDir, "simple.excalidraw"), "utf-8"),
    );
    expect(excalidrawContent.appState.currentItemStrokeColor).not.toBe("#f08c00");

    console.log("✅ Styling disabled successfully");
  });

  test("should handle no input files gracefully", async () => {
    const emptyDir = path.join(TEST_DIR, "empty");
    mkdirSync(emptyDir, { recursive: true });

    const result = await runCLI([
      "--input",
      emptyDir,
      "--output",
      path.join(TEST_DIR, "empty-output"),
      "--format",
      "svg",
    ]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("No .mmd files found");

    console.log("✅ Empty directory handled gracefully");
  });
});
