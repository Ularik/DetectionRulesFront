import { axiosApi } from "@/shared/api";
import type {
  ScenarioApiResponse,
  ScenarioQueryParams,
  ScenarioAggregateSchema,
  ScenarioEvents,
  ScenarioEventsParams,
} from "../model/types";

export async function fetchScenarios(
  params: ScenarioQueryParams,
): Promise<ScenarioApiResponse> {
  const res = await axiosApi.get<ScenarioApiResponse>("/scenarios/", {
    params,
  });
  return res.data;
}

export async function fetchScenario(
  scenario_id: string,
): Promise<ScenarioAggregateSchema> {
  const res = await axiosApi.get<ScenarioAggregateSchema>(
    `/scenarios/${scenario_id}`,
  );
  return res.data;
}

export async function fetchScenarioEvents({
  scenario_id,
  params,
}: {
  scenario_id: string;
  params: ScenarioEventsParams;
}): Promise<ScenarioEvents> {
  const res = await axiosApi.get<ScenarioEvents>(
    `/scenarios/${scenario_id}/events`,
    { params },
  );
  return res.data;
}
