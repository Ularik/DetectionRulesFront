import { cn } from "@/shared/lib/utils";
import { IOC_SEVERITY_FALLBACK_STYLE, IOC_SEVERITY_STYLES } from "../config/severity";

export function IocSeverityBadge({ severity, className }: { severity: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-[10px] border px-2.5 py-0.5 text-[13px] font-semibold",
        IOC_SEVERITY_STYLES[severity.toLowerCase()] ?? IOC_SEVERITY_FALLBACK_STYLE,
        className,
      )}
    >
      {severity}
    </span>
  );
}
