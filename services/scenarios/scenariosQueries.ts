import { useQuery } from "@tanstack/react-query";
import {
  getDetailScenario,
  getScenarios,
  getScenarioEvents,
} from "@/services/scenarios/scenariosRequests";
import type {
  ScenarioEventsParams,
  ScenarioQueryParams,
} from "@/types/scenarios";

export function useScenarios(params: ScenarioQueryParams) {
  return useQuery({
    queryKey: ["scenarios", params],
    queryFn: () => getScenarios(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useScenarioDetail(scenarioId: string) {
  return useQuery({
    queryKey: ["scenarios", "detail", scenarioId],
    queryFn: () => getDetailScenario(scenarioId),
    enabled: Boolean(scenarioId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useScenarioEvents(
  scenarioId: string,
  params: ScenarioEventsParams,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["scenarios", "events", scenarioId, params],
    queryFn: () => getScenarioEvents({ scenario_id: scenarioId, params }),
    enabled: enabled && Boolean(scenarioId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
