import axiosApi from "@/lib/axiosAPi";
import type {
  WazuhEventApiResponse,
  RawEventsQueryParamsSchema,
} from "@/types/events";


export async function getEvents(
  params: RawEventsQueryParamsSchema,
): Promise<WazuhEventApiResponse> {
  const res = await axiosApi.get<WazuhEventApiResponse>("/events/", {
    params: params,
  });
  return res.data;
};