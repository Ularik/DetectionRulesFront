import type { EngineAuditParams } from "../model/engineTypes";
import type { CorrelationAuditParams, RuleAuditParams } from "../model/types";

export const auditKeys = {
  all: ["audits"] as const,
  detail: (id: string) => [...auditKeys.all, "detail", id] as const,
  rules: () => [...auditKeys.all, "rule"] as const,
  rule: (ruleId: string) => [...auditKeys.rules(), ruleId] as const,
  ruleList: (ruleId: string, params: RuleAuditParams) =>
    [...auditKeys.rule(ruleId), params] as const,
  ruleAll: (ruleId: string) => [...auditKeys.rule(ruleId), "all"] as const,
  correlation: () => [...auditKeys.all, "correlation"] as const,
  correlationList: (params: CorrelationAuditParams) =>
    [...auditKeys.correlation(), "list", params] as const,
  correlationRule: (correlationId: string) =>
    [...auditKeys.correlation(), "rule", correlationId] as const,
  correlationRuleList: (correlationId: string, params: Omit<CorrelationAuditParams, "author_id">) =>
    [...auditKeys.correlationRule(correlationId), params] as const,
  engine: () => [...auditKeys.all, "engine"] as const,
  engineList: (params: EngineAuditParams) => [...auditKeys.engine(), params] as const,
  correlationDetail: (auditId: number) =>
    [...auditKeys.correlation(), "detail", auditId] as const,
};
