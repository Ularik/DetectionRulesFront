import { cn } from "@/shared/lib/utils";

// Зелёный бейдж «Активна» — по макету; для отключённой организации — красный
export function OrganizationStatusBadge({
  enabled,
  className,
}: {
  enabled: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-[93px] justify-center rounded-[10px] border text-sm leading-[16px] text-ink",
        enabled ? "border-[#92db97] bg-[#b7e9ba]" : "border-[#f5b5b5] bg-[#fde2e2]",
        className,
      )}
    >
      {enabled ? "Активна" : "Отключена"}
    </span>
  );
}
