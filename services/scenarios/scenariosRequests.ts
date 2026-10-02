import axiosApi from "@/lib/axiosAPi";
import type {
  ScenarioApiResponse,
  ScenarioQueryParams,
  ScenarioAggregateSchema,
  ScenarioEvents,
  ScenarioEventsParams
} from "@/types/scenarios";


export async function getScenarios(params: ScenarioQueryParams): 
Promise<ScenarioApiResponse> {
    const res = await axiosApi.get<ScenarioApiResponse>("/scenarios/", {
      params: params,
    });
    return res.data;
};


export async function getDetailScenario(
  scenario_id: string,
): Promise<ScenarioAggregateSchema> {
  const res = await axiosApi.get<ScenarioAggregateSchema>(
    `/scenarios/${scenario_id}`,
  );
  return res.data;
};

export async function getScenarioEvents({
  scenario_id,
  params,
}: {
  scenario_id: string;
  params: ScenarioEventsParams;
}): Promise<ScenarioEvents> {
  const res = await axiosApi.get<ScenarioEvents>(
    `/scenarios/${scenario_id}/events`, {
      params: params
    }
  );
  return res.data;
};