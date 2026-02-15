// Polyfill ImageData for Cloudflare Workers
// This must be imported before any @jsquash modules
if (typeof ImageData === "undefined" || !globalThis.ImageData) {
	console.log("Polyfilling ImageData...");
	(globalThis as any).ImageData = class ImageData {
		data: Uint8ClampedArray;
		width: number;
		height: number;
		constructor(data: Uint8ClampedArray, width: number, height: number) {
			this.data = data;
			this.width = width;
			this.height = height;
		}
	};
} else {
	// Even if it exists, force it if it looks broken or generic?
	// Let's rely on the check above for now.
	console.log("ImageData is already defined:", typeof ImageData);
}
