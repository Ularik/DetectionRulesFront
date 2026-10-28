import { useQuery } from "@tanstack/react-query";
import { fetchMitreTechniques } from "./mitreApi";

export const mitreKeys = {
  all: ["mitre"] as const,
  techniques: () => [...mitreKeys.all, "techniques"] as const,
};

export function useMitreTechniques() {
  return useQuery({
    queryKey: mitreKeys.techniques(),
    queryFn: fetchMitreTechniques,
    staleTime: 5 * 60 * 1000,
  });
}
