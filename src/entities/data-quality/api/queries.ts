import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { DataQualityParams } from "../model/types";
import {
  fetchDataQualitySource,
  fetchDataQualitySources,
  fetchDataQualitySummary,
} from "./dataQualityApi";
import { dataQualityKeys } from "./queryKeys";

export function useDataQualitySummary(params: DataQualityParams) {
  return useQuery({
    queryKey: dataQualityKeys.summary(params),
    queryFn: () => fetchDataQualitySummary(params),
    placeholderData: keepPreviousData,
  });
}

export function useDataQualitySources(params: DataQualityParams) {
  return useQuery({
    queryKey: dataQualityKeys.sources(params),
    queryFn: () => fetchDataQualitySources(params),
    placeholderData: keepPreviousData,
  });
}

export function useDataQualitySource(sourceId: string | null, params: DataQualityParams) {
  return useQuery({
    queryKey: dataQualityKeys.source(sourceId ?? "", params),
    queryFn: () => fetchDataQualitySource(sourceId as string, params),
    enabled: Boolean(sourceId),
    placeholderData: keepPreviousData,
  });
}
