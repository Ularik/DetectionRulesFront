import type { Severity } from "../model/types";

export const SCENARIO_SEVERITY_STYLES: Record<Severity, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};
