import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { engineSettingsKeys, resetEngineSettings } from "@/entities/engine-config";
import { getErrorMessage } from "@/shared/lib/errors";

export function useResetEngineSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetEngineSettings,
    onSuccess: ({ success, settings }) => {
      if (!success) {
        toast.error("Движок не сбросил настройки");
        return queryClient.invalidateQueries({ queryKey: engineSettingsKeys.all });
      }
      toast.success("Настройки движка сброшены к значениям по умолчанию");
      // Ответ содержит настройки по умолчанию — обновляем кэш без повторного GET
      queryClient.setQueryData(engineSettingsKeys.detail(), settings);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Не удалось сбросить настройки движка"));
    },
  });
}
