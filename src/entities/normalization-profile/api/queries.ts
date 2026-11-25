import { useQuery } from "@tanstack/react-query";
import {
  fetchNormalizationFields,
  fetchNormalizationProfile,
  fetchNormalizationProfiles,
} from "./normalizationProfileApi";
import { normalizationProfileKeys } from "./queryKeys";

export function useNormalizationProfiles() {
  return useQuery({
    queryKey: normalizationProfileKeys.lists(),
    queryFn: fetchNormalizationProfiles,
  });
}

export function useNormalizationProfile(name: string) {
  return useQuery({
    queryKey: normalizationProfileKeys.detail(name),
    queryFn: () => fetchNormalizationProfile(name),
    enabled: Boolean(name),
  });
}

// Каталог полей меняется только вместе с backend — кешируем надолго
export function useNormalizationFields() {
  return useQuery({
    queryKey: normalizationProfileKeys.fields(),
    queryFn: fetchNormalizationFields,
    staleTime: 10 * 60_000,
  });
}
