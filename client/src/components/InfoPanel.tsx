import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ConvertResult } from "../hooks/useConverter";

interface InfoPanelProps {
  result: ConvertResult;
  fileName?: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDimensions(w: number, h: number): string {
  return `${w.toLocaleString()} x ${h.toLocaleString()} px`;
}

export function InfoPanel({ result, fileName }: InfoPanelProps) {
  const {
    originalSize,
    convertedSize,
    originalWidth,
    originalHeight,
    convertedWidth,
    convertedHeight,
    originalFormat,
  } = result;

  const saved = originalSize - convertedSize;
  const ratio = originalSize > 0 ? (saved / originalSize) * 100 : 0;
  const isSmaller = saved > 0;
  const ratioAbs = Math.abs(ratio).toFixed(1);

  return (
    <Card className="overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <CardContent className="p-6 flex flex-col gap-5">
        {/* Ratio hero */}
        <div className="flex flex-col items-center gap-1 py-4 pt-2">
          <div
            className={cn(
              "flex items-baseline leading-none",
              isSmaller ? "text-emerald-500" : "text-amber-500"
            )}
          >
            <span className="text-2xl font-bold mr-0.5">
              {isSmaller ? "-" : "+"}
            </span>
            <span className="text-5xl sm:text-6xl font-bold tabular-nums tracking-tight">
              {ratioAbs}
            </span>
            <span className="text-2xl font-bold ml-0.5">%</span>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {isSmaller
              ? `Saved ${formatBytes(saved)}`
              : `Grew by ${formatBytes(Math.abs(saved))}`}
          </p>
        </div>

        <Separator />

        {/* Stats grid */}
        <dl className="flex flex-col gap-3">
          <StatRow
            label="変換前"
            left={formatBytes(originalSize)}
            right={formatDimensions(originalWidth, originalHeight)}
            badge={originalFormat.toUpperCase()}
            badgeVariant="neutral"
          />
          <StatRow
            label="変換後"
            left={formatBytes(convertedSize)}
            right={formatDimensions(convertedWidth, convertedHeight)}
            badge="WebP"
            badgeVariant="accent"
          />
        </dl>

        {/* Size bar comparison */}
        <div className="flex flex-col gap-3" aria-hidden="true">
          <SizeBar
            label="変換前"
            bytes={originalSize}
            maxBytes={Math.max(originalSize, convertedSize)}
            variant="neutral"
          />
          <SizeBar
            label="変換後"
            bytes={convertedSize}
            maxBytes={Math.max(originalSize, convertedSize)}
            variant="accent"
          />
        </div>

        {fileName && (
          <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/10 rounded-md">
            <span
              className="flex items-center text-primary shrink-0"
              aria-hidden="true"
            >
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-sm font-mono text-muted-foreground truncate">
              {fileName.replace(/\.[^.]+$/, ".webp")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatRowProps {
  label: string;
  left: string;
  right: string;
  badge: string;
  badgeVariant: "neutral" | "accent";
}

function StatRow({ label, left, right, badge, badgeVariant }: StatRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <dt className="text-xs font-semibold tracking-wider text-muted-foreground min-w-[60px] uppercase">
        {label}
      </dt>
      <dd className="flex items-center gap-2 flex-wrap justify-end flex-1">
        <Badge
          variant={badgeVariant === "accent" ? "secondary" : "outline"}
          className={cn(
            "font-mono text-[10px] px-1.5 py-0.5 h-auto tracking-wider",
            badgeVariant === "accent"
              ? "text-primary bg-primary/10 border-primary/20"
              : "text-muted-foreground bg-muted/50"
          )}
        >
          {badge}
        </Badge>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {left}
        </span>
        <span className="text-xs text-muted-foreground" aria-hidden="true">
          ·
        </span>
        <span className="text-xs font-mono text-muted-foreground tabular-nums">
          {right}
        </span>
      </dd>
    </div>
  );
}

interface SizeBarProps {
  label: string;
  bytes: number;
  maxBytes: number;
  variant: "neutral" | "accent";
}

function SizeBar({ label, bytes, maxBytes, variant }: SizeBarProps) {
  const pct = maxBytes > 0 ? Math.max(4, (bytes / maxBytes) * 100) : 0;
  return (
    <div className="grid grid-cols-[60px_1fr_auto] items-center gap-3">
      <span className="text-xs font-medium text-muted-foreground text-right">
        {label}
      </span>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variant === "accent" ? "bg-primary" : "bg-muted-foreground/30"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono tabular-nums text-muted-foreground min-w-[52px] text-right">
        {formatBytes(bytes)}
      </span>
    </div>
  );
}
