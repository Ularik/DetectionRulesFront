import { useQuery } from "@tanstack/react-query";
import {
  fetchAgents,
  fetchOrganization,
  fetchOrganizations,
} from "./organizationApi";
import { organizationKeys } from "./queryKeys";

export function useOrganizations() {
  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: fetchOrganizations,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOrganization(organizationId: string) {
  return useQuery({
    queryKey: organizationKeys.detail(organizationId),
    queryFn: () => fetchOrganization(organizationId),
    enabled: Boolean(organizationId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAgents() {
  return useQuery({
    queryKey: organizationKeys.agents(),
    queryFn: fetchAgents,
    staleTime: 5 * 60 * 1000,
  });
}
