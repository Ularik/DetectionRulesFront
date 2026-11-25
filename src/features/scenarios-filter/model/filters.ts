import type { FilterBarField } from "@/shared/ui/filter-bar";
import {
  ANALYST_STATUSES,
  INCIDENT_STATUS_LABELS,
  isAnalystStatus,
} from "@/entities/incident";
import type { ScenarioQueryParams, Severity } from "@/entities/scenario";

export type ScenarioFilterParams = Omit<ScenarioQueryParams, "page" | "size">;
export type ScenarioFilterKey = keyof ScenarioFilterParams;
/** Поля меню «Добавить фильтр» (полнотекстовый поиск задаётся отдельно) */
export type ScenarioChipFilterKey = Exclude<ScenarioFilterKey, "text">;

const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];
const severityOptions = SEVERITIES.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

const isSeverity = (value: string): value is Severity =>
  (SEVERITIES as string[]).includes(value);

// Backend принимает в source_ip/destination_ip только IP-адрес (иначе 422)
const isIpAddress = (value: string) =>
  /^(\d{1,3}\.){3}\d{1,3}$/.test(value) || (value.includes(":") && /^[\da-f:.]+$/i.test(value));

// Порядок — как в выпадающем списке макета
export const scenarioFilterFields: FilterBarField<ScenarioChipFilterKey>[] = [
  { name: "organization_id", label: "Организация" },
  {
    name: "severity",
    label: "Критичность",
    options: severityOptions,
  },
  { name: "source_ip", label: "Source IP" },
  { name: "destination_ip", label: "Destination IP" },
  { name: "host", label: "Host" },
  { name: "user", label: "User" },
  {
    name: "analyst_status",
    label: "Статус",
    options: ANALYST_STATUSES.map((status) => ({
      value: status,
      label: INCIDENT_STATUS_LABELS[status],
    })),
  },
  { name: "scenario_type", label: "Тип сценария" },
  { name: "scenario_id", label: "ID сценария" },
  { name: "incident_id", label: "ID инцидента" },
  { name: "attack_type", label: "Тип атаки" },
  { name: "ioc_severity", label: "IOC Severity", options: severityOptions },
  {
    name: "decision",
    label: "Вердикт",
    options: [
      { value: "malicious", label: "Malicious" },
      { value: "suspicious", label: "Suspicious" },
    ],
  },
  {
    name: "action",
    label: "Действие",
    options: [
      { value: "monitor", label: "Мониторинг" },
      { value: "block", label: "Блокировка" },
      { value: "investigate", label: "Расследование" },
    ],
  },
  { name: "priority", label: "Приоритет", type: "number" },
  { name: "score_min", label: "Оценка от", type: "number" },
  { name: "score_max", label: "Оценка до", type: "number" },
  { name: "asset_id", label: "ID актива" },
  { name: "asset_hostname", label: "Asset hostname" },
  {
    name: "blacklisted",
    label: "Чёрный список",
    options: [
      { value: "true", label: "Да" },
      { value: "false", label: "Нет" },
    ],
  },
  { name: "detection_category", label: "Категория детекции" },
];

// Строка из поля ввода → типизированные параметры запроса; null — значение некорректно
export function applyScenarioFilterValue(
  filters: ScenarioFilterParams,
  key: ScenarioChipFilterKey,
  rawValue: string,
): ScenarioFilterParams | null {
  const value = rawValue.trim();
  if (!value) return null;

  switch (key) {
    case "analyst_status":
      return isAnalystStatus(value) ? { ...filters, analyst_status: value } : null;
    case "severity":
    case "ioc_severity":
      return isSeverity(value) ? { ...filters, [key]: value } : null;
    case "decision":
      return value === "malicious" || value === "suspicious"
        ? { ...filters, decision: value }
        : null;
    case "action":
      return value === "monitor" || value === "block" || value === "investigate"
        ? { ...filters, action: value }
        : null;
    case "blacklisted":
      return { ...filters, blacklisted: value === "true" };
    case "source_ip":
    case "destination_ip":
      return isIpAddress(value) ? { ...filters, [key]: value } : null;
    case "priority": {
      const number = Number(value);
      return Number.isInteger(number) && number >= 0 ? { ...filters, priority: number } : null;
    }
    case "score_min":
    case "score_max": {
      const number = Number(value);
      return Number.isFinite(number) && number >= 0 && number <= 100
        ? { ...filters, [key]: number }
        : null;
    }
    default:
      return { ...filters, [key]: value };
  }
}

export function removeScenarioFilter(
  filters: ScenarioFilterParams,
  key: ScenarioFilterKey,
): ScenarioFilterParams {
  const next = { ...filters };
  delete next[key];
  return next;
}

/** Применённые фильтры, которые показываются чипами */
export function getScenarioChips(filters: ScenarioFilterParams) {
  return scenarioFilterFields.flatMap((field) => {
    const value = filters[field.name];
    if (value === undefined || value === null || value === "") return [];
    const option = field.options?.find((item) => item.value === String(value));
    return [{ field, value: option?.label ?? String(value) }];
  });
}
