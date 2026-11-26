import type { RuleType } from "@/entities/rule/@x/audit";
import type { UserType } from "@/entities/user/@x/audit";
import type { CorrelationSeverity } from "@/entities/correlation-rule/@x/audit";


export interface AuditType {
  id: string;
  author_id: string;
  rule_unique_id: number;
  rule_general_id: string;
  action: string | null;
  resource_type: string;
  before_id: string;
  after_id: string;
  created_at: Date;
  updated_at: Date;
  author: UserType;
}


export interface AuditDetailType extends AuditType {
  rule: RuleType
}


export interface ApiAuditResponseType {
    total: number;
    items: AuditType[]
}


/** GET /audits/rule/{rule_id}: limit строго меньше 20 */
export interface RuleAuditParams {
    limit: number;
    offset: number;
}



// ——— История изменений правил корреляции: /audits/correlation-rules/* ———

export type CorrelationAuditAction = "created" | "updated" | "status_changed" | "deleted";

/** CorrelationAuditOutWithAuthorSchema */
export interface CorrelationAuditType {
  id: number;
  author_id: number;
  correlation_unique_id: number;
  correlation_id: string;
  action: string | null;
  resource_type: string | null;
  before_id: number | null;
  after_id: number | null;
  created_at: string;
  updated_at: string;
  author: UserType;
}

/** ApiCorrelationAuditWithAuthorSchema — новые записи первыми */
export interface ApiCorrelationAuditResponse {
  total: number;
  has_next: boolean;
  items: CorrelationAuditType[];
}

/** AuditFieldChangeSchema — изменение одного поля относительно предыдущей версии */
export interface AuditFieldChange {
  field: string;
  old: unknown;
  new: unknown;
}

/** CorrelationRuleDBSchema — версия правила на момент изменения */
export interface CorrelationRuleVersion {
  id: number;
  correlation_id: string | null;
  enabled: boolean;
  scenario_type: string;
  description: string | null;
  window_seconds: number;
  sequence: string[];
  group_by: string[];
  min_unique_categories: number | null;
  severity: CorrelationSeverity | null;
  confidence: number;
  recommendations: string[];
  tags: string[];
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

/** CorrelationAuditOutFullSchema — GET /audits/correlation-rules/{audit_id} */
export interface CorrelationAuditDetailType extends CorrelationAuditType {
  rule: CorrelationRuleVersion;
  /** Пусто для первой версии */
  changes: AuditFieldChange[];
}

/** Параметры списков истории правил корреляции; limit строго меньше 20 */
export interface CorrelationAuditParams {
  limit: number;
  offset: number;
  action?: CorrelationAuditAction;
  /** Только для общей истории всех правил */
  author_id?: number;
}
