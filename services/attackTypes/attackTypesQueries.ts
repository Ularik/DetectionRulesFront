import { useQuery } from "@tanstack/react-query";
import { getAttackTypes } from "@/services/attackTypes/attackTypesRequest";

export function useAttackTypes() {
  return useQuery({
    queryKey: ["attackTypes"],
    queryFn: getAttackTypes,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
