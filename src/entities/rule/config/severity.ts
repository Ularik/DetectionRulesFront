import type { RuleType } from "../model/types";

export const RULE_SEVERITY_STYLES: Record<RuleType["severity_hint"], string> = {
  info: "bg-blue-100 text-blue-700",
  low: "bg-yellow-100 text-yellow-700",
  medium: "bg-purple-100 text-purple-700",
  critical: "bg-red-100 text-red-700",
  high: "bg-red-100 text-red-700",
};
