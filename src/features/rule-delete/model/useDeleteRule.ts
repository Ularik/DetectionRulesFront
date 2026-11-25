import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getErrorMessage } from "@/shared/lib/errors";
import { toast } from "sonner";
import { deleteRule, ruleKeys } from "@/entities/rule";
import { auditKeys } from "@/entities/audit";

export const useDeleteRule = ({ silent = false }: { silent?: boolean } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rule_id: string) => deleteRule(rule_id),
    onSuccess: (_data, rule_id) => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.lists() });
      queryClient.removeQueries({ queryKey: ruleKeys.detail(rule_id) });
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
      if (!silent) toast.success("Правило удалено", { position: "top-center" });
    },
    onError: (error, rule_id) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        toast.error(`Правило ${rule_id} не найдено`, { position: "top-center" });
      } else {
        toast.error(getErrorMessage(error, `Не удалось удалить правило ${rule_id}`), {
          position: "top-center",
        });
      }
    },
  });
};
