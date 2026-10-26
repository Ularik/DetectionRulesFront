import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ruleKeys, updateRule } from "@/entities/rule";

export function useUpdateRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.all });
    },
  });
}
