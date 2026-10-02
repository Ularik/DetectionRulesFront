import { useQuery } from "@tanstack/react-query";
import { getEventDetail, getEvents } from "@/services/events/eventRequest";
import type { RawEventsQueryParamsSchema } from "@/types/events";

export function useEvents(params: RawEventsQueryParamsSchema) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: () => getEvents(params),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useEventDetail({
  index_name,
  event_id,
}: {
  index_name: string;
  event_id: string;
}) {
  return useQuery({
    queryKey: ["event-detail", index_name, event_id],
    queryFn: () => getEventDetail({ index_name, event_id }),
    enabled: Boolean(index_name) && Boolean(event_id),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
