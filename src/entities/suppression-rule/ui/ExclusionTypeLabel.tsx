import {
  Crosshair,
  FileSearch,
  FlaskConical,
  Globe,
  type LucideIcon,
  Monitor,
  Network,
  Plug,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { EXCLUSION_TYPE_LABELS, type ExclusionType } from "../lib/match";

const ICONS: Record<ExclusionType, LucideIcon> = {
  source_ip: ShieldCheck,
  destination_ip: Network,
  detection_rule: Crosshair,
  attack_type: Globe,
  category: FlaskConical,
  content: FileSearch,
  port: Plug,
  host: Monitor,
  none: ShieldQuestion,
};

/** «🛡 По источнику (IP)» — колонка «Тип исключения» из макета; iconOnly — для узкой таблицы, текст в подсказке */
export function ExclusionTypeLabel({
  type,
  iconOnly,
  className,
}: {
  type: ExclusionType;
  iconOnly?: boolean;
  className?: string;
}) {
  const Icon = ICONS[type];
  const label = EXCLUSION_TYPE_LABELS[type];
  return (
    <span className={cn("inline-flex items-center gap-2", className)} title={iconOnly ? label : undefined}>
      <Icon aria-hidden className="size-4 shrink-0 text-[#2165aa]" />
      <span className={cn(iconOnly && "sr-only")}>{label}</span>
    </span>
  );
}

/** «Активно» / «Отключено» — как в макете */
export function SuppressionStatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[78px] justify-center rounded-[10px] px-2 text-xs leading-[18px] font-medium",
        enabled ? "bg-[#b7e9ba] text-ink" : "bg-gray-200 text-gray-600",
      )}
    >
      {enabled ? "Активно" : "Отключено"}
    </span>
  );
}
