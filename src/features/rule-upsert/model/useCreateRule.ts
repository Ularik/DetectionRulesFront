import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRule, ruleKeys } from "@/entities/rule";

export function useCreateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.lists() });
    },
  });
}
