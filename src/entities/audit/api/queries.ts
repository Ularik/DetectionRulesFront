import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { CorrelationAuditParams, RuleAuditParams } from "../model/types";
import {
  fetchAudit,
  fetchCorrelationAudit,
  fetchCorrelationAudits,
  fetchCorrelationRuleAudits,
  fetchEngineAudits,
  fetchRuleAudits,
  fetchAllRuleAudits,
} from "./auditApi";
import { auditKeys } from "./queryKeys";
import type { EngineAuditParams } from "../model/engineTypes";

export function useAudit(id: string) {
  return useQuery({
    queryKey: auditKeys.detail(id),
    queryFn: () => fetchAudit(id),
  });
}

/** Снимок версии правила обнаружения для истории: записи аудита не меняются — кэшируем навсегда.
 * Ключ общий с useAudit, чтобы страница записи аудита брала данные из того же кэша */
export function useRuleAuditVersion(id: string | number | null | undefined) {
  const auditId = id === null || id === undefined || id === "" ? null : String(id);
  return useQuery({
    queryKey: auditKeys.detail(auditId ?? ""),
    queryFn: () => fetchAudit(auditId as string),
    enabled: auditId !== null,
    staleTime: Infinity,
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

/** Вся история правила обнаружения — фильтр по действию и пагинация на клиенте */
export function useAllRuleAudits(ruleId: string) {
  return useQuery({
    queryKey: auditKeys.ruleAll(ruleId),
    queryFn: () => fetchAllRuleAudits(ruleId),
    enabled: Boolean(ruleId),
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

export function useEngineAudits(params: EngineAuditParams) {
  return useQuery({
    queryKey: auditKeys.engineList(params),
    queryFn: () => fetchEngineAudits(params),
    placeholderData: keepPreviousData,
  });
}
