import { ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PreviewProps {
  originalUrl: string | null;
  convertedUrl: string | null;
  originalName?: string;
  convertedName?: string;
  loading?: boolean;
}

export function Preview({
  originalUrl,
  convertedUrl,
  originalName = "Original",
  convertedName = "WebP",
  loading = false,
}: PreviewProps) {
  if (!originalUrl) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-0 items-stretch animate-in fade-in duration-700">
      <PreviewPane
        url={originalUrl}
        label="変換前"
        badgeText={originalName}
        badgeVariant="neutral"
      />

      {/* Divider */}
      <div className="flex md:flex-col flex-row items-center justify-center p-2 md:pt-8 md:p-0 gap-0 md:w-12 shrink-0">
        <div className="flex-1 w-full md:w-px h-px md:h-auto bg-linear-to-r md:bg-linear-to-b from-transparent via-border to-transparent" />
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-card border border-border text-primary shrink-0 md:rotate-0 rotate-90">
          <ArrowRight className="w-4 h-4" />
        </div>
        <div className="flex-1 w-full md:w-px h-px md:h-auto bg-linear-to-l md:bg-linear-to-b from-transparent md:from-border via-border md:via-border to-transparent md:to-transparent" />
      </div>

      <PreviewPane
        url={convertedUrl}
        label="変換後"
        badgeText={convertedName}
        badgeVariant="accent"
        loading={loading}
      />
    </div>
  );
}

interface PaneProps {
  url: string | null;
  label: string;
  badgeText: string;
  badgeVariant: "neutral" | "accent";
  loading?: boolean;
}

function PreviewPane({
  url,
  label,
  badgeText,
  badgeVariant,
  loading,
}: PaneProps) {
  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {label}
        </span>
        <Badge
          variant={badgeVariant === "accent" ? "secondary" : "outline"}
          className={cn(
            "font-mono text-xs font-medium tracking-wide",
            badgeVariant === "accent"
              ? "text-primary bg-primary/10 border-primary/30"
              : "text-muted-foreground bg-muted/50"
          )}
        >
          {badgeText}
        </Badge>
      </div>

      <div className="relative aspect-4/3 flex items-center justify-center rounded-lg border border-border overflow-hidden bg-muted/30">
        {/* Checkered background */}
        <div
          className="absolute inset-0 z-0 opacity-50"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #80808020 25%, transparent 25%), 
              linear-gradient(-45deg, #80808020 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #80808020 75%), 
              linear-gradient(-45deg, transparent 75%, #80808020 75%)
            `,
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
          }}
        />

        {loading ? (
          <div className="relative z-10 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground animate-pulse">
              Converting...
            </span>
          </div>
        ) : url ? (
          <img
            src={url}
            alt={`${label} preview`}
            className="relative z-10 block max-w-full max-h-full object-contain transition-opacity duration-300"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="flex gap-2">
              <span
                className="w-2 h-2 rounded-full bg-border animate-bounce"
                style={{ animationDelay: "0s" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-border animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-border animate-bounce"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              Awaiting conversion
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
