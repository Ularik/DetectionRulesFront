import { axiosApi } from "@/shared/api";
import type {
  WazuhEventApiResponse,
  RawEventsQueryParamsSchema,
  WazuhEvent,
} from "../model/types";

export async function fetchEvents(
  params: RawEventsQueryParamsSchema,
): Promise<WazuhEventApiResponse> {
  const res = await axiosApi.get<WazuhEventApiResponse>("/events/", {
    params,
  });
  return res.data;
}

export async function fetchEvent({
  index_name,
  event_id,
}: {
  index_name: string;
  event_id: string;
}): Promise<WazuhEvent> {
  const res = await axiosApi.get<WazuhEvent>(`/events/${index_name}/${event_id}`);
  return res.data;
}
