import axiosApi from "@/lib/axiosAPi";
import { QueryFiltersType, RuleApiResponse, RuleCreateType, RuleType } from "@/types";


export const createRule = async (data: RuleCreateType) => {
  const result = await axiosApi.post<RuleType>("rules/admin/", data);
  return result.data
};


export const deleteRule = async (rule_id: string) => {
  await axiosApi.delete(`rules/admin/${rule_id}`);
}

