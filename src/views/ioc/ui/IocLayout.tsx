"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegment } from "next/navigation";
import { cn } from "@/shared/lib/utils";
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

  return (
    <div
      className={cn(
        "grid items-start gap-5 font-(family-name:--font-inter)",
        selectedId && "xl:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]",
      )}
    >
      <div className={cn(selectedId && "order-2 xl:order-1")}>
        <IocList selectedId={selectedId} />
      </div>
      {selectedId && (
        <aside className="order-1 xl:sticky xl:top-5 xl:order-2 xl:max-h-[calc(100vh-40px)] xl:overflow-y-auto">
          {children}
        </aside>
      )}
    </div>
  );
}
