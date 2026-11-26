"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegments } from "next/navigation";
import { OrganizationsList } from "@/widgets/organizations-list";

function decodeSegment(segment: string | undefined) {
  if (!segment) return null;
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

// Как в MITRE ATT&CK и Threat Intelligence: таблица живёт в layout раздела,
// карточка организации (children) открывается справа — фрейм «ORG Detail» (Figma 651:12785).
// Создание (/new) и редактирование (/[id]/edit) — отдельные страницы без таблицы
export function OrganizationsLayout({ children }: { children: ReactNode }) {
  const segments = useSelectedLayoutSegments();

  if (segments[0] === "new" || segments[1] === "edit") return children;

  const selectedId = decodeSegment(segments[0]);

  return <OrganizationsList selectedId={selectedId} detail={selectedId ? children : undefined} />;
}
