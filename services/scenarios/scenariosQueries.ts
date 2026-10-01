import { useQuery } from "@tanstack/react-query";
import { getScenarios } from "@/services/scenarios/scenariosRequests";
import type { ScenarioQueryParams } from "@/types/scenarios";

export function useScenarios(params: ScenarioQueryParams) {
  return useQuery({
    queryKey: ["scenarios", params],
    queryFn: () => getScenarios(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
