import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMitreTechniques, syncMitre } from "@/services/mitre/mitreRequests";

export function useMitreTechniques() {
  return useQuery({
    queryKey: ["mitre", "techniques"],
    queryFn: getMitreTechniques,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSyncMitre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncMitre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mitre", "techniques"] });
    },
  });
}
