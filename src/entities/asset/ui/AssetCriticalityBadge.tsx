import { cn } from "@/shared/lib/utils";
import { ASSET_CRITICALITY_LABELS } from "../config/labels";
import type { AssetCriticality } from "../model/types";

// Цвета по макету public/images/assets.jpeg: «Высокая» — розовая, «Низкая» — голубая
const CRITICALITY_STYLES: Record<AssetCriticality, string> = {
  low: "bg-[#dbeafe] text-[#1d4ed8]",
  medium: "bg-[#fef3c7] text-[#b45309]",
  high: "bg-[#fde2e2] text-[#dc2626]",
  critical: "bg-[#dc2626] text-white",
};

export function AssetCriticalityBadge({
  criticality,
  className,
}: {
  criticality: AssetCriticality;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[76px] justify-center rounded-lg px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        CRITICALITY_STYLES[criticality] ?? "bg-line-muted text-ink",
        className,
      )}
    >
      {ASSET_CRITICALITY_LABELS[criticality] ?? criticality}
    </span>
  );
}
