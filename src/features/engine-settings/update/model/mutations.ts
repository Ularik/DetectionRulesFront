import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  engineSettingsKeys,
  updateEngineSettings,
  validateEngineSettings,
} from "@/entities/engine-config";
import { getEngineSettingsErrorMessage } from "./errors";

export function useUpdateEngineSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEngineSettings,
    onSuccess: ({ success, settings }) => {
      if (!success) {
        toast.error("Движок не сохранил настройки");
        return queryClient.invalidateQueries({ queryKey: engineSettingsKeys.all });
      }
      toast.success("Настройки движка сохранены");
      // В ответе — сохранённые настройки с updated_by/updated_at: кладём их в кэш без повторного GET
      queryClient.setQueryData(engineSettingsKeys.detail(), settings);
    },
    onError: (error) => {
      toast.error(getEngineSettingsErrorMessage(error, "Не удалось сохранить настройки движка"));
    },
  });
}

// Проверка движком без сохранения; ошибки по полям приходят как 422 (onError)
export function useValidateEngineSettings() {
  return useMutation({
    mutationFn: validateEngineSettings,
    onSuccess: ({ valid }) => {
      if (valid) toast.success("Настройки корректны");
      else toast.error("Движок отклонил настройки");
    },
    onError: (error) => {
      toast.error(getEngineSettingsErrorMessage(error, "Не удалось проверить настройки движка"));
    },
  });
}
