/** Периоды выборки: backend принимает hours (целое ≥ 1) */
export const DATA_QUALITY_PERIODS = [
  { hours: 1, label: "За 1 час" },
  { hours: 24, label: "За 24 часа" },
  { hours: 24 * 7, label: "За 7 дней" },
  { hours: 24 * 30, label: "За 30 дней" },
  { hours: 24 * 90, label: "За 90 дней" },
  // «За всё время» — заведомо больший период, чем хранятся события
  { hours: 24 * 365 * 10, label: "За всё время" },
] as const;

export const DEFAULT_DATA_QUALITY_HOURS = 24 * 30;

/** source_id событий, которые не удалось отнести ни к одному источнику */
export const UNRESOLVED_SOURCE_ID = "__unresolved__";
export const UNKNOWN_ORGANIZATION_ID = "__unknown__";
