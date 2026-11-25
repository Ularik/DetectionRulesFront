import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assetKeys,
  createAsset,
  updateAsset,
  type AssetCreateUpdateType,
} from "@/entities/asset";

export function useCreateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
    },
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assetId, data }: { assetId: string; data: AssetCreateUpdateType }) =>
      updateAsset(assetId, data),
    onSuccess: (_data, { assetId }) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(assetId) });
    },
  });
}
