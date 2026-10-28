import type { RuleType } from "@/entities/rule/@x/audit";
import type { UserType } from "@/entities/user/@x/audit";


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


export interface AuditParams {
    limit: number;
    offset: number;
    rule_id?: string;
    user_id?: string;
}
