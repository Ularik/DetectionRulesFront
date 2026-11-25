"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegments } from "next/navigation";
import { ProfilesList } from "@/widgets/normalization/list";

function decodeSegment(segment: string | undefined) {
  if (!segment) return null;
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

// Как в «Источниках»: таблица живёт в layout раздела, карточка профиля (children) — справа.
// Создание (/new) и редактирование (/[name]/edit) — отдельные страницы без таблицы
export function NormalizationProfilesLayout({ children }: { children: ReactNode }) {
  const segments = useSelectedLayoutSegments();

  if (segments[0] === "new" || segments[1] === "edit") return children;

  const selectedId = decodeSegment(segments[0]);

  return <ProfilesList selectedId={selectedId} detail={selectedId ? children : undefined} />;
}
