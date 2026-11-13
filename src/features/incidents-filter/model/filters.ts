import type { FilterBarField } from "@/shared/ui/filter-bar";
import {
  ANALYST_STATUSES,
  INCIDENT_STATUS_LABELS,
  isAnalystStatus,
  type IncidentParams,
} from "@/entities/incident";

export type IncidentFilterParams = Omit<IncidentParams, "page" | "size">;
export type FilterKey = keyof IncidentFilterParams;

/** Поля, которые добавляются через меню «Добавить фильтр» (поиск и период задаются отдельно) */
export type ChipFilterKey = Exclude<FilterKey, "text" | "from_time" | "to_time">;

export type FilterFieldConfig = FilterBarField<ChipFilterKey>;

// Порядок первых полей — как в выпадающем списке макета
export const filterFields: FilterFieldConfig[] = [
  { name: "destination_ip", label: "Destination IP" },
  { name: "source_ip", label: "Source IP" },
  { name: "host", label: "Host" },
  { name: "user", label: "User" },
  { name: "incident_id", label: "ID инцидента" },
  { name: "attack_type", label: "Тип атаки" },
  { name: "mitre_id", label: "Mitre ID" },
  {
    name: "analyst_status",
    label: "Статус",
    options: ANALYST_STATUSES.map((status) => ({
      value: status,
      label: INCIDENT_STATUS_LABELS[status],
    })),
  },
  { name: "source_id", label: "Источник", valueClassName: "text-[#ae46d8]" },
  {
    name: "severity",
    label: "Критичность",
    options: [
      { value: "critical", label: "Critical" },
      { value: "high", label: "High" },
      { value: "medium", label: "Medium" },
      { value: "low", label: "Low" },
    ],
  },
  { name: "organization_id", label: "Организация" },
  { name: "decision", label: "Решение" },
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
  {
    name: "suppressed",
    label: "Подавление",
    options: [
      { value: "true", label: "Подавлен" },
      { value: "false", label: "Не подавлен" },
    ],
  },
  { name: "campaign_id", label: "ID кампании" },
  { name: "risk_score_min", label: "Risk score от", type: "number" },
  { name: "risk_score_max", label: "Risk score до", type: "number" },
  { name: "detection_category", label: "Категория детекции" },
];

export function getFilterField(name: ChipFilterKey) {
  return filterFields.find((field) => field.name === name);
}

// Превращает строку из поля ввода в типизированные параметры запроса; null — значение некорректно
export function applyFilterValue(
  filters: IncidentFilterParams,
  key: ChipFilterKey,
  rawValue: string,
): IncidentFilterParams | null {
  const value = rawValue.trim();
  if (!value) return null;

  switch (key) {
    case "analyst_status":
      return isAnalystStatus(value) ? { ...filters, analyst_status: value } : null;
    case "suppressed":
      return { ...filters, suppressed: value === "true" };
    case "priority":
    case "risk_score_min":
    case "risk_score_max": {
      const number = Number(value);
      return Number.isFinite(number) ? { ...filters, [key]: number } : null;
    }
    default:
      return { ...filters, [key]: value };
  }
}

export function removeFilter(
  filters: IncidentFilterParams,
  key: FilterKey,
): IncidentFilterParams {
  const next = { ...filters };
  delete next[key];
  return next;
}

/** Применённые фильтры, которые показываются чипами */
export function getActiveChips(filters: IncidentFilterParams) {
  return filterFields.flatMap((field) => {
    const value = filters[field.name];
    if (value === undefined || value === "") return [];
    const option = field.options?.find((item) => item.value === String(value));
    return [{ field, value: option?.label ?? String(value) }];
  });
}
