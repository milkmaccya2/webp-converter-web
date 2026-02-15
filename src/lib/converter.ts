import avifWasm from "@jsquash/avif/codec/dec/avif_dec.wasm?url";
import * as decodeAvif from "@jsquash/avif/decode.js";
import jpegWasm from "@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm?url";
import * as decodeJpeg from "@jsquash/jpeg/decode.js";
import pngWasm from "@jsquash/png/codec/squoosh_png_bg.wasm?url";
import * as decodePng from "@jsquash/png/decode.js";
import * as resize from "@jsquash/resize";
import resizeWasm from "@jsquash/resize/lib/resize/pkg/squoosh_resize_bg.wasm?url";
import webpDecWasm from "@jsquash/webp/codec/dec/webp_dec.wasm?url";
import webpEncWasm from "@jsquash/webp/codec/enc/webp_enc.wasm?url";
import * as decodeWebp from "@jsquash/webp/decode.js";
import * as encodeWebp from "@jsquash/webp/encode.js";

const MAX_OUTPUT_DIMENSION = 8000;

export interface ConversionOptions {
	quality: number;
	scale: number;
}

export interface ConversionResult {
	buffer: ArrayBuffer;
	originalWidth: number;
	originalHeight: number;
	convertedWidth: number;
	convertedHeight: number;
	originalSize: number;
	convertedSize: number;
	originalFormat: string;
}

// Initialize modules (Singleton Pattern)
// We use a lazy initialization to avoid loading Wasm on initial page load if not needed immediately
let initPromise: Promise<void> | null = null;

export async function initModules() {
	if (initPromise) return initPromise;

	initPromise = (async () => {
		try {
			await Promise.all([
				decodeJpeg.init(jpegWasm),
				decodePng.init(pngWasm),
				decodeWebp.init(webpDecWasm),
				decodeAvif.init(avifWasm),
				encodeWebp.init(webpEncWasm),
				resize.initResize(resizeWasm),
			]);
		} catch (e) {
			console.error("Error initializing Wasm modules", e);
			initPromise = null;
			throw e;
		}
	})();

	return initPromise;
}

export async function convertImage(
	file: File,
	options: ConversionOptions = { quality: 80, scale: 100 },
): Promise<ConversionResult> {
	await initModules();

	const buffer = await file.arrayBuffer();
	let imageData: ImageData;
	const meta = { width: 0, height: 0, format: file.type };

	try {
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
				throw new Error(`Unsupported format: ${file.type}`);
		}
	} catch (error) {
		throw new Error(`Failed to decode image: ${(error as Error).message}`);
	}

	meta.width = imageData.width;
	meta.height = imageData.height;

	// Calculate target dimensions
	let newWidth = Math.round(meta.width * (options.scale / 100));
	let newHeight = Math.round(meta.height * (options.scale / 100));

	// Constrain dimensions
	if (newWidth > MAX_OUTPUT_DIMENSION || newHeight > MAX_OUTPUT_DIMENSION) {
		if (newWidth >= newHeight) {
			newHeight = Math.round(newHeight * (MAX_OUTPUT_DIMENSION / newWidth));
			newWidth = MAX_OUTPUT_DIMENSION;
		} else {
			newWidth = Math.round(newWidth * (MAX_OUTPUT_DIMENSION / newHeight));
			newHeight = MAX_OUTPUT_DIMENSION;
		}
	}

	// Resize if necessary
	if (newWidth !== meta.width || newHeight !== meta.height) {
		imageData = await resize.default(imageData, {
			width: newWidth,
			height: newHeight,
		});
	}

	// Encode to WebP
	const webpBuffer = await encodeWebp.default(imageData, {
		quality: options.quality,
	});

	return {
		buffer: webpBuffer,
		originalWidth: meta.width,
		originalHeight: meta.height,
		convertedWidth: imageData.width,
		convertedHeight: imageData.height,
		originalSize: file.size,
		convertedSize: webpBuffer.byteLength,
		originalFormat: file.type,
	};
}
