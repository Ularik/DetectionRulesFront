import type { DailyIncidentCountParams, IncidentParams } from "../model/types";

export const incidentKeys = {
  all: ["incidents"] as const,
  lists: () => [...incidentKeys.all, "list"] as const,
  list: (params: IncidentParams) => [...incidentKeys.lists(), params] as const,
  dailyCount: (params: DailyIncidentCountParams) =>
    [...incidentKeys.all, "daily-count", params] as const,
  detail: (incidentId: string) =>
    [...incidentKeys.all, "detail", incidentId] as const,
  events: (incidentId: string, page: number, size: number) =>
    [...incidentKeys.all, "events", incidentId, page, size] as const,
};
