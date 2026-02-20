export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

export function formatPercent(original: number, converted: number): string {
  if (original === 0) return "0%";
  const diff = original - converted;
  const pct = (diff / original) * 100;
  if (pct >= 0) return `-${pct.toFixed(1)}%`;
  return `+${Math.abs(pct).toFixed(1)}%`;
}
