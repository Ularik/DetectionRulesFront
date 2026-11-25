import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { AuditParams, CorrelationAuditParams, RuleAuditParams } from "../model/types";
import {
  fetchAudit,
  fetchAudits,
  fetchCorrelationAudit,
  fetchCorrelationAudits,
  fetchCorrelationRuleAudits,
  fetchRuleAudits,
} from "./auditApi";
import { auditKeys } from "./queryKeys";

export function useAudits(params: AuditParams) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: () => fetchAudits(params),
  });
}

export function useAudit(id: string) {
  return useQuery({
    queryKey: auditKeys.detail(id),
    queryFn: () => fetchAudit(id),
  });
}

export function useRuleAudits(ruleId: string, params: RuleAuditParams) {
  return useQuery({
    queryKey: auditKeys.ruleList(ruleId, params),
    queryFn: () => fetchRuleAudits(ruleId, params),
    enabled: Boolean(ruleId),
    placeholderData: keepPreviousData,
  });
}

export function useCorrelationAudits(params: CorrelationAuditParams) {
  return useQuery({
    queryKey: auditKeys.correlationList(params),
    queryFn: () => fetchCorrelationAudits(params),
    placeholderData: keepPreviousData,
  });
}

export function useCorrelationRuleAudits(
  correlationId: string,
  params: Omit<CorrelationAuditParams, "author_id">,
) {
  return useQuery({
    queryKey: auditKeys.correlationRuleList(correlationId, params),
    queryFn: () => fetchCorrelationRuleAudits(correlationId, params),
    enabled: Boolean(correlationId),
    placeholderData: keepPreviousData,
  });
}

/** Записи истории не меняются — кэшируем навсегда */
export function useCorrelationAudit(auditId: number | null) {
  return useQuery({
    queryKey: auditKeys.correlationDetail(auditId ?? 0),
    queryFn: () => fetchCorrelationAudit(auditId as number),
    enabled: auditId !== null,
    staleTime: Infinity,
  });
}
