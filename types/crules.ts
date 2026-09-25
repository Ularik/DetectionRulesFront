export interface CorrelationRuleRequestCreateUpdateType {
  enabled?: boolean;
  scenario_type: string;
  description?: string | null;
  window_seconds: number;
  sequence: string[];
  group_by: string[];
  min_unique_categories?: number | null;
  severity?: string | null;
  confidence?: number;
  recommendations?: string[];
  tags?: string[];
}

export interface CorrelationRuleType extends CorrelationRuleRequestCreateUpdateType {
  correlation_id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface SequenceValueType {
  value: string;
  label: string;
}

export interface CorrelationGroupByFieldsType {
    value: string;
    label: string;
    description: string;
}