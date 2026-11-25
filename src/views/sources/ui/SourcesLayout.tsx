"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegments } from "next/navigation";
import { SourcesList } from "@/widgets/sources/list";

function decodeSegment(segment: string | undefined) {
  if (!segment) return null;
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

// Как в «Организациях» и Threat Intelligence: таблица живёт в layout раздела, карточка источника
// (children) открывается справа. Создание (/new) и редактирование (/[id]/edit) — страницы без таблицы
export function SourcesLayout({ children }: { children: ReactNode }) {
  const segments = useSelectedLayoutSegments();

  if (segments[0] === "new" || segments[1] === "edit") return children;

  const selectedId = decodeSegment(segments[0]);

  return <SourcesList selectedId={selectedId} detail={selectedId ? children : undefined} />;
}
