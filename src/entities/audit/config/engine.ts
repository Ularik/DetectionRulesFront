// Подписи действий и типов ресурсов журнала движка. Набор значений backend не зафиксировал —
// известные переводим, незнакомые показываем как есть

export type EngineActionKind =
  | "create"
  | "update"
  | "delete"
  | "enable"
  | "disable"
  | "status"
  | "login"
  | "logout"
  | "test"
  | "sync"
  | "other";

export const ENGINE_ACTION_LABELS: Record<EngineActionKind, string> = {
  create: "Создание",
  update: "Изменение",
  delete: "Удаление",
  enable: "Включение",
  disable: "Отключение",
  status: "Смена статуса",
  login: "Вход",
  logout: "Выход",
  test: "Тест",
  sync: "Синхронизация",
  other: "Другое",
};

const ACTION_ALIASES: Record<string, EngineActionKind> = {
  create: "create",
  created: "create",
  add: "create",
  insert: "create",
  update: "update",
  updated: "update",
  edit: "update",
  modify: "update",
  patch: "update",
  replace: "update",
  delete: "delete",
  deleted: "delete",
  remove: "delete",
  removed: "delete",
  enable: "enable",
  enabled: "enable",
  activate: "enable",
  disable: "disable",
  disabled: "disable",
  deactivate: "disable",
  status: "status",
  status_changed: "status",
  toggle: "status",
  login: "login",
  logout: "logout",
  test: "test",
  sync: "sync",
};

export const ENGINE_RESOURCE_LABELS: Record<string, string> = {
  correlation_rule: "Правило корреляции",
  correlation: "Правило корреляции",
  rule: "Правило обнаружения",
  detection_rule: "Правило обнаружения",
  suppression_rule: "Подавление (Suppression)",
  supersession_rule: "Подавление (Suppression)",
  suppression: "Подавление (Suppression)",
  asset: "Актив (Asset)",
  ioc: "IOC",
  organization: "Организация",
  source: "Источник",
  normalization_profile: "Профиль нормализации",
  user: "Пользователь",
  incident: "Инцидент",
  scenario: "Сценарий",
  mitre: "MITRE ATT&CK",
};

const normalizeKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/s$/, "");

/** «correlation_rule.update», «UPDATE», «updated» → update */
export function getEngineActionKind(action: string): EngineActionKind {
  const raw = action.trim().toLowerCase();
  const last = raw.split(/[.:/]/).pop() ?? raw;
  return ACTION_ALIASES[last] ?? ACTION_ALIASES[raw] ?? "other";
}

export function getEngineResourceLabel(resourceType: string | null | undefined) {
  if (!resourceType) return "—";
  return ENGINE_RESOURCE_LABELS[normalizeKey(resourceType)] ?? ENGINE_RESOURCE_LABELS[resourceType] ?? resourceType;
}

/** Нормализованный ключ типа ресурса — для ссылок на карточки */
export const normalizeEngineResourceType = (resourceType: string) => {
  const key = normalizeKey(resourceType);
  if (key === "correlation") return "correlation_rule";
  if (key === "detection_rule") return "rule";
  if (key === "supersession_rule" || key === "suppression") return "suppression_rule";
  return key;
};
