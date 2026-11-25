import type { QueryFiltersType } from "../model/types";

export const ruleKeys = {
  all: ["rules"] as const,
  lists: () => [...ruleKeys.all, "list"] as const,
  list: (filters: QueryFiltersType) => [...ruleKeys.lists(), filters] as const,
  allList: () => [...ruleKeys.lists(), "all"] as const,
  details: () => [...ruleKeys.all, "detail"] as const,
  detail: (ruleId: string) => [...ruleKeys.details(), ruleId] as const,
  severityHints: () => [...ruleKeys.all, "severity-hints"] as const,
  categories: () => [...ruleKeys.all, "detection-categories"] as const,
  scopes: () => [...ruleKeys.all, "detection-scopes"] as const,
};
