import { useQuery } from "@tanstack/react-query";
import {
  fetchSuppressionMatchFields,
  fetchSuppressionRule,
  fetchSuppressionRules,
} from "./suppressionRuleApi";

export const suppressionRuleKeys = {
  all: ["suppression-rules"] as const,
  lists: () => [...suppressionRuleKeys.all, "list"] as const,
  detail: (suppressionId: string) =>
    [...suppressionRuleKeys.all, "detail", suppressionId] as const,
  matchFields: () => [...suppressionRuleKeys.all, "match-fields"] as const,
};

export function useSuppressionRules() {
  return useQuery({
    queryKey: suppressionRuleKeys.lists(),
    queryFn: fetchSuppressionRules,
  });
}

export function useSuppressionRule(suppressionId: string) {
  return useQuery({
    queryKey: suppressionRuleKeys.detail(suppressionId),
    queryFn: () => fetchSuppressionRule(suppressionId),
  });
}

export function useSuppressionMatchFields() {
  return useQuery({
    queryKey: suppressionRuleKeys.matchFields(),
    queryFn: fetchSuppressionMatchFields,
  });
}
