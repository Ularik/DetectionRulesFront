import { useQuery } from "@tanstack/react-query";
import { fetchSeverities } from "@/services/severities/severitiesRequests";

export const useSeverities = () => {
  return useQuery({
    queryKey: ["severities"],
    queryFn: fetchSeverities,
  });
};
