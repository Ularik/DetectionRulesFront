"use client";

import { Button } from "@/shared/ui/button";
import { getErrorMessage } from "@/shared/lib/errors";
import type { SyncMitreMutation } from "../model/useSyncMitre";

export function SyncMitreStatus({ sync }: { sync: SyncMitreMutation }) {
  return (
    <>
      {sync.isError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700" role="alert">
            {getErrorMessage(
              sync.error,
              "Не удалось синхронизировать MITRE ATT&CK.",
            )}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sync.mutate()}
            disabled={sync.isPending}
          >
            Повторить
          </Button>
        </div>
      )}
      {sync.isSuccess && sync.data.success && (
        <p className="text-sm text-emerald-700" role="status">
          Синхронизация завершена. Обработано: {sync.data.received}, добавлено в
          индекс: {sync.data.indexed}.
        </p>
      )}
      {sync.isSuccess && !sync.data.success && (
        <p className="text-sm text-red-700" role="alert">
          Сервер сообщил, что синхронизация MITRE ATT&CK не завершилась.
        </p>
      )}
    </>
  );
}
