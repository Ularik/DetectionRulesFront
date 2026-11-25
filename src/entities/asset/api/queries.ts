import { useQuery } from "@tanstack/react-query";
import { fetchAsset, fetchAssets } from "./assetApi";
import { assetKeys } from "./queryKeys";

export function useAssets() {
  return useQuery({
    queryKey: assetKeys.lists(),
    queryFn: fetchAssets,
  });
}

export function useAsset(assetId: string) {
  return useQuery({
    queryKey: assetKeys.detail(assetId),
    queryFn: () => fetchAsset(assetId),
    enabled: Boolean(assetId),
  });
}
