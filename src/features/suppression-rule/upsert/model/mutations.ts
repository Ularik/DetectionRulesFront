import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSuppressionRule,
  patchSuppressionRuleStatus,
  suppressionRuleKeys,
  testSuppressionRule,
  updateSuppressionRule,
  type SuppressionRuleUpdateType,
} from "@/entities/suppression-rule";

export function useCreateSuppressionRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSuppressionRule,
    onSuccess: (rule) => {
      queryClient.setQueryData(suppressionRuleKeys.detail(rule.suppression_id), rule);
      queryClient.invalidateQueries({ queryKey: suppressionRuleKeys.lists() });
    },
  });
}

/** PUT не принимает enabled — если статус в форме изменился, следом идёт PATCH /status */
export function useUpdateSuppressionRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      suppression_id,
      data,
      enabled,
    }: {
      suppression_id: string;
      data: SuppressionRuleUpdateType;
      enabled?: boolean;
    }) => {
      const updated = await updateSuppressionRule({ suppression_id, data });
      return enabled === undefined || enabled === updated.enabled
        ? updated
        : patchSuppressionRuleStatus({ suppression_id, enabled });
    },
    onSuccess: (rule, { suppression_id }) => {
      queryClient.setQueryData(suppressionRuleKeys.detail(suppression_id), rule);
      queryClient.invalidateQueries({ queryKey: suppressionRuleKeys.lists() });
    },
    onError: (_error, { suppression_id }) => {
      // PUT мог пройти, а PATCH — нет: перечитываем правило
      queryClient.invalidateQueries({ queryKey: suppressionRuleKeys.detail(suppression_id) });
    },
  });
}

/** POST /supersession-rules/test — проверка правила на инциденте без сохранения */
export function useTestSuppressionRule() {
  return useMutation({ mutationFn: testSuppressionRule });
}
