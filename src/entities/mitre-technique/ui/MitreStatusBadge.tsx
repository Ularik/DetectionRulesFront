import { cn } from "@/shared/lib/utils";
import type { MitreTechniqueStatus } from "../model/status";

// Цвета бейджей — по фрейму «MITRE ATTACK» макета CERT-KG SIEM (Figma 608:9871)
const statusStyles: Record<MitreTechniqueStatus, { label: string; className: string }> = {
  active: { label: "Активна", className: "border-[#92db97] bg-[#b7e9ba] text-ink" },
  revoked: { label: "Отозвана", className: "border-[#94a3b8]/25 bg-[#abb6c7] text-black" },
  deprecated: { label: "Устарела", className: "border-amber-300 bg-amber-100 text-amber-900" },
};

export function MitreStatusBadge({
  status,
  className,
}: {
  status: MitreTechniqueStatus;
  className?: string;
}) {
  const style = statusStyles[status];
  return (
    <span
      className={cn(
        "inline-flex w-[93px] justify-center rounded-[10px] border text-sm leading-[16px]",
        style.className,
        className,
      )}
    >
      {style.label}
    </span>
  );
}
