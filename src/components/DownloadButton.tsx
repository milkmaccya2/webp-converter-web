import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadButtonProps {
  onClick: () => void;
  disabled?: boolean;
  fileName?: string;
}

export function DownloadButton({
  onClick,
  disabled = false,
  fileName,
}: DownloadButtonProps) {
  const label = fileName
    ? `Download ${fileName.replace(/\.[^.]+$/, ".webp")}`
    : "Download WebP";

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="w-full gap-2 text-base font-semibold shadow-lg hover:translate-y-[-2px] hover:shadow-xl transition-all active:translate-y-0"
      size="lg"
    >
      <Download className="h-5 w-5" />
      {label}
    </Button>
  );
}
