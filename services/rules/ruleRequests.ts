import axiosApi from "@/lib/axiosAPi";
import { QueryFiltersType, RuleApiResponse, RuleType } from "@/types/rules";


export const fetchRules = async (filters: QueryFiltersType) => {
  const result = await axiosApi.get<RuleApiResponse>("rules/", {
    params: filters,
  });
  return result.data;
};

export const fetchOneRule = async (rule_id: string) => {
  const result = await axiosApi.get<RuleType>(`rules/${rule_id}`);
  return result.data;
};
