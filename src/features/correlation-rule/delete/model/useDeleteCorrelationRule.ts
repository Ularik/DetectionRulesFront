import { useMutation, useQueryClient } from "@tanstack/react-query";
import { correlationRuleKeys, deleteCorrelationRule } from "@/entities/correlation-rule";
import { auditKeys } from "@/entities/audit";

export const useDeleteCorrelationRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCorrelationRule,
    onSuccess: (_data, correlationId) => {
      queryClient.invalidateQueries({ queryKey: correlationRuleKeys.lists() });
      queryClient.removeQueries({ queryKey: correlationRuleKeys.detail(correlationId) });
      queryClient.invalidateQueries({ queryKey: auditKeys.correlation() });
    },
  });
};
