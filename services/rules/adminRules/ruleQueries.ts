import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createRule,
  deleteRule,
  updateRule,
  patchRule,
  testRule
} from "@/services/rules/adminRules/rulesRequests";
import { toast } from "sonner";
import { RuleApiResponse, RuleStatusPatchType, RuleType } from "@/types/rules";


export function useAdminCreateRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createRule,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["rules"]});
        }
    })
}

export function useAdminUpdateRule() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: updateRule,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["rules"] });
      },
    });
}

export const useDeleteRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rule_id: string) => deleteRule(rule_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"], exact: false });
    },
    onError: () => {
      toast.error("Ошибка!");
    },
  });
};


export const useAdminSetStatusRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      rule_id,
      data,
    }: {
      rule_id: string;
      data: RuleStatusPatchType;
    }) => patchRule({ rule_id, data }),
    onSuccess: (updatedData) => {
      queryClient.setQueriesData<RuleApiResponse>(
        {
          queryKey: ["rules"],
          exact: false,
        },
        (oldData) => {
          if (!oldData) return oldData;

          const result = {
            ...oldData,
            items: oldData.items.map((rule) =>
              rule.rule_id === updatedData.rule_id ? updatedData : rule,
            ),
          };
          return result;
        },
      );
    },
    onError: (err) => {
      toast.error("Ошибка!");
      console.log(err)
    },
  });
};

export const useAdminTestRule = () => {
  return useMutation({
    mutationFn: testRule,
  });
}