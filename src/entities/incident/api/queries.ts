import { useQuery } from "@tanstack/react-query";
import type { IncidentParams } from "../model/types";
import {
  fetchIncident,
  fetchIncidentEvents,
  fetchIncidents,
} from "./incidentApi";
import { incidentKeys } from "./queryKeys";

export const useIncidents = (params: IncidentParams) => {
  return useQuery({
    queryKey: incidentKeys.list(params),
    queryFn: () => fetchIncidents(params),
  });
};

export const useIncident = (inc_id: string) => {
  return useQuery({
    queryKey: incidentKeys.detail(inc_id),
    queryFn: () => fetchIncident(inc_id),
  });
};

export const useIncidentEvents = ({
  incidentId,
  page,
  size,
  enabled,
}: {
  incidentId: string;
  page: number;
  size: number;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: incidentKeys.events(incidentId, page, size),
    queryFn: () => fetchIncidentEvents({ inc_id: incidentId, page, size }),
    enabled,
  });
};
