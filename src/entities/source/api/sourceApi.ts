import { axiosApi } from "@/shared/api";
import type {
  SourceCreateUpdateType,
  SourceHealthType,
  SourceListApiResponse,
  SourceSampleEventsType,
  SourceType,
} from "../model/types";

const sourcePath = (sourceId: string) => `/sources/${encodeURIComponent(sourceId)}`;

export async function fetchSources(): Promise<SourceListApiResponse> {
  const res = await axiosApi.get<SourceListApiResponse>("/sources/");
  return res.data;
}

export async function fetchSource(sourceId: string): Promise<SourceType> {
  const res = await axiosApi.get<SourceType>(sourcePath(sourceId));
  return res.data;
}

export async function fetchSourceHealth(sourceId: string): Promise<SourceHealthType> {
  const res = await axiosApi.get<SourceHealthType>(`${sourcePath(sourceId)}/health`);
  return res.data;
}

export async function fetchSourceSampleEvents(
  sourceId: string,
  size: number,
): Promise<SourceSampleEventsType> {
  const res = await axiosApi.get<SourceSampleEventsType>(
    `${sourcePath(sourceId)}/sample-events`,
    { params: { size } },
  );
  return res.data;
}

// Схема ответа POST/PUT в OpenAPI не описана, поэтому возвращаем как есть
export async function createSource(data: SourceCreateUpdateType): Promise<unknown> {
  const res = await axiosApi.post("/sources/", data);
  return res.data;
}

export async function updateSource(
  sourceId: string,
  data: SourceCreateUpdateType,
): Promise<unknown> {
  const res = await axiosApi.put(sourcePath(sourceId), data);
  return res.data;
}

export async function deleteSource(sourceId: string): Promise<void> {
  await axiosApi.delete(sourcePath(sourceId));
}
