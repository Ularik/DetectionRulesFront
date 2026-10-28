"use client";

import { UserRound } from "lucide-react";
import { useMe } from "@/entities/user";
import { LogoutButton } from "@/features/auth-logout";

export function TopBar() {
  const { data: user } = useMe();

  return (
    <header className="flex min-h-[33px] flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3 rounded-xl bg-brand/5 px-3 py-2 text-sm text-brand-light">
        Мониторинг в реальном времени
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-light opacity-50" />
          <span className="relative inline-flex size-2.5 rounded-full bg-brand-light" />
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xl font-semibold text-ink">{user?.username}</span>
        <UserRound className="size-6 text-ink" aria-hidden />
        <LogoutButton variant="icon" />
      </div>
    </header>
  );
}
