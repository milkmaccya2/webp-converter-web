import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("sharp");
vi.mock("node:fs/promises");

const mockSharpInstance = {
  metadata: vi.fn(),
  resize: vi.fn(),
  webp: vi.fn(),
  toFile: vi.fn(),
};

// Methods return self for chaining
mockSharpInstance.resize.mockReturnValue(mockSharpInstance);
mockSharpInstance.webp.mockReturnValue(mockSharpInstance);

const mockStat = { size: 10240 };

beforeEach(() => {
  vi.mocked(sharp).mockReturnValue(mockSharpInstance as never);

  mockSharpInstance.metadata.mockResolvedValue({ width: 1920, height: 1080 });
  mockSharpInstance.toFile.mockResolvedValue({
    width: 1920,
    height: 1080,
    size: 8192,
    format: "webp",
    channels: 3,
    premultiplied: false,
  });

  vi.mocked(fs.stat).mockResolvedValue(mockStat as never);
  vi.mocked(fs.mkdir).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

// Import after mocks are set up
const { convertSingleFile } = await import("../converter.js");

describe("convertSingleFile", () => {
  it("converts with correct quality and lossless options", async () => {
    await convertSingleFile("/input/photo.jpg", {
      quality: 85,
      scale: 100,
      lossless: false,
    });

    expect(mockSharpInstance.webp).toHaveBeenCalledWith({
      quality: 85,
      lossless: false,
    });
  });

  it("applies scale when not 100%", async () => {
    await convertSingleFile("/input/photo.jpg", {
      quality: 80,
      scale: 50,
      lossless: false,
    });

    expect(mockSharpInstance.resize).toHaveBeenCalledWith(960, 540);
  });

  it("skips resize when scale is 100%", async () => {
    await convertSingleFile("/input/photo.jpg", {
      quality: 80,
      scale: 100,
      lossless: false,
    });

    expect(mockSharpInstance.resize).not.toHaveBeenCalled();
  });

  it("resolves output path alongside input when no output specified", async () => {
    const result = await convertSingleFile("/input/photo.jpg", {
      quality: 80,
      scale: 100,
      lossless: false,
    });

    expect(result.outputPath).toBe(path.join("/input", "photo.webp"));
  });

  it("places output in directory when output is a directory path", async () => {
    const result = await convertSingleFile("/input/photo.jpg", {
      quality: 80,
      scale: 100,
      output: "/output/",
      lossless: false,
    });

    expect(result.outputPath).toBe(path.join("/output/", "photo.webp"));
  });

  it("uses exact output path when output ends with .webp", async () => {
    const result = await convertSingleFile("/input/photo.jpg", {
      quality: 80,
      scale: 100,
      output: "/output/result.webp",
      lossless: false,
    });

    expect(result.outputPath).toBe("/output/result.webp");
  });
});
