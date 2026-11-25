export const correlationRuleKeys = {
  all: ["correlation-rules"] as const,
  lists: () => [...correlationRuleKeys.all, "list"] as const,
  details: () => [...correlationRuleKeys.all, "detail"] as const,
  detail: (correlationId: string) => [...correlationRuleKeys.details(), correlationId] as const,
  sequenceOptions: () => [...correlationRuleKeys.all, "sequence"] as const,
  scenarioTypes: () => [...correlationRuleKeys.all, "scenario-types"] as const,
  groupByFields: () => [...correlationRuleKeys.all, "group-by"] as const,
};
