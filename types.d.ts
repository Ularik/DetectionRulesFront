export interface RuleType {
    rule_id: string;
    rule_type: string;
    attack_type: string;
    category: string;
    scenario_type: string;
    scope: string;
    severity_hint: "critical" | "high" | "medium" | "low" | "info";
    confidence: number;
    pattern: string;
    match_type: string;
    case_sensitive: boolean;
    fields: string[];
    mitre_ids: string[];
    tactics: string[];
    tags: string[];
    recommendations: string[];
    description: string;
    explanation_template: string;
    false_positive_notes: string;
    enabled: boolean;
    enabled_reason: string;
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string;
}

export type RuleCreateType = Omit<
  RuleType,
  "created_at" | "created_by" | "updated_at" | "updated_by"
>;


export interface QueryFiltersType {
  pattern?: string;
  rule_id?: string;
  description?: string;
  limit: number;
  offset: number;
}

export interface RuleApiResponse {
  total: number;
  has_next: boolean;
  items: RuleType[];
}

export interface MetaType {
  total: number;
  limit: number;
  offset: number;
}