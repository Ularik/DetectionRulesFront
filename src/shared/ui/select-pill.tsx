"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

// Фильтр-«пилюля» из макетов CERT-KG SIEM: «Тип: Все ▾». Нативный select лежит прозрачным слоем поверх
export function SelectPill({
  label,
  value,
  display,
  onChange,
  icon,
  children,
}: {
  label: string;
  value: string;
  display: string;
  onChange: (value: string) => void;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-line bg-white pr-9 pl-3.5 text-sm text-ink focus-within:border-brand-light focus-within:ring-2 focus-within:ring-brand-light/20">
      {icon}
      <span className="text-ink-muted">{label}:</span>
      <span className={cn("max-w-[150px] truncate", value && "font-medium")}>{display}</span>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3 size-4 text-ink-muted" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`Фильтр: ${label}`}
        className="absolute inset-0 cursor-pointer appearance-none opacity-0"
      >
        {children}
      </select>
    </div>
  );
}
