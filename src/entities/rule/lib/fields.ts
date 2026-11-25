import { RULE_CONDITION_MODES, RULE_CONDITION_OPERATORS } from "../config/conditions";
import type { RuleCondition, RuleType } from "../model/types";

/** Подписи полей правила обнаружения — для истории изменений (порядок = порядок вывода) */
export const RULE_FIELD_LABELS: Record<string, string> = {
  enabled: "Статус",
  enabled_reason: "Причина включения",
  description: "Описание",
  rule_type: "Тип правила",
  scope: "Область (scope)",
  category: "Категория",
  attack_type: "Тип атаки",
  scenario_type: "Тип сценария",
  severity_hint: "Критичность",
  confidence: "Уверенность",
  match_type: "Тип совпадения",
  pattern: "Паттерн",
  fields: "Поля события",
  case_sensitive: "Учитывать регистр",
  condition_mode: "Режим условий",
  conditions: "Условия",
  mitre_ids: "MITRE ATT&CK",
  tactics: "Тактики",
  explanation_template: "Шаблон пояснения",
  recommendations: "Рекомендации",
  false_positive_notes: "Ложные срабатывания",
  tags: "Теги",
};

/** Служебные поля снимка — в истории не сравниваем */
const IGNORED_FIELDS = new Set(["rule_id", "created_at", "updated_at", "created_by", "updated_by"]);

export const ruleFieldLabel = (field: string) => RULE_FIELD_LABELS[field] ?? field;

function formatCondition(condition: RuleCondition) {
  const operator =
    RULE_CONDITION_OPERATORS.find((item) => item.value === condition.operator)?.label ??
    condition.operator;
  return `${condition.field} ${operator} "${condition.value}"${condition.case_sensitive ? " (Aa)" : ""}`;
}

/** Значение поля правила обнаружения в читаемом виде */
export function formatRuleFieldValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (field === "conditions" && Array.isArray(value)) {
    return value.length ? (value as RuleCondition[]).map(formatCondition).join("\n") : "—";
  }
  if (Array.isArray(value)) return value.length ? value.map(String).join(", ") : "—";
  switch (field) {
    case "enabled":
      return value ? "Активно" : "Отключено";
    case "case_sensitive":
      return value ? "Да" : "Нет";
    case "confidence":
      return `${value}%`;
    case "condition_mode":
      return RULE_CONDITION_MODES.find((item) => item.value === value)?.label ?? String(value);
  }
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

export interface RuleFieldChange {
  field: string;
  old: unknown;
  new: unknown;
}

const isBlank = (value: unknown) =>
  value === null || value === undefined || value === "" || (Array.isArray(value) && !value.length);

const sameValue = (a: unknown, b: unknown) =>
  (isBlank(a) && isBlank(b)) || JSON.stringify(a) === JSON.stringify(b);

/** Изменённые поля между двумя версиями правила. Backend готовый diff для правил обнаружения
 * не отдаёт (в отличие от правил корреляции), поэтому сравниваем снимки на клиенте */
export function diffRuleVersions(
  before: Partial<RuleType>,
  after: Partial<RuleType>,
): RuleFieldChange[] {
  const known = Object.keys(RULE_FIELD_LABELS);
  const extra = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(
    (field) => !known.includes(field) && !IGNORED_FIELDS.has(field),
  );
  return [...known, ...extra]
    .map((field) => ({
      field,
      old: before[field as keyof RuleType],
      new: after[field as keyof RuleType],
    }))
    .filter((change) => !sameValue(change.old, change.new));
}
