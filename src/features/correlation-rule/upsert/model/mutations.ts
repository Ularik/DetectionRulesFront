import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  correlationRuleKeys,
  createCorrelationRule,
  testCorrelationRule,
  updateCorrelationRule,
} from "@/entities/correlation-rule";
import { auditKeys } from "@/entities/audit";

export function useCreateCorrelationRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCorrelationRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: correlationRuleKeys.lists() });
      // Изменение пишет запись в историю
      queryClient.invalidateQueries({ queryKey: auditKeys.correlation() });
    },
  });
}

export function useUpdateCorrelationRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCorrelationRule,
    onSuccess: (updatedRule, { correlation_id }) => {
      queryClient.setQueryData(correlationRuleKeys.detail(correlation_id), updatedRule);
      queryClient.invalidateQueries({ queryKey: correlationRuleKeys.lists() });
      // Изменение пишет запись в историю
      queryClient.invalidateQueries({ queryKey: auditKeys.correlation() });
    },
  });
}

/** POST /correlation-rules/test — проверка правила на инцидентах без сохранения */
export function useTestCorrelationRule() {
  return useMutation({ mutationFn: testCorrelationRule });
}
