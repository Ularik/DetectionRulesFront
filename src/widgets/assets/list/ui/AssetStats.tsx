import type { ReactNode } from "react";
import { AlertTriangle, Check, LayoutGrid, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

function StatCard({
  icon,
  iconClass,
  value,
  label,
  hint,
}: {
  icon: ReactNode;
  iconClass: string;
  value: number | string;
  label: string;
  hint?: string;
}) {
  return (
    <div
      title={hint}
      className="flex items-center gap-4 rounded-2xl border border-line bg-white px-5 py-4 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.06)]"
    >
      <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-full", iconClass)}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-2xl leading-tight font-semibold text-ink tabular-nums">{value}</p>
        <p className="truncate text-sm text-ink-muted">{label}</p>
      </div>
    </div>
  );
}

const format = (value: number | undefined) => (value === undefined ? "—" : value.toLocaleString("ru-RU"));

export function AssetStats({
  total,
  active,
  attention,
  inactive,
}: {
  total?: number;
  active?: number;
  attention?: number;
  inactive?: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={<LayoutGrid className="size-6" />}
        iconClass="bg-[#e0edff] text-[#2563eb]"
        value={format(total)}
        label="Всего активов"
      />
      <StatCard
        icon={<Check className="size-6" strokeWidth={3} />}
        iconClass="bg-[#dcfce7] text-[#16a34a]"
        value={format(active)}
        label="Активных"
      />
      <StatCard
        icon={<AlertTriangle className="size-6" />}
        iconClass="bg-[#fef3c7] text-[#d97706]"
        value={format(attention)}
        label="Требуют внимания"
        hint="Активные активы без организации или без указанного типа"
      />
      <StatCard
        icon={<X className="size-6" strokeWidth={3} />}
        iconClass="bg-[#fee2e2] text-[#dc2626]"
        value={format(inactive)}
        label="Неактивных"
      />
    </div>
  );
}
