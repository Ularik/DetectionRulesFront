import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/shared/lib/errors";
import {
  correlationRuleKeys,
  patchCorrelationRuleStatus,
  type CorrelationRuleType,
} from "@/entities/correlation-rule";
import { auditKeys } from "@/entities/audit";

type StatusChange = Pick<CorrelationRuleType, "correlation_id" | "enabled">;

/** PATCH /correlation-rules/{id}/status; кэш списка и карточки обновляется без refetch */
export const useSetCorrelationRuleStatus = ({ silent = false }: { silent?: boolean } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ correlation_id, enabled }: StatusChange) =>
      patchCorrelationRuleStatus({ correlation_id, data: { enabled } }),
    onSuccess: (updatedRule) => {
      queryClient.setQueryData<CorrelationRuleType[]>(correlationRuleKeys.lists(), (rules) =>
        rules?.map((rule) =>
          rule.correlation_id === updatedRule.correlation_id ? updatedRule : rule,
        ),
      );
      queryClient.setQueryData(correlationRuleKeys.detail(updatedRule.correlation_id), updatedRule);
      queryClient.invalidateQueries({ queryKey: auditKeys.correlation() });
      if (!silent) {
        toast.success(
          `Правило ${updatedRule.correlation_id} ${updatedRule.enabled ? "включено" : "отключено"}`,
        );
      }
    },
    onError: (error, { correlation_id }) => {
      toast.error(getErrorMessage(error, `Не удалось изменить статус правила ${correlation_id}`));
    },
  });
};
