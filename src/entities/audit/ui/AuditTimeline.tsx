"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, History } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { UserType } from "@/entities/user/@x/audit";

// Компактная лента записей аудита — для узких панелей (история правила обнаружения / корреляции)

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  created: "Создано",
  updated: "Изменено",
  status_changed: "Статус изменён",
  deleted: "Удалено",
};

const ACTION_STYLES: Record<string, string> = {
  created: "bg-emerald-50 text-emerald-700 border-emerald-200",
  updated: "bg-amber-50 text-amber-700 border-amber-200",
  status_changed: "bg-sky-50 text-sky-700 border-sky-200",
  deleted: "bg-red-50 text-red-700 border-red-200",
};

// create → created, update → updated
export function normalizeAuditAction(action: string | null) {
  const key = action?.toLowerCase() ?? "";
  if (key in AUDIT_ACTION_LABELS) return key;
  if (`${key}d` in AUDIT_ACTION_LABELS) return `${key}d`;
  if (`${key}ed` in AUDIT_ACTION_LABELS) return `${key}ed`;
  return key;
}

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

/** Общее у записей аудита правил обнаружения и правил корреляции */
export interface AuditTimelineItem {
  id: string | number;
  action: string | null;
  author_id: string | number;
  author?: UserType | null;
  created_at: string | Date;
}

type Props<T extends AuditTimelineItem> = {
  items: T[];
  isLoading?: boolean;
  skeletonRows?: number;
  emptyText?: string;
  /** Запись — ссылка на отдельную страницу */
  getHref?: (item: T) => string;
  /** Запись раскрывается и показывает подробности (взаимоисключающе с getHref) */
  renderExpanded?: (item: T) => ReactNode;
};

export function AuditTimeline<T extends AuditTimelineItem>({
  items,
  isLoading = false,
  skeletonRows = 4,
  emptyText = "Изменений пока нет",
  getHref,
  renderExpanded,
}: Props<T>) {
  const [expanded, setExpanded] = useState<string | number | null>(null);

  if (isLoading) {
    return (
      <ul className="flex animate-pulse flex-col gap-2">
        {Array.from({ length: skeletonRows }).map((_, index) => (
          <li key={index} className="h-14 rounded-lg bg-line-muted" />
        ))}
      </ul>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-line px-4 py-8 text-center">
        <History className="size-6 text-ink-muted" />
        <p className="text-sm text-ink-muted">{emptyText}</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const action = normalizeAuditAction(item.action);
        const isOpen = expanded === item.id;
        const row = (
          <>
            <span
              className={cn(
                "shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-semibold",
                ACTION_STYLES[action] ?? "bg-gray-50 text-gray-700 border-gray-200",
              )}
            >
              {AUDIT_ACTION_LABELS[action] ?? (item.action || "—")}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] font-medium text-ink">
                {item.author?.username ?? `Пользователь #${item.author_id}`}
                {item.author?.role && (
                  <span className="ml-1.5 text-[11px] font-normal text-ink-muted">{item.author.role}</span>
                )}
              </span>
              <span className="text-[11px] text-ink-muted">{formatDate(item.created_at)}</span>
            </span>
            {renderExpanded ? (
              <ChevronDown
                className={cn("size-4 shrink-0 text-ink-muted transition-transform", isOpen && "rotate-180")}
              />
            ) : (
              <ChevronRight className="size-4 shrink-0 text-ink-muted" />
            )}
          </>
        );
        const rowClass =
          "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-muted";

        return (
          <li key={item.id} className="overflow-hidden rounded-lg border border-line">
            {getHref ? (
              <Link href={getHref(item)} className={rowClass}>
                {row}
              </Link>
            ) : renderExpanded ? (
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setExpanded(isOpen ? null : item.id)}
                className={rowClass}
              >
                {row}
              </button>
            ) : (
              <div className={rowClass}>{row}</div>
            )}
            {renderExpanded && isOpen && (
              <div className="border-t border-line-muted bg-surface-muted/50 px-3 py-2.5">
                {renderExpanded(item)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
