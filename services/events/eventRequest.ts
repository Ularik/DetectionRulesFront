import axiosApi from "@/lib/axiosAPi";
import type {
  WazuhEventApiResponse,
  RawEventsQueryParamsSchema,
  WazuhEvent,
} from "@/types/events";


export async function getEvents(
  params: RawEventsQueryParamsSchema,
): Promise<WazuhEventApiResponse> {
  const res = await axiosApi.get<WazuhEventApiResponse>("/events/", {
    params: params,
  });
  return res.data;
};

export async function getEventDetail({
  index_name,
  event_id,
}: {
  index_name: string;
  event_id: string;
}): Promise<WazuhEvent> {
  const res = await axiosApi.get<WazuhEvent>(`/events/${index_name}/${event_id}`);
  return res.data;
};