import { Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UploadAreaProps {
  onFile: (file: File) => void;
}

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/webp",
  "image/avif",
];

export function UploadArea({ onFile }: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) return;
      onFile(file);
    },
    [onFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );



  return (
    <button
      type="button"
      className={cn(
        "relative flex flex-col items-center justify-center gap-5 p-12 py-16 cursor-pointer select-none transition-all duration-300 border-2 border-dashed rounded-xl bg-card hover:bg-accent/50 hover:border-primary/50 shadow-sm hover:shadow-md w-full",
        isDragOver
          ? "bg-accent/10 border-primary shadow-[0_0_0_4px_rgba(var(--primary),0.1)] scale-[1.01]"
          : "border-border"
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      aria-label="Upload image — click or drag and drop"
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={onInputChange}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="shrink-0">
        <div
          className={cn(
            "flex items-center justify-center w-[72px] h-[72px] rounded-full bg-secondary border border-border transition-all duration-300 group-hover:bg-primary/10 group-hover:border-primary/40",
            isDragOver && "bg-primary/10 border-primary shadow-glow"
          )}
        >
          <Upload
            className={cn(
              "w-8 h-8 text-primary transition-all duration-300",
              isDragOver
                ? "text-primary scale-110"
                : "text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5"
            )}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-lg font-semibold text-foreground">
          {isDragOver ? "Drop to upload" : "Drop image here"}
        </p>
        <p className="text-sm text-muted-foreground">
          or{" "}
          <span className="text-primary font-medium hover:underline underline-offset-2">
            browse files
          </span>
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {["JPEG", "PNG", "GIF", "BMP", "TIFF", "AVIF", "WebP"].map((fmt) => (
          <Badge
            key={fmt}
            variant="secondary"
            className="font-mono text-xs font-medium text-muted-foreground bg-secondary/50 border-border hover:border-primary/50 hover:text-foreground transition-colors"
          >
            {fmt}
          </Badge>
        ))}
      </div>
    </button>
  );
}
