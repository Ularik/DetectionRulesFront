import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchRules, fetchOneRule, createRule, deleteRule } from "@/services/rules";
import { QueryFiltersType, RuleCreateType } from "@/types";
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
}

export const useCreateRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RuleCreateType) => createRule(data),
    onSuccess: (data, onMutateResult) => {
      queryClient.invalidateQueries({ queryKey: ["rules"], exact: false });
    }
  });
};

export const useDeleteRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rule_id: string) => deleteRule(rule_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"], exact: false });
    },
    onError: () => {
      toast.success("Ошибка!");
    },
  });
};