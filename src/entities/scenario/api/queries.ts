import { useQuery } from "@tanstack/react-query";
import type {
  ScenarioEventsParams,
  ScenarioQueryParams,
} from "../model/types";
import {
  fetchScenario,
  fetchScenarioEvents,
  fetchScenarios,
} from "./scenarioApi";

export const scenarioKeys = {
  all: ["scenarios"] as const,
  lists: () => [...scenarioKeys.all, "list"] as const,
  list: (params: ScenarioQueryParams) =>
    [...scenarioKeys.lists(), params] as const,
  detail: (scenarioId: string) =>
    [...scenarioKeys.all, "detail", scenarioId] as const,
  events: (scenarioId: string, params: ScenarioEventsParams) =>
    [...scenarioKeys.all, "events", scenarioId, params] as const,
};

export function useScenarios(params: ScenarioQueryParams) {
  return useQuery({
    queryKey: scenarioKeys.list(params),
    queryFn: () => fetchScenarios(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useScenario(scenarioId: string) {
  return useQuery({
    queryKey: scenarioKeys.detail(scenarioId),
    queryFn: () => fetchScenario(scenarioId),
    enabled: Boolean(scenarioId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useScenarioEvents(
  scenarioId: string,
  params: ScenarioEventsParams,
  enabled: boolean,
) {
  return useQuery({
    queryKey: scenarioKeys.events(scenarioId, params),
    queryFn: () => fetchScenarioEvents({ scenario_id: scenarioId, params }),
    enabled: enabled && Boolean(scenarioId),
    staleTime: 5 * 60 * 1000,
  });
}
