"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { routes } from "@/shared/config";
import { useLogout } from "../model/useLogout";

type Props = {
  /** `icon` — компактная иконка для верхней панели */
  variant?: "button" | "icon";
};

export function LogoutButton({ variant = "button" }: Props) {
  const router = useRouter();
  const { mutate, isPending, isError, error } = useLogout();

  const logoutFunc = () => {
    mutate(undefined, {
      onSuccess: () => {
        router.push(routes.login);
      },
      onError: (logoutError) => {
        if (variant === "icon") {
          toast.error(logoutError.message || "Произошла ошибка при выходе");
        }
      },
    });
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={logoutFunc}
        disabled={isPending}
        aria-label="Выйти"
        title="Выйти"
        className="rounded-md text-ink transition-colors hover:text-brand-light disabled:opacity-60"
      >
        <LogOut className="size-6" />
      </button>
    );
  }

  return (
    <>
      {isError && (
        <div className="mb-3 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
          {error?.message || "Произошла ошибка при выходе"}
        </div>
      )}

      <button
        onClick={logoutFunc}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
      >
        <LogOut size={18} />
        {isPending ? "Выход..." : "Выйти"}
      </button>
    </>
  );
}
