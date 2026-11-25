import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createNormalizationProfile,
  normalizationProfileKeys,
  updateNormalizationProfile,
  type NormalizationProfileType,
} from "@/entities/normalization-profile";

export function useCreateNormalizationProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNormalizationProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: normalizationProfileKeys.lists() });
    },
  });
}

export function useUpdateNormalizationProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, data }: { name: string; data: NormalizationProfileType }) =>
      updateNormalizationProfile(name, data),
    onSuccess: (_data, { name }) => {
      queryClient.invalidateQueries({ queryKey: normalizationProfileKeys.lists() });
      queryClient.invalidateQueries({ queryKey: normalizationProfileKeys.detail(name) });
    },
  });
}
