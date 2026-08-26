import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createRule,
  deleteRule,
} from "@/services/rules/adminRules/rulesRequests";
import { toast } from "sonner";


export function useAdminCreateRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createRule,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["rules"]});
        }
    })
}

export const useDeleteRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rule_id: string) => deleteRule(rule_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"], exact: false });
    },
    onError: () => {
      toast.success("Ошибка!");
    },
  });
};
