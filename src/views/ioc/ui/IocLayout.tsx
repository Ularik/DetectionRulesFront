"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegment } from "next/navigation";
import { IocList } from "@/widgets/ioc-list";

// Сегменты /admin/ioc/*, которые не являются карточкой IOC
const OWN_PAGE_SEGMENTS = new Set(["new"]);

function decodeSegment(segment: string | null) {
  if (!segment) return null;
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

// Как в разделе MITRE ATT&CK: таблица живёт в layout (страница списка не сбрасывается),
// карточка IOC (children) открывается справа
export function IocLayout({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment();

  if (segment && OWN_PAGE_SEGMENTS.has(segment)) return children;

  const selectedId = decodeSegment(segment);

  return <IocList selectedId={selectedId} detail={selectedId ? children : undefined} />;
}
