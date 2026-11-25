import { useQuery } from "@tanstack/react-query";
import {
  fetchCorrelationRule,
  fetchCorrelationRules,
  fetchGroupByFields,
  fetchScenarioTypes,
  fetchSequenceOptions,
} from "./correlationRuleApi";
import { correlationRuleKeys } from "./queryKeys";

export const useCorrelationRules = () =>
  useQuery({
    queryKey: correlationRuleKeys.lists(),
    queryFn: fetchCorrelationRules,
  });

export const useCorrelationRule = (correlationId: string) =>
  useQuery({
    queryKey: correlationRuleKeys.detail(correlationId),
    queryFn: () => fetchCorrelationRule(correlationId),
    enabled: Boolean(correlationId),
  });

export const useSequenceOptions = () =>
  useQuery({
    queryKey: correlationRuleKeys.sequenceOptions(),
    queryFn: fetchSequenceOptions,
    staleTime: Infinity,
  });

export const useGroupByFields = () =>
  useQuery({
    queryKey: correlationRuleKeys.groupByFields(),
    queryFn: fetchGroupByFields,
    staleTime: Infinity,
  });

export const useScenarioTypes = () =>
  useQuery({
    queryKey: correlationRuleKeys.scenarioTypes(),
    queryFn: fetchScenarioTypes,
    staleTime: Infinity,
  });
