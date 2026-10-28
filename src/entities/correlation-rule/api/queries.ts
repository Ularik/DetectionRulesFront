import { useQuery } from "@tanstack/react-query";
import {
  fetchCorrelationRule,
  fetchCorrelationRules,
  fetchGroupByFields,
  fetchSequenceOptions,
} from "./correlationRuleApi";

export const correlationRuleKeys = {
  all: ["correlation-rules"] as const,
  lists: () => [...correlationRuleKeys.all, "list"] as const,
  detail: (correlationId: string) =>
    [...correlationRuleKeys.all, "detail", correlationId] as const,
  sequenceOptions: () => [...correlationRuleKeys.all, "sequence"] as const,
  groupByFields: () => [...correlationRuleKeys.all, "group-by"] as const,
};

export const useCorrelationRules = () => {
  return useQuery({
    queryKey: correlationRuleKeys.lists(),
    queryFn: fetchCorrelationRules,
    staleTime: 5 * 60 * 1000, // 5 минут данные считаются "свежими"
    gcTime: 10 * 60 * 1000, // Кэш хранится в памяти 10 минут после размонтирования
  });
};

export const useCorrelationRule = (correlation_id: string) => {
  return useQuery({
    queryKey: correlationRuleKeys.detail(correlation_id),
    queryFn: () => fetchCorrelationRule(correlation_id),
  });
};

export function useSequenceOptions() {
  return useQuery({
    queryKey: correlationRuleKeys.sequenceOptions(),
    queryFn: fetchSequenceOptions,
  });
}

export function useGroupByFields() {
  return useQuery({
    queryKey: correlationRuleKeys.groupByFields(),
    queryFn: fetchGroupByFields,
  });
}
