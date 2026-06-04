import { useQuery } from "@tanstack/react-query";
import { fetchRules } from "@/services/rules";
import { QueryFiltersType } from "@/types";

export const useRules = (filters: QueryFiltersType) => {
    return useQuery({
      queryKey: ["rules", filters],
      queryFn: () => fetchRules(filters),
    });
}