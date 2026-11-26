"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, Settings2, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { routes } from "@/shared/config";
import { getSourceTypeLabel } from "@/entities/source";
import {
  DATA_QUALITY_LEVEL_LABELS,
  UNRESOLVED_SOURCE_ID,
  describeParseError,
  formatCount,
  formatDataQualityDate,
  formatPercent,
  getQualityLevel,
  normalizedEvents,
  qualityPercent,
  useDataQualitySource,
  type DataQualityParams,
  type DataQualityStats,
} from "@/entities/data-quality";
import type { QualityRow } from "../lib/rows";
import { QualityLevelBadge, SourceStateBadge } from "./badges";
import { STATUS_COLORS } from "./charts";

type Tab = "overview" | "fields" | "errors";

const TABS: { value: Tab; label: string }[] = [
  { value: "overview", label: "Обзор" },
  { value: "fields", label: "Поля" },
  { value: "errors", label: "Ошибки" },
];

function InfoRow({ label, children, highlight }: { label: string; children: ReactNode; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 rounded-md px-2 py-1.5 text-[13px]",
        highlight && "bg-[#e9f7ef]",
      )}
    >
      <dt className="text-ink-muted">{label}</dt>
      <dd className={cn("min-w-0 break-words text-ink", highlight && "font-semibold")}>{children}</dd>
    </div>
  );
}

/** Отсутствующие поля: доля событий, где поле не заполнено */
export function MissingFieldsList({ stats }: { stats: DataQualityStats }) {
  if (!stats.missing_fields_top.length) {
    return <p className="py-6 text-center text-sm text-ink-muted">Все поля профиля заполнены</p>;
  }
  const total = stats.total_events || 1;
  return (
    <ul className="flex flex-col gap-2.5">
      {stats.missing_fields_top.map((item) => {
        const share = Math.min(100, (item.count / total) * 100);
        return (
          <li key={item.field} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <code className="min-w-0 truncate font-mono text-ink" title={item.field}>
                {item.field}
              </code>
              <span className="shrink-0 text-xs text-ink-muted tabular-nums">
                {formatCount(item.count)} · {formatPercent(share)}
              </span>
            </div>
            <span className="h-1.5 overflow-hidden rounded-full bg-line-muted">
              <span
                className="block h-full rounded-full"
                style={{ width: `${share}%`, backgroundColor: STATUS_COLORS.warning }}
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function ParseErrorsList({ stats }: { stats: DataQualityStats }) {
  if (!stats.parse_errors_top.length) {
    return <p className="py-6 text-center text-sm text-ink-muted">Ошибок разбора нет</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {stats.parse_errors_top.map((error, index) => {
        const { text, count } = describeParseError(error);
        return (
          <li
            key={`${text}-${index}`}
            className="flex items-start justify-between gap-3 rounded-lg border border-red-100 bg-red-50/60 px-3 py-2 text-[13px]"
          >
            <span className="min-w-0 font-mono break-all text-ink">{text}</span>
            {count !== null && <span className="shrink-0 text-xs text-ink-muted tabular-nums">×{formatCount(count)}</span>}
          </li>
        );
      })}
    </ul>
  );
}

export function SourceQualityPanel({
  row,
  params,
  organizationName,
  onClose,
}: {
  row: QualityRow;
  params: DataQualityParams;
  organizationName: (id: string | null) => string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  // Подробности источника — GET /data-quality/sources/{id}; пока грузится — данные строки списка
  const detail = useDataQualitySource(row.stats ? row.id : null, params);
  const stats = detail.data ?? row.stats;
  const level = stats ? getQualityLevel(stats) : "empty";
  const isUnresolved = row.id === UNRESOLVED_SOURCE_ID;
  const profile = row.profiles.length === 1 ? row.profiles[0] : null;

  return (
    <section className="flex flex-col rounded-2xl border border-line bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.06)]">
      <header className="flex items-start justify-between gap-3 px-5 pt-5">
        <h2 className="min-w-0 text-lg font-semibold break-words text-ink">Источник: {row.name}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="rounded-md p-1 text-ink-muted hover:bg-surface-muted hover:text-ink"
        >
          <X className="size-5" />
        </button>
      </header>

      <div className="flex gap-1.5 px-5 pt-4" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => setTab(item.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              tab === item.value ? "bg-brand-light text-white" : "text-ink hover:bg-surface-muted",
            )}
          >
            {item.label}
            {item.value === "errors" && stats?.parse_errors_total ? (
              <span className="ml-1.5 text-xs opacity-80">{formatCount(stats.parse_errors_total)}</span>
            ) : null}
          </button>
        ))}
      </div>

      <div className={cn("flex flex-col gap-4 px-5 py-4", detail.isFetching && "opacity-70")}>
        {tab === "overview" && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <SourceStateBadge enabled={row.enabled} />
                <QualityLevelBadge level={level} />
              </div>
              <span className="text-xs text-ink-muted">
                Последнее событие: {formatDataQualityDate(stats?.last_event_at)}
              </span>
            </div>
            <dl className="flex flex-col">
              <InfoRow label="Тип источника">{getSourceTypeLabel(row.sourceType)}</InfoRow>
              <InfoRow label="Организация">{organizationName(row.organizationId)}</InfoRow>
              <InfoRow label="Профиль нормализации">{row.profiles.join(", ") || "—"}</InfoRow>
              <InfoRow label="Всего событий">{formatCount(stats?.total_events ?? 0)}</InfoRow>
              <InfoRow label="Нормализовано">{formatCount(stats ? normalizedEvents(stats) : 0)}</InfoRow>
              <InfoRow label="С предупреждениями">
                {formatCount(stats?.warning_events ?? 0)}
                {stats?.total_events ? ` (${formatPercent(stats.warning_percent)})` : ""}
              </InfoRow>
              <InfoRow label="Ошибки">
                {formatCount(stats?.error_events ?? 0)}
                {stats?.total_events ? ` (${formatPercent(stats.error_percent)})` : ""}
              </InfoRow>
              <InfoRow label="Покрытие полей">{formatPercent(stats?.total_events ? stats.avg_coverage_percent : null)}</InfoRow>
              <InfoRow label="Первое событие">{formatDataQualityDate(stats?.first_event_at)}</InfoRow>
              <InfoRow label="Последняя ошибка">{formatDataQualityDate(stats?.last_error_at)}</InfoRow>
              <InfoRow label="Качество" highlight>
                {formatPercent(stats ? qualityPercent(stats) : null)}
                <span className="ml-1.5 font-normal text-ink-muted">{DATA_QUALITY_LEVEL_LABELS[level]}</span>
              </InfoRow>
            </dl>
          </>
        )}

        {tab === "fields" &&
          (stats ? (
            <>
              <p className="text-xs text-ink-muted">
                Поля профиля, которые не удалось заполнить (всего пропусков: {formatCount(stats.missing_fields_total)})
              </p>
              <MissingFieldsList stats={stats} />
            </>
          ) : (
            <p className="py-6 text-center text-sm text-ink-muted">За период событий нет</p>
          ))}

        {tab === "errors" &&
          (stats ? (
            <ParseErrorsList stats={stats} />
          ) : (
            <p className="py-6 text-center text-sm text-ink-muted">За период событий нет</p>
          ))}
      </div>

      {!isUnresolved && (
        <footer className="mt-auto flex flex-wrap gap-2 border-t border-line-muted px-5 py-4">
          {profile && (
            <Link
              href={routes.normalizationProfileEdit(profile)}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold whitespace-nowrap text-ink hover:bg-surface-muted"
            >
              <Settings2 className="size-4" />
              Редактировать профиль
            </Link>
          )}
          {row.enabled !== null && (
            <Link
              href={routes.source(row.id)}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold whitespace-nowrap text-white hover:bg-brand-light"
            >
              <ExternalLink className="size-4" />
              Карточка источника
            </Link>
          )}
        </footer>
      )}
    </section>
  );
}
