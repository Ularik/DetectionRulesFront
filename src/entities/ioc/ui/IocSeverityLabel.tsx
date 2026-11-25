import { cn } from "@/shared/lib/utils";
import { IOC_SEVERITY_DOT } from "../config/severity";

// Критичность — точка и текст, как в таблице «Инциденты»
export function IocSeverityLabel({ severity, className }: { severity: string; className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span
        className={cn("size-2 shrink-0 rounded-full bg-ink-muted", IOC_SEVERITY_DOT[severity.toLowerCase()])}
      />
      {severity}
    </span>
  );
}
