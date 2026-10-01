import axiosApi from "@/lib/axiosAPi";
import type { ScenarioApiResponse, ScenarioQueryParams } from "@/types/scenarios";


export async function getScenarios(params: ScenarioQueryParams): 
Promise<ScenarioApiResponse> {
    const res = await axiosApi.get<ScenarioApiResponse>("/scenarios/", {
      params: params,
    });
    return res.data;
};