import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

// Серо-голубая «таблетка» для типа источника, агентов, хостов (макет «Источники»)
export function SourceTag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex justify-center rounded-[10px] bg-[#dbe4ed] px-2 text-xs leading-[18px] font-medium text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}
