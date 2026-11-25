import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { DailyIncidentCountParams, IncidentParams } from "../model/types";
import {
  fetchDailyIncidentCount,
  fetchIncident,
  fetchIncidentArtifacts,
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

export const useIncidentArtifacts = ({
  incidentId,
  page,
  size,
}: {
  incidentId: string;
  page: number;
  size: number;
}) => {
  return useQuery({
    queryKey: incidentKeys.artifacts(incidentId, page, size),
    queryFn: () => fetchIncidentArtifacts({ inc_id: incidentId, page, size }),
    enabled: Boolean(incidentId),
    placeholderData: keepPreviousData,
  });
};

export const useDailyIncidentCount = (params: DailyIncidentCountParams) => {
  return useQuery({
    queryKey: incidentKeys.dailyCount(params),
    queryFn: () => fetchDailyIncidentCount(params),
  });
};
