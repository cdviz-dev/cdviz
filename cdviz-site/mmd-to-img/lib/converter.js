import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MermaidConverter {
  constructor(options = {}) {
    this.browser = null;
    this.page = null;
    this.options = {
      headless: options.headless ?? true,
      verbose: options.verbose ?? false,
      ...options,
    };
  }

  async initialize() {
    if (this.options.verbose) console.log("🚀 Initializing browser...");

    this.browser = await chromium.launch({
      headless: this.options.headless,
    });

    this.page = await this.browser.newPage();
    await this.setupPage();
  }

  async setupPage() {
    // Load required libraries
    await this.page.addScriptTag({
      url: "https://esm.sh/@excalidraw/mermaid-to-excalidraw@1.1.2",
    });

    await this.page.addScriptTag({
      url: "https://esm.sh/@excalidraw/excalidraw@0.18.0",
    });

    // Load local Excalifont for proper PNG rendering
    const fontPath = path.join(__dirname, "..", "Excalifont-Regular.woff2");
    const fontBuffer = readFileSync(fontPath);
    const fontBase64 = fontBuffer.toString("base64");

    await this.page.addStyleTag({
      content: `
        @font-face {
          font-family: "Excalifont";
          src: url("data:font/woff2;base64,${fontBase64}") format("woff2");
          font-display: swap;
        }
      `,
    });

    // Wait for font to load
    await this.page.evaluate(() => {
      return document.fonts.ready;
    });

    // Setup conversion functions
    await this.page.evaluate(() => {
      window.convertMermaidToExcalidraw = async (mermaidSyntax, options = {}) => {
        const { parseMermaidToExcalidraw } = await import(
          "https://esm.sh/@excalidraw/mermaid-to-excalidraw@1.1.2"
        );
        const { convertToExcalidrawElements } = await import(
          "https://esm.sh/@excalidraw/excalidraw@0.18.0"
        );

        // Step 1: Parse mermaid to excalidraw format
        const parseResult = await parseMermaidToExcalidraw(mermaidSyntax, {
          fontSize: options.fontSize || 16,
        });

        // Step 2: Convert to proper excalidraw elements (CRITICAL STEP!)
        const excalidrawElements = convertToExcalidrawElements(parseResult.elements);

        return {
          type: "excalidraw",
          version: 2,
          source: "https://excalidraw.com",
          elements: excalidrawElements,
          appState: {
            gridSize: null,
            viewBackgroundColor: options.backgroundColor || "#ffffff",
          },
          files: {},
        };
      };

      window.applyCDvizStyling = (excalidrawData) => {
        const styledElements = excalidrawData.elements.map((element) => {
          const styled = { ...element };

          // Apply CDviz styling
          if (element.type === "rectangle" || element.type === "arrow") {
            styled.strokeColor = "#f08c00";
            styled.backgroundColor = "transparent";
            styled.fillStyle = "solid";
            styled.strokeWidth = 2;
            styled.roughness = 2;
            styled.opacity = 100;
          }

          if (element.type === "text") {
            styled.strokeColor = "#f08c00"; // CDviz orange for text
            styled.backgroundColor = "transparent";
            styled.fontFamily = 5; // Hand-drawn font
            styled.roughness = 1; // Slightly less rough for text readability
          }

          return styled;
        });

        return {
          ...excalidrawData,
          elements: styledElements,
          appState: {
            ...excalidrawData.appState,
            currentItemStrokeColor: "#f08c00",
            currentItemBackgroundColor: "transparent",
            currentItemFillStyle: "solid",
            currentItemStrokeWidth: 2,
            currentItemRoughness: 2,
            currentItemOpacity: 100,
          },
        };
      };

      window.exportToSVG = async (excalidrawData, options = {}) => {
        const { exportToSvg } = await import("https://esm.sh/@excalidraw/excalidraw@0.18.0");

        const svg = await exportToSvg({
          elements: excalidrawData.elements || [],
          appState: excalidrawData.appState || {},
          files: excalidrawData.files || {},
          exportPadding: options.padding || 20,
        });

        return svg.outerHTML;
      };

      window.exportToPNG = async (excalidrawData, options = {}) => {
        const { exportToCanvas } = await import("https://esm.sh/@excalidraw/excalidraw@0.18.0");

        // Ensure font is loaded before export
        await document.fonts.load("16px Excalifont");

        const canvas = await exportToCanvas({
          elements: excalidrawData.elements || [],
          appState: excalidrawData.appState || {},
          files: excalidrawData.files || {},
          exportPadding: options.padding || 20,
          maxWidthOrHeight: options.maxWidthOrHeight,
        });

        return canvas.toDataURL("image/png");
      };
    });

    if (this.options.verbose) console.log("✅ Browser setup complete");
  }

  async convertMermaid(mermaidContent, options = {}) {
    if (!this.page) {
      throw new Error("Converter not initialized. Call initialize() first.");
    }

    try {
      // Convert mermaid to excalidraw
      const excalidrawData = await this.page.evaluate(
        async ({ content, opts }) => {
          return await window.convertMermaidToExcalidraw(content, opts);
        },
        { content: mermaidContent, opts: options },
      );

      // Apply styling if requested
      const finalData = options.style
        ? await this.page.evaluate((data) => window.applyCDvizStyling(data), excalidrawData)
        : excalidrawData;

      return finalData;
    } catch (error) {
      throw new Error(`Mermaid conversion failed: ${error.message}`);
    }
  }

  async exportToSVG(excalidrawData, options = {}) {
    if (!this.page) {
      throw new Error("Converter not initialized. Call initialize() first.");
    }

    try {
      return await this.page.evaluate(
        async ({ data, opts }) => {
          return await window.exportToSVG(data, opts);
        },
        { data: excalidrawData, opts: options },
      );
    } catch (error) {
      throw new Error(`SVG export failed: ${error.message}`);
    }
  }

  async exportToPNG(excalidrawData, options = {}) {
    if (!this.page) {
      throw new Error("Converter not initialized. Call initialize() first.");
    }

    try {
      const dataUrl = await this.page.evaluate(
        async ({ data, opts }) => {
          return await window.exportToPNG(data, opts);
        },
        { data: excalidrawData, opts: options },
      );

      // Convert data URL to buffer
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      return Buffer.from(base64Data, "base64");
    } catch (error) {
      throw new Error(`PNG export failed: ${error.message}`);
    }
  }

  async convertFile(inputFile, options = {}) {
    const mermaidContent = readFileSync(inputFile, "utf-8");
    const baseName = path.basename(inputFile, ".mmd");
    const outputDir = options.outputDir || "./output";

    const results = {
      inputFile,
      success: false,
      outputFiles: [],
      error: null,
    };

    try {
      // Convert to excalidraw
      const excalidrawData = await this.convertMermaid(mermaidContent, options);

      const outputs = [];

      // Export based on format option
      if (options.format === "excalidraw" || options.format === "all") {
        const excalidrawPath = path.join(outputDir, `${baseName}.excalidraw`);
        writeFileSync(excalidrawPath, JSON.stringify(excalidrawData, null, 2));
        outputs.push(excalidrawPath);
      }

      if (options.format === "svg" || options.format === "all") {
        const svg = await this.exportToSVG(excalidrawData, options);
        const svgPath = path.join(outputDir, `${baseName}.svg`);
        writeFileSync(svgPath, svg);
        outputs.push(svgPath);
      }

      if (options.format === "png" || options.format === "all") {
        const pngBuffer = await this.exportToPNG(excalidrawData, options);
        const pngPath = path.join(outputDir, `${baseName}.png`);
        writeFileSync(pngPath, pngBuffer);
        outputs.push(pngPath);
      }

      results.success = true;
      results.outputFiles = outputs;

      if (this.options.verbose) {
        console.log(`✅ Converted: ${inputFile}`);
        outputs.forEach((file) => console.log(`   → ${file}`));
      }
    } catch (error) {
      results.error = error.message;
      if (this.options.verbose) {
        console.log(`❌ Failed: ${inputFile} - ${error.message}`);
      }
    }

    return results;
  }

  async convertBatch(inputFiles, options = {}) {
    const maxConcurrent = options.maxConcurrent || 3;
    const results = [];

    // Process files in batches to avoid overwhelming the browser
    for (let i = 0; i < inputFiles.length; i += maxConcurrent) {
      const batch = inputFiles.slice(i, i + maxConcurrent);
      const batchPromises = batch.map((file) => this.convertFile(file, options));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      if (this.options.verbose) console.log("🔄 Browser cleanup complete");
    }
  }
}
