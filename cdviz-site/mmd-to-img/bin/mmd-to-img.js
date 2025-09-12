#!/usr/bin/env node

import { Command } from "commander";
import { MermaidConverter } from "../lib/converter.js";
import { glob } from "glob";
import path from "path";
import { existsSync, mkdirSync } from "fs";

const program = new Command();

program
  .name("mmd-to-img")
  .description("Convert mermaid diagrams (.mmd) to SVG/PNG images")
  .version("1.0.0");

program
  .option("-i, --input <path>", "Input directory containing .mmd files", ".")
  .option("-o, --output <path>", "Output directory for generated images", "./output")
  .option("-f, --format <type>", "Output format (excalidraw|svg|png|all)", "svg")
  .option("--no-style", "Disable CDviz styling (styled by default)")
  .option("--width <number>", "PNG width (default: auto)")
  .option("--height <number>", "PNG height (default: auto)")
  .option("--background <color>", "Background color (default: transparent)")
  .option("--padding <number>", "Export padding in pixels", "20")
  .option("--concurrent <number>", "Max concurrent conversions", "3")
  .option("-v, --verbose", "Verbose logging", false)
  .parse();

const options = program.opts();

async function main() {
  try {
    // Validate input directory
    if (!existsSync(options.input)) {
      console.error(`❌ Input directory not found: ${options.input}`);
      process.exit(1);
    }

    // Create output directory
    if (!existsSync(options.output)) {
      mkdirSync(options.output, { recursive: true });
      if (options.verbose) console.log(`📁 Created output directory: ${options.output}`);
    }

    // Find all .mmd files
    const inputPattern = path.join(options.input, "**/*.mmd");
    const mmdFiles = await glob(inputPattern);

    if (mmdFiles.length === 0) {
      console.log(`ℹ️  No .mmd files found in ${options.input}`);
      process.exit(0);
    }

    console.log(`🔍 Found ${mmdFiles.length} mermaid file(s)`);
    if (options.verbose) {
      mmdFiles.forEach((file) => console.log(`  - ${file}`));
    }

    // Initialize converter
    const converter = new MermaidConverter({
      headless: true,
      verbose: options.verbose,
    });

    await converter.initialize();

    // Process files
    const results = await converter.convertBatch(mmdFiles, {
      outputDir: options.output,
      format: options.format,
      style: !options.noStyle, // Style by default, disable with --no-style
      width: options.width ? parseInt(options.width) : undefined,
      height: options.height ? parseInt(options.height) : undefined,
      background: options.background,
      padding: parseInt(options.padding),
      maxConcurrent: parseInt(options.concurrent),
    });

    // Report results
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`\n✅ Successfully converted: ${successful}`);
    if (failed > 0) {
      console.log(`❌ Failed conversions: ${failed}`);
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`  - ${r.inputFile}: ${r.error}`);
        });
    }

    if (options.verbose && successful > 0) {
      console.log("\n📄 Generated files:");
      results
        .filter((r) => r.success)
        .forEach((r) => {
          r.outputFiles.forEach((file) => console.log(`  - ${file}`));
        });
    }

    await converter.cleanup();

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("❌ CLI Error:", error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
