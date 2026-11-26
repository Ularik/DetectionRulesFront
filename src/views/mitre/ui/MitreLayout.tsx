"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegment } from "next/navigation";
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

  return <MitreTechniques selectedId={selectedId} detail={selectedId ? children : undefined} />;
}
