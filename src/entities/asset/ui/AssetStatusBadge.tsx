import { cn } from "@/shared/lib/utils";

export function AssetStatusBadge({ enabled, className }: { enabled: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[76px] justify-center rounded-lg px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        enabled ? "bg-[#dcfce7] text-[#15803d]" : "bg-line-muted text-ink-muted",
        className,
      )}
    >
      {enabled ? "Активен" : "Неактивен"}
    </span>
  );
}
