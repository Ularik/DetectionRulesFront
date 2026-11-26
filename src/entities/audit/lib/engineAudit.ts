import {
  ENGINE_ACTION_LABELS,
  getEngineActionKind,
  type EngineActionKind,
} from "../config/engine";
import type { EngineAuditType } from "../model/engineTypes";

// Служебные поля снимков — не считаем их изменениями
const IGNORED_DIFF_FIELDS = new Set(["updated_at", "updated_by", "modified_at", "version", "_id"]);

export interface EngineAuditChange {
  field: string;
  before: unknown;
  after: unknown;
}

const isBlank = (value: unknown) =>
  value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);

const same = (a: unknown, b: unknown) => (isBlank(a) && isBlank(b)) || JSON.stringify(a) === JSON.stringify(b);

/** Поля, отличающиеся в снимках до и после (верхний уровень) */
export function diffEngineAudit(audit: Pick<EngineAuditType, "before" | "after">): EngineAuditChange[] {
  const before = audit.before ?? {};
  const after = audit.after ?? {};
  const fields = [...new Set([...Object.keys(before), ...Object.keys(after)])];
  return fields
    .filter((field) => !IGNORED_DIFF_FIELDS.has(field) && !same(before[field], after[field]))
    .map((field) => ({ field, before: before[field], after: after[field] }));
}

/** Тип действия с учётом снимков: смена статуса с enabled → включение / отключение */
export function resolveEngineAction(audit: EngineAuditType): EngineActionKind {
  const kind = getEngineActionKind(audit.action);
  if (kind === "status" || kind === "update") {
    const before = audit.before?.enabled;
    const after = audit.after?.enabled;
    const changes = diffEngineAudit(audit);
    const onlyStatus = changes.length > 0 && changes.every((change) => change.field === "enabled" || change.field === "status");
    if (typeof after === "boolean" && before !== after && (kind === "status" || onlyStatus)) {
      return after ? "enable" : "disable";
    }
  }
  return kind;
}

export const getEngineActionLabel = (audit: EngineAuditType) => {
  const kind = resolveEngineAction(audit);
  return kind === "other" ? audit.action : ENGINE_ACTION_LABELS[kind];
};

const pickText = (source: Record<string, unknown> | null | undefined, keys: string[]) => {
  if (!source) return null;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
};

/** Значение для описания: строки как есть, остальное — JSON */
export function formatAuditValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  return JSON.stringify(value);
}

/** Описание записи: из metadata, иначе собираем по действию и изменённым полям */
export function describeEngineAudit(audit: EngineAuditType): string {
  const fromMeta = pickText(audit.metadata, ["description", "message", "summary", "details", "reason", "comment"]);
  if (fromMeta) return fromMeta;

  const kind = resolveEngineAction(audit);
  switch (kind) {
    case "create":
      return "Создан новый объект";
    case "delete":
      return "Объект удалён";
    case "enable":
      return "Объект включён";
    case "disable":
      return "Объект отключён";
    case "login": {
      const ip = pickText(audit.metadata, ["ip", "client_ip", "remote_addr", "source_ip"]);
      return ip ? `Успешный вход в систему (IP: ${ip})` : "Вход в систему";
    }
    case "logout":
      return "Выход из системы";
  }

  const changes = diffEngineAudit(audit);
  if (changes.length === 1) {
    const [change] = changes;
    const short = (value: unknown) => {
      const text = formatAuditValue(value);
      return text.length > 40 ? `${text.slice(0, 40)}…` : text;
    };
    return `Изменено поле «${change.field}»: ${short(change.before)} → ${short(change.after)}`;
  }
  if (changes.length > 1) {
    const names = changes.slice(0, 4).map((change) => change.field).join(", ");
    return `Изменены поля: ${names}${changes.length > 4 ? ` и ещё ${changes.length - 4}` : ""}`;
  }
  return ENGINE_ACTION_LABELS[kind] === "Другое" ? audit.action : ENGINE_ACTION_LABELS[kind];
}
