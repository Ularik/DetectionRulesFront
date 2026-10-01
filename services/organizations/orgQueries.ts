import { useQuery } from "@tanstack/react-query";
import { getOrganizations } from "@/services/organizations/orgRequests";

export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: getOrganizations,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
