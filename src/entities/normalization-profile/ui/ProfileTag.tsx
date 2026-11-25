import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

// Таблетки типа источника (голубая) и формата (серая) из макета
export function ProfileTypeTag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-brand-soft/60 px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-[#1067c2]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ProfileFormatTag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-surface-muted px-2 py-0.5 text-xs font-medium whitespace-nowrap text-ink ring-1 ring-line-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
