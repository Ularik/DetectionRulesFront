import { cn } from "@/shared/lib/utils";

// Зелёный бейдж «Активен» — по макету; отключённый источник — серо-красный
export function SourceStatusBadge({
  enabled,
  className,
}: {
  enabled: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[70px] justify-center rounded-[10px] px-2 text-xs leading-[18px] font-medium text-ink",
        enabled ? "bg-[#b7e9ba]" : "bg-[#fde2e2] text-red-700",
        className,
      )}
    >
      {enabled ? "Активен" : "Отключён"}
    </span>
  );
}
