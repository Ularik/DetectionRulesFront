"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { routes } from "@/shared/config";
import { CopyButton } from "@/shared/ui/copy-button";
import type { IocType } from "../model/types";
import { IocSeverityBadge } from "./IocSeverityBadge";

interface IocTableProps {
  items: IocType[];
  isLoading?: boolean;
  limit?: number;
  /** ioc_id открытого IOC: строка подсвечивается, таблица становится компактной */
  selectedId?: string | null;
}

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value || "—" : dateFormatter.format(date);
}

const headClass = "px-2 py-3 text-[13px] font-semibold whitespace-nowrap text-ink";
const cellClass = "px-2 py-2 text-sm font-normal text-ink";

// Стиль строк — как в таблице MITRE ATT&CK (Figma 608:9871); карточка IOC открывается справа
export function IocTable({ items, isLoading = false, limit = 10, selectedId }: IocTableProps) {
  const compact = Boolean(selectedId);
  const columnCount = compact ? 4 : 6;

  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-left", compact ? "min-w-[520px]" : "min-w-[900px]")}>
        <thead className="border-b border-line-muted bg-surface-muted">
          <tr>
            <th className={cn(headClass, "pl-4")}>IOC</th>
            <th className={headClass}>Тип</th>
            <th className={headClass}>Угроза</th>
            <th className={cn(headClass, compact && "pr-4")}>Критичность</th>
            {!compact && <th className={headClass}>Источник</th>}
            {!compact && <th className={cn(headClass, "pr-4")}>Последнее обнаружение</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-line-muted">
          {isLoading ? (
            Array.from({ length: limit }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                {Array.from({ length: columnCount }).map((__, cellIndex) => (
                  <td className="px-4 py-3" key={cellIndex}>
                    <div className="h-4 w-20 rounded bg-line-muted" />
                  </td>
                ))}
              </tr>
            ))
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className="px-4 py-14 text-center text-sm text-ink-muted">
                <ShieldAlert className="mx-auto mb-2 h-8 w-8 text-line" />
                IOC не найдены
              </td>
            </tr>
          ) : (
            items.map((item) => {
              const isSelected = item.ioc_id === selectedId;
              return (
                <tr
                  key={item.ioc_id}
                  aria-selected={isSelected || undefined}
                  className={cn(
                    "transition-colors",
                    isSelected ? "bg-brand-soft/40" : "hover:bg-surface-muted",
                  )}
                >
                  <td className={cn(cellClass, "max-w-[320px] py-1 pl-4")}>
                    <div className="flex items-center gap-1">
                      <Link
                        href={routes.iocEntry(item.ioc_id)}
                        scroll={false}
                        aria-current={isSelected ? "page" : undefined}
                        title={item.value}
                        className="min-w-0 truncate text-sm font-semibold text-[#1067c2] hover:underline"
                      >
                        {item.value}
                      </Link>
                      <CopyButton
                        value={item.value}
                        label={`Копировать ${item.ioc_type}`}
                        successMessage="IOC скопирован"
                      />
                    </div>
                  </td>
                  <td className={cn(cellClass, "whitespace-nowrap")}>{item.ioc_type}</td>
                  <td className={cn(cellClass, "whitespace-nowrap")}>{item.threat_type}</td>
                  <td className={cn(cellClass, "whitespace-nowrap", compact && "pr-4")}>
                    <IocSeverityBadge severity={item.severity} />
                  </td>
                  {!compact && (
                    <td className={cn(cellClass, "whitespace-nowrap")}>
                      {item.source}
                      {item.source_org && (
                        <span> · {item.source_org}</span>
                      )}
                    </td>
                  )}
                  {!compact && (
                    <td className={cn(cellClass, "pr-4 whitespace-nowrap")}>
                      {formatDate(item.last_seen_at)}
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
