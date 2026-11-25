import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSource,
  sourceKeys,
  updateSource,
  type SourceCreateUpdateType,
} from "@/entities/source";

export function useCreateSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sourceKeys.lists() });
    },
  });
}

export function useUpdateSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceId, data }: { sourceId: string; data: SourceCreateUpdateType }) =>
      updateSource(sourceId, data),
    onSuccess: (_data, { sourceId }) => {
      queryClient.invalidateQueries({ queryKey: sourceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sourceKeys.detail(sourceId) });
      // пороги состояния влияют на /health
      queryClient.invalidateQueries({ queryKey: sourceKeys.health(sourceId) });
    },
  });
}
