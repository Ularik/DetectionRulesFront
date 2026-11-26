import { AlertTriangle, CheckCircle2, CircleSlash, XCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { DATA_QUALITY_LEVEL_LABELS, type DataQualityLevel } from "@/entities/data-quality";

const badgeClass =
  "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium whitespace-nowrap";

/** Статус источника из справочника /sources (вкл/выкл); null — источника нет в справочнике */
export function SourceStateBadge({ enabled }: { enabled: boolean | null }) {
  if (enabled === null) {
    return <span className={cn(badgeClass, "bg-line-muted text-ink-muted")}>Не в справочнике</span>;
  }
  return enabled ? (
    <span className={cn(badgeClass, "bg-[#dcfce7] text-[#15803d]")}>
      <CheckCircle2 className="size-3.5" />
      Активен
    </span>
  ) : (
    <span className={cn(badgeClass, "bg-line-muted text-ink-muted")}>
      <CircleSlash className="size-3.5" />
      Отключён
    </span>
  );
}

// Статус качества — всегда иконка + подпись, не только цвет
const LEVEL_STYLES: Record<DataQualityLevel, { className: string; icon: typeof CheckCircle2 }> = {
  good: { className: "bg-[#dcfce7] text-[#15803d]", icon: CheckCircle2 },
  warning: { className: "bg-[#fef3c7] text-[#b45309]", icon: AlertTriangle },
  error: { className: "bg-[#fee2e2] text-[#b91c1c]", icon: XCircle },
  empty: { className: "bg-line-muted text-ink-muted", icon: CircleSlash },
};

export function QualityLevelBadge({ level }: { level: DataQualityLevel }) {
  const { className, icon: Icon } = LEVEL_STYLES[level];
  return (
    <span className={cn(badgeClass, className)}>
      <Icon className="size-3.5" />
      {DATA_QUALITY_LEVEL_LABELS[level]}
    </span>
  );
}
