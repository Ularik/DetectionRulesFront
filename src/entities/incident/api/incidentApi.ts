import { axiosApi } from "@/shared/api";
import type {
  ANALYST_STATUS,
  IncidentApiResponse,
  IncidentParams,
  IncidentSchema,
} from "../model/types";
import type { IncidentEventResponse } from "../model/eventsTypes";

export async function fetchIncidents(params: IncidentParams) {
  const res = await axiosApi.get<IncidentApiResponse>("/incidents", { params });
  return res.data;
}

export async function fetchIncident(inc_id: string) {
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

export async function fetchIncidentEvents({
  inc_id,
  page,
  size,
}: {
  inc_id: string;
  page: number;
  size: number;
}) {
  const res = await axiosApi.get<IncidentEventResponse>(
    `/incidents/${inc_id}/events`,
    { params: { page, size } },
  );
  return res.data;
}
