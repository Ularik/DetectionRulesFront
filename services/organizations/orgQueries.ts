import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteOrganization,
  getAgents,
  getOrganizationDetail,
  getOrganizations,
  postOrganization,
  putOrganization,
} from "@/services/organizations/orgRequests";

export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: getOrganizations,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useOrganizationDetail(organizationId: string) {
  return useQuery({
    queryKey: ["organization", organizationId],
    queryFn: () => getOrganizationDetail(organizationId),
    enabled: Boolean(organizationId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useAgents() {
  return useQuery({
    queryKey: ["organization-agents"],
    queryFn: getAgents,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: Parameters<typeof putOrganization>[1];
    }) => putOrganization(organizationId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({
        queryKey: ["organization", variables.organizationId],
      });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) => deleteOrganization(organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}
