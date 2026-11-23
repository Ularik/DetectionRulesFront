"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegment } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { MitreTechniques } from "@/widgets/mitre-techniques";

function decodeSegment(segment: string | null) {
  if (!segment) return null;
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

// Список техник живёт в layout раздела, поэтому поиск и страница таблицы
// не сбрасываются при переходе между /admin/mitre и /admin/mitre/[mitreId].
// Карточка техники (children) открывается справа, как во фрейме «Mirte detail» (Figma 617:11041)
export function MitreLayout({ children }: { children: ReactNode }) {
  const selectedId = decodeSegment(useSelectedLayoutSegment());

  return (
    <div
      className={cn(
        "grid items-start gap-5",
        selectedId && "xl:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]",
      )}
    >
      <div className={cn(selectedId && "order-2 xl:order-1")}>
        <MitreTechniques selectedId={selectedId} />
      </div>
      {selectedId && (
        <aside className="order-1 xl:sticky xl:top-5 xl:order-2 xl:max-h-[calc(100vh-40px)] xl:overflow-y-auto">
          {children}
        </aside>
      )}
    </div>
  );
}
