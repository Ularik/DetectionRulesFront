import { useQuery } from "@tanstack/react-query";
import { fetchAttackTypes } from "./attackTypeApi";

export const attackTypeKeys = {
  all: ["attack-types"] as const,
};

export function useAttackTypes() {
  return useQuery({
    queryKey: attackTypeKeys.all,
    queryFn: fetchAttackTypes,
    staleTime: 5 * 60 * 1000,
  });
}
