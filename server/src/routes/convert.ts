// Import Wasm modules directly
import avifWasm from "@jsquash/avif/codec/dec/avif_dec.wasm";
import * as decodeAvif from "@jsquash/avif/decode.js";
import jpegWasm from "@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm";
import * as decodeJpeg from "@jsquash/jpeg/decode.js";
import pngWasm from "@jsquash/png/codec/squoosh_png_bg.wasm";
import * as decodePng from "@jsquash/png/decode.js";
import * as resize from "@jsquash/resize";
import resizeWasm from "@jsquash/resize/lib/resize/pkg/squoosh_resize_bg.wasm";
import webpDecWasm from "@jsquash/webp/codec/dec/webp_dec.wasm";
import webpEncWasm from "@jsquash/webp/codec/enc/webp_enc.wasm";
import * as decodeWebp from "@jsquash/webp/decode.js";
import * as encodeWebp from "@jsquash/webp/encode.js";
import { Hono } from "hono";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_OUTPUT_DIMENSION = 8000;

const ALLOWED_MIME_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/avif",
]);

// Polyfill ImageData for Cloudflare Workers
// (Moved to polyfills.ts)

const convertRoute = new Hono();

// Initialize modules (Singleton Pattern)
let initPromise: Promise<void> | null = null;
async function initModules() {
	if (initPromise) return initPromise;

	initPromise = (async () => {
		console.log("Initializing Wasm modules...");
		try {
			console.log("Initializing JPEG...");
			await decodeJpeg.init(jpegWasm);
			console.log("Initializing PNG...");
			await decodePng.init(pngWasm);
			console.log("Initializing WebP Dec...");
			await decodeWebp.init(webpDecWasm);
			console.log("Initializing AVIF...");
			await decodeAvif.init(avifWasm);
			console.log("Initializing WebP Enc...");
			await encodeWebp.init(webpEncWasm);
			console.log("Initializing Resize...");
			await resize.initResize(resizeWasm);
			console.log("All modules initialized");
		} catch (e) {
			console.error("Error initializing modules", e);
			// Reset promise on failure so we can retry
			initPromise = null;
			throw e;
		}
	})();

	return initPromise;
}

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
		await initModules();
		const buffer = await file.arrayBuffer();

		// 1. Decode
		let imageData;
		const meta = { width: 0, height: 0, format: file.type };

		switch (file.type) {
			case "image/jpeg":
				imageData = await decodeJpeg.default(buffer);
				break;
			case "image/png":
				imageData = await decodePng.default(buffer);
				break;
			case "image/webp":
				imageData = await decodeWebp.default(buffer);
				break;
			case "image/avif":
				imageData = await decodeAvif.default(buffer);
				break;
			default:
				throw new Error("Unsupported format for decoding");
		}

		meta.width = imageData.width;
		meta.height = imageData.height;

		// 2. Resize and Validate Dimensions
		// Calculate target dimensions based on scale
		let newWidth = Math.round(meta.width * (scale / 100));
		let newHeight = Math.round(meta.height * (scale / 100));

		// Constrain dimensions to MAX_OUTPUT_DIMENSION while maintaining aspect ratio
		if (newWidth > MAX_OUTPUT_DIMENSION || newHeight > MAX_OUTPUT_DIMENSION) {
			if (newWidth >= newHeight) {
				// Width is the larger dimension (or equal)
				newHeight = Math.round(newHeight * (MAX_OUTPUT_DIMENSION / newWidth));
				newWidth = MAX_OUTPUT_DIMENSION;
			} else {
				// Height is the larger dimension
				newWidth = Math.round(newWidth * (MAX_OUTPUT_DIMENSION / newHeight));
				newHeight = MAX_OUTPUT_DIMENSION;
			}
		}

		// Only resize if necessary (dimensions changed)
		if (newWidth !== meta.width || newHeight !== meta.height) {
			imageData = await resize.default(imageData, {
				width: newWidth,
				height: newHeight,
			});
		}

		// 3. Encode to WebP
		const webpBuffer = await encodeWebp.default(imageData, { quality });

		return new Response(webpBuffer, {
			headers: {
				"Content-Type": "image/webp",
				"Content-Length": String(webpBuffer.byteLength),
				"X-Original-Width": String(meta.width),
				"X-Original-Height": String(meta.height),
				"X-Converted-Width": String(imageData.width),
				"X-Converted-Height": String(imageData.height),
				"X-Original-Size": String(file.size),
				"X-Converted-Size": String(webpBuffer.byteLength),
				"X-Original-Format": meta.format || "unknown",
			},
		});
	} catch (err) {
		console.error("Image conversion failed:", err);
		return c.json(
			{ error: "Failed to process image", details: String(err) },
			500,
		);
	}
});

export { convertRoute };
// Trigger rebuild 2
