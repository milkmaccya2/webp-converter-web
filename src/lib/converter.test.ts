import * as decodeJpeg from "@jsquash/jpeg/decode.js";
import * as decodePng from "@jsquash/png/decode.js";
import * as resize from "@jsquash/resize";
import * as encodeWebp from "@jsquash/webp/encode.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { convertImage, initModules } from "./converter";

// Mock the Wasm modules
vi.mock("@jsquash/avif/decode.js", () => ({ default: vi.fn(), init: vi.fn() }));
vi.mock("@jsquash/jpeg/decode.js", () => ({ default: vi.fn(), init: vi.fn() }));
vi.mock("@jsquash/png/decode.js", () => ({ default: vi.fn(), init: vi.fn() }));
vi.mock("@jsquash/resize", () => ({ default: vi.fn(), initResize: vi.fn() }));
vi.mock("@jsquash/webp/decode.js", () => ({ default: vi.fn(), init: vi.fn() }));
vi.mock("@jsquash/webp/encode.js", () => ({ default: vi.fn(), init: vi.fn() }));

// Mock Wasm URLs
vi.mock("@jsquash/avif/codec/dec/avif_dec.wasm?url", () => ({
	default: "avif_wasm_url",
}));
vi.mock("@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm?url", () => ({
	default: "jpeg_wasm_url",
}));
vi.mock("@jsquash/png/codec/squoosh_png_bg.wasm?url", () => ({
	default: "png_wasm_url",
}));
vi.mock("@jsquash/resize/lib/resize/pkg/squoosh_resize_bg.wasm?url", () => ({
	default: "resize_wasm_url",
}));
vi.mock("@jsquash/webp/codec/dec/webp_dec.wasm?url", () => ({
	default: "webp_dec_wasm_url",
}));
vi.mock("@jsquash/webp/codec/enc/webp_enc.wasm?url", () => ({
	default: "webp_enc_wasm_url",
}));

describe("converter", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize modules", async () => {
		await initModules();
		expect(decodeJpeg.init).toHaveBeenCalled();
		expect(decodePng.init).toHaveBeenCalled();
		// Check others as needed
	});

	it("should convert jpeg image correctly", async () => {
		const file = new File(["dummy content"], "test.jpg", {
			type: "image/jpeg",
		});
		const mockImageData = {
			width: 100,
			height: 100,
			data: new Uint8ClampedArray(),
		} as ImageData;
		const mockWebpBuffer = new ArrayBuffer(10);

		vi.mocked(decodeJpeg.default).mockResolvedValue(mockImageData);
		vi.mocked(encodeWebp.default).mockResolvedValue(mockWebpBuffer);

		const result = await convertImage(file, { quality: 80, scale: 100 });

		expect(decodeJpeg.default).toHaveBeenCalled();
		expect(encodeWebp.default).toHaveBeenCalledWith(mockImageData, {
			quality: 80,
		});
		expect(result.buffer).toBe(mockWebpBuffer);
		expect(result.originalWidth).toBe(100);
		expect(result.convertedWidth).toBe(100);
	});

	it("should resize image when scale is provided", async () => {
		const file = new File(["dummy"], "test.png", { type: "image/png" });
		const srcImageData = { width: 100, height: 100 } as ImageData;
		const resizedImageData = { width: 50, height: 50 } as ImageData;

		vi.mocked(decodePng.default).mockResolvedValue(srcImageData);
		vi.mocked(resize.default).mockResolvedValue(resizedImageData);
		vi.mocked(encodeWebp.default).mockResolvedValue(new ArrayBuffer(1));

		await convertImage(file, { quality: 80, scale: 50 });

		expect(resize.default).toHaveBeenCalledWith(srcImageData, {
			width: 50,
			height: 50,
		});
	});

	it("should constrain dimensions to MAX_OUTPUT_DIMENSION", async () => {
		// Mock MAX_OUTPUT_DIMENSION is 8000 in source, we test logic
		const file = new File(["dummy"], "large.png", { type: "image/png" });
		const hugeWidth = 10000;
		const hugeHeight = 5000;
		const srcImageData = { width: hugeWidth, height: hugeHeight } as ImageData;

		vi.mocked(decodePng.default).mockResolvedValue(srcImageData);
		vi.mocked(resize.default).mockResolvedValue({} as ImageData);
		vi.mocked(encodeWebp.default).mockResolvedValue(new ArrayBuffer(1));

		await convertImage(file, { quality: 80, scale: 100 });

		// Expected: Width constrained to 8000, Height scaled proportionally (4000)
		expect(resize.default).toHaveBeenCalledWith(srcImageData, {
			width: 8000,
			height: 4000,
		});
	});
});
