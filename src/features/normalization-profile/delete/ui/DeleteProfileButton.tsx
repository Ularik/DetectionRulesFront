"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { routes } from "@/shared/config";
import { getErrorMessage } from "@/shared/lib/errors";
import { cn } from "@/shared/lib/utils";
import { useDeleteNormalizationProfile } from "../model/useDeleteProfile";

type Props = {
  name: string;
  /** icon — квадратная кнопка-корзина (шапка карточки), menu — пункт выпадающего меню */
  variant?: "icon" | "menu";
  className?: string;
};

export function DeleteProfileButton({ name, variant = "icon", className }: Props) {
  const router = useRouter();
  const deleteProfile = useDeleteNormalizationProfile();

  const handleDelete = () => {
    if (!window.confirm(`Удалить профиль нормализации "${name}"?`)) return;

    deleteProfile.mutate(name, {
      onSuccess: () => {
        toast.success("Профиль удалён", { position: "top-center" });
        router.push(routes.normalizationProfiles, { scroll: false });
      },
      onError: (error) => {
        toast.error(
          getErrorMessage(error, "Не удалось удалить профиль (системные generic-профили удалить нельзя)"),
          { position: "top-center" },
        );
      },
    });
  };

  if (variant === "menu") {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleteProfile.isPending}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-60",
          className,
        )}
      >
        <Trash2 className="size-4" />
        {deleteProfile.isPending ? "Удаление..." : "Удалить"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleteProfile.isPending}
      aria-label="Удалить профиль"
      title="Удалить профиль"
      className={cn(
        "flex size-10 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60",
        className,
      )}
    >
      <Trash2 className="size-4" />
    </button>
  );
}
