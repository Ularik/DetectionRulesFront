import { useQuery } from "@tanstack/react-query";
import type { RawEventsQueryParamsSchema } from "../model/types";
import { fetchEvent, fetchEvents } from "./eventApi";

export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (params: RawEventsQueryParamsSchema) =>
    [...eventKeys.lists(), params] as const,
  detail: (indexName: string, eventId: string) =>
    [...eventKeys.all, "detail", indexName, eventId] as const,
};

export function useEvents(params: RawEventsQueryParamsSchema) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => fetchEvents(params),
    staleTime: 60 * 1000,
  });
}

export function useEvent({
  index_name,
  event_id,
}: {
  index_name: string;
  event_id: string;
}) {
  return useQuery({
    queryKey: eventKeys.detail(index_name, event_id),
    queryFn: () => fetchEvent({ index_name, event_id }),
    enabled: Boolean(index_name) && Boolean(event_id),
    staleTime: 60 * 1000,
  });
}
