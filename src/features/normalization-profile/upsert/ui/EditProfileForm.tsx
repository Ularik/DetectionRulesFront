"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { routes } from "@/shared/config";
import { getErrorMessage } from "@/shared/lib/errors";
import { useNormalizationProfile } from "@/entities/normalization-profile";
import { useUpdateNormalizationProfile } from "../model/mutations";
import { ProfileForm } from "./ProfileForm";

export function EditProfileForm({ name }: { name: string }) {
  const router = useRouter();
  const { data: profile, isPending } = useNormalizationProfile(name);
  const updateProfile = useUpdateNormalizationProfile();

  if (isPending) {
    return <div className="py-20 text-center text-ink-muted">Загрузка профиля...</div>;
  }

  if (!profile) {
    return (
      <div className="rounded-lg border border-red-200 bg-white p-6 text-center text-red-700">
        Профиль не найден
      </div>
    );
  }

  return (
    <ProfileForm
      key={profile.source_name}
      title="Редактирование профиля"
      backHref={routes.normalizationProfile(name)}
      backLabel="К профилю"
      submitLabel="Сохранить"
      pendingLabel="Сохранение..."
      isPending={updateProfile.isPending}
      lockName
      initialValues={profile}
      onSubmit={(payload) =>
        updateProfile.mutate(
          { name, data: payload },
          {
            onSuccess: () => {
              toast.success("Профиль обновлён", { position: "top-center" });
              router.push(routes.normalizationProfile(name));
            },
            onError: (error) => {
              toast.error(getErrorMessage(error, "Не удалось обновить профиль"), {
                position: "top-center",
              });
            },
          },
        )
      }
    />
  );
}
