import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRule, ruleKeys, type RuleCreateUpdateType } from "@/entities/rule";
import { auditKeys } from "@/entities/audit";
import { useEditorRole } from "./useEditorRole";

export function useCreateRule() {
  const queryClient = useQueryClient();
  const role = useEditorRole();
  return useMutation({
    mutationFn: (data: RuleCreateUpdateType) => createRule({ data, role }),
    onSuccess: (createdRule) => {
      queryClient.setQueryData(ruleKeys.detail(createdRule.rule_id), createdRule);
      queryClient.invalidateQueries({ queryKey: ruleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
    },
  });
}
