import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  patchRuleStatus,
  ruleKeys,
  type RuleApiResponse,
  type RuleType,
} from "@/entities/rule";

export const useToggleRuleStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rule: Pick<RuleType, "rule_id" | "enabled">) =>
      patchRuleStatus({
        rule_id: rule.rule_id,
        data: { enabled: !rule.enabled },
      }),
    onSuccess: (updatedRule) => {
      // Обновляем правило во всех закэшированных страницах списка без refetch
      queryClient.setQueriesData<RuleApiResponse>(
        { queryKey: ruleKeys.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            items: oldData.items.map((rule) =>
              rule.rule_id === updatedRule.rule_id ? updatedRule : rule,
            ),
          };
        },
      );
      queryClient.setQueryData(ruleKeys.detail(updatedRule.rule_id), updatedRule);
    },
    onError: () => {
      toast.error("Ошибка!");
    },
  });
};
