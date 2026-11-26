import type { DataQualityParams } from "../model/types";

export const dataQualityKeys = {
  all: ["data-quality"] as const,
  summary: (params: DataQualityParams) => [...dataQualityKeys.all, "summary", params] as const,
  sources: (params: DataQualityParams) => [...dataQualityKeys.all, "sources", params] as const,
  source: (sourceId: string, params: DataQualityParams) =>
    [...dataQualityKeys.all, "source", sourceId, params] as const,
};
