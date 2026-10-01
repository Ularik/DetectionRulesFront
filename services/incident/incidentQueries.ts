import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ANALYST_STATUS,
  IncidentParams,
  IncidentSchema,
} from "@/types/incidents";
import {
  getIncidentDetail,
  getIncidentEvents,
  getIncidents,
  patchIncidentStatus,
} from "./incidentRequest";

export const useIncidents = (params: IncidentParams) => {
  return useQuery({
    queryKey: ["incidents", params],
    queryFn: () => getIncidents(params),
  });
};

export const useIncidentDetai = (inc_id: string) => {
  return useQuery({
    queryKey: ["incidents", inc_id],
    queryFn: () => getIncidentDetail(inc_id),
  });
};

export const useIncidentEvents = ({
  incidentId,
  page,
  size,
  enabled,
}: {
  incidentId: string;
  page: number;
  size: number;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ["incidents", incidentId, "events", page, size],
    queryFn: () => getIncidentEvents({ inc_id: incidentId, page, size }),
    enabled,
  });
};

export const usePatchIncidentStatus = () => {
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
      const queryKey = ["incidents", incidentId] as const;
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
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
};
