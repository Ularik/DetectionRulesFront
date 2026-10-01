import { useQuery } from "@tanstack/react-query";
import { getEvents } from "@/services/events/eventRequest";
import type { RawEventsQueryParamsSchema } from "@/types/events";

export function useEvents(params: RawEventsQueryParamsSchema) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: () => getEvents(params),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
