import axiosApi from "@/lib/axiosAPi";
import {
  QueryFiltersType,
  RuleApiResponse,
  RuleCreateUpdateType,
  RuleType,
} from "@/types/rules";

export const createRule = async (data: RuleCreateUpdateType) => {
  const result = await axiosApi.post<RuleType>("rules/admin/", data);
  return result.data;
};

export const deleteRule = async (rule_id: string) => {
  await axiosApi.delete(`rules/admin/${rule_id}`);
};

export async function updateRule({
  rule_id,
  data,
}: {
  rule_id: string;
  data: RuleCreateUpdateType;
}): Promise<RuleType> {
  const result = await axiosApi.put<RuleType>(`rules/admin/${rule_id}`, data);
  return result.data;
}
