"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { routes } from "@/shared/config";
import { getErrorMessage } from "@/shared/lib/errors";
import { useNormalizationProfile } from "@/entities/normalization-profile";
import { useCreateNormalizationProfile } from "../model/mutations";
import { ProfileForm } from "./ProfileForm";

/** copyFrom — имя профиля, копию которого открываем в форме («Дублировать») */
export function CreateProfileForm({ copyFrom }: { copyFrom?: string }) {
  const router = useRouter();
  const createProfile = useCreateNormalizationProfile();
  const { data: source, isPending: isSourcePending } = useNormalizationProfile(copyFrom ?? "");

  if (copyFrom && isSourcePending) {
    return <div className="py-20 text-center text-ink-muted">Загрузка профиля...</div>;
  }

  return (
    <ProfileForm
      key={source?.source_name ?? "new"}
      title={source ? `Копия профиля ${source.source_name}` : "Новый профиль нормализации"}
      backHref={routes.normalizationProfiles}
      backLabel="К профилям нормализации"
      submitLabel="Создать профиль"
      pendingLabel="Создание..."
      isPending={createProfile.isPending}
      initialValues={source ? { ...source, source_name: `${source.source_name}_copy` } : undefined}
      onSubmit={(payload) =>
        createProfile.mutate(payload, {
          onSuccess: () => {
            toast.success("Профиль создан", { position: "top-center" });
            router.push(routes.normalizationProfile(payload.source_name));
          },
          onError: (error) => {
            toast.error(getErrorMessage(error, "Не удалось создать профиль (возможно, имя уже занято)"), {
              position: "top-center",
            });
          },
        })
      }
    />
  );
}
