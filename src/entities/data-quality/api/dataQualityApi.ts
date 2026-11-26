import { axiosApi } from "@/shared/api";
import type {
  DataQualityParams,
  DataQualitySourcesResponse,
  DataQualitySummary,
} from "../model/types";

export async function fetchDataQualitySummary(params: DataQualityParams): Promise<DataQualitySummary> {
  const res = await axiosApi.get<DataQualitySummary>("/data-quality/summary", { params });
  return res.data;
}

export async function fetchDataQualitySources(
  params: DataQualityParams,
): Promise<DataQualitySourcesResponse> {
  const res = await axiosApi.get<DataQualitySourcesResponse>("/data-quality/sources", { params });
  return res.data;
}

export async function fetchDataQualitySource(
  sourceId: string,
  params: DataQualityParams,
): Promise<DataQualitySummary> {
  const res = await axiosApi.get<DataQualitySummary>(
    `/data-quality/sources/${encodeURIComponent(sourceId)}`,
    { params },
  );
  return res.data;
}
