"use client";

import { usePathname } from "next/navigation";
import { UserRound } from "lucide-react";
import { useMe } from "@/entities/user";
import { LogoutButton } from "@/features/auth-logout";
import { routes } from "@/shared/config";

// Заголовок раздела слева в шапке (Figma «MITRE ATTACK» 608:10003)
const SECTION_TITLES: { path: string; title: string }[] = [
  { path: routes.mitre, title: "MITRE ATT&CK" },
  { path: routes.organizations, title: "Организации" },
];

function getSectionTitle(pathname: string) {
  return SECTION_TITLES.find(
    ({ path }) => pathname === path || pathname.startsWith(`${path}/`),
  )?.title;
}

export function TopBar() {
  const { data: user } = useMe();
  const title = getSectionTitle(usePathname());

  return (
    <header className="flex min-h-10 flex-wrap items-center justify-between gap-3">
      {title ? (
        <h1 className="px-3 py-2 text-xl font-semibold text-black">{title}</h1>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-3">
        <span className="text-xl font-semibold text-ink">{user?.username}</span>
        <UserRound className="size-6 text-ink" aria-hidden />
        <LogoutButton variant="icon" />
      </div>
    </header>
  );
}
