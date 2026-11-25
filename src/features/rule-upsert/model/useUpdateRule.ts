import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ruleKeys, updateRule, type RuleCreateUpdateType } from "@/entities/rule";
import { auditKeys } from "@/entities/audit";
import { useEditorRole } from "./useEditorRole";

export function useUpdateRule() {
  const queryClient = useQueryClient();
  const role = useEditorRole();
  return useMutation({
    mutationFn: ({ rule_id, data }: { rule_id: string; data: RuleCreateUpdateType }) =>
      updateRule({ rule_id, data, role }),
    onSuccess: (updatedRule, { rule_id }) => {
      queryClient.setQueryData(ruleKeys.detail(rule_id), updatedRule);
      queryClient.invalidateQueries({ queryKey: ruleKeys.lists() });
      // Сохранение пишет запись в историю изменений
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
    },
  });
}
