import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/shared/lib/errors";
import { patchRuleStatus, ruleKeys, type RuleType } from "@/entities/rule";
import { auditKeys } from "@/entities/audit";

type RuleStatusChange = Pick<RuleType, "rule_id" | "enabled">;

/** Устанавливает правилу статус enabled (PATCH /rules/admin/{id}) и обновляет кэш без refetch */
export const useSetRuleStatus = ({ silent = false }: { silent?: boolean } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rule_id, enabled }: RuleStatusChange) =>
      patchRuleStatus({ rule_id, data: { enabled } }),
    onSuccess: (updatedRule) => {
      // И постраничные списки, и полный список раздела хранят правила в items
      queryClient.setQueriesData<{ items: RuleType[] }>(
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
      queryClient.invalidateQueries({ queryKey: auditKeys.rule(updatedRule.rule_id) });
      if (!silent) {
        toast.success(updatedRule.enabled ? "Правило включено" : "Правило отключено");
      }
    },
    onError: (error, { rule_id }) => {
      toast.error(getErrorMessage(error, `Не удалось изменить статус правила ${rule_id}`));
    },
  });
};

/** Переключает статус на противоположный */
export const useToggleRuleStatus = () => {
  const mutation = useSetRuleStatus();
  return {
    ...mutation,
    mutate: (rule: RuleStatusChange) =>
      mutation.mutate({ rule_id: rule.rule_id, enabled: !rule.enabled }),
  };
};
