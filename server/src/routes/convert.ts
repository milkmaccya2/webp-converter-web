import { Hono } from "hono";
import sharp from "sharp";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_OUTPUT_DIMENSION = 8000;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/tiff",
]);

const convertRoute = new Hono();

convertRoute.post("/convert", async (c) => {
  const body = await c.req.parseBody();
  const file = body.image;

  if (!(file instanceof File)) {
    return c.json({ error: "No image file provided" }, 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return c.json({ error: "File size exceeds 10MB limit" }, 400);
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return c.json({ error: "Unsupported file type" }, 400);
  }

  const quality = Math.min(100, Math.max(1, Number(body.quality) || 80));
  const scale = Math.min(200, Math.max(1, Number(body.scale) || 100));

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const image = sharp(buffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      return c.json({ error: "Unable to read image dimensions" }, 400);
    }

    const newWidth = Math.min(
      Math.round(metadata.width * (scale / 100)),
      MAX_OUTPUT_DIMENSION
    );

    const converted = await image
      .resize({ width: newWidth, withoutEnlargement: scale <= 100 })
      .webp({ quality })
      .toBuffer({ resolveWithObject: true });

    // biome-ignore lint/suspicious/noExplicitAny: sharp buffer is compatible
    return new Response(converted.data as any, {
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(converted.data.length),
        "X-Original-Width": String(metadata.width),
        "X-Original-Height": String(metadata.height),
        "X-Converted-Width": String(converted.info.width),
        "X-Converted-Height": String(converted.info.height),
        "X-Original-Size": String(file.size),
        "X-Converted-Size": String(converted.data.length),
        "X-Original-Format": metadata.format || "unknown",
      },
    });
  } catch (err) {
    console.error("Image conversion failed:", err);
    return c.json({ error: "Failed to process image" }, 500);
  }
});

export { convertRoute };
