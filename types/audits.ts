import { RuleType } from "./rules";
import { UserType } from "./users";


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
