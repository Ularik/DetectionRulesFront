"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/shared/lib/errors";
import { assetKeys, deleteAsset, type Asset } from "@/entities/asset";

type Target = Pick<Asset, "asset_id" | "name">;

// Удаление одного или нескольких активов (массового эндпоинта нет — DELETE по одному)
export function useDeleteAssets() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (assetIds: string[]) => {
      const results = await Promise.allSettled(assetIds.map((assetId) => deleteAsset(assetId)));
      const failed = results.filter((result) => result.status === "rejected");
      if (failed.length === assetIds.length) throw failed[0].reason;
      return { deleted: assetIds.length - failed.length, failed: failed.length };
    },
    onSettled: (_data, _error, assetIds) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
      assetIds.forEach((assetId) => queryClient.removeQueries({ queryKey: assetKeys.detail(assetId) }));
    },
  });

  /** Спрашивает подтверждение и удаляет; onSuccess — например, сбросить выделение */
  const confirmAndDelete = (assets: Target[], onSuccess?: () => void) => {
    if (!assets.length) return;
    const question =
      assets.length === 1
        ? `Удалить актив "${assets[0].name}" (${assets[0].asset_id})?`
        : `Удалить выбранные активы (${assets.length})?`;
    if (!window.confirm(question)) return;

    mutation.mutate(
      assets.map((asset) => asset.asset_id),
      {
        onSuccess: ({ deleted, failed }) => {
          if (failed) toast.warning(`Удалено: ${deleted}, не удалось удалить: ${failed}`, { position: "top-center" });
          else toast.success(deleted === 1 ? "Актив удалён" : `Удалено активов: ${deleted}`, { position: "top-center" });
          onSuccess?.();
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, "Не удалось удалить актив"), { position: "top-center" });
        },
      },
    );
  };

  return { confirmAndDelete, isPending: mutation.isPending };
}
