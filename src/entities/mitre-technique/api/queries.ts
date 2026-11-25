import { useQuery } from "@tanstack/react-query";
import { fetchMitreTechnique, fetchMitreTechniques } from "./mitreApi";

export const mitreKeys = {
  all: ["mitre"] as const,
  techniques: () => [...mitreKeys.all, "techniques"] as const,
  detail: (mitreId: string) => [...mitreKeys.all, "detail", mitreId] as const,
};

export function useMitreTechniques() {
  return useQuery({
    queryKey: mitreKeys.techniques(),
    queryFn: fetchMitreTechniques,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMitreTechnique(mitreId: string) {
  return useQuery({
    queryKey: mitreKeys.detail(mitreId),
    queryFn: () => fetchMitreTechnique(mitreId),
    enabled: Boolean(mitreId),
    staleTime: 5 * 60 * 1000,
  });
}
