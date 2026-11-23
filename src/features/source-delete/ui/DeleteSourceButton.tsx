"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { routes } from "@/shared/config";
import { getErrorMessage } from "@/shared/lib/errors";
import type { SourceType } from "@/entities/source";
import { useDeleteSource } from "../model/useDeleteSource";

export function DeleteSourceButton({ source }: { source: Pick<SourceType, "source_id" | "name"> }) {
  const router = useRouter();
  const deleteSource = useDeleteSource();

  const handleDelete = () => {
    if (!window.confirm(`Удалить источник "${source.name}" (${source.source_id})?`)) return;

    deleteSource.mutate(source.source_id, {
      onSuccess: () => {
        toast.success("Источник удалён", { position: "top-center" });
        router.push(routes.sources);
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, "Не удалось удалить источник"), {
          position: "top-center",
        });
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleteSource.isPending}
      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
    >
      <Trash2 className="h-4 w-4" />
      {deleteSource.isPending ? "Удаление..." : "Удалить источник"}
    </button>
  );
}
