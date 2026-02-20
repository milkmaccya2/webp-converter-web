import {
  AlertCircle,
  FileImage,
  Image as ImageIcon,
  Loader2,
  X,
} from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ControlPanel } from "./components/ControlPanel";
import { DownloadButton } from "./components/DownloadButton";
import { InfoPanel } from "./components/InfoPanel";
import { Preview } from "./components/Preview";
import { UploadArea } from "./components/UploadArea";
import { useConverter } from "./hooks/useConverter";

export default function App() {
  const {
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
  } = useConverter();

  const handleFile = useCallback((f: File) => setFile(f), [setFile]);

  const handleReset = useCallback(() => setFile(null), [setFile]);

  const hasImage = Boolean(file || originalPreviewUrl);

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans antialiased text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-tight">
                WebP Converter
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 py-12 px-4 md:px-6">
        <div className="container mx-auto max-w-5xl space-y-10 animate-in fade-in duration-500 slide-in-from-bottom-4">
          {/* Upload area */}
          {!hasImage && (
            <section aria-label="Upload" className="max-w-3xl mx-auto w-full">
              <UploadArea onFile={handleFile} />
            </section>
          )}

          {/* Workspace (shown after upload) */}
          {hasImage && (
            <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500">
              {/* Top bar with file name + reset */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-3 px-5 bg-card/50 backdrop-blur-sm border rounded-xl shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="flex items-center text-primary shrink-0"
                    aria-hidden="true"
                  >
                    <FileImage className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-mono text-muted-foreground truncate max-w-[200px] md:max-w-[400px]">
                    {file?.name ?? "image"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 md:h-9 hover:text-destructive hover:bg-destructive/10"
                  aria-label="画像を削除してやり直す"
                >
                  <X className="w-4 h-4 mr-2" />
                  削除
                </Button>
              </div>

              {/* Preview */}
              <section aria-label="Image preview">
                <Preview
                  originalUrl={originalPreviewUrl}
                  convertedUrl={result?.previewUrl ?? null}
                  originalName={
                    file?.name?.split(".").pop()?.toUpperCase() ?? ""
                  }
                  convertedName="WebP"
                  loading={loading}
                />
              </section>

              {/* Error */}
              {error && (
                <div
                  className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg"
                  role="alert"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Bottom section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Controls */}
                <section className="h-full" aria-label="Conversion settings">
                  <Card className="h-full">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                        Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ControlPanel
                        quality={quality}
                        scale={scale}
                        onQualityChange={setQuality}
                        onScaleChange={setScale}
                      />
                    </CardContent>
                  </Card>
                </section>

                {/* Info + Download */}
                <div className="flex flex-col gap-4">
                  {result && (
                    <>
                      <section aria-label="File statistics">
                        <InfoPanel result={result} fileName={file?.name} />
                      </section>
                      <DownloadButton
                        onClick={download}
                        disabled={loading}
                        fileName={file?.name}
                      />
                    </>
                  )}
                  {!result && !loading && !error && (
                    <Card className="flex flex-col items-center justify-center gap-4 py-12 bg-muted/30 border-dashed shadow-none">
                      <div
                        className="text-muted-foreground animate-pulse"
                        aria-hidden="true"
                      >
                        <Loader2 className="w-8 h-8 opacity-50" />
                      </div>
                      <p className="text-sm text-muted-foreground">変換待ち…</p>
                    </Card>
                  )}
                  {loading && !result && (
                    <Card className="flex flex-col items-center justify-center gap-4 py-12 bg-muted/30 border-dashed shadow-none">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">
                        画像を変換中…
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t bg-muted/20">
        <p className="text-xs text-muted-foreground">
          変換はブラウザ上でのみ行われます。画像がサーバーに送信されることはありません。
        </p>
      </footer>
    </div>
  );
}
