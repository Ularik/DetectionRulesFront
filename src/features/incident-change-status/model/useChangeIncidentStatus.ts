import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  incidentKeys,
  patchIncidentStatus,
  type ANALYST_STATUS,
  type IncidentSchema,
} from "@/entities/incident";

// Оптимистично меняет статус в кэше детали инцидента, при ошибке откатывает
export const useChangeIncidentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      incidentId,
      analystStatus,
    }: {
      incidentId: string;
      analystStatus: ANALYST_STATUS;
    }) => patchIncidentStatus(incidentId, analystStatus),
    onMutate: async ({ incidentId, analystStatus }) => {
      const queryKey = incidentKeys.detail(incidentId);
      await queryClient.cancelQueries({ queryKey });
      const previousIncident =
        queryClient.getQueryData<IncidentSchema>(queryKey);

      queryClient.setQueryData<IncidentSchema>(queryKey, (current) =>
        current
          ? {
              ...current,
              incident: {
                ...current.incident,
                analyst_status: analystStatus,
              },
            }
          : current,
      );

      return { queryKey, previousIncident };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousIncident) {
        queryClient.setQueryData(context.queryKey, context.previousIncident);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
    },
  });
};
