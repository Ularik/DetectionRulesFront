import { useQuery } from "@tanstack/react-query";
import {
  fetchSource,
  fetchSourceHealth,
  fetchSourceSampleEvents,
  fetchSources,
} from "./sourceApi";
import { sourceKeys } from "./queryKeys";

export function useSources() {
  return useQuery({
    queryKey: sourceKeys.lists(),
    queryFn: fetchSources,
  });
}

export function useSource(sourceId: string) {
  return useQuery({
    queryKey: sourceKeys.detail(sourceId),
    queryFn: () => fetchSource(sourceId),
    enabled: Boolean(sourceId),
  });
}

// Мониторинг: метрики за 5 минут, поэтому обновляем раз в 30 с, пока карточка открыта
export function useSourceHealth(sourceId: string) {
  return useQuery({
    queryKey: sourceKeys.health(sourceId),
    queryFn: () => fetchSourceHealth(sourceId),
    enabled: Boolean(sourceId),
    staleTime: 0,
    refetchInterval: 30_000,
  });
}

export function useSourceSampleEvents(sourceId: string, size = 5, enabled = true) {
  return useQuery({
    queryKey: sourceKeys.sampleEvents(sourceId, size),
    queryFn: () => fetchSourceSampleEvents(sourceId, size),
    enabled: Boolean(sourceId) && enabled,
    staleTime: 0,
  });
}
