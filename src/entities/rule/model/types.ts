// Типы по схемам OpenAPI backend: RuleESSchema, RuleRequestCreateUpdateSchema, RuleConditionSchema

export type SeverityHint = "info" | "low" | "medium" | "high" | "critical";

export type RuleConditionMode = "all" | "any";

export type RuleConditionOperator =
  | "contains"
  | "equals"
  | "startswith"
  | "endswith";

/** RuleConditionSchema */
export interface RuleCondition {
  field: string;
  operator: RuleConditionOperator;
  value: string;
  case_sensitive: boolean;
}

/** RuleESSchema — правило в ответах GET/POST/PUT/PATCH /rules/* */
export interface RuleType {
  rule_id: string;
  enabled: boolean;
  rule_type: string | null;
  scope: string | null;
  match_type: string | null;
  pattern: string;
  fields: string[];
  case_sensitive: boolean;
  condition_mode: RuleConditionMode;
  conditions: RuleCondition[];
  category: string | null;
  attack_type: string | null;
  scenario_type: string | null;
  mitre_ids: string[];
  tactics: string[];
  severity_hint: SeverityHint;
  confidence: number | null;
  description: string | null;
  explanation_template: string | null;
  recommendations: string[];
  enabled_reason: string | null;
  false_positive_notes: string | null;
  tags: string[];
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface RuleStatusPatchType {
  enabled: boolean;
}

/** RuleRequestCreateUpdateSchema — тело POST/PUT и поле rule в POST /rules/admin/test;
 * category, attack_type и description в запросе обязательны */
export type RuleCreateUpdateType = Omit<
  RuleType,
  "created_at" | "created_by" | "updated_at" | "updated_by" | "category" | "attack_type" | "description"
> & {
  category: string;
  attack_type: string;
  description: string;
};

/** Кто сохраняет правило: ADMIN — /rules/admin/*, ANALYST — /rules/analyst/* */
export type RuleEditorRole = "ADMIN" | "ANALYST";

/** RuleDeleteResponseSchema */
export interface RuleDeleteResponse {
  _id: string;
  result: string;
}

/** Параметры GET /rules/: поиск по pattern/description; с rule_id — страница из одного правила или пустая */
export interface QueryFiltersType {
  pattern?: string;
  description?: string;
  rule_id?: string;
  limit: number;
  offset: number;
}

export interface RuleApiResponse {
  total: number;
  has_next: boolean;
  items: RuleType[];
}

/** Ответ fetchAllRules: правила, которые backend не смог отдать (500), считаются в failed */
export interface AllRulesResponse {
  items: RuleType[];
  total: number;
  failed: number;
}

/** GET /rules/enums/detection-categories */
export interface DetectionCategory {
  category: string;
  name: string;
  description: string;
  default_attack_type: string;
  default_scenario_type: string;
  default_severity: SeverityHint;
  default_mitre_ids: string[];
  default_tactics: string[];
  enabled: boolean;
}

/** GET /rules/enums/detection-scopes */
export interface DetectionScope {
  scope: string;
  name: string;
  description: string;
  default_fields: string[];
  enabled: boolean;
}

/** TestRuleSchema: событие — схема Event backend; заполняется JSON-ом в форме */
export interface RuleTestRequest {
  rule: RuleCreateUpdateType;
  event: Record<string, unknown>;
}

export interface RuleTestResponse {
  matched: boolean;
  rule_id: string;
}

export interface MetaType {
  total: number;
  limit: number;
  offset: number;
}
