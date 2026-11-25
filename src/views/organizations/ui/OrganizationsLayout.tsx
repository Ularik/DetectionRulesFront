"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegments } from "next/navigation";
import { cn } from "@/shared/lib/utils";
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

  return (
    <div className={cn("grid items-start gap-5", selectedId && "xl:grid-cols-[minmax(0,1fr)_422px]")}>
      <div className={cn(selectedId && "order-2 xl:order-1")}>
        <OrganizationsList selectedId={selectedId} />
      </div>
      {selectedId && (
        <aside className="order-1 xl:sticky xl:top-5 xl:order-2 xl:max-h-[calc(100vh-40px)] xl:overflow-y-auto">
          {children}
        </aside>
      )}
    </div>
  );
}
