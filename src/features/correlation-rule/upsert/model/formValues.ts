import {
  splitWindow,
  windowToSeconds,
  type CorrelationRuleRequestCreateUpdateType,
  type CorrelationRuleType,
  type CorrelationSeverity,
  type WindowUnit,
} from "@/entities/correlation-rule";

/** Значения формы: окно — число + единица, числа редактируются строками */
export interface CorrelationRuleFormValues {
  enabled: boolean;
  scenario_type: string;
  description: string;
  window_amount: string;
  window_unit: WindowUnit;
  sequence: string[];
  group_by: string[];
  min_unique_categories: string;
  severity: CorrelationSeverity;
  confidence: string;
  recommendations: string;
  tags: string[];
  mitre_ids: string[];
}

export const DESCRIPTION_MAX = 500;
export const SCENARIO_TYPE_MAX = 100;

export const correlationRuleFormDefaults: CorrelationRuleFormValues = {
  enabled: true,
  scenario_type: "",
  description: "",
  window_amount: "10",
  window_unit: "minutes",
  sequence: [],
  group_by: ["source_ip"],
  min_unique_categories: "",
  severity: "high",
  confidence: "80",
  recommendations: "",
  tags: [],
  mitre_ids: [],
};

export function correlationRuleToFormValues(rule: CorrelationRuleType): CorrelationRuleFormValues {
  const { amount, unit } = splitWindow(rule.window_seconds);
  return {
    enabled: rule.enabled,
    scenario_type: rule.scenario_type,
    description: rule.description ?? "",
    window_amount: String(amount),
    window_unit: unit,
    sequence: [...rule.sequence],
    group_by: [...rule.group_by],
    min_unique_categories:
      rule.min_unique_categories === null ? "" : String(rule.min_unique_categories),
    severity: rule.severity ?? "medium",
    confidence: String(rule.confidence),
    recommendations: rule.recommendations.join("\n"),
    tags: [...rule.tags],
    mitre_ids: [...(rule.mitre_ids ?? [])],
  };
}

/** Копия для «Копировать»: id выдаёт backend, копия создаётся отключённой */
export const correlationRuleToCopyValues = (rule: CorrelationRuleType): CorrelationRuleFormValues => ({
  ...correlationRuleToFormValues(rule),
  enabled: false,
});

export function formValuesToPayload(
  values: CorrelationRuleFormValues,
): CorrelationRuleRequestCreateUpdateType {
  const minCategories = values.min_unique_categories.trim();
  return {
    enabled: values.enabled,
    scenario_type: values.scenario_type.trim(),
    description: values.description.trim(),
    window_seconds: windowToSeconds(Number(values.window_amount), values.window_unit),
    sequence: values.sequence.map((step) => step.trim()).filter(Boolean),
    group_by: values.group_by,
    min_unique_categories: minCategories ? Number(minCategories) : null,
    severity: values.severity,
    confidence: Number(values.confidence),
    recommendations: values.recommendations
      .split("\n")
      .map((line) => line.replace(/^\s*[•\-*]\s*/, "").trim())
      .filter(Boolean),
    tags: values.tags,
    mitre_ids: values.mitre_ids,
  };
}
