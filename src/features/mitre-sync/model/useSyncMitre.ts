import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mitreKeys, syncMitre } from "@/entities/mitre-technique";

export function useSyncMitre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncMitre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mitreKeys.techniques() });
    },
  });
}

export type SyncMitreMutation = ReturnType<typeof useSyncMitre>;
