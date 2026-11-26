"use client";

import { useState } from "react";
import {
  formatCount,
  formatPercent,
  normalizedEvents,
  qualityPercent,
  type DataQualityStats,
} from "@/entities/data-quality";
import { cn } from "@/shared/lib/utils";

// Статусные цвета (зарезервированы под good / warning / error) — всегда с легендой и подписями
export const STATUS_COLORS = {
  good: "#22a06b",
  warning: "#e8a33d",
  error: "#e5484d",
} as const;

const SEGMENTS = [
  { key: "good", label: "Без замечаний", color: STATUS_COLORS.good },
  { key: "warning", label: "С предупреждениями", color: STATUS_COLORS.warning },
  { key: "error", label: "Ошибки", color: STATUS_COLORS.error },
] as const;

const segmentValue = (stats: DataQualityStats, key: (typeof SEGMENTS)[number]["key"]) =>
  key === "good" ? stats.good_events : key === "warning" ? stats.warning_events : stats.error_events;

export function StatusLegend({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted", className)}>
      {SEGMENTS.map((segment) => (
        <li key={segment.key} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
          {segment.label}
        </li>
      ))}
    </ul>
  );
}

function Tooltip({ title, stats }: { title: string; stats: DataQualityStats }) {
  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-60 -translate-x-1/2 rounded-lg border border-line bg-white p-3 text-xs shadow-lg">
      <p className="mb-1.5 truncate font-semibold text-ink">{title}</p>
      <dl className="flex flex-col gap-1">
        {SEGMENTS.map((segment) => (
          <div key={segment.key} className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-ink-muted">
              <span className="size-2 rounded-full" style={{ backgroundColor: segment.color }} />
              {segment.label}
            </dt>
            <dd className="font-medium text-ink tabular-nums">{formatCount(segmentValue(stats, segment.key))}</dd>
          </div>
        ))}
        <div className="mt-1 flex justify-between gap-3 border-t border-line-muted pt-1">
          <dt className="text-ink-muted">Покрытие полей</dt>
          <dd className="font-medium text-ink tabular-nums">{formatPercent(stats.avg_coverage_percent)}</dd>
        </div>
      </dl>
    </div>
  );
}

/** Горизонтальные 100%-полосы good / warning / error по источникам */
export function SourcesQualityBars({
  rows,
  onSelect,
  selectedId,
}: {
  rows: { id: string; name: string; stats: DataQualityStats }[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (!rows.length) {
    return <p className="py-10 text-center text-sm text-ink-muted">За период событий нет</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => {
        const total = row.stats.total_events || 1;
        return (
          <button
            key={row.id}
            type="button"
            onClick={() => onSelect(row.id)}
            onMouseEnter={() => setHovered(row.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(row.id)}
            onBlur={() => setHovered(null)}
            className={cn(
              "grid grid-cols-[minmax(0,130px)_minmax(0,1fr)_56px] items-center gap-3 rounded-md py-0.5 text-left",
              selectedId === row.id && "bg-brand-soft/30",
            )}
          >
            <span className="truncate text-right text-[13px] font-medium text-ink" title={row.name}>
              {row.name}
            </span>
            <span className="relative flex h-4 gap-0.5">
              {hovered === row.id && <Tooltip title={row.name} stats={row.stats} />}
              {SEGMENTS.map((segment) => {
                const value = segmentValue(row.stats, segment.key);
                if (!value) return null;
                return (
                  <span
                    key={segment.key}
                    className="h-full first:rounded-l last:rounded-r"
                    style={{ width: `${(value / total) * 100}%`, backgroundColor: segment.color, minWidth: 3 }}
                  />
                );
              })}
            </span>
            <span className="text-right text-[13px] font-semibold text-ink tabular-nums">
              {formatPercent(qualityPercent(row.stats))}
            </span>
          </button>
        );
      })}
      <div className="grid grid-cols-[minmax(0,130px)_minmax(0,1fr)_56px] gap-3 text-[11px] text-ink-muted">
        <span />
        <span className="flex justify-between">
          {[0, 20, 40, 60, 80, 100].map((tick) => (
            <span key={tick}>{tick}%</span>
          ))}
        </span>
        <span />
      </div>
    </div>
  );
}

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 2;

/** Кольцо распределения good / warning / error с качеством в центре */
export function QualityDonut({ stats }: { stats: DataQualityStats | undefined }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const total = stats?.total_events ?? 0;
  const parts = SEGMENTS.map((segment) => ({
    ...segment,
    value: stats ? segmentValue(stats, segment.key) : 0,
  })).filter((part) => part.value > 0);
  const gap = parts.length > 1 ? GAP : 0;

  const lengths = parts.map((part) => (part.value / total) * CIRCUMFERENCE);
  const arcs = parts.map((part, index) => ({
    ...part,
    dash: Math.max(lengths[index] - gap, 1),
    // начало дуги = сумма длин предыдущих
    offset: lengths.slice(0, index).reduce((sum, length) => sum + length, 0),
  }));
  const active = arcs.find((arc) => arc.key === hovered);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center xl:flex-col 2xl:flex-row">
      <div className="relative size-40 shrink-0">
        <svg viewBox="0 0 140 140" className="size-full -rotate-90" role="img" aria-label="Распределение событий по результату нормализации">
          <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="var(--color-line-muted)" strokeWidth="14" />
          {arcs.map((arc) => (
            <circle
              key={arc.key}
              cx="70"
              cy="70"
              r={RADIUS}
              fill="none"
              stroke={arc.color}
              strokeWidth={hovered === arc.key ? 18 : 14}
              strokeDasharray={`${arc.dash} ${CIRCUMFERENCE}`}
              strokeDashoffset={-arc.offset}
              onMouseEnter={() => setHovered(arc.key)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-default transition-[stroke-width]"
            >
              <title>{`${arc.label}: ${formatCount(arc.value)} (${formatPercent((arc.value / total) * 100)})`}</title>
            </circle>
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {active ? (
            <>
              <span className="text-xl font-semibold text-ink tabular-nums">
                {formatPercent((active.value / total) * 100)}
              </span>
              <span className="max-w-24 text-[11px] leading-tight text-ink-muted">{active.label}</span>
            </>
          ) : (
            <>
              <span className="text-2xl font-semibold text-ink tabular-nums">
                {formatPercent(stats ? qualityPercent(stats) : null)}
              </span>
              <span className="text-xs text-ink-muted">Качество</span>
            </>
          )}
        </div>
      </div>

      <dl className="flex w-full min-w-0 flex-col gap-2 text-[13px]">
        {SEGMENTS.map((segment) => {
          const value = stats ? segmentValue(stats, segment.key) : 0;
          return (
            <div
              key={segment.key}
              className="flex items-center justify-between gap-3"
              onMouseEnter={() => setHovered(segment.key)}
              onMouseLeave={() => setHovered(null)}
            >
              <dt className="flex items-center gap-2 text-ink">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
                {segment.label}
              </dt>
              <dd className="font-medium whitespace-nowrap text-ink tabular-nums">
                {formatCount(value)}
                <span className="ml-1 text-ink-muted">({formatPercent(total ? (value / total) * 100 : null)})</span>
              </dd>
            </div>
          );
        })}
        <div className="mt-1 flex items-center justify-between gap-3 border-t border-line-muted pt-2">
          <dt className="text-ink-muted">Нормализовано</dt>
          <dd className="font-semibold text-ink tabular-nums">
            {formatCount(stats ? normalizedEvents(stats) : null)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
