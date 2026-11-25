import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNormalizationProfile, normalizationProfileKeys } from "@/entities/normalization-profile";

export function useDeleteNormalizationProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => deleteNormalizationProfile(name),
    onSuccess: (_data, name) => {
      queryClient.invalidateQueries({ queryKey: normalizationProfileKeys.lists() });
      queryClient.removeQueries({ queryKey: normalizationProfileKeys.detail(name) });
    },
  });
}
