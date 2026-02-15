import { useCallback, useEffect, useRef, useState } from "react";

export interface ConvertResult {
  previewUrl: string;
  originalSize: number;
  convertedSize: number;
  originalWidth: number;
  originalHeight: number;
  convertedWidth: number;
  convertedHeight: number;
  originalFormat: string;
}

interface UseConverterReturn {
  file: File | null;
  originalPreviewUrl: string | null;
  result: ConvertResult | null;
  quality: number;
  scale: number;
  loading: boolean;
  error: string | null;
  setFile: (file: File | null) => void;
  setQuality: (q: number) => void;
  setScale: (s: number) => void;
  download: () => void;
}

const DEBOUNCE_MS = 400;

export function useConverter(): UseConverterReturn {
  const [file, setFileState] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(
    null
  );
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [quality, setQuality] = useState(80);
  const [scale, setScale] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const abortController = useRef<AbortController>(null);
  const resultBlobUrl = useRef<string | null>(null);
  const originalBlobUrl = useRef<string | null>(null);
  const isMounted = useRef(true);

  const convert = useCallback(
    async (targetFile: File, q: number, s: number) => {
      abortController.current?.abort();
      const controller = new AbortController();
      abortController.current = controller;

      setLoading(true);
      setError(null);

      try {
        const form = new FormData();
        form.append("image", targetFile);
        form.append("quality", String(q));
        form.append("scale", String(s));

        const res = await fetch("/api/convert", {
          method: "POST",
          body: form,
          signal: controller.signal,
        });

        if (!res.ok) {
          let message = "Conversion failed";
          try {
            const json = await res.json();
            message = json.error || message;
          } catch {
            // Non-JSON response (proxy error, etc.)
          }
          throw new Error(message);
        }

        const blob = await res.blob();

        if (resultBlobUrl.current) {
          URL.revokeObjectURL(resultBlobUrl.current);
        }
        const previewUrl = URL.createObjectURL(blob);
        resultBlobUrl.current = previewUrl;

        setResult({
          previewUrl,
          originalSize: Number(res.headers.get("X-Original-Size")),
          convertedSize: Number(res.headers.get("X-Converted-Size")),
          originalWidth: Number(res.headers.get("X-Original-Width")),
          originalHeight: Number(res.headers.get("X-Original-Height")),
          convertedWidth: Number(res.headers.get("X-Converted-Width")),
          convertedHeight: Number(res.headers.get("X-Converted-Height")),
          originalFormat: res.headers.get("X-Original-Format") || "unknown",
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    []
  );

  const debouncedConvert = useCallback(
    (targetFile: File, q: number, s: number) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(
        () => convert(targetFile, q, s),
        DEBOUNCE_MS
      );
    },
    [convert]
  );

  const setFile = useCallback((f: File | null) => {
    setFileState(f);
    setResult(null);
    setError(null);
    if (f) {
      if (originalBlobUrl.current) URL.revokeObjectURL(originalBlobUrl.current);
      const url = URL.createObjectURL(f);
      originalBlobUrl.current = url;
      setOriginalPreviewUrl(url);
    } else {
      if (originalBlobUrl.current) URL.revokeObjectURL(originalBlobUrl.current);
      originalBlobUrl.current = null;
      setOriginalPreviewUrl(null);
    }
  }, []);

  // Trigger conversion when file, quality, or scale changes
  useEffect(() => {
    if (file) debouncedConvert(file, quality, scale);
  }, [quality, scale, file, debouncedConvert]);

  const download = useCallback(() => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.previewUrl;
    a.download = file
      ? file.name.replace(/\.[^.]+$/, ".webp")
      : "converted.webp";
    a.click();
  }, [result, file]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (resultBlobUrl.current) URL.revokeObjectURL(resultBlobUrl.current);
      if (originalBlobUrl.current) URL.revokeObjectURL(originalBlobUrl.current);
      abortController.current?.abort();
    };
  }, []);

  return {
    file,
    originalPreviewUrl,
    result,
    quality,
    scale,
    loading,
    error,
    setFile,
    setQuality,
    setScale,
    download,
  };
}
