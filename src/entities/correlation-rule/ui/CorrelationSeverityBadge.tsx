import { cn } from "@/shared/lib/utils";
import { CORRELATION_SEVERITY_LABELS, CORRELATION_SEVERITY_STYLES } from "../config/severity";
import type { CorrelationSeverity } from "../model/types";

export function CorrelationSeverityBadge({
  severity,
  className,
}: {
  severity: CorrelationSeverity | null;
  className?: string;
}) {
  if (!severity) return <span className="text-ink-muted">—</span>;
  return (
    <span
      className={cn(
        "inline-flex min-w-[70px] justify-center rounded-[10px] px-2 text-xs leading-[18px] font-medium",
        CORRELATION_SEVERITY_STYLES[severity] ?? "bg-gray-100 text-gray-600",
        className,
      )}
    >
      {CORRELATION_SEVERITY_LABELS[severity] ?? severity}
    </span>
  );
}
