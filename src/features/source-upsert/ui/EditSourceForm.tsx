"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { routes } from "@/shared/config";
import { getErrorMessage } from "@/shared/lib/errors";
import {
  DEFAULT_HEALTH_OFFLINE_SECONDS,
  DEFAULT_HEALTH_WARNING_SECONDS,
  useSource,
  type SourceType,
} from "@/entities/source";
import { useUpdateSource } from "../model/mutations";
import { SourceForm } from "./SourceForm";

export function EditSourceForm({
  sourceId,
  renderExtraActions,
}: {
  sourceId: string;
  /** Слот для кнопки удаления (feature source-delete передаёт view) */
  renderExtraActions?: (source: SourceType) => ReactNode;
}) {
  const router = useRouter();
  const { data: source, isPending: isSourcePending } = useSource(sourceId);
  const updateSource = useUpdateSource();

  if (isSourcePending) {
    return <div className="py-20 text-center text-ink-muted">Загрузка источника...</div>;
  }

  if (!source) {
    return (
      <div className="rounded-lg border border-red-200 bg-white p-6 text-center text-red-700">
        Источник не найден
      </div>
    );
  }

  return (
    <SourceForm
      // Перемонтируем форму при смене источника, чтобы подхватить начальные значения
      key={source.source_id}
      title="Редактирование источника"
      backHref={routes.source(sourceId)}
      backLabel="К карточке источника"
      submitLabel="Сохранить"
      pendingLabel="Сохранение..."
      isPending={updateSource.isPending}
      extraActions={renderExtraActions?.(source)}
      initialValues={{
        organization_id: source.organization_id,
        name: source.name ?? "",
        source_type: source.source_type ?? "",
        vendor_name: source.vendor_name,
        product_name: source.product_name,
        normalization_profile: source.normalization_profile,
        agent_ids: source.agent_ids ?? [],
        agent_names: source.agent_names ?? [],
        hostnames: source.hostnames ?? [],
        locations: source.locations ?? [],
        device_ips: source.device_ips ?? [],
        health_warning_after_seconds:
          source.health_warning_after_seconds ?? DEFAULT_HEALTH_WARNING_SECONDS,
        health_offline_after_seconds:
          source.health_offline_after_seconds ?? DEFAULT_HEALTH_OFFLINE_SECONDS,
        enabled: Boolean(source.enabled),
        description: source.description,
      }}
      onSubmit={(payload) =>
        updateSource.mutate(
          { sourceId, data: payload },
          {
            onSuccess: () => {
              toast.success("Источник обновлён", { position: "top-center" });
              router.push(routes.source(sourceId));
            },
            onError: (error) => {
              toast.error(getErrorMessage(error, "Не удалось обновить источник"), {
                position: "top-center",
              });
            },
          },
        )
      }
    />
  );
}
