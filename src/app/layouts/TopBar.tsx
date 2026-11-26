"use client";

import { UserRound } from "lucide-react";
import { useMe } from "@/entities/user";
import { LogoutButton } from "@/features/auth-logout";

// Заголовок раздела рендерит сама страница (shared/ui PageHeader), в шапке — только пользователь
export function TopBar() {
  const { data: user } = useMe();

  return (
    <header className="flex min-h-10 items-center justify-end gap-3">
      <span className="text-xl font-semibold text-ink">{user?.username}</span>
      <UserRound className="size-6 text-ink" aria-hidden />
      <LogoutButton variant="icon" />
    </header>
  );
}
