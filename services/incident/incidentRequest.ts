import axiosApi from "@/lib/axiosAPi";
import type {
  ANALYST_STATUS,
  IncidentApiResponse,
  IncidentParams,
  IncidentSchema,
} from "@/types/incidents";
import type { IncidentEventResponse } from "@/types/incidentEvents";

export async function getIncidents(params: IncidentParams) {
  const res = await axiosApi.get<IncidentApiResponse>("/incidents", { params });
  return res.data;
}

export async function getIncidentDetail(inc_id: string) {
  const res = await axiosApi.get<IncidentSchema>(`/incidents/${inc_id}`);
  return res.data;
}

export async function patchIncidentStatus(
  inc_id: string,
  analyst_status: ANALYST_STATUS,
) {
  const res = await axiosApi.patch(
    `/incidents/${encodeURIComponent(inc_id)}/status`,
    { analyst_status },
  );
  return res.data;
}

export async function getIncidentEvents({inc_id, page, size}: {inc_id: string, page: number, size: number}) {
  const res = await axiosApi.get<IncidentEventResponse>(`/incidents/${inc_id}/events`, {
    params: {page, size}
  });
  return res.data;
}