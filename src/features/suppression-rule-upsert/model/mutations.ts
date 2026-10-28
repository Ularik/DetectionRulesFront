import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSuppressionRule,
  suppressionRuleKeys,
  updateSuppressionRule,
} from "@/entities/suppression-rule";

export function useCreateSuppressionRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSuppressionRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suppressionRuleKeys.lists() });
    },
  });
}

export function useUpdateSuppressionRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSuppressionRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suppressionRuleKeys.all });
    },
  });
}
