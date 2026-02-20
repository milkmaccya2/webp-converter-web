import { program } from "commander";
import { convertFiles } from "./converter.js";
import { resolveInputPaths } from "./glob.js";

program
  .name("webp-convert")
  .description("Convert images to WebP format")
  .version("0.1.0")
  .argument("<inputs...>", "input files, glob patterns, or directories")
  .option("-q, --quality <number>", "quality (1-100)", "80")
  .option("-s, --scale <number>", "scale percentage (1-200)", "100")
  .option("-o, --output <path>", "output directory or file path")
  .option("--lossless", "use lossless compression")
  .option("--dry-run", "preview conversion results without writing files")
  .action(async (inputs: string[], options) => {
    const quality = parseInt(options.quality, 10);
    const scale = parseInt(options.scale, 10);

    if (isNaN(quality) || quality < 1 || quality > 100) {
      console.error("Error: quality must be between 1 and 100");
      process.exit(1);
    }

    if (isNaN(scale) || scale < 1 || scale > 200) {
      console.error("Error: scale must be between 1 and 200");
      process.exit(1);
    }

    const inputPaths = await resolveInputPaths(inputs);

    if (inputPaths.length === 0) {
      console.error(
        `Error: No supported image files found matching "${inputs.join(", ")}"`
      );
      process.exit(1);
    }

    try {
      await convertFiles(inputPaths, {
        quality,
        scale,
        output: options.output,
        lossless: options.lossless ?? false,
        dryRun: options.dryRun ?? false,
      });
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program.parse();
