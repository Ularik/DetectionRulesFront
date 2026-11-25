// Типы по схемам OpenAPI backend (/correlation-rules): CorrelationRuleESSchema,
// CorrelationRuleRequestCreateUpdateSchema, CorrelationRuleTestSchema и др.

export type CorrelationSeverity = "info" | "low" | "medium" | "high" | "critical";

/** CorrelationRuleESSchema — правило в ответах GET/PUT/PATCH */
export interface CorrelationRuleType {
  correlation_id: string;
  enabled: boolean;
  scenario_type: string;
  description: string | null;
  /** Максимальное окно между инцидентами, секунды */
  window_seconds: number;
  /** Цепочка типов атак/категорий, которые должны связаться */
  sequence: string[];
  /** Поля, по которым инциденты считаются связанными */
  group_by: string[];
  min_unique_categories: number | null;
  severity: CorrelationSeverity | null;
  confidence: number;
  recommendations: string[];
  tags: string[];
  /** Техники MITRE ATT&CK (из GET /mitre/mitre) — классификация результата (добавляются к Scenario),
   * не условие корреляции; в старых правилах поля может не быть */
  mitre_ids?: string[];
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

/** CorrelationRuleRequestCreateUpdateSchema — тело POST/PUT; description, severity, confidence обязательны,
 * sequence и group_by — непустые */
export interface CorrelationRuleRequestCreateUpdateType {
  enabled: boolean;
  scenario_type: string;
  description: string;
  window_seconds: number;
  sequence: string[];
  group_by: string[];
  min_unique_categories: number | null;
  severity: CorrelationSeverity;
  confidence: number;
  recommendations: string[];
  tags: string[];
  /** Необязательно; значения — из GET /mitre/mitre, отозванные/устаревшие backend отклоняет */
  mitre_ids: string[];
}

/** CorrelationRuleStatusSchema — PATCH /correlation-rules/{id}/status */
export interface CorrelationRuleStatusType {
  enabled: boolean;
}

/** CorrelationRuleDeleteResponseSchema */
export interface CorrelationRuleDeleteResponse {
  correlation_id: string;
  deleted: boolean;
}

/** SequenceItemSchema — GET /correlation-rules/sequence */
export interface SequenceValueType {
  value: string;
  label: string;
}

/** ScenarioTypesResponseSchema — GET /correlation-rules/scenario-types, справочник поля scenario_type */
export interface ScenarioTypesResponse {
  items: SequenceValueType[];
  count: number | null;
}

/** CorrelationGroupByFieldsSchema — элемент GET /correlation-rules/group-by-fields */
export interface CorrelationGroupByFieldsType {
  value: string;
  label: string;
  description: string;
}

/** GroupByResponseSchema */
export interface CorrelationGroupByResponse {
  items: CorrelationGroupByFieldsType[];
  count: number | null;
}

/** IncidentTestSchema: описаны основные поля, остальные поля инцидента backend принимает как есть */
export interface CorrelationTestIncident {
  incident_id: string;
  organization_id?: string | null;
  attack_type?: string;
  scenario_type?: string | null;
  source_ip?: string | null;
  destination_ip?: string | null;
  observer_host?: string | null;
  target_ports?: unknown[];
  request_uris?: string[];
  detection_rule_ids?: string[];
  detection_categories?: string[];
  severity?: string;
  risk_score?: number;
  start_time?: string | null;
  end_time?: string | null;
  [field: string]: unknown;
}

/** CorrelationRuleTestSchema — POST /correlation-rules/test */
export interface CorrelationRuleTestRequest {
  rule: CorrelationRuleRequestCreateUpdateType;
  incidents: CorrelationTestIncident[];
}

/** CorrelationRuleTestResponseSchema */
export interface CorrelationRuleTestResponse {
  matched: boolean;
  scenario_type: string | null;
  severity: string | null;
  confidence: number | null;
  recommendations: string[];
}
