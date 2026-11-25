import type {
  SuppressionAction,
  SuppressionDecision,
  SuppressionMatchSchema,
  SuppressionRuleCreateType,
  SuppressionRuleType,
  SuppressionRuleUpdateType,
  SuppressionSeverity,
} from "@/entities/suppression-rule";

/** Значения формы: необязательные поля — пустые строки, числа редактируются строками */
export interface SuppressionRuleFormValues {
  enabled: boolean;
  description: string;
  reason: string;
  tags: string[];
  // match
  source_ip: string;
  destination_ip: string;
  dst_port: string;
  observer_host: string;
  attack_type: string;
  detection_rule_id: string;
  category: string;
  paths: string[];
  path_prefixes: string[];
  contains: string[];
  // action
  action: SuppressionAction | "";
  severity: SuppressionSeverity | "";
  decision: SuppressionDecision | "";
  risk_score: string;
  override_attack_type: string;
  suppressed: boolean;
  suppression_reason: string;
}

export const DESCRIPTION_MAX = 200;
export const REASON_MAX = 500;

export const suppressionRuleFormDefaults: SuppressionRuleFormValues = {
  enabled: true,
  description: "",
  reason: "",
  tags: [],
  source_ip: "",
  destination_ip: "",
  dst_port: "",
  observer_host: "",
  attack_type: "",
  detection_rule_id: "",
  category: "",
  paths: [],
  path_prefixes: [],
  contains: [],
  action: "ignore",
  severity: "low",
  decision: "benign",
  risk_score: "",
  override_attack_type: "",
  suppressed: true,
  suppression_reason: "",
};

const pick = <T extends string>(value: string | null, allowed: readonly T[]): T | "" =>
  allowed.includes(value as T) ? (value as T) : "";

export function suppressionRuleToFormValues(rule: SuppressionRuleType): SuppressionRuleFormValues {
  const { match, action } = rule;
  return {
    enabled: rule.enabled,
    description: rule.description,
    reason: rule.reason ?? "",
    tags: [...rule.tags],
    source_ip: match.source_ip ?? "",
    destination_ip: match.destination_ip ?? "",
    dst_port: match.dst_port === null ? "" : String(match.dst_port),
    observer_host: match.observer_host ?? "",
    attack_type: match.attack_type ?? "",
    detection_rule_id: match.detection_rule_id ?? "",
    category: match.category ?? "",
    paths: [...match.paths],
    path_prefixes: [...match.path_prefixes],
    contains: [...match.contains],
    action: pick(action.action, ["block", "investigate", "monitor", "ignore"]),
    severity: pick(action.severity, ["critical", "high", "medium", "low", "info"]),
    decision: pick(action.decision, ["malicious", "suspicious", "benign"]),
    risk_score: action.risk_score === null ? "" : String(action.risk_score),
    override_attack_type: action.attack_type ?? "",
    suppressed: action.suppressed,
    suppression_reason: action.suppression_reason ?? "",
  };
}

/** Копия для «Копировать»: id выдаёт backend, копия создаётся отключённой */
export const suppressionRuleToCopyValues = (rule: SuppressionRuleType): SuppressionRuleFormValues => ({
  ...suppressionRuleToFormValues(rule),
  enabled: false,
});

const text = (value: string) => value.trim() || null;

export function formValuesToMatch(values: SuppressionRuleFormValues): SuppressionMatchSchema {
  const port = values.dst_port.trim();
  return {
    source_ip: text(values.source_ip),
    destination_ip: text(values.destination_ip),
    dst_port: port ? Number(port) : null,
    observer_host: text(values.observer_host),
    attack_type: text(values.attack_type),
    detection_rule_id: text(values.detection_rule_id),
    category: text(values.category),
    paths: values.paths,
    path_prefixes: values.path_prefixes,
    contains: values.contains,
  };
}

const riskScore = (value: string) => (value.trim() ? Number(value) : null);

/** Тело POST и правило для /test */
export function formValuesToCreatePayload(values: SuppressionRuleFormValues): SuppressionRuleCreateType {
  return {
    enabled: values.enabled,
    description: values.description.trim(),
    reason: text(values.reason),
    match: formValuesToMatch(values),
    action: {
      mode: "suppress",
      attack_type: text(values.override_attack_type),
      decision: values.decision || null,
      severity: values.severity || null,
      risk_score: riskScore(values.risk_score),
      action: values.action || null,
      suppressed: values.suppressed,
      suppression_reason: text(values.suppression_reason),
    },
    tags: values.tags,
  };
}

/** Тело PUT: action плоско; severity и новый тип атаки через PUT не меняются, enabled — через PATCH */
export function formValuesToUpdatePayload(values: SuppressionRuleFormValues): SuppressionRuleUpdateType {
  return {
    description: values.description.trim(),
    reason: text(values.reason),
    match: formValuesToMatch(values),
    decision: values.decision || null,
    risk_score: riskScore(values.risk_score),
    action: values.action || null,
    suppressed: values.suppressed,
    suppression_reason: text(values.suppression_reason),
    tags: values.tags,
  };
}
