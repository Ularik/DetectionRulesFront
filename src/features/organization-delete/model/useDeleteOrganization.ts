import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteOrganization, organizationKeys } from "@/entities/organization";

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: string) => deleteOrganization(organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
}
