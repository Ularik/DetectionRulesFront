import axiosApi from "@/lib/axiosAPi";
import { QueryFiltersType, RuleApiResponse } from "@/types";


export const fetchRules = async (filters: QueryFiltersType) => {  
  const result = await axiosApi.get<RuleApiResponse>("rules/", {
    params: filters,
  });
  return result.data;
};