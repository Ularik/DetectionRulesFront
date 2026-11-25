import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSuppressionRule, suppressionRuleKeys } from "@/entities/suppression-rule";

export const useDeleteSuppressionRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSuppressionRule,
    onSuccess: (_data, suppressionId) => {
      queryClient.invalidateQueries({ queryKey: suppressionRuleKeys.lists() });
      queryClient.removeQueries({ queryKey: suppressionRuleKeys.detail(suppressionId) });
    },
  });
};
