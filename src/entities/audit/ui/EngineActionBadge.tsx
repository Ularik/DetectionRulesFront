import {
  FlaskConical,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  ToggleLeft,
  Trash2,
  CircleDot,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ENGINE_ACTION_LABELS, type EngineActionKind } from "../config/engine";

// Бейджи действий по макету public/images/audit.jpeg — иконка + подпись, не только цвет
const STYLES: Record<EngineActionKind, { className: string; icon: LucideIcon }> = {
  create: { className: "bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]", icon: Plus },
  update: { className: "bg-[#fef9c3] text-[#854d0e] border-[#fde68a]", icon: Pencil },
  delete: { className: "bg-[#fee2e2] text-[#b91c1c] border-[#fecaca]", icon: Trash2 },
  enable: { className: "bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]", icon: Power },
  disable: { className: "bg-[#fee2e2] text-[#dc2626] border-[#fecaca]", icon: Power },
  status: { className: "bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]", icon: ToggleLeft },
  login: { className: "bg-[#dbeafe] text-[#1d4ed8] border-[#bfdbfe]", icon: LogIn },
  logout: { className: "bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]", icon: LogOut },
  test: { className: "bg-[#ede9fe] text-[#6d28d9] border-[#ddd6fe]", icon: FlaskConical },
  sync: { className: "bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]", icon: RefreshCw },
  other: { className: "bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]", icon: CircleDot },
};

export function EngineActionBadge({
  kind,
  label,
  className,
}: {
  kind: EngineActionKind;
  /** Своя подпись (например, исходное значение action для «other») */
  label?: string;
  className?: string;
}) {
  const { className: style, icon: Icon } = STYLES[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        style,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {label ?? ENGINE_ACTION_LABELS[kind]}
    </span>
  );
}
