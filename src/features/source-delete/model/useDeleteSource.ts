import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSource, sourceKeys } from "@/entities/source";

export function useDeleteSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceId: string) => deleteSource(sourceId),
    onSuccess: (_data, sourceId) => {
      queryClient.invalidateQueries({ queryKey: sourceKeys.lists() });
      queryClient.removeQueries({ queryKey: sourceKeys.detail(sourceId) });
    },
  });
}
