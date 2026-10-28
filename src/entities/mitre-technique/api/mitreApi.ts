import { axiosApi } from "@/shared/api";
import type { MitreSyncResponse, MitreTechnique } from "../model/types";

export async function fetchMitreTechniques(): Promise<MitreTechnique[]> {
  const response = await axiosApi.get<MitreTechnique[]>("/mitre/mitre");
  return response.data;
}

export async function syncMitre(): Promise<MitreSyncResponse> {
  const response = await axiosApi.post<MitreSyncResponse>("/mitre/sync-mitre");
  return response.data;
}
