import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { AttackGroupsParams } from "../model/types";
import { fetchAttackGroups, fetchAttackTypes } from "./attackTypeApi";

export const attackTypeKeys = {
  all: ["attack-types"] as const,
  groups: (params: AttackGroupsParams) =>
    [...attackTypeKeys.all, "groups", params] as const,
};

export function useAttackTypes() {
  return useQuery({
    queryKey: attackTypeKeys.all,
    queryFn: fetchAttackTypes,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAttackGroups(params: AttackGroupsParams) {
  return useQuery({
    queryKey: attackTypeKeys.groups(params),
    queryFn: () => fetchAttackGroups(params),
    placeholderData: keepPreviousData,
  });
}
