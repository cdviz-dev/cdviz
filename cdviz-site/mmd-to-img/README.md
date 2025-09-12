# @cdviz/mmd-to-img

A CLI tool to convert Mermaid diagrams (.mmd files) to SVG/PNG images with proper text positioning and optional CDviz styling.

## Features

- ✅ **Correct API Usage**: Uses proper `@excalidraw/mermaid-to-excalidraw` API with `convertToExcalidrawElements`
- 🎨 **CDviz Styling**: Applies orange colors (#f08c00) and hand-drawn style by default
- 📁 **Batch Processing**: Convert multiple .mmd files in one command
- 🖼️ **Multiple Formats**: Output to excalidraw, SVG, PNG, or all formats
- ⚡ **Concurrent Processing**: Process multiple files in parallel
- 🧪 **Well Tested**: Comprehensive test suite included

## Quick Start

```bash
# Install dependencies
mise run install

# Convert examples to SVG with CDviz styling
mise run convert:example

# Convert all .mmd files in current directory to PNG
bun run bin/mmd-to-img.js --format png

# Convert specific directory to all formats
bun run bin/mmd-to-img.js --input ./diagrams --output ./images --format all
```

## CLI Usage

```bash
mmd-to-img [options]

Options:
  -i, --input <path>        Input directory containing .mmd files (default: ".")
  -o, --output <path>       Output directory for generated images (default: "./output")
  -f, --format <type>       Output format: excalidraw|svg|png|all (default: "svg")
  --no-style               Disable CDviz styling (styled by default)
  --width <number>         PNG width (default: auto)
  --height <number>        PNG height (default: auto)
  --background <color>     Background color (default: transparent)
  --padding <number>       Export padding in pixels (default: "20")
  --concurrent <number>    Max concurrent conversions (default: "3")
  -v, --verbose            Verbose logging
  -h, --help              Display help
```

## Examples

### Basic Usage

```bash
# Convert to SVG with default CDviz styling
mmd-to-img --input ./diagrams --output ./images --format svg

# Convert to PNG without styling
mmd-to-img --input ./diagrams --format png --no-style

# Convert to all formats
mmd-to-img --format all --verbose
```

### Advanced Usage

```bash
# Custom PNG dimensions and background
mmd-to-img --format png --width 1200 --height 800 --background white

# High concurrency for large batches
mmd-to-img --format all --concurrent 8 --input ./large-diagram-set
```

### Mise Task Examples

```bash
# Run tests
mise run test

# Convert examples
mise run convert:example

# Batch convert with specific settings
mise run convert:batch
```

## Output Formats

### Excalidraw (.excalidraw)

Complete Excalidraw document with proper element structure and text positioning.

### SVG (.svg)

Scalable vector graphics suitable for web and print use.

### PNG (.png)

Raster images with transparent background, suitable for embedding in documents.

## CDviz Styling

By default, all outputs use CDviz visual standards:

- **Color**: `#f08c00` (orange) for all elements
- **Background**: Transparent
- **Style**: Hand-drawn appearance (roughness: 2)
- **Typography**: Sketchy/hand-drawn font
- **Stroke Width**: 2px for consistent visibility

Disable with `--no-style` for default Excalidraw appearance.

## Development

### Project Structure

```
mmd-to-img/
├── bin/                    # CLI entry point
│   └── mmd-to-img.js      # Main CLI script
├── lib/                    # Core functionality
│   └── converter.js       # MermaidConverter class
├── tests/                  # Test suite
│   ├── converter.test.js  # Unit tests
│   └── cli.test.js        # Integration tests
├── examples/              # Example mermaid files
└── package.json          # Dependencies and config
```

### Running Tests

```bash
# Run all tests
mise run test

# Run specific test file
bun test tests/converter.test.js

# Run tests with verbose output
bun test --verbose
```

### API Usage

```javascript
import { MermaidConverter } from "./lib/converter.js";

const converter = new MermaidConverter({
  headless: true,
  verbose: false,
});

await converter.initialize();

// Convert mermaid syntax
const excalidrawData = await converter.convertMermaid(mermaidSyntax, {
  style: true, // Apply CDviz styling
});

// Export to different formats
const svg = await converter.exportToSVG(excalidrawData);
const pngBuffer = await converter.exportToPNG(excalidrawData);

await converter.cleanup();
```

## Technical Details

### Fixed Text Positioning Issue

This tool correctly implements the `@excalidraw/mermaid-to-excalidraw` API:

1. **Parse**: `parseMermaidToExcalidraw(mermaidSyntax)`
2. **Convert**: `convertToExcalidrawElements(parseResult.elements)` ← **Critical step!**

The second step is essential for proper text element positioning and binding.

### Browser Automation

Uses Playwright with Chromium for:

- Loading ES modules from esm.sh CDN
- Converting Mermaid to Excalidraw elements
- Exporting to SVG/PNG formats
- Applying styling transformations

### Performance

- **Concurrent Processing**: Configurable parallel file processing
- **Browser Reuse**: Single browser instance for multiple conversions
- **Resource Management**: Automatic cleanup and memory management

## Integration

### Use with Mise

Add to your project's `.mise.toml`:

```toml
[tasks.diagrams]
description = "Convert mermaid diagrams to images"
run = ["bun", "mmd-to-img/bin/mmd-to-img.js", "--input", "docs/diagrams", "--format", "all"]
```

### Use in CI/CD

```yaml
- name: Convert diagrams
  run: |
    cd mmd-to-img
    bun install
    bun run bin/mmd-to-img.js --input ../docs --format svg
```

## Troubleshooting

### Common Issues

**"Browser not found"**: Install Playwright browsers

```bash
bunx playwright install chromium
```

**"Timeout errors"**: Increase timeout or reduce concurrency

```bash
mmd-to-img --concurrent 1 --verbose
```

**"Invalid mermaid syntax"**: Validate your .mmd files

```bash
# Check mermaid syntax at https://mermaid.live/
```

### Debug Mode

Use `--verbose` flag to see detailed processing information:

```bash
mmd-to-img --verbose --format all
```

## License

Apache-2.0 - Part of the CDviz project.
