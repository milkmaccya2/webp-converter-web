import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";

async function createTestImage(
  width: number,
  height: number,
  format: "png" | "jpeg" = "png"
): Promise<Buffer> {
  // Create noisy image so WebP quality differences are measurable
  const pixels = Buffer.alloc(width * height * 3);
  for (let i = 0; i < pixels.length; i++) {
    pixels[i] = Math.floor(Math.random() * 256);
  }
  return sharp(pixels, { raw: { width, height, channels: 3 } })
    .toFormat(format)
    .toBuffer();
}

function createFormData(
  imageBuffer: Buffer,
  filename: string,
  options: Record<string, string> = {}
): FormData {
  const form = new FormData();
  form.append(
    "image",
    new File([imageBuffer], filename, { type: "image/png" })
  );
  for (const [key, value] of Object.entries(options)) {
    form.append(key, value);
  }
  return form;
}

describe("POST /api/convert", () => {
  it("converts an image to webp with default settings", async () => {
    const image = await createTestImage(200, 100);
    const form = createFormData(image, "test.png");

    const res = await app.request("/api/convert", {
      method: "POST",
      body: form,
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/webp");
    expect(res.headers.get("X-Original-Width")).toBe("200");
    expect(res.headers.get("X-Original-Height")).toBe("100");
    expect(res.headers.get("X-Converted-Width")).toBe("200");
    expect(res.headers.get("X-Converted-Height")).toBe("100");
  });

  it("resizes image by scale percentage", async () => {
    const image = await createTestImage(400, 200);
    const form = createFormData(image, "test.png", { scale: "50" });

    const res = await app.request("/api/convert", {
      method: "POST",
      body: form,
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("X-Converted-Width")).toBe("200");
    expect(res.headers.get("X-Converted-Height")).toBe("100");
  });

  it("applies quality setting", async () => {
    const image = await createTestImage(800, 600, "jpeg");

    const formHigh = createFormData(image, "test.png", { quality: "90" });
    const formLow = createFormData(image, "test.png", { quality: "10" });

    const [resHigh, resLow] = await Promise.all([
      app.request("/api/convert", { method: "POST", body: formHigh }),
      app.request("/api/convert", { method: "POST", body: formLow }),
    ]);

    const highSize = Number(resHigh.headers.get("X-Converted-Size"));
    const lowSize = Number(resLow.headers.get("X-Converted-Size"));

    expect(lowSize).toBeLessThan(highSize);
  });

  it("returns 400 when no image is provided", async () => {
    const form = new FormData();
    const res = await app.request("/api/convert", {
      method: "POST",
      body: form,
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("No image file provided");
  });

  it("clamps quality to valid range", async () => {
    const image = await createTestImage(100, 100);
    const form = createFormData(image, "test.png", { quality: "999" });

    const res = await app.request("/api/convert", {
      method: "POST",
      body: form,
    });
    expect(res.status).toBe(200);
  });
});
