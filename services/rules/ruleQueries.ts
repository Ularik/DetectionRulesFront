import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchRules,
  fetchOneRule,
} from "@/services/rules/ruleRequests";
import { QueryFiltersType } from "@/types";
import { toast } from "sonner";


export const useRules = (filters: QueryFiltersType) => {
  return useQuery({
    queryKey: ["rules", filters],
    queryFn: () => fetchRules(filters),
    staleTime: 5 * 60 * 1000, // 5 минут данные считаются "свежими"
    gcTime: 10 * 60 * 1000, // Кэш хранится в памяти 10 минут после размонтирования

    refetchOnWindowFocus: false, // Отключает запрос при смене вкладок или возвращении в браузер
  });
};

export const useOneRule = (rule_id: string) => {
  return useQuery({
    queryKey: ["ruleOne", rule_id],
    queryFn: () => fetchOneRule(rule_id),
  });
};
