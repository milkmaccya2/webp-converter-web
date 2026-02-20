import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { formatBytes, formatPercent } from "./utils.js";

export interface ConvertOptions {
  quality: number;
  scale: number;
  output?: string;
  lossless: boolean;
  dryRun?: boolean;
}

export interface ConvertResult {
  inputPath: string;
  outputPath: string;
  originalSize: number;
  convertedSize: number;
  originalWidth: number;
  originalHeight: number;
  convertedWidth: number;
  convertedHeight: number;
}

export async function convertSingleFile(
  inputPath: string,
  options: ConvertOptions
): Promise<ConvertResult> {
  const outputPath = await resolveOutputPath(inputPath, options.output);
  const originalSize = (await fs.stat(inputPath)).size;

  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const originalWidth = metadata.width ?? 0;
  const originalHeight = metadata.height ?? 0;

  let pipeline = image;

  if (options.scale !== 100) {
    const newWidth = Math.round(originalWidth * (options.scale / 100));
    const newHeight = Math.round(originalHeight * (options.scale / 100));
    pipeline = pipeline.resize(newWidth, newHeight);
  }

  pipeline = pipeline.webp({
    quality: options.quality,
    lossless: options.lossless,
  });

  let convertedSize: number;
  let convertedWidth: number;
  let convertedHeight: number;

  if (options.dryRun) {
    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
    convertedSize = data.length;
    convertedWidth = info.width;
    convertedHeight = info.height;
  } else {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    const info = await pipeline.toFile(outputPath);
    // info.size は toFile() が返す書き込み済みバイト数
    convertedSize = info.size;
    convertedWidth = info.width;
    convertedHeight = info.height;
  }

  return {
    inputPath,
    outputPath,
    originalSize,
    convertedSize,
    originalWidth,
    originalHeight,
    convertedWidth,
    convertedHeight,
  };
}

export async function convertFiles(
  inputPaths: string[],
  options: ConvertOptions
): Promise<void> {
  const isBatch = inputPaths.length > 1;
  const dryRun = options.dryRun ?? false;

  if (isBatch && options.output?.endsWith(".webp")) {
    throw new Error(
      "output must be a directory when converting multiple files"
    );
  }

  let successCount = 0;
  let failCount = 0;
  const originalSizes: number[] = [];
  const convertedSizes: number[] = [];

  for (let i = 0; i < inputPaths.length; i++) {
    const inputPath = inputPaths[i];
    const prefix = isBatch ? `[${i + 1}/${inputPaths.length}] ` : "";
    const label = dryRun ? "DRY RUN" : "Converting";

    try {
      const result = await convertSingleFile(inputPath, options);
      const savings = formatPercent(result.originalSize, result.convertedSize);
      const sizeInfo = `${formatBytes(result.originalSize)} → ${formatBytes(result.convertedSize)} (${savings})`;

      console.log(`${prefix}${label} ${path.basename(inputPath)}... Done`);
      console.log(
        `  ${dryRun ? "Would write" : "Output"}: ${result.outputPath}`
      );
      console.log(`  Size:   ${sizeInfo}`);
      console.log(
        `  Dims:   ${result.originalWidth}x${result.originalHeight} → ${result.convertedWidth}x${result.convertedHeight}`
      );

      originalSizes.push(result.originalSize);
      convertedSizes.push(result.convertedSize);
      successCount++;
    } catch (err) {
      console.log(`${prefix}${label} ${path.basename(inputPath)}... Failed`);
      console.error(`  Error: ${(err as Error).message}`);
      failCount++;
    }
  }

  if (isBatch) {
    const totalOrig = originalSizes.reduce((a, b) => a + b, 0);
    const totalConv = convertedSizes.reduce((a, b) => a + b, 0);
    const summary = dryRun
      ? `\nSummary (dry run): ${successCount} files would be converted, ${failCount} failed`
      : `\nSummary: ${successCount} converted, ${failCount} failed`;
    console.log(summary);
    console.log(
      `Total:   ${formatBytes(totalOrig)} → ${formatBytes(totalConv)} (${formatPercent(totalOrig, totalConv)})`
    );
  }
}

async function resolveOutputPath(
  inputPath: string,
  outputOption?: string
): Promise<string> {
  const baseName =
    path.basename(inputPath, path.extname(inputPath)) + ".webp";

  if (!outputOption) {
    return path.join(path.dirname(inputPath), baseName);
  }

  if (outputOption.endsWith(".webp")) {
    return outputOption;
  }

  // 既存ディレクトリかどうかを確認してからパスを決定する
  try {
    const stat = await fs.stat(outputOption);
    if (stat.isDirectory()) {
      return path.join(outputOption, baseName);
    }
  } catch {
    // 存在しないパス → ディレクトリとして作成する
  }

  return path.join(outputOption, baseName);
}
