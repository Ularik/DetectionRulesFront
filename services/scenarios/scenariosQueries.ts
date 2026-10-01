import { useQuery } from "@tanstack/react-query";
import {
  getDetailScenario,
  getScenarios,
} from "@/services/scenarios/scenariosRequests";
import type { ScenarioQueryParams } from "@/types/scenarios";

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
