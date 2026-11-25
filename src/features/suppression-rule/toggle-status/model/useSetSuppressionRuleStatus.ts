import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/shared/lib/errors";
import {
  patchSuppressionRuleStatus,
  suppressionRuleKeys,
  type SuppressionRuleType,
} from "@/entities/suppression-rule";

type StatusChange = Pick<SuppressionRuleType, "suppression_id" | "enabled">;

/** PATCH /supersession-rules/{id}/status; кэш списка и карточки обновляется без refetch */
export const useSetSuppressionRuleStatus = ({ silent = false }: { silent?: boolean } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (change: StatusChange) => patchSuppressionRuleStatus(change),
    onSuccess: (updatedRule) => {
      queryClient.setQueryData<SuppressionRuleType[]>(suppressionRuleKeys.lists(), (rules) =>
        rules?.map((rule) => (rule.suppression_id === updatedRule.suppression_id ? updatedRule : rule)),
      );
      queryClient.setQueryData(suppressionRuleKeys.detail(updatedRule.suppression_id), updatedRule);
      if (!silent) {
        toast.success(
          `Правило ${updatedRule.suppression_id} ${updatedRule.enabled ? "включено" : "отключено"}`,
        );
      }
    },
    onError: (error, { suppression_id }) => {
      toast.error(getErrorMessage(error, `Не удалось изменить статус правила ${suppression_id}`));
    },
  });
};
