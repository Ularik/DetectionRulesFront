import {
  ANALYST_STATUSES,
  isAnalystStatus,
  type ANALYST_STATUS,
  type IncidentParams,
} from "@/entities/incident";

export type IncidentFilterParams = Omit<IncidentParams, "page" | "size">;
export type FilterKey = keyof IncidentFilterParams;
export type FilterValues = Omit<Record<FilterKey, string>, "analyst_status"> & {
  analyst_status: ANALYST_STATUS | "";
};

export const emptyFilterValues: FilterValues = {
  organization_id: "",
  from_time: "",
  to_time: "",
  source_ip: "",
  destination_ip: "",
  host: "",
  user: "",
  attack_type: "",
  severity: "",
  analyst_status: "",
  decision: "",
  action: "",
  priority: "",
  suppressed: "",
  mitre_id: "",
  campaign_id: "",
  incident_id: "",
  risk_score_min: "",
  risk_score_max: "",
  detection_category: "",
  source_id: "",
  text: "",
};

const textFilterKeys = [
  "organization_id",
  "source_ip",
  "destination_ip",
  "host",
  "user",
  "attack_type",
  "severity",
  "decision",
  "action",
  "mitre_id",
  "campaign_id",
  "incident_id",
  "detection_category",
  "source_id",
  "text",
] as const satisfies readonly FilterKey[];

export type FilterFieldConfig = {
  name: FilterKey;
  label: string;
  type?: "text" | "number" | "datetime-local";
  options?: Array<{ value: string; label: string }>;
};

export const advancedFilters: FilterFieldConfig[] = [
  { name: "incident_id", label: "ID инцидента" },
  { name: "organization_id", label: "Организация" },
  { name: "from_time", label: "Начало периода", type: "datetime-local" },
  { name: "to_time", label: "Конец периода", type: "datetime-local" },
  { name: "source_ip", label: "IP источника" },
  { name: "destination_ip", label: "IP назначения" },
  { name: "host", label: "Хост" },
  { name: "user", label: "Пользователь" },
  { name: "attack_type", label: "Тип атаки" },
  {
    name: "severity",
    label: "Критичность",
    options: [
      { value: "critical", label: "Критическая" },
      { value: "high", label: "Высокая" },
      { value: "medium", label: "Средняя" },
      { value: "low", label: "Низкая" },
    ],
  },
  {
    name: "analyst_status",
    label: "Статус аналитика",
    options: [
      { value: ANALYST_STATUSES[0], label: "Новый" },
      { value: ANALYST_STATUSES[1], label: "На проверке" },
      { value: ANALYST_STATUSES[2], label: "Подтвержден" },
      { value: ANALYST_STATUSES[3], label: "Ложное срабатывание" },
      { value: ANALYST_STATUSES[4], label: "Закрыт" },
    ],
  },
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
  { name: "mitre_id", label: "MITRE ID" },
  { name: "campaign_id", label: "ID кампании" },
  { name: "risk_score_min", label: "Risk score от", type: "number" },
  { name: "risk_score_max", label: "Risk score до", type: "number" },
  { name: "detection_category", label: "Категория детекции" },
  { name: "source_id", label: "ID источника" },
];

// Превращает строковые значения формы в типизированные параметры запроса
export function buildIncidentFilters(
  filterValues: FilterValues,
): IncidentFilterParams {
  const nextFilters: IncidentFilterParams = {};

  for (const key of textFilterKeys) {
    const value = filterValues[key].trim();
    if (value) nextFilters[key] = value;
  }

  if (isAnalystStatus(filterValues.analyst_status)) {
    nextFilters.analyst_status = filterValues.analyst_status;
  }

  for (const key of ["from_time", "to_time"] as const) {
    const value = filterValues[key];
    if (!value) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) nextFilters[key] = date.toISOString();
  }

  for (const key of ["priority", "risk_score_min", "risk_score_max"] as const) {
    const value = filterValues[key];
    if (value === "") continue;
    const number = Number(value);
    if (Number.isFinite(number)) nextFilters[key] = number;
  }

  if (filterValues.suppressed !== "") {
    nextFilters.suppressed = filterValues.suppressed === "true";
  }

  return nextFilters;
}
