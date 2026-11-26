import type { DataQualityParseError, DataQualityStats } from "../model/types";

/** Нормализовано = good + warning (warning — нормализовано, но не все поля профиля заполнены) */
export const normalizedEvents = (stats: Pick<DataQualityStats, "good_events" | "warning_events">) =>
  stats.good_events + stats.warning_events;

/** Качество нормализации, % — доля событий без ошибок разбора; null, если событий нет */
export function qualityPercent(stats: Pick<DataQualityStats, "total_events" | "error_percent">) {
  if (!stats.total_events) return null;
  return Math.max(0, 100 - stats.error_percent);
}

export type DataQualityLevel = "good" | "warning" | "error" | "empty";

/** Итоговая оценка: ошибки разбора > 1% — error; предупреждения или покрытие < 80% — warning */
export function getQualityLevel(
  stats: Pick<DataQualityStats, "total_events" | "error_percent" | "warning_percent" | "avg_coverage_percent">,
): DataQualityLevel {
  if (!stats.total_events) return "empty";
  if (stats.error_percent > 1) return "error";
  if (stats.warning_percent > 0 || stats.avg_coverage_percent < 80) return "warning";
  return "good";
}

export const DATA_QUALITY_LEVEL_LABELS: Record<DataQualityLevel, string> = {
  good: "Норма",
  warning: "Есть замечания",
  error: "Ошибки",
  empty: "Нет событий",
};

const numberFormat = new Intl.NumberFormat("ru-RU");
export const formatCount = (value: number | null | undefined) =>
  value === null || value === undefined ? "—" : numberFormat.format(value);

export const formatPercent = (value: number | null | undefined, digits = 1) =>
  value === null || value === undefined
    ? "—"
    : `${value.toLocaleString("ru-RU", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;

export function formatDataQualityDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Текст и счётчик ошибки разбора — формат элемента у backend не зафиксирован */
export function describeParseError(error: DataQualityParseError): { text: string; count: number | null } {
  if (typeof error === "string") return { text: error, count: null };
  const count = typeof error.count === "number" ? error.count : null;
  for (const key of ["error", "message", "reason", "detail", "field"]) {
    const value = error[key];
    if (typeof value === "string" && value.trim()) return { text: value, count };
  }
  const rest = Object.fromEntries(Object.entries(error).filter(([key]) => key !== "count"));
  return { text: JSON.stringify(rest), count };
}
