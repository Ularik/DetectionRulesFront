import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

// Голубая «таблетка» для псевдонимов, агентов и хостов (Figma «Organization» 640:11556)
export function OrganizationTag({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[54px] justify-center rounded-[10px] border border-[rgba(143,205,241,0.2)] bg-[rgba(143,205,241,0.25)] px-2 text-sm leading-[16px] text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}
