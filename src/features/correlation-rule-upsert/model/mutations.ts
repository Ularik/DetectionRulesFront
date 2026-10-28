import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  correlationRuleKeys,
  createCorrelationRule,
  updateCorrelationRule,
} from "@/entities/correlation-rule";

export function useCreateCorrelationRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCorrelationRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: correlationRuleKeys.lists() });
    },
  });
}

export function useUpdateCorrelationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCorrelationRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: correlationRuleKeys.all });
    },
  });
}
