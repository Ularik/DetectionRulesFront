// Схемы backend /supersession-rules (OpenAPI, сверено 2026-11-25)

export type SuppressionAction = "block" | "investigate" | "monitor" | "ignore";

export type SuppressionSeverity = "critical" | "high" | "medium" | "low" | "info";

export type SuppressionDecision = "malicious" | "suspicious" | "benign";

/** SuppressionMatchSchema — условия совпадения; нужно заполнить хотя бы одно поле */
export interface SuppressionMatchSchema {
  /** IP-адрес источника (точное совпадение) */
  source_ip: string | null;
  /** IP-адрес назначения (точное совпадение) */
  destination_ip: string | null;
  /** Порт назначения (1–65535), ищется среди target_ports инцидента */
  dst_port: number | null;
  /** Хост-наблюдатель (точное совпадение) */
  observer_host: string | null;
  /** Тип атаки (справочник /attack-types) */
  attack_type: string | null;
  /** ID правила обнаружения, ищется среди detection_rule_ids инцидента */
  detection_rule_id: string | null;
  /** Категория, ищется среди detection_categories инцидента */
  category: string | null;
  /** Точные пути внутри события */
  paths: string[];
  /** Префиксы путей внутри события */
  path_prefixes: string[];
  /** Подстроки в тексте события (без учёта регистра) */
  contains: string[];
}

/** SuppressionActionResponseSchema — в ответе все переопределения могут быть null */
export interface SuppressionActionResponseSchema {
  /** Режим обработки; движок поддерживает только suppress */
  mode: string | null;
  attack_type: string | null;
  decision: string | null;
  severity: string | null;
  risk_score: number | null;
  action: string | null;
  /** Признак suppressed у инцидента */
  suppressed: boolean;
  suppression_reason: string | null;
}

/** SuppressionRuleSchema */
export interface SuppressionRuleType {
  suppression_id: string;
  enabled: boolean;
  /** Описание — в UI это «Название» */
  description: string;
  /** Причина создания правила — в UI «Описание / Причина» */
  reason: string | null;
  match: SuppressionMatchSchema;
  action: SuppressionActionResponseSchema;
  tags: string[];
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

/** SuppressionActionSchema — действие в теле POST (все переопределения необязательны) */
export interface SuppressionActionRequestSchema {
  mode: "suppress";
  attack_type: string | null;
  decision: SuppressionDecision | null;
  severity: SuppressionSeverity | null;
  risk_score: number | null;
  action: SuppressionAction | null;
  suppressed: boolean;
  suppression_reason: string | null;
}

/** SuppressionRequestPostSchema — тело POST и правило в /test */
export interface SuppressionRuleCreateType {
  enabled: boolean;
  description: string;
  reason: string | null;
  match: SuppressionMatchSchema;
  action: SuppressionActionRequestSchema;
  tags: string[];
}

/**
 * SuppressionRuleUpdateSchema — тело PUT. Поля action передаются плоско;
 * mode, action.attack_type и action.severity через PUT не меняются, enabled — через PATCH /status
 */
export interface SuppressionRuleUpdateType {
  description: string;
  reason: string | null;
  match: SuppressionMatchSchema;
  decision: SuppressionDecision | null;
  risk_score: number | null;
  action: SuppressionAction | null;
  suppressed: boolean;
  suppression_reason: string | null;
  tags: string[];
}

/** SuppressionRuleCreateUpdateResultSchema — ответ POST, PUT и PATCH /status */
export interface SuppressionRuleCreateUpdateResult {
  success: boolean;
  rule: SuppressionRuleType;
}

/** SuppressionRuleDeleteResponseSchema */
export interface SuppressionRuleDeleteResponse {
  success: boolean;
  suppression_id: string;
}

/** IncidentTestSchema — инцидент для проверки; лишние поля backend принимает как есть */
export interface SuppressionTestIncident {
  incident_id: string;
  organization_id?: string | null;
  attack_type?: string;
  scenario_type?: string | null;
  source_ip?: string | null;
  destination_ip?: string | null;
  observer_host?: string | null;
  target_ports?: number[];
  request_uris?: string[];
  detection_rule_ids?: string[];
  detection_categories?: string[];
  severity?: string;
  risk_score?: number;
  start_time?: string | null;
  end_time?: string | null;
  [field: string]: unknown;
}

/** SuppressionRuleTestSchema — POST /supersession-rules/test */
export interface SuppressionRuleTestRequest {
  rule: SuppressionRuleCreateType;
  incident: SuppressionTestIncident;
}

/** SuppressionRuleTestResponseSchema; если не сработало — mode, reason и result равны null */
export interface SuppressionRuleTestResponse {
  matched: boolean;
  mode: string | null;
  reason: string | null;
  result: {
    severity: string | null;
    decision: string | null;
    risk_score: number | null;
    action: string | null;
    suppressed: boolean;
  } | null;
}

/** MatchFieldSchema — метаданные поля match (GET /supersession-rules/suppression-match-fields) */
export interface MatchFieldType {
  field: keyof SuppressionMatchSchema;
  label: string;
  description: string;
  type: "ip" | "integer" | "string" | "enum" | (string & {});
  ui_control: "input" | "number" | "select" | "multi_input" | (string & {});
  multiple: boolean;
  value_source: "manual" | "reference" | (string & {});
  min: number | null;
  max: number | null;
  reference: string | null;
  reference_description: string | null;
  match_mode: "exact" | "prefix" | "contains" | null;
  example: unknown;
}

export interface MatchFieldResponseType {
  items: MatchFieldType[];
  count: number;
  frontend_rules: Record<string, string>;
}
