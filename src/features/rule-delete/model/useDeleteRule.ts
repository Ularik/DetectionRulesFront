import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { deleteRule, ruleKeys } from "@/entities/rule";

export const useDeleteRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rule_id: string) => deleteRule(rule_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ruleKeys.all });
      toast.success("Правило удалено", { position: "top-center" });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        toast.error("Запись не найдена", { position: "top-center" });
      } else {
        toast.error("Ошибка удаления", { position: "top-center" });
      }
    },
  });
};
