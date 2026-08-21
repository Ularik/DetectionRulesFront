import axiosApi from "@/lib/axiosAPi";
import { QueryFiltersType, RuleApiResponse, RuleCreateType, RuleType } from "@/types";


export const fetchRules = async (filters: QueryFiltersType) => {  
  const result = await axiosApi.get<RuleApiResponse>("rules/", {
    params: filters,
  });
  return result.data;
};

export const createRule = async (data: RuleCreateType) => {
  const result = await axiosApi.post<RuleType>("rules/", data);
  return result.data
};

export const deleteRule = async (rule_id: string) => {
  await axiosApi.delete(`rules/${rule_id}`);
}

export const fetchOneRule = async (rule_id: string) => {
  const result = await axiosApi.get<RuleType>(`rules/${rule_id}`);
  return result.data;
}