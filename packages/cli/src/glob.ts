import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";

const SUPPORTED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".tiff",
  ".tif",
  ".avif",
  ".webp",
]);

export async function resolveInputPaths(inputs: string[]): Promise<string[]> {
  const seen = new Set<string>();
  const results: string[] = [];

  for (const input of inputs) {
    const resolved = await resolveSingleInput(input);
    for (const f of resolved) {
      if (!seen.has(f)) {
        seen.add(f);
        results.push(f);
      }
    }
  }

  return results;
}

async function resolveSingleInput(input: string): Promise<string[]> {
  // ディレクトリ指定
  try {
    const stat = await fs.stat(input);
    if (stat.isDirectory()) {
      return scanDirectory(input);
    }
  } catch {
    // ファイル・ディレクトリが存在しない → glob パターンとして処理
  }

  // glob パターン
  if (input.includes("*") || input.includes("?") || input.includes("{")) {
    const files = await fg(input, { absolute: true });
    return files
      .filter((f) => SUPPORTED_EXTENSIONS.has(path.extname(f).toLowerCase()))
      .sort();
  }

  // 単一ファイル
  return [path.resolve(input)];
}

async function scanDirectory(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (SUPPORTED_EXTENSIONS.has(ext)) {
        results.push(path.resolve(dir, entry.name));
      }
    }
  }

  return results.sort();
}
