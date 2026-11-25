"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegments } from "next/navigation";
import { RulesList } from "@/widgets/rules/list";

function decodeSegment(segment: string | undefined) {
  if (!segment) return null;
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

// Как в «Источниках»: таблица живёт в layout раздела, форма правила (children) открывается справа —
// и для существующего правила (/[slug]), и для нового (/new)
export function RulesLayout({ children }: { children: ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const segment = segments[0];
  const selectedId = segment && segment !== "new" ? decodeSegment(segment) : null;

  return <RulesList selectedId={selectedId} detail={segment ? children : undefined} />;
}
