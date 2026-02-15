declare module "*.wasm" {
	const module: WebAssembly.Module;
	export default module;
}

declare module "@jsquash/png/codec/squoosh_png_bg.wasm" {
	const module: WebAssembly.Module;
	export default module;
}

declare module "@jsquash/resize/lib/resize/pkg/squoosh_resize_bg.wasm" {
	const module: WebAssembly.Module;
	export default module;
}
declare module "@jsquash/jpeg/decode.js" {
	export function init(wasm: ArrayBuffer | WebAssembly.Module): Promise<void>;
	export default function decode(data: ArrayBuffer): Promise<{
		data: Uint8ClampedArray;
		width: number;
		height: number;
	}>;
}

declare module "@jsquash/png/decode.js" {
	export function init(wasm: ArrayBuffer | WebAssembly.Module): Promise<void>;
	export default function decode(data: ArrayBuffer): Promise<{
		data: Uint8ClampedArray;
		width: number;
		height: number;
	}>;
}

declare module "@jsquash/webp/decode.js" {
	export function init(wasm: ArrayBuffer | WebAssembly.Module): Promise<void>;
	export default function decode(data: ArrayBuffer): Promise<{
		data: Uint8ClampedArray;
		width: number;
		height: number;
	}>;
}

declare module "@jsquash/avif/decode.js" {
	export function init(wasm: ArrayBuffer | WebAssembly.Module): Promise<void>;
	export default function decode(data: ArrayBuffer): Promise<{
		data: Uint8ClampedArray;
		width: number;
		height: number;
	}>;
}

declare module "@jsquash/webp/encode.js" {
	export function init(wasm: ArrayBuffer | WebAssembly.Module): Promise<void>;
	export default function encode(
		imageData: {
			data: Uint8ClampedArray;
			width: number;
			height: number;
		},
		options?: { quality?: number },
	): Promise<ArrayBuffer>;
}

declare module "@jsquash/resize" {
	export function initResize(
		wasm: ArrayBuffer | WebAssembly.Module,
	): Promise<void>;
	export default function resize(
		imageData: {
			data: Uint8ClampedArray;
			width: number;
			height: number;
		},
		options: { width: number; height: number },
	): Promise<{
		data: Uint8ClampedArray;
		width: number;
		height: number;
	}>;
}
