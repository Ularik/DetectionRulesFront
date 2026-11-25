"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegments } from "next/navigation";
import { CorrelationRulesList } from "@/widgets/correlation-rules/list";

function decodeSegment(segment: string | undefined) {
  if (!segment) return null;
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

// Как в «Правилах обнаружения»: таблица живёт в layout раздела, форма существующего правила (/[correlation_id])
// открывается справа; создание (/new) — отдельная страница
export function CorrelationRulesLayout({ children }: { children: ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const segment = segments[0];
  const selectedId = segment && segment !== "new" ? decodeSegment(segment) : null;

  // Создание (/new, в т. ч. копия) — отдельная страница-конструктор на всю ширину, без таблицы
  if (segment === "new") return children;

  return <CorrelationRulesList selectedId={selectedId} detail={segment ? children : undefined} />;
}
