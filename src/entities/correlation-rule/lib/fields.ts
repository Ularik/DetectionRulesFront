import { CORRELATION_SEVERITY_LABELS } from "../config/severity";
import type { CorrelationSeverity } from "../model/types";
import { formatWindow } from "./window";

/** Подписи полей правила корреляции — для истории изменений */
export const CORRELATION_FIELD_LABELS: Record<string, string> = {
  enabled: "Статус",
  scenario_type: "Тип сценария",
  description: "Описание",
  window_seconds: "Окно корреляции",
  sequence: "Последовательность",
  group_by: "Group by",
  min_unique_categories: "Минимум уникальных категорий",
  severity: "Критичность",
  confidence: "Уверенность",
  recommendations: "Рекомендации",
  tags: "Теги",
  mitre_ids: "MITRE ATT&CK",
};

export const correlationFieldLabel = (field: string) => CORRELATION_FIELD_LABELS[field] ?? field;

/** Значение поля правила корреляции в читаемом виде */
export function formatCorrelationFieldValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) {
    if (!value.length) return "—";
    return value.map(String).join(field === "sequence" ? " → " : ", ");
  }
  switch (field) {
    case "enabled":
      return value ? "Активен" : "Отключён";
    case "severity":
      return CORRELATION_SEVERITY_LABELS[value as CorrelationSeverity] ?? String(value);
    case "window_seconds":
      return typeof value === "number" ? formatWindow(value) : String(value);
    case "confidence":
      return `${value}%`;
  }
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}
