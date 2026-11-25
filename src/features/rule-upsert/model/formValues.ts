import type {
  RuleCondition,
  RuleConditionMode,
  RuleCreateUpdateType,
  RuleType,
  SeverityHint,
} from "@/entities/rule";

/** Значения формы правила: nullable-строки API редактируются как обычные строки */
export interface RuleFormValues {
  rule_id: string;
  enabled: boolean;
  rule_type: string;
  scope: string;
  match_type: string;
  pattern: string;
  fields: string[];
  case_sensitive: boolean;
  condition_mode: RuleConditionMode;
  conditions: RuleCondition[];
  category: string;
  attack_type: string;
  scenario_type: string;
  mitre_ids: string[];
  tactics: string[];
  severity_hint: SeverityHint;
  confidence: string;
  description: string;
  explanation_template: string;
  recommendations: string;
  enabled_reason: string;
  false_positive_notes: string;
  tags: string[];
}

export const DESCRIPTION_MAX = 500;
export const RECOMMENDATIONS_MAX = 1000;

// Значения rule_type, которые форма выставляет сама по наличию условий
const PATTERN_RULE_TYPE = "payload_pattern";
const CONDITIONS_RULE_TYPE = "advanced_conditions";

export const emptyCondition = (): RuleCondition => ({
  field: "",
  operator: "contains",
  value: "",
  case_sensitive: false,
});

export const ruleFormDefaults: RuleFormValues = {
  rule_id: "",
  enabled: true,
  rule_type: PATTERN_RULE_TYPE,
  scope: "web",
  match_type: "contains",
  pattern: "",
  fields: [],
  case_sensitive: false,
  condition_mode: "all",
  conditions: [],
  category: "",
  attack_type: "",
  scenario_type: "",
  mitre_ids: [],
  tactics: [],
  severity_hint: "medium",
  confidence: "70",
  description: "",
  explanation_template: "",
  recommendations: "",
  enabled_reason: "",
  false_positive_notes: "",
  tags: [],
};

export function ruleToFormValues(rule: RuleType): RuleFormValues {
  return {
    rule_id: rule.rule_id,
    enabled: rule.enabled,
    rule_type: rule.rule_type ?? "",
    scope: rule.scope ?? "",
    match_type: rule.match_type ?? "",
    pattern: rule.pattern,
    fields: [...rule.fields],
    case_sensitive: rule.case_sensitive,
    condition_mode: rule.condition_mode,
    conditions: rule.conditions.map((condition) => ({ ...condition })),
    category: rule.category ?? "",
    attack_type: rule.attack_type ?? "",
    scenario_type: rule.scenario_type ?? "",
    mitre_ids: [...rule.mitre_ids],
    tactics: [...rule.tactics],
    severity_hint: rule.severity_hint,
    confidence: rule.confidence === null ? "" : String(rule.confidence),
    description: rule.description ?? "",
    explanation_template: rule.explanation_template ?? "",
    recommendations: rule.recommendations.join("\n"),
    enabled_reason: rule.enabled_reason ?? "",
    false_positive_notes: rule.false_positive_notes ?? "",
    tags: [...rule.tags],
  };
}

/** Копия правила для «Копировать»: новый id, правило создаётся отключённым */
export function ruleToCopyValues(rule: RuleType): RuleFormValues {
  return { ...ruleToFormValues(rule), rule_id: `${rule.rule_id}-COPY`, enabled: false };
}

const orNull = (value: string) => (value.trim() ? value.trim() : null);

export function formValuesToPayload(values: RuleFormValues): RuleCreateUpdateType {
  const conditions = values.conditions
    .filter((condition) => condition.field.trim() && condition.value !== "")
    .map((condition) => ({ ...condition, field: condition.field.trim() }));

  // rule_type выводится из условий, если правило использует один из двух известных типов
  const knownType = [PATTERN_RULE_TYPE, CONDITIONS_RULE_TYPE, ""].includes(values.rule_type);
  const rule_type = knownType
    ? conditions.length
      ? CONDITIONS_RULE_TYPE
      : PATTERN_RULE_TYPE
    : values.rule_type;

  const confidence = values.confidence.trim() === "" ? null : Number(values.confidence);

  return {
    rule_id: values.rule_id.trim(),
    enabled: values.enabled,
    rule_type,
    scope: orNull(values.scope),
    match_type: orNull(values.match_type),
    pattern: values.pattern,
    fields: values.fields,
    case_sensitive: values.case_sensitive,
    condition_mode: values.condition_mode,
    conditions,
    category: values.category.trim(),
    attack_type: values.attack_type.trim(),
    scenario_type: orNull(values.scenario_type),
    mitre_ids: values.mitre_ids,
    tactics: values.tactics,
    severity_hint: values.severity_hint,
    confidence,
    description: values.description.trim(),
    explanation_template: orNull(values.explanation_template),
    recommendations: values.recommendations
      .split("\n")
      .map((line) => line.replace(/^\s*[•\-*]\s*/, "").trim())
      .filter(Boolean),
    enabled_reason: orNull(values.enabled_reason),
    false_positive_notes: orNull(values.false_positive_notes),
    tags: values.tags,
  };
}
