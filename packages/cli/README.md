# webp-convert

CLI tool to batch convert images to WebP format using [sharp](https://sharp.pixelplumbing.com/).

## Install

```bash
npm install -g webp-convert
```

Or run without installing:

```bash
npx webp-convert <inputs...>
```

## Usage

```
webp-convert [options] <inputs...>

Arguments:
  inputs                  input files, glob patterns, or directories

Options:
  -q, --quality <number>  quality (1-100) (default: "80")
  -s, --scale <number>    scale percentage (1-200) (default: "100")
  -o, --output <path>     output directory or file path
  --lossless              use lossless compression
  -V, --version           output the version number
  -h, --help              display help for command
```

## Examples

**Single file:**
```bash
webp-convert photo.jpg
webp-convert photo.jpg -q 90 -o output.webp
```

**Multiple files:**
```bash
webp-convert img1.jpg img2.jpg img3.jpg -o ./dist/
```

**Glob patterns:**
```bash
webp-convert "images/*.jpg" -q 75 -o ./webp/
webp-convert "**/*.png" "**/*.jpg" -o ./out/
```

**Directory:**
```bash
webp-convert ./photos/ -o ./webp-photos/
webp-convert ./photos/ ./raw/ -s 50 -q 85
```

**Lossless + resize:**
```bash
webp-convert screenshot.png --lossless -s 50
```

## Output

```
[1/3] Converting photo1.jpg... Done
  Output: ./webp/photo1.webp
  Size:   2.40MB → 540.2KB (-77.8%)
  Dims:   3024x4032 → 3024x4032
[2/3] Converting photo2.jpg... Done
  ...

Summary: 3 converted, 0 failed
Total:   7.20MB → 1.62MB (-77.5%)
```

## Supported formats

Input: JPEG, PNG, GIF, BMP, TIFF, AVIF, WebP

## License

MIT
