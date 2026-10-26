import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrganization,
  organizationKeys,
  updateOrganization,
  type OrganizationCreateUpdateType,
} from "@/entities/organization";

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
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
      data: OrganizationCreateUpdateType;
    }) => updateOrganization(organizationId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: organizationKeys.detail(variables.organizationId),
      });
    },
  });
}
