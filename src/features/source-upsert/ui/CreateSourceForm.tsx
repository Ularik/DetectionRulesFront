"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { routes } from "@/shared/config";
import { getErrorMessage } from "@/shared/lib/errors";
import { useCreateSource } from "../model/mutations";
import { SourceForm } from "./SourceForm";

// Схема ответа POST /sources/ не описана: если backend вернул source_id — открываем карточку
function getCreatedSourceId(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const nested = record.source;
  const candidate =
    record.source_id ??
    (nested && typeof nested === "object" ? (nested as Record<string, unknown>).source_id : null);
  return typeof candidate === "string" && candidate ? candidate : null;
}

export function CreateSourceForm() {
  const router = useRouter();
  const createSource = useCreateSource();

  return (
    <SourceForm
      title="Добавление источника"
      backHref={routes.sources}
      backLabel="К списку источников"
      submitLabel="Добавить источник"
      pendingLabel="Добавление..."
      isPending={createSource.isPending}
      onSubmit={(payload) =>
        createSource.mutate(payload, {
          onSuccess: (data) => {
            toast.success("Источник добавлен", { position: "top-center" });
            const sourceId = getCreatedSourceId(data);
            router.push(sourceId ? routes.source(sourceId) : routes.sources);
          },
          onError: (error) => {
            toast.error(getErrorMessage(error, "Не удалось добавить источник"), {
              position: "top-center",
            });
          },
        })
      }
    />
  );
}
