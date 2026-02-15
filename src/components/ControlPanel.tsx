import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ControlPanelProps {
  quality: number;
  scale: number;
  onQualityChange: (q: number) => void;
  onScaleChange: (s: number) => void;
}

const SCALE_PRESETS = [25, 50, 75, 100] as const;

export function ControlPanel({
  quality,
  scale,
  onQualityChange,
  onScaleChange,
}: ControlPanelProps) {
  const qualityLabel =
    quality >= 90
      ? "Lossless-like"
      : quality >= 70
        ? "High Quality"
        : quality >= 50
          ? "Balanced"
          : quality >= 30
            ? "Compressed"
            : "Maximum Compression";

  const getQualityColorClass = (q: number) => {
    if (q >= 80) return "text-emerald-500";
    if (q >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const colorClass = getQualityColorClass(quality);

  return (
    <div className="flex flex-col gap-6">
      {/* Quality */}
      <section className="flex flex-col gap-4" aria-labelledby="quality-label">
        <div className="flex justify-between items-center">
          <label
            id="quality-label"
            className="text-sm font-semibold text-muted-foreground tracking-wider uppercase"
            htmlFor="quality-slider"
          >
            Quality
          </label>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "text-xs font-medium transition-colors",
                colorClass
              )}
            >
              {qualityLabel}
            </span>
            <span className="text-2xl font-bold tabular-nums leading-none min-w-[2.5ch] text-right">
              {quality}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className={cn("relative w-full", colorClass)}>
            {/* We override the slider variable colors by using CSS variables scope or specific class overrides if needed.
                 Standard shadcn slider uses bg-primary. We can use [&>span:first-child]:bg-current to target the range. */}
            <Slider
              id="quality-slider"
              value={[quality]}
              min={1}
              max={100}
              step={1}
              onValueChange={(vals) => onQualityChange(vals[0])}
              className={cn(
                "[&_.absolute]:bg-current [&_.block]:border-current [&_.block]:shadow-sm", // Target range and thumb
                colorClass
              )}
              aria-label="Quality"
            />
          </div>
          <div className="flex justify-between px-0.5">
            {[1, 25, 50, 75, 100].map((tick) => (
              <span
                key={tick}
                className="text-xs text-muted-foreground tabular-nums select-none"
              >
                {tick}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Scale */}
      <section className="flex flex-col gap-4" aria-labelledby="scale-label">
        <div className="flex justify-between items-center">
          <span
            id="scale-label"
            className="text-sm font-semibold text-muted-foreground tracking-wider uppercase"
          >
            Output Scale
          </span>
          <span className="text-xl font-bold tabular-nums leading-none">
            {scale}%
          </span>
        </div>

        <div
          className="grid grid-cols-4 gap-2"
          role="radiogroup"
          aria-labelledby="scale-label"
        >
          {SCALE_PRESETS.map((preset) => (
            <Button
              key={preset}
              variant={scale === preset ? "secondary" : "outline"}
              size="sm"
              onClick={() => onScaleChange(preset)}
              className={cn(
                "font-mono h-10 transition-all",
                scale === preset &&
                  "bg-primary/10 text-primary hover:bg-primary/20 border-primary/30"
              )}
            >
              {preset}%
            </Button>
          ))}
        </div>

        {/* Custom scale input */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="custom-scale"
            className="text-sm text-muted-foreground whitespace-nowrap"
          >
            Custom:
          </label>
          <div className="relative flex items-center flex-1 max-w-[100px]">
            <Input
              id="custom-scale"
              type="number"
              min={1}
              max={200}
              key={scale} // Force re-render on scale change from external to reset default value if needed, or controlled?
              // defaultValue={scale} // User used defaultValue.
              value={scale} // Let's make it controlled or use local state + effect if we want to avoid cursor jumps.
              // Actually User code used defaultValue and onBlur.
              // Let's stick to user logic but adapted to Input.
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!Number.isNaN(v)) {
                  // We probably shouldn't trigger onScaleChange on every keystroke if it's too fast, but Input is fine.
                  // Original code used defaultValue + onBlur/Enter.
                  // The requirement is "Migrate".
                }
              }}
              onBlur={(e) => {
                const v = Math.min(
                  200,
                  Math.max(1, Number(e.target.value) || 100)
                );
                onScaleChange(v);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = Math.min(
                    200,
                    Math.max(1, Number(e.currentTarget.value) || 100)
                  );
                  onScaleChange(v);
                  e.currentTarget.blur();
                }
              }}
              className="h-9 pr-8 font-mono font-medium text-right tabular-nums"
              placeholder="100"
            />
            <span className="absolute right-3 text-sm text-muted-foreground pointer-events-none">
              %
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
