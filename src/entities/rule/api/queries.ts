import { useQuery } from "@tanstack/react-query";
import type { QueryFiltersType } from "../model/types";
import { fetchRule, fetchRules, fetchSeverityHints } from "./ruleApi";
import { ruleKeys } from "./queryKeys";

export const useRules = (filters: QueryFiltersType) => {
  return useQuery({
    queryKey: ruleKeys.list(filters),
    queryFn: () => fetchRules(filters),
    staleTime: 5 * 60 * 1000, // 5 минут данные считаются "свежими"
    gcTime: 10 * 60 * 1000, // Кэш хранится в памяти 10 минут после размонтирования
  });
};

export const useRule = (rule_id: string) => {
  return useQuery({
    queryKey: ruleKeys.detail(rule_id),
    queryFn: () => fetchRule(rule_id),
  });
};

export const useSeverityHints = () => {
  return useQuery({
    queryKey: ruleKeys.severityHints(),
    queryFn: fetchSeverityHints,
  });
};
