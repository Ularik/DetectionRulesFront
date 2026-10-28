import type { QueryFiltersType } from "../model/types";

export const ruleKeys = {
  all: ["rules"] as const,
  lists: () => [...ruleKeys.all, "list"] as const,
  list: (filters: QueryFiltersType) => [...ruleKeys.lists(), filters] as const,
  details: () => [...ruleKeys.all, "detail"] as const,
  detail: (ruleId: string) => [...ruleKeys.details(), ruleId] as const,
  severityHints: () => [...ruleKeys.all, "severity-hints"] as const,
};
