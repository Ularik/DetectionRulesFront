"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegments } from "next/navigation";
import { SuppressionRulesList } from "@/widgets/suppression-rules/list";

function decodeSegment(segment: string | undefined) {
  if (!segment) return null;
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

// Как в «Правилах корреляции»: таблица живёт в layout раздела, форма правила (children) открывается справа —
// и для существующего правила (/[suppression_id]), и для нового (/new)
export function SuppressionRulesLayout({ children }: { children: ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const segment = segments[0];
  const selectedId = segment && segment !== "new" ? decodeSegment(segment) : null;

  return <SuppressionRulesList selectedId={selectedId} detail={segment ? children : undefined} />;
}
