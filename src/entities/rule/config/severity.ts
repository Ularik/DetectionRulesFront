import type { SeverityHint } from "../model/types";

export const RULE_SEVERITY_STYLES: Record<SeverityHint, string> = {
  info: "bg-blue-100 text-blue-700",
  low: "bg-yellow-100 text-yellow-700",
  medium: "bg-purple-100 text-purple-700",
  critical: "bg-red-100 text-red-700",
  high: "bg-red-100 text-red-700",
};

export const RULE_SEVERITIES: SeverityHint[] = [
  "info",
  "low",
  "medium",
  "high",
  "critical",
];

// Точка перед severity в таблице и форме (макет «Правила обнаружения»)
export const RULE_SEVERITY_DOT: Record<SeverityHint, string> = {
  info: "bg-sky-500",
  low: "bg-emerald-500",
  medium: "bg-amber-400",
  high: "bg-orange-500",
  critical: "bg-red-600",
};
